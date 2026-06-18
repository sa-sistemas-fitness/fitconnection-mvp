import {
  BadgeCheck,
  CalendarCheck,
  CircleDollarSign,
  Percent,
  Star,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "../api/client.js";
import { ErrorState, LoadingState } from "../components/RequestState.jsx";
import { IncomeChart, SessionsChart } from "../components/TrainerCharts.jsx";
import { Card, MetricCard, StatusBadge } from "../components/ui.jsx";
import {
  acceptanceRate,
  approvedPayments,
  isSameMonth,
  monthlyIncomeSeries,
  paymentNet,
  uniqueActiveStudents,
  weeklySessionSeries,
} from "../lib/trainerAnalytics.js";
import { fullDate, money } from "../lib/format.js";

export function TrainerReportsPage() {
  const [data, setData] = useState({
    trainer: null,
    report: null,
    payments: [],
    turns: [],
    requests: [],
    reviews: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const trainerResponse = await api.get("/trainers/me");
      const trainer = trainerResponse.data.trainer;
      const [report, payments, turns, requests, reviews] = await Promise.all([
        api.get("/reports/trainer/me"),
        api.get("/payments/received"),
        api.get("/turns/received"),
        api.get("/connection-requests/received"),
        api.get(`/reviews/trainer/${trainer.idEntrenador}`),
      ]);
      setData({
        trainer,
        report: report.data,
        payments: payments.data.payments,
        turns: turns.data.turns,
        requests: requests.data.connectionRequests,
        reviews: reviews.data.reviews,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "No fue posible cargar los reportes del entrenador.",
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
    return {
      totalIncome: approved.reduce(
        (sum, payment) => sum + paymentNet(payment),
        0,
      ),
      monthlyIncome: approved
        .filter((payment) => isSameMonth(payment.fechaPago))
        .reduce((sum, payment) => sum + paymentNet(payment), 0),
      completedTurns: data.turns.filter(
        (turn) => turn.estado.nombre === "Finalizado",
      ).length,
      students: uniqueActiveStudents(data.requests, data.turns),
      acceptance: acceptanceRate(data.requests),
    };
  }, [data]);

  if (loading) {
    return (
      <div className="page-container py-10">
        <LoadingState label="Preparando reportes profesionales..." />
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

  return (
    <div className="page-container py-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">ENT-09</p>
          <h1 className="mt-2 text-4xl font-extrabold">
            Reportes Entrenador
          </h1>
          <p className="mt-2 text-slate-400">
            Evolución financiera, sesiones y experiencia de alumnos.
          </p>
        </div>
        <StatusBadge tone="green">
          <BadgeCheck className="size-4" /> Datos actualizados
        </StatusBadge>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          icon={CircleDollarSign}
          label="Ingresos totales"
          tone="green"
          value={money(metrics.totalIncome)}
        />
        <MetricCard
          icon={CircleDollarSign}
          label="Ingresos mensuales"
          note="Neto del mes actual"
          value={money(metrics.monthlyIncome)}
        />
        <MetricCard
          icon={CalendarCheck}
          label="Turnos finalizados"
          tone="violet"
          value={metrics.completedTurns}
        />
        <MetricCard
          icon={Star}
          label="Calificación promedio"
          note={`${data.reviews.length} reseñas visibles`}
          tone="amber"
          value={`${data.trainer.calificacionPromedio.toFixed(1)}★`}
        />
        <MetricCard
          icon={Users}
          label="Alumnos activos"
          value={metrics.students}
        />
        <MetricCard
          icon={Percent}
          label="Tasa de aceptación"
          note="Solicitudes respondidas"
          tone="green"
          value={`${metrics.acceptance}%`}
        />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-2">
        <IncomeChart
          data={monthlyIncomeSeries(data.payments)}
          title="Evolución de ingresos netos"
        />
        <SessionsChart
          data={weeklySessionSeries(data.turns)}
          title="Evolución de sesiones"
        />
      </div>

      <Card className="mt-7 p-6 md:p-7">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold">
            Últimas calificaciones
          </h2>
          <StatusBadge tone="amber">
            <Star className="size-4" /> {data.reviews.length}
          </StatusBadge>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {data.reviews.length ? (
            data.reviews.slice(0, 6).map((review) => (
              <div
                className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
                key={review.idCalificacion}
              >
                <div className="flex items-center justify-between gap-4">
                  <strong>
                    {review.cliente.usuario.nombre}{" "}
                    {review.cliente.usuario.apellido}
                  </strong>
                  <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: review.puntuacion }).map(
                      (_, index) => (
                        <Star
                          className="size-4 fill-current"
                          key={index}
                        />
                      ),
                    )}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {review.comentario || "Sin comentario."}
                </p>
                <p className="mt-3 text-xs text-slate-600">
                  {fullDate(review.fecha)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              Todavía no hay calificaciones visibles.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
