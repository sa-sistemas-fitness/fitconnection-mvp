import {
  Ban,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  Search,
  UserRoundX,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "../api/client.js";
import { ErrorState, LoadingState } from "../components/RequestState.jsx";
import { Button, Card, EmptyState, Input, StatusBadge } from "../components/ui.jsx";

const statusTone = {
  Activo: "green",
  Suspendido: "amber",
  Bloqueado: "rose",
  Inactivo: "slate",
};

const actions = [
  ["Activo", "Activar", CheckCircle2, "secondary"],
  ["Suspendido", "Suspender", Clock3, "secondary"],
  ["Bloqueado", "Bloquear", LockKeyhole, "danger"],
  ["Inactivo", "Inactivo", UserRoundX, "danger"],
];

function dateTime(value) {
  if (!value) return "Nunca";
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/users");
      setUsers(data.users);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "No fue posible cargar los usuarios.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visibleUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter((user) =>
      [
        user.nombre,
        user.apellido,
        user.email,
        user.estadoCuenta,
        ...user.roles,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, users]);

  const changeStatus = async (user, status) => {
    setWorkingId(user.idUsuario);
    setFeedback({ type: "", message: "" });
    try {
      await api.patch(`/users/${user.idUsuario}/status`, { status });
      setFeedback({
        type: "success",
        message: `${user.nombre} ${user.apellido} ahora está ${status.toLowerCase()}.`,
      });
      await load();
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError.response?.data?.message ??
          "No se pudo cambiar el estado de la cuenta.",
      });
    } finally {
      setWorkingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <LoadingState label="Cargando cuentas de usuario..." />
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
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">ADMIN-02</p>
          <h1 className="mt-2 text-4xl font-extrabold">
            Gestión de Usuarios
          </h1>
          <p className="mt-2 text-slate-400">
            Controlá el acceso y estado de todas las cuentas.
          </p>
        </div>
        <Button onClick={load} variant="secondary">
          <RefreshCw className="size-4" /> Actualizar
        </Button>
      </div>

      {feedback.message && (
        <p
          className={`mt-6 rounded-2xl border p-4 text-sm ${
            feedback.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/20 bg-rose-500/10 text-rose-300"
          }`}
        >
          {feedback.message}
        </p>
      )}

      <Input
        className="mt-7"
        icon={Search}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar por nombre, email, rol o estado..."
        value={query}
      />

      <Card className="mt-6 overflow-hidden p-0">
        {visibleUsers.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.025] text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">Nombre</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Roles</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4">Registro</th>
                  <th className="px-5 py-4">Último login</th>
                  <th className="px-5 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user) => (
                  <tr
                    className="border-b border-white/[0.06] text-sm text-slate-300"
                    key={user.idUsuario}
                  >
                    <td className="px-5 py-5 font-bold text-white">
                      {user.nombre} {user.apellido}
                    </td>
                    <td className="px-5 py-5">{user.email}</td>
                    <td className="px-5 py-5">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <StatusBadge key={role} tone="blue">
                            {role}
                          </StatusBadge>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <StatusBadge tone={statusTone[user.estadoCuenta]}>
                        {user.estadoCuenta}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-5">
                      {dateTime(user.fechaRegistro)}
                    </td>
                    <td className="px-5 py-5">
                      {dateTime(user.ultimoLogin)}
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex flex-wrap gap-2">
                        {actions.map(([status, label, Icon, variant]) => (
                          <Button
                            disabled={
                              workingId === user.idUsuario ||
                              user.estadoCuenta === status
                            }
                            key={status}
                            onClick={() => changeStatus(user, status)}
                            size="sm"
                            variant={variant}
                          >
                            {workingId === user.idUsuario ? (
                              <LoaderCircle className="size-3.5 animate-spin" />
                            ) : (
                              <Icon className="size-3.5" />
                            )}
                            {label}
                          </Button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            description="Probá con otro nombre, email, rol o estado."
            icon={Users}
            title="No encontramos usuarios"
          />
        )}
      </Card>

      <Card className="mt-5 flex items-start gap-3 border-amber-500/15 bg-amber-500/[0.05] p-5">
        <Ban className="mt-0.5 size-5 shrink-0 text-amber-400" />
        <p className="text-sm leading-6 text-slate-400">
          Las cuentas suspendidas, bloqueadas o inactivas son rechazadas por el
          backend al iniciar sesión. La cuenta administrativa actual no puede
          desactivarse a sí misma.
        </p>
      </Card>
    </div>
  );
}
