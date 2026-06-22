const monthFormatter = new Intl.DateTimeFormat("es-AR", { month: "short" });

export function approvedPayments(payments) {
  return payments.filter((payment) => payment.estado.nombre === "Aprobado");
}

export function paymentNet(payment) {
  return payment.monto - payment.comision;
}

export function isSameMonth(value, reference = new Date()) {
  const date = new Date(value);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth()
  );
}

export function startOfWeek(value = new Date()) {
  const date = new Date(value);
  const day = date.getDay();
  const distance = day === 0 ? 6 : day - 1;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - distance);
  return date;
}

export function endOfWeek(value = new Date()) {
  const end = startOfWeek(value);
  end.setDate(end.getDate() + 7);
  return end;
}

export function monthlyIncomeSeries(payments, months = 6) {
  const approved = approvedPayments(payments);
  const now = new Date();
  return Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1);
    const next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const monthPayments = approved.filter((payment) => {
      const paymentDate = new Date(payment.fechaPago);
      return paymentDate >= date && paymentDate < next;
    });
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: monthFormatter.format(date).replace(".", ""),
      bruto: monthPayments.reduce((sum, payment) => sum + payment.monto, 0),
      neto: monthPayments.reduce((sum, payment) => sum + paymentNet(payment), 0),
    };
  });
}

export function weeklySessionSeries(turns, weeks = 6) {
  const currentWeek = startOfWeek();
  return Array.from({ length: weeks }, (_, index) => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - 7 * (weeks - 1 - index));
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const weekTurns = turns.filter((turn) => {
      const turnDate = new Date(turn.fechaInicio);
      return turnDate >= start && turnDate < end;
    });
    return {
      label: `S${index + 1}`,
      sesiones: weekTurns.length,
      finalizadas: weekTurns.filter(
        (turn) => turn.estado.nombre === "Finalizado",
      ).length,
    };
  });
}

export function acceptanceRate(requests) {
  const answered = requests.filter((request) =>
    ["Aceptada", "Rechazada"].includes(request.estado.nombre),
  );
  if (!answered.length) return 0;
  const accepted = answered.filter(
    (request) => request.estado.nombre === "Aceptada",
  ).length;
  return Math.round((accepted / answered.length) * 100);
}

export function uniqueActiveStudents(requests, turns = []) {
  const ids = new Set(
    requests
      .filter((request) => request.estado.nombre === "Aceptada")
      .map((request) => request.idCliente),
  );
  turns
    .filter((turn) =>
      ["Solicitado", "Reservado", "Finalizado"].includes(turn.estado.nombre),
    )
    .forEach((turn) => ids.add(turn.idCliente));
  return ids.size;
}
