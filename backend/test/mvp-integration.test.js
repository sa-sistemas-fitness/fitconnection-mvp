import test from "node:test";
import assert from "node:assert/strict";

const enabled = process.env.MVP_INTEGRATION === "1";

test("flujo integrado: menor, disponibilidad, solapamiento y cancelación", { skip: !enabled }, async () => {
  const [{ prisma }, authService, trainerService, turnService] = await Promise.all([
    import("../src/lib/prisma.js"),
    import("../src/services/auth.service.js"),
    import("../src/services/trainer.service.js"),
    import("../src/services/turn.service.js"),
  ]);

  const suffix = Date.now();
  const registered = await authService.registerUser({
    nombre: "Cliente",
    apellido: "Menor",
    email: `minor-${suffix}@example.test`,
    dni: String(40000000 + (suffix % 9000000)),
    password: "segura123",
    fechaNacimiento: "2012-05-10",
  }, "127.0.0.1");
  assert.equal(registered.user.isMinor, true);

  const auth = {
    userId: registered.user.idUsuario,
    clientId: registered.user.cliente.idCliente,
    roles: ["Cliente"],
  };
  const trainers = await trainerService.listApprovedTrainers({}, auth);
  assert.ok(trainers.length > 0);
  assert.ok(trainers.every((trainer) => trainer.trabajaConMenores));
  const trainer = trainers[0];

  const accepted = await prisma.estadoSolicitudConexion.findUniqueOrThrow({ where: { nombre: "Aceptada" } });
  const connection = await prisma.solicitudConexion.create({
    data: {
      idCliente: auth.clientId,
      idEntrenador: trainer.idEntrenador,
      idEstadoSolicitud: accepted.idEstadoSolicitud,
      mensajeInicial: "Prueba integrada",
      fechaRespuesta: new Date(),
    },
  });

  const slot = await prisma.disponibilidadEntrenador.findFirstOrThrow({
    where: { idEntrenador: trainer.idEntrenador, activa: true },
  });
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + ((slot.diaSemana - date.getUTCDay() + 7) % 7) + (2 + (suffix % 40)) * 7);
  const dateValue = date.toISOString().slice(0, 10);

  const first = await turnService.createTurn(auth, {
    requestId: connection.idSolicitud,
    fechaInicio: dateValue,
    fechaFin: dateValue,
    horaInicio: slot.horaInicio,
    horaFin: slot.horaFin,
    modalidad: slot.modalidad,
  });
  await assert.rejects(
    turnService.createTurn(auth, {
      requestId: connection.idSolicitud,
      fechaInicio: dateValue,
      fechaFin: dateValue,
      horaInicio: slot.horaInicio,
      horaFin: slot.horaFin,
      modalidad: slot.modalidad,
    }),
    (error) => error.statusCode === 409,
  );

  await turnService.cancelTurn(first.idTurno, auth, "127.0.0.1", "Prueba de liberación");
  const replacement = await turnService.createTurn(auth, {
    requestId: connection.idSolicitud,
    fechaInicio: dateValue,
    fechaFin: dateValue,
    horaInicio: slot.horaInicio,
    horaFin: slot.horaFin,
    modalidad: slot.modalidad,
  });
  assert.equal(replacement.estado.nombre, "Solicitado");
  await prisma.$disconnect();
});
