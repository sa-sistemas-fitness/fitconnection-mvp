import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  MessageSquare,
  Search,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client.js";
import { ErrorState, LoadingState } from "../components/RequestState.jsx";
import { TrainerAvatar } from "../components/TrainerAvatar.jsx";
import {
  Button,
  Card,
  EmptyState,
  MetricCard,
  StatusBadge,
} from "../components/ui.jsx";
import { fullDate, money, trainerName } from "../lib/format.js";

function durationInHours(turn) {
  const [startHour, startMinute] = turn.horaInicio.split(":").map(Number);
  const [endHour, endMinute] = turn.horaFin.split(":").map(Number);
  return Math.max(0, endHour + endMinute / 60 - startHour - startMinute / 60);
}

export function ClientDashboardPage() {
  const [data, setData] = useState({
    turns: [],
    payments: [],
    connections: [],
    chats: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [turns, payments, connections, chats] = await Promise.all([
        api.get("/turns/my"),
        api.get("/payments/my"),
        api.get("/connection-requests/my"),
        api.get("/chats"),
      ]);
      setData({
        turns: turns.data.turns,
        payments: payments.data.payments,
        connections: connections.data.connectionRequests,
        chats: chats.data.chats,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "No fue posible obtener tu actividad.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const activeTrainers = useMemo(() => {
    const trainers = new Map();
    data.connections
      .filter((connection) => connection.estado.nombre === "Aceptada")
      .forEach((connection) =>
        trainers.set(connection.idEntrenador, connection.entrenador),
      );
    return [...trainers.values()];
  }, [data.connections]);

  const upcoming = data.turns
    .filter((turn) => ["Solicitado", "Reservado"].includes(turn.estado.nombre))
    .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));
  const myTurns = [...data.turns]
    .sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud))
    .slice(0, 8);
  const approvedPayments = data.payments.filter(
    (payment) => payment.estado.nombre === "Aprobado",
  );
  const totalInvested = approvedPayments.reduce(
    (sum, payment) => sum + payment.monto,
    0,
  );
  const trainingHours = data.turns
    .filter((turn) => turn.estado.nombre === "Finalizado")
    .reduce((sum, turn) => sum + durationInHours(turn), 0);

  const activity = [
    ...approvedPayments.map((payment) => ({
      id: `payment-${payment.idPago}`,
      date: payment.fechaPago,
      title: "Pago aprobado",
      detail: `${money(payment.monto)} · ${trainerName(payment.entrenador)}`,
      icon: DollarSign,
    })),
    ...data.turns
      .filter((turn) => turn.estado.nombre === "Finalizado")
      .map((turn) => ({
        id: `turn-${turn.idTurno}`,
        date: turn.fechaFin,
        title: "Turno finalizado",
        detail: `${trainerName(turn.entrenador)} · ${turn.modalidad}`,
        icon: CheckCircle2,
      })),
    ...data.connections
      .filter((connection) => connection.estado.nombre === "Aceptada")
      .map((connection) => ({
        id: `connection-${connection.idSolicitud}`,
        date: connection.fechaRespuesta,
        title: "Nueva conexión",
        detail: trainerName(connection.entrenador),
        icon: UserRoundCheck,
      })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="page-container py-10">
        <LoadingState label="Preparando tu panel..." />
      </div>
    );
  }
  if (error) {
    return (
      <div className="page-container py-10">
        <ErrorState message={error} onRetry={loadDashboard} />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Tu centro de entrenamiento</p>
          <h1 className="mt-2 text-4xl font-extrabold">Mi Panel</h1>
          <p className="mt-2 text-slate-400">
            Tu progreso, entrenadores y próximos turnos con datos actualizados.
          </p>
        </div>
        <Link to="/entrenadores">
          <Button>
            <Search className="size-5" /> Buscar Entrenador
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={CalendarDays}
          label="Turnos totales"
          note={`${upcoming.length} próximos`}
          value={data.turns.length}
        />
        <MetricCard
          icon={DollarSign}
          label="Total invertido"
          note={`${approvedPayments.length} pagos aprobados`}
          tone="green"
          value={money(totalInvested)}
        />
        <MetricCard
          icon={Users}
          label="Entrenadores activos"
          note={`${activeTrainers.length} conexiones aceptadas`}
          tone="violet"
          value={activeTrainers.length}
        />
        <MetricCard
          icon={Clock3}
          label="Horas de entrenamiento"
          note="Turnos finalizados"
          tone="amber"
          value={`${trainingHours.toLocaleString("es-AR", {
            maximumFractionDigits: 1,
          })}h`}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.65fr_.85fr]">
        <Card className="p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Agenda e historial</p>
              <h2 className="mt-1 text-2xl font-extrabold">Mis Turnos</h2>
            </div>
            <Link className="text-sm font-bold text-blue-400" to="/turnos">
              Ver todos ({data.turns.length})
            </Link>
          </div>
          <div className="mt-6 space-y-3">
            {myTurns.length ? (
              myTurns.map((turn) => (
                <div
                  className="flex flex-col gap-4 rounded-2xl bg-[#151827] p-4 md:flex-row md:items-center"
                  key={turn.idTurno}
                >
                  <TrainerAvatar
                    className="size-12 rounded-full"
                    index={(turn.idEntrenador - 1) % 6}
                  />
                  <div className="flex-1">
                    <strong>{trainerName(turn.entrenador)}</strong>
                    <p className="text-sm text-slate-500">
                      {turn.entrenador.especialidades
                        ?.map(({ especialidad }) => especialidad.nombre)
                        .join(" · ") || turn.modalidad}
                    </p>
                  </div>
                  <div className="md:text-right">
                    <strong>{fullDate(turn.fechaInicio)}</strong>
                    <p className="text-sm text-slate-500">
                      {turn.horaInicio}–{turn.horaFin}
                    </p>
                  </div>
                  <StatusBadge
                    tone={
                      turn.estado.nombre === "Reservado"
                        ? "green"
                        : turn.estado.nombre === "Solicitado"
                          ? "amber"
                          : turn.estado.nombre === "Finalizado"
                            ? "blue"
                            : "rose"
                    }
                  >
                    {turn.estado.nombre}
                  </StatusBadge>
                </div>
              ))
            ) : (
              <EmptyState
                action={
                  <Link to="/entrenadores">
                    <Button>Buscar entrenador</Button>
                  </Link>
                }
                description="Cuando una conexión sea aceptada podrás solicitar tu primer turno desde el perfil del entrenador."
                icon={CalendarDays}
                title="Todavía no tenés turnos"
              />
            )}
          </div>
        </Card>

        <Card className="p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold">Mis entrenadores</h2>
            <Link className="font-bold text-blue-400" to="/entrenadores">
              + Agregar
            </Link>
          </div>
          <div className="mt-6 space-y-5">
            {activeTrainers.length ? (
              activeTrainers.map((trainer) => {
                const hasChat = data.chats.some(
                  (chat) =>
                    chat.solicitud.idEntrenador === trainer.idEntrenador,
                );
                return (
                  <div
                    className="flex items-center gap-3"
                    key={trainer.idEntrenador}
                  >
                    <div className="relative">
                      <TrainerAvatar
                        className="size-11 rounded-full"
                        index={(trainer.idEntrenador - 1) % 6}
                      />
                      <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-[#0d0f19] bg-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        className="truncate font-bold hover:text-blue-300"
                        to={`/entrenadores/${trainer.idEntrenador}`}
                      >
                        {trainerName(trainer)}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {trainer.modalidad}
                      </p>
                    </div>
                    {hasChat && (
                      <Link
                        aria-label="Abrir conversación"
                        className="rounded-xl p-2 text-slate-500 hover:bg-blue-500/10 hover:text-blue-400"
                        to="/mensajes"
                      >
                        <MessageSquare className="size-4" />
                      </Link>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm leading-6 text-slate-500">
                Todavía no tenés conexiones aceptadas.
              </p>
            )}
          </div>

          <div className="mt-7 border-t border-white/10 pt-6">
            <p className="eyebrow">Actividad reciente</p>
            <div className="mt-4 space-y-4 text-sm">
              {activity.length ? (
                activity.map(({ id, title, detail, icon: Icon }) => (
                  <div className="flex gap-3" key={id}>
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-blue-500/10 text-blue-400">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <strong>{title}</strong>
                      <p className="text-slate-500">{detail}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">Todavía no hay actividad.</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
