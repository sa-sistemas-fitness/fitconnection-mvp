import {
  BadgeCheck,
  CircleDollarSign,
  CreditCard,
  ShieldCheck,
  Star,
  UserRound,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
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
import { Button, Card, ChartCard, MetricCard, StatusBadge } from "../components/ui.jsx";
import { money } from "../lib/format.js";

export function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/reports/admin/overview");
      setOverview(data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "No fue posible cargar el dashboard administrativo.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="page-container py-10">
        <LoadingState label="Preparando el centro de administración..." />
      </div>
    );
  }
  if (error || !overview) {
    return (
      <div className="page-container py-10">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  const communityData = [
    { label: "Usuarios", cantidad: overview.users.total },
    { label: "Clientes", cantidad: overview.clients },
    { label: "Entrenadores", cantidad: overview.trainers.approved },
  ];
  const pendingData = [
    { label: "Entrenadores", cantidad: overview.trainers.pending },
    { label: "Certificaciones", cantidad: overview.certifications.pending },
    { label: "Moderaciones", cantidad: overview.moderations.pending },
  ];

  return (
    <div className="page-container py-10">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">ADMIN-01</p>
          <h1 className="mt-2 text-4xl font-extrabold">
            Dashboard Administrador
          </h1>
          <p className="mt-2 text-slate-400">
            Estado general, actividad económica y revisiones pendientes.
          </p>
        </div>
        <StatusBadge className="px-4 py-2" tone="green">
          <ShieldCheck className="size-4" /> Plataforma operativa
        </StatusBadge>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Usuarios activos"
          note={`${overview.users.total} cuentas totales`}
          value={overview.users.active}
        />
        <MetricCard
          icon={UserRound}
          label="Clientes registrados"
          note="Perfiles Cliente"
          tone="violet"
          value={overview.clients}
        />
        <MetricCard
          icon={BadgeCheck}
          label="Entrenadores aprobados"
          note={`${overview.trainers.pending} pendientes`}
          tone="green"
          value={overview.trainers.approved}
        />
        <MetricCard
          icon={ShieldCheck}
          label="Certificaciones pendientes"
          note="Requieren validación"
          tone="amber"
          value={overview.certifications.pending}
        />
        <MetricCard
          icon={CreditCard}
          label="Pagos totales"
          note={`${overview.payments.approved} aprobados`}
          value={overview.payments.total}
        />
        <MetricCard
          icon={CircleDollarSign}
          label="Comisiones generadas"
          note={`${money(overview.payments.volume)} procesados`}
          tone="green"
          value={money(overview.payments.commissions)}
        />
        <MetricCard
          icon={UserRoundCheck}
          label="Entrenadores pendientes"
          note="Postulaciones"
          tone="violet"
          value={overview.trainers.pending}
        />
        <MetricCard
          icon={Star}
          label="Moderaciones pendientes"
          note="Calificaciones"
          tone="amber"
          value={overview.moderations.pending}
        />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-2">
        <ChartCard title="Comunidad FitConnection">
          <ResponsiveContainer height={260} width="100%">
            <BarChart data={communityData}>
              <CartesianGrid stroke="#1b2030" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="#66708f" />
              <YAxis allowDecimals={false} stroke="#66708f" />
              <Tooltip
                contentStyle={{
                  background: "#10131f",
                  border: "1px solid #29304a",
                  borderRadius: 14,
                }}
              />
              <Bar dataKey="cantidad" fill="#2867f0" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Cola de revisión">
          <ResponsiveContainer height={260} width="100%">
            <BarChart data={pendingData}>
              <CartesianGrid stroke="#1b2030" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="#66708f" />
              <YAxis allowDecimals={false} stroke="#66708f" />
              <Tooltip
                contentStyle={{
                  background: "#10131f",
                  border: "1px solid #29304a",
                  borderRadius: 14,
                }}
              />
              <Bar dataKey="cantidad" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Link className="surface surface-hover p-6" to="/admin/usuarios">
          <Users className="size-7 text-blue-400" />
          <h2 className="mt-4 text-xl font-extrabold">Gestión de Usuarios</h2>
          <p className="mt-2 text-sm text-slate-500">
            Administrá estados y accesos de las cuentas.
          </p>
          <Button className="mt-5" size="sm" variant="secondary">
            Abrir usuarios
          </Button>
        </Link>
        <Link
          className="surface surface-hover p-6"
          to="/admin/certificaciones"
        >
          <ShieldCheck className="size-7 text-violet-400" />
          <h2 className="mt-4 text-xl font-extrabold">
            Validar Certificaciones
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Revisá documentación profesional pendiente.
          </p>
          <Button className="mt-5" size="sm" variant="secondary">
            Abrir certificaciones
          </Button>
        </Link>
        {[
          [Star, "Moderar Calificaciones", "Revisá reseñas pendientes.", "/admin/moderacion"],
          [CircleDollarSign, "Configurar Comisiones", "Consultá la escala vigente.", "/admin/comisiones"],
          [CreditCard, "Supervisar Pagos", "Controlá estados y operaciones.", "/admin/pagos"],
          [UserRoundCheck, "Reportes Admin", "Analizá conexiones, finanzas y ranking.", "/admin/reportes"],
        ].map(([Icon, title, description, to]) => (
          <Link className="surface surface-hover p-6" key={title} to={to}>
            <Icon className="size-7 text-blue-400" />
            <h2 className="mt-4 text-xl font-extrabold">{title}</h2>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
            <Button className="mt-5" size="sm" variant="secondary">
              Abrir módulo
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
