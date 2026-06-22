import {
  Check,
  Clock3,
  LoaderCircle,
  MessageSquareText,
  RefreshCw,
  UserRoundCheck,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "../api/client.js";
import { ErrorState, LoadingState } from "../components/RequestState.jsx";
import { TrainerAvatar } from "../components/TrainerAvatar.jsx";
import { Button, Card, EmptyState, StatusBadge } from "../components/ui.jsx";
import { fullDate } from "../lib/format.js";

const tone = { Pendiente: "amber", Aceptada: "green", Rechazada: "rose" };

export function TrainerRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("Pendiente");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/connection-requests/received");
      setRequests(data.connectionRequests);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "No fue posible cargar las solicitudes recibidas.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => requests.filter((request) => request.estado.nombre === filter),
    [filter, requests],
  );

  const respond = async (request, action) => {
    setWorkingId(request.idSolicitud);
    setFeedback({ type: "", message: "" });
    try {
      await api.patch(
        `/connection-requests/${request.idSolicitud}/${action}`,
      );
      setFeedback({
        type: "success",
        message:
          action === "accept"
            ? "Solicitud aceptada. El chat con el cliente ya está disponible."
            : "Solicitud rechazada correctamente.",
      });
      await load();
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError.response?.data?.message ??
          "No se pudo actualizar la solicitud.",
      });
    } finally {
      setWorkingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <LoadingState label="Cargando solicitudes recibidas..." />
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
          <p className="eyebrow">ENT-05</p>
          <h1 className="mt-2 text-4xl font-extrabold">
            Solicitudes Recibidas
          </h1>
          <p className="mt-2 text-slate-400">
            Revisá quién quiere comenzar a entrenar con vos.
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

      <div className="mt-7 flex flex-wrap gap-2">
        {["Pendiente", "Aceptada", "Rechazada"].map((status) => (
          <button
            className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
              filter === status
                ? "border-blue-500/50 bg-blue-500/15 text-blue-200"
                : "border-white/10 bg-white/[0.03] text-slate-500"
            }`}
            key={status}
            onClick={() => setFilter(status)}
          >
            {status} (
            {requests.filter((item) => item.estado.nombre === status).length})
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {visible.length ? (
          visible.map((request) => (
            <Card className="p-6" key={request.idSolicitud}>
              <div className="flex items-start gap-4">
                <TrainerAvatar
                  className="size-16 rounded-2xl"
                  index={(request.idCliente - 1) % 6}
                  src={request.cliente.usuario.fotoPerfil}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-xl font-extrabold">
                      {request.cliente.usuario.nombre}{" "}
                      {request.cliente.usuario.apellido}
                    </h2>
                    <StatusBadge tone={tone[request.estado.nombre]}>
                      {request.estado.nombre}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <Clock3 className="size-4" />
                    {fullDate(request.fechaSolicitud)}
                  </p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-white/[0.07] bg-[#10131f] p-4">
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-400">
                  <MessageSquareText className="size-4" /> Mensaje inicial
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                  {request.mensajeInicial}
                </p>
              </div>
              {request.estado.nombre === "Pendiente" && (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Button
                    disabled={workingId === request.idSolicitud}
                    onClick={() => respond(request, "accept")}
                  >
                    {workingId === request.idSolicitud ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    Aceptar
                  </Button>
                  <Button
                    disabled={workingId === request.idSolicitud}
                    onClick={() => respond(request, "reject")}
                    variant="danger"
                  >
                    <X className="size-4" /> Rechazar
                  </Button>
                </div>
              )}
            </Card>
          ))
        ) : (
          <div className="xl:col-span-2">
            <EmptyState
              description={`No hay solicitudes en estado ${filter.toLowerCase()}.`}
              icon={UserRoundCheck}
              title={`Sin solicitudes ${filter.toLowerCase()}s`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
