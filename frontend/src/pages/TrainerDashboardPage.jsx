import {
  BadgeCheck,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Percent,
  Star,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client.js";
import { ErrorState, LoadingState } from "../components/RequestState.jsx";
import { IncomeChart, SessionsChart } from "../components/TrainerCharts.jsx";
import { Button, Card, MetricCard, StatusBadge } from "../components/ui.jsx";
import {
  approvedPayments,
  endOfWeek,
  isSameMonth,
  monthlyIncomeSeries,
  paymentNet,
  startOfWeek,
  uniqueActiveStudents,
  weeklySessionSeries,
} from "../lib/trainerAnalytics.js";
import { fullDate, money } from "../lib/format.js";

export function TrainerDashboardPage() {
  const [data, setData] = useState({
    trainer: null,
    report: null,
    payments: [],
    turns: [],
    requests: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [trainer, report, payments, turns, requests] = await Promise.all([
        api.get("/trainers/me"),
        api.get("/reports/trainer/me"),
        api.get("/payments/received"),
        api.get("/turns/received"),
        api.get("/connection-requests/received"),
      ]);
      setData({
        trainer: trainer.data.trainer,
        report: report.data,
        payments: payments.data.payments,
        turns: turns.data.turns,
        requests: requests.data.connectionRequests,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "No fue posible cargar el dashboard del entrenador.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const metrics = useMemo(() => {
    const approved = approvedPayments(data.payments);
    const weekStart = startOfWeek();
    const weekEnd = endOfWeek();
    return {
      monthlyIncome: approved
        .filter((payment) => isSameMonth(payment.fechaPago))
        .reduce((sum, payment) => sum + paymentNet(payment), 0),
      students: uniqueActiveStudents(data.requests, data.turns),
      sessionsThisWeek: data.turns.filter((turn) => {
        const date = new Date(turn.fechaInicio);
        return date >= weekStart && date < weekEnd;
      }).length,
      pendingRequests: data.requests.filter(
        (request) => request.estado.nombre === "Pendiente",
      ).length,
    };
  }, [data]);

  if (loading) {
    return (
      <div className="page-container py-10">
        <LoadingState label="Preparando tu dashboard profesional..." />
      </div>
    );
  }
  if (error || !data.trainer) {
    return (
      <div className="page-container py-10">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  const incomeData = monthlyIncomeSeries(data.payments);
  const sessionData = weeklySessionSeries(data.turns);
  const upcoming = data.turns
    .filter(
      (turn) =>
        ["Solicitado", "Reservado"].includes(turn.estado.nombre) &&
        new Date(turn.fechaInicio) >= new Date(new Date().setHours(0, 0, 0, 0)),
    )
    .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
    .slice(0, 5);
  const students = [
    ...new Map(
      data.turns.map((turn) => [turn.idCliente, turn.cliente]),
    ).values(),
  ].slice(0, 5);

  return (
    <div className="page-container py-10">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">ENT-02 · Dashboard Entrenador</p>
          <h1 className="mt-2 text-4xl font-extrabold">
            Hola, {data.trainer.usuario.nombre}
          </h1>
          <p className="mt-2 text-slate-400">
            Rendimiento, agenda e ingresos actualizados desde la API.
          </p>
        </div>
        <StatusBadge className="px-4 py-2" tone="green">
          <BadgeCheck className="size-4" /> Disponible para reservas
        </StatusBadge>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={CircleDollarSign}
          label="Ingresos mensuales"
          note="Neto de pagos aprobados"
          tone="green"
          value={money(metrics.monthlyIncome)}
        />
        <MetricCard
          icon={Users}
          label="Alumnos activos"
          note="Conexiones y turnos"
          value={metrics.students}
        />
        <MetricCard
          icon={CalendarDays}
          label="Sesiones esta semana"
          note="Todos los estados"
          tone="violet"
          value={metrics.sessionsThisWeek}
        />
        <MetricCard
          icon={Star}
          label="Calificación promedio"
          note={`${data.trainer._count.calificaciones} reseñas`}
          tone="amber"
          value={`${data.trainer.calificacionPromedio.toFixed(1)}★`}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm text-slate-500">Comisión actual</p>
            <p className="mt-1 text-3xl font-extrabold">
              {data.trainer.porcentajeComision}%
            </p>
            <p className="mt-2 text-xs text-slate-600">
              Persistida en tu perfil profesional.
            </p>
          </div>
          <span className="grid size-14 place-items-center rounded-2xl bg-violet-500/12 text-violet-400">
            <Percent className="size-6" />
          </span>
        </Card>
        <Link
          className="surface surface-hover flex items-center justify-between p-6"
          to="/portal-entrenador/solicitudes"
        >
          <div>
            <p className="text-sm text-slate-500">Solicitudes pendientes</p>
            <p className="mt-1 text-3xl font-extrabold">
              {metrics.pendingRequests}
            </p>
            <p className="mt-2 text-sm font-semibold text-blue-400">
              Revisar solicitudes
            </p>
          </div>
          <UserRoundCheck className="size-8 text-blue-400" />
        </Link>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-2">
        <IncomeChart data={incomeData} />
        <SessionsChart data={sessionData} />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <Card className="p-6 md:p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold">Próximos turnos</h2>
            <Link to="/portal-entrenador/turnos">
              <Button size="sm" variant="secondary">
                Ver agenda
              </Button>
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {upcoming.length ? (
              upcoming.map((turn) => (
                <div
                  className="flex flex-col justify-between gap-3 rounded-2xl bg-white/[0.035] p-4 sm:flex-row sm:items-center"
                  key={turn.idTurno}
                >
                  <div>
                    <strong>
                      {turn.cliente.usuario.nombre}{" "}
                      {turn.cliente.usuario.apellido}
                    </strong>
                    <p className="mt-1 text-sm text-slate-500">
                      {fullDate(turn.fechaInicio)} · {turn.horaInicio}–
                      {turn.horaFin} · {turn.modalidad}
                    </p>
                  </div>
                  <StatusBadge
                    tone={
                      turn.estado.nombre === "Reservado" ? "green" : "amber"
                    }
                  >
                    {turn.estado.nombre}
                  </StatusBadge>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-white/[0.03] p-5 text-sm text-slate-500">
                No hay turnos próximos.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6 md:p-7">
          <h2 className="text-2xl font-extrabold">Alumnos recientes</h2>
          <div className="mt-5 space-y-4">
            {students.length ? (
              students.map((student) => (
                <div
                  className="flex items-center gap-3 border-b border-white/[0.06] pb-4 last:border-0"
                  key={student.idCliente}
                >
                  <span className="grid size-10 place-items-center rounded-full bg-blue-500/12 font-bold text-blue-300">
                    {student.usuario.nombre[0]}
                  </span>
                  <div>
                    <strong>
                      {student.usuario.nombre} {student.usuario.apellido}
                    </strong>
                    <p className="text-xs text-slate-500">
                      {student.nivelDeportivo || "Nivel no informado"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Todavía no hay alumnos registrados.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
