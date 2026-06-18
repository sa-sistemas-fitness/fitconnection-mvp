import {
  BadgeCheck,
  CircleDollarSign,
  Percent,
  Star,
  Trophy,
  UserRoundCheck,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { api } from "../api/client.js";
import { ErrorState, LoadingState } from "../components/RequestState.jsx";
import {
  Card,
  ChartCard,
  DataTable,
  MetricCard,
  StatusBadge,
} from "../components/ui.jsx";
import { money } from "../lib/format.js";

const monthFormatter = new Intl.DateTimeFormat("es-AR", { month: "short" });
const tooltipStyle = {
  background: "#10131f",
  border: "1px solid #29304a",
  borderRadius: 14,
};

function monthlyFinancial(payments, months = 6) {
  const now = new Date();
  return Array.from({ length: months }, (_, index) => {
    const start = new Date(
      now.getFullYear(),
      now.getMonth() - (months - 1 - index),
      1,
    );
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const approved = payments.filter((payment) => {
      if (payment.estado.nombre !== "Aprobado" || !payment.fechaPago) return false;
      const date = new Date(payment.fechaPago);
      return date >= start && date < end;
    });
    return {
      label: monthFormatter.format(start).replace(".", ""),
      facturacion: approved.reduce((sum, payment) => sum + payment.monto, 0),
      comisiones: approved.reduce(
        (sum, payment) => sum + payment.comision,
        0,
      ),
    };
  });
}

export function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState("connections");
  const [data, setData] = useState({
    overview: null,
    connections: null,
    financial: null,
    trainers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [overview, connections, financial, trainers] = await Promise.all([
        api.get("/reports/admin/overview"),
        api.get("/reports/connections"),
        api.get("/reports/financial"),
        api.get("/reports/trainers"),
      ]);
      setData({
        overview: overview.data,
        connections: connections.data,
        financial: financial.data,
        trainers: trainers.data.trainers,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "No fue posible cargar los reportes administrativos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const connectionMetrics = useMemo(() => {
    const counts = Object.fromEntries(
      (data.connections?.byStatus ?? []).map((item) => [
        item.status,
        item.count,
      ]),
    );
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const answered = (counts.Aceptada ?? 0) + (counts.Rechazada ?? 0);
    return {
      total,
      accepted: counts.Aceptada ?? 0,
      pending: counts.Pendiente ?? 0,
      rejected: counts.Rechazada ?? 0,
      rate: answered
        ? Math.round(((counts.Aceptada ?? 0) / answered) * 100)
        : 0,
    };
  }, [data.connections]);

  const demandData = useMemo(() => {
    const demand = new Map();
    (data.connections?.recent ?? []).forEach((request) => {
      request.entrenador.especialidades?.forEach(({ especialidad }) => {
        demand.set(
          especialidad.nombre,
          (demand.get(especialidad.nombre) ?? 0) + 1,
        );
      });
    });
    return [...demand.entries()]
      .map(([deporte, solicitudes]) => ({ deporte, solicitudes }))
      .sort((a, b) => b.solicitudes - a.solicitudes);
  }, [data.connections]);

  const paymentCounts = useMemo(
    () =>
      (data.financial?.payments ?? []).reduce((result, payment) => {
        result[payment.estado.nombre] =
          (result[payment.estado.nombre] ?? 0) + 1;
        return result;
      }, {}),
    [data.financial],
  );

  const trainerRows = useMemo(
    () =>
      data.trainers
        .map((trainer) => ({
          ...trainer,
          income: trainer.pagos.reduce(
            (sum, payment) => sum + payment.monto,
            0,
          ),
        }))
        .sort(
          (a, b) =>
            b.calificacionPromedio - a.calificacionPromedio ||
            b.income - a.income,
        ),
    [data.trainers],
  );

  if (loading) {
    return (
      <div className="page-container py-10">
        <LoadingState label="Consolidando reportes administrativos..." />
      </div>
    );
  }
  if (error) {
    return (
      <div className="page-container py-10">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <div>
        <p className="eyebrow">ADMIN-07</p>
        <h1 className="mt-2 text-4xl font-extrabold">Reportes Admin</h1>
        <p className="mt-2 text-slate-400">
          Conexiones, finanzas y rendimiento de entrenadores.
        </p>
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        {[
          ["connections", "REP-01 Conexiones"],
          ["financial", "REP-02 Financiero"],
          ["trainers", "REP-03 Entrenadores"],
        ].map(([key, label]) => (
          <button
            className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
              activeTab === key
                ? "border-blue-500/50 bg-blue-500/15 text-blue-200"
                : "border-white/10 bg-white/[0.03] text-slate-500"
            }`}
            key={key}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "connections" && (
        <>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              icon={UserRoundCheck}
              label="Total solicitudes"
              value={connectionMetrics.total}
            />
            <MetricCard
              icon={BadgeCheck}
              label="Aceptadas"
              tone="green"
              value={connectionMetrics.accepted}
            />
            <MetricCard
              icon={UserRoundCheck}
              label="Pendientes"
              tone="amber"
              value={connectionMetrics.pending}
            />
            <MetricCard
              icon={UserRoundCheck}
              label="Rechazadas"
              tone="violet"
              value={connectionMetrics.rejected}
            />
            <MetricCard
              icon={Percent}
              label="Tasa de aceptación"
              tone="green"
              value={`${connectionMetrics.rate}%`}
            />
          </div>
          <ChartCard className="mt-7" title="Deportes más demandados">
            {demandData.length ? (
              <ResponsiveContainer height={300} width="100%">
                <BarChart data={demandData}>
                  <CartesianGrid stroke="#1b2030" strokeDasharray="3 3" />
                  <XAxis dataKey="deporte" stroke="#66708f" />
                  <YAxis allowDecimals={false} stroke="#66708f" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="solicitudes"
                    fill="#2867f0"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-20 text-center text-sm text-slate-500">
                Todavía no hay demanda suficiente para graficar.
              </p>
            )}
          </ChartCard>
        </>
      )}

      {activeTab === "financial" && (
        <>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              icon={CircleDollarSign}
              label="Facturación total"
              tone="green"
              value={money(data.financial.totals.grossVolume)}
            />
            <MetricCard
              icon={Percent}
              label="Comisiones cobradas"
              tone="violet"
              value={money(data.financial.totals.commissions)}
            />
            <MetricCard
              icon={BadgeCheck}
              label="Pagos aprobados"
              value={paymentCounts.Aprobado ?? 0}
            />
            <MetricCard
              icon={CircleDollarSign}
              label="Pagos pendientes"
              tone="amber"
              value={paymentCounts.Pendiente ?? 0}
            />
            <MetricCard
              icon={CircleDollarSign}
              label="Pagos rechazados"
              tone="violet"
              value={paymentCounts.Rechazado ?? 0}
            />
          </div>
          <ChartCard className="mt-7" title="Facturación mensual">
            <ResponsiveContainer height={320} width="100%">
              <AreaChart data={monthlyFinancial(data.financial.payments)}>
                <defs>
                  <linearGradient
                    id="admin-finance"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="0" stopColor="#3474ff" stopOpacity=".4" />
                    <stop offset="1" stopColor="#3474ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1b2030" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#66708f" />
                <YAxis stroke="#66708f" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  dataKey="facturacion"
                  fill="url(#admin-finance)"
                  name="Facturación"
                  stroke="#3474ff"
                  strokeWidth={3}
                  type="monotone"
                />
                <Area
                  dataKey="comisiones"
                  fill="transparent"
                  name="Comisiones"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}

      {activeTab === "trainers" && (
        <Card className="mt-7 p-6">
          <div className="flex items-center gap-3">
            <Trophy className="size-7 text-amber-400" />
            <h2 className="text-2xl font-extrabold">
              Ranking de entrenadores
            </h2>
          </div>
          <div className="mt-5">
            <DataTable
              columns={[
                {
                  key: "rank",
                  label: "#",
                  render: (trainer) => trainer.rank,
                },
                {
                  key: "trainer",
                  label: "Entrenador",
                  render: (trainer) =>
                    `${trainer.usuario.nombre} ${trainer.usuario.apellido}`,
                },
                {
                  key: "rating",
                  label: "Calificación",
                  render: (trainer) => (
                    <span className="flex items-center gap-1 text-amber-300">
                      <Star className="size-4 fill-current" />
                      {trainer.calificacionPromedio.toFixed(1)}
                    </span>
                  ),
                },
                {
                  key: "income",
                  label: "Ingresos generados",
                  render: (trainer) => money(trainer.income),
                },
                {
                  key: "commission",
                  label: "Comisión",
                  render: (trainer) => `${trainer.porcentajeComision}%`,
                },
                {
                  key: "turns",
                  label: "Turnos",
                  render: (trainer) => trainer._count.turnos,
                },
                {
                  key: "status",
                  label: "Estado",
                  render: (trainer) => (
                    <StatusBadge
                      tone={
                        trainer.estado.nombre === "Aprobado"
                          ? "green"
                          : trainer.estado.nombre === "Pendiente"
                            ? "amber"
                            : "rose"
                      }
                    >
                      {trainer.estado.nombre}
                    </StatusBadge>
                  ),
                },
              ]}
              rows={trainerRows.map((trainer, index) => ({
                ...trainer,
                id: trainer.idEntrenador,
                rank: index + 1,
              }))}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
