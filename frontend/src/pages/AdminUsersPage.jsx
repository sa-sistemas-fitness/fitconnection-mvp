import {
  Ban,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldAlert,
  UserRoundX,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "../api/client.js";
import { ErrorState, LoadingState } from "../components/RequestState.jsx";
import { Button, Card, EmptyState, Input, Modal, StatusBadge } from "../components/ui.jsx";

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

const accessActions = [
  ["block-account", "Bloquear cuenta", LockKeyhole, "danger", true],
  ["block-account-dni", "Bloquear cuenta y DNI", ShieldAlert, "danger", true],
  ["unblock-account", "Desbloquear cuenta", CheckCircle2, "secondary", false],
  ["unblock-dni", "Desbloquear DNI", RefreshCw, "secondary", false],
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
  const [securityModal, setSecurityModal] = useState(null);
  const [reason, setReason] = useState("");

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
        user.dniMascara,
        user.dniBloqueado ? "dni bloqueado" : "",
        user.motivoBloqueoDni ?? "",
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

  const openAccessAction = (user, action, label, requiresReason) => {
    setReason("");
    setSecurityModal({ user, action, label, requiresReason });
  };

  const runAccessAction = async () => {
    if (!securityModal) return;
    if (securityModal.requiresReason && reason.trim().length < 4) {
      setFeedback({
        type: "error",
        message: "Indicá un motivo de al menos 4 caracteres.",
      });
      return;
    }
    setWorkingId(securityModal.user.idUsuario);
    setFeedback({ type: "", message: "" });
    try {
      const { data } = await api.patch(
        `/users/${securityModal.user.idUsuario}/access`,
        { action: securityModal.action, reason },
      );
      setFeedback({
        type: "success",
        message: data.message ?? "Acción administrativa aplicada.",
      });
      setSecurityModal(null);
      setReason("");
      await load();
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError.response?.data?.message ??
          "No se pudo aplicar la acción administrativa.",
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
            <table className="w-full min-w-[1320px] text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.025] text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">Nombre</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">DNI</th>
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
                      <div className="space-y-2">
                        <span className="font-semibold text-slate-200">
                          {user.dniMascara ?? "Sin dato"}
                        </span>
                        {user.dniBloqueado && (
                          <div className="space-y-1">
                            <StatusBadge tone="rose">DNI bloqueado</StatusBadge>
                            <p className="max-w-56 text-xs leading-5 text-slate-500">
                              Motivo: {user.motivoBloqueoDni ?? "Sin motivo"}
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
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
                        {accessActions.map(([action, label, Icon, variant, requiresReason]) => (
                          <Button
                            disabled={
                              workingId === user.idUsuario ||
                              (action === "unblock-account" && user.estadoCuenta === "Activo") ||
                              (action === "unblock-dni" && !user.dniBloqueado)
                            }
                            key={action}
                            onClick={() => openAccessAction(user, action, label, requiresReason)}
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

      <Modal
        onClose={() => setSecurityModal(null)}
        open={Boolean(securityModal)}
        title={securityModal?.label ?? "Acción administrativa"}
      >
        {securityModal && (
          <div className="space-y-5">
            <p className="text-sm leading-6 text-slate-400">
              Vas a aplicar esta acción sobre{" "}
              <span className="font-bold text-white">
                {securityModal.user.nombre} {securityModal.user.apellido}
              </span>
              . DNI asociado:{" "}
              <span className="font-bold text-slate-200">
                {securityModal.user.dniMascara ?? "Sin dato"}
              </span>
              .
            </p>
            {(securityModal.requiresReason || securityModal.action === "unblock-dni") && (
              <Input
                label={securityModal.requiresReason ? "Motivo obligatorio" : "Motivo / comentario opcional"}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Ej.: incumplimiento de normas de la plataforma"
                value={reason}
              />
            )}
            {securityModal.user.dniBloqueado && (
              <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                Motivo actual del bloqueo DNI:{" "}
                {securityModal.user.motivoBloqueoDni ?? "Sin motivo registrado"}
              </p>
            )}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button onClick={() => setSecurityModal(null)} type="button" variant="secondary">
                Cancelar
              </Button>
              <Button
                disabled={workingId === securityModal.user.idUsuario}
                onClick={runAccessAction}
                type="button"
                variant={securityModal.action.startsWith("block") ? "danger" : "primary"}
              >
                {workingId === securityModal.user.idUsuario ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : null}
                Confirmar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Card className="mt-5 flex items-start gap-3 border-amber-500/15 bg-amber-500/[0.05] p-5">
        <Ban className="mt-0.5 size-5 shrink-0 text-amber-400" />
        <p className="text-sm leading-6 text-slate-400">
          Las cuentas suspendidas, bloqueadas o inactivas son rechazadas por el
          backend al iniciar sesión. La cuenta administrativa actual no puede
          desactivarse a sí misma. El DNI se muestra enmascarado y, si está
          bloqueado, impide nuevos registros con esa identidad.
        </p>
      </Card>
    </div>
  );
}
