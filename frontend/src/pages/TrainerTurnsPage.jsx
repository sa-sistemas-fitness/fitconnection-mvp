import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  LoaderCircle,
  MapPin,
  RefreshCw,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "../api/client.js";
import { ErrorState, LoadingState } from "../components/RequestState.jsx";
import {
  Button,
  Card,
  EmptyState,
  Modal,
  StatusBadge,
} from "../components/ui.jsx";
import { fullDate, money } from "../lib/format.js";

const tabs = [
  ["Solicitado", "Solicitados", Clock3],
  ["Reservado", "Reservados", CalendarDays],
  ["Cancelado", "Cancelados", XCircle],
  ["Finalizado", "Finalizados", CheckCircle2],
];
const tone = {
  Solicitado: "amber",
  Reservado: "green",
  Cancelado: "rose",
  Finalizado: "blue",
};

export function TrainerTurnsPage() {
  const [turns, setTurns] = useState([]);
  const [activeTab, setActiveTab] = useState("Solicitado");
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/turns/received");
      setTurns(data.turns);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "No fue posible cargar los turnos recibidos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () =>
      turns
        .filter((turn) => turn.estado.nombre === activeTab)
        .sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio)),
    [activeTab, turns],
  );

  const runAction = async (turn, action, body = {}) => {
    setWorkingId(turn.idTurno);
    setFeedback({ type: "", message: "" });
    try {
      await api.patch(`/turns/${turn.idTurno}/${action}`, body);
      const messages = {
        accept: "Turno aceptado y reservado.",
        reject: "Turno rechazado y cancelado.",
        cancel: "Turno cancelado.",
        finish: "Turno finalizado correctamente.",
      };
      setFeedback({ type: "success", message: messages[action] });
      setModal("");
      setSelected(null);
      if (action === "accept") setActiveTab("Reservado");
      if (["reject", "cancel"].includes(action)) setActiveTab("Cancelado");
      if (action === "finish") setActiveTab("Finalizado");
      await load();
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError.response?.data?.message ??
          "No se pudo actualizar el turno.",
      });
    } finally {
      setWorkingId(null);
    }
  };

  const openReason = (turn, action) => {
    setSelected(turn);
    setReason("");
    setModal(action);
    setFeedback({ type: "", message: "" });
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <LoadingState label="Cargando turnos recibidos..." />
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
          <p className="eyebrow">ENT-06</p>
          <h1 className="mt-2 text-4xl font-extrabold">Gestionar Turnos</h1>
          <p className="mt-2 text-slate-400">
            Confirmá solicitudes y administrá cada entrenamiento.
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

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tabs.map(([key, label, Icon]) => (
          <button
            className={`flex items-center justify-between rounded-2xl border p-5 transition ${
              activeTab === key
                ? "border-blue-500/50 bg-blue-500/10"
                : "border-white/[0.07] bg-[#0d0f19]"
            }`}
            key={key}
            onClick={() => setActiveTab(key)}
          >
            <span className="flex items-center gap-3 font-bold">
              <Icon className="size-5 text-blue-400" /> {label}
            </span>
            <strong className="text-2xl">
              {turns.filter((turn) => turn.estado.nombre === key).length}
            </strong>
          </button>
        ))}
      </div>

      <div className="mt-7 space-y-4">
        {visible.length ? (
          visible.map((turn) => (
            <Card className="p-5 md:p-6" key={turn.idTurno}>
              <div className="grid gap-5 xl:grid-cols-[1fr_1fr_auto] xl:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-extrabold">
                      {turn.cliente.usuario.nombre}{" "}
                      {turn.cliente.usuario.apellido}
                    </h2>
                    <StatusBadge tone={tone[turn.estado.nombre]}>
                      {turn.estado.nombre}
                    </StatusBadge>
                    {turn.pago && (
                      <StatusBadge
                        tone={
                          turn.pago.estado.nombre === "Aprobado"
                            ? "green"
                            : "rose"
                        }
                      >
                        Pago {turn.pago.estado.nombre}
                      </StatusBadge>
                    )}
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <UserRound className="size-4" /> Cliente #{turn.idCliente}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {turn.observaciones || "Sin observaciones."}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <p className="flex items-center gap-2 text-sm">
                    <CalendarDays className="size-4 text-blue-400" />
                    {fullDate(turn.fechaInicio)}
                  </p>
                  <p className="flex items-center gap-2 text-sm">
                    <Clock3 className="size-4 text-blue-400" />
                    {turn.horaInicio}–{turn.horaFin}
                  </p>
                  <p className="flex items-center gap-2 text-sm">
                    <MapPin className="size-4 text-blue-400" />
                    {turn.modalidad}
                  </p>
                  <p className="text-sm font-bold text-emerald-300">
                    {money(turn.tarifa)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 xl:max-w-64 xl:justify-end">
                  <Button
                    onClick={() => {
                      setSelected(turn);
                      setModal("detail");
                    }}
                    size="sm"
                    variant="secondary"
                  >
                    <Eye className="size-4" /> Detalle
                  </Button>
                  {turn.estado.nombre === "Solicitado" && (
                    <>
                      <Button
                        disabled={workingId === turn.idTurno}
                        onClick={() => runAction(turn, "accept")}
                        size="sm"
                      >
                        {workingId === turn.idTurno ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <Check className="size-4" />
                        )}
                        Aceptar
                      </Button>
                      <Button
                        onClick={() => openReason(turn, "reject")}
                        size="sm"
                        variant="danger"
                      >
                        <X className="size-4" /> Rechazar
                      </Button>
                    </>
                  )}
                  {turn.estado.nombre === "Reservado" && (
                    <>
                      <Button
                        disabled={workingId === turn.idTurno}
                        onClick={() => runAction(turn, "finish")}
                        size="sm"
                      >
                        <CheckCircle2 className="size-4" /> Finalizar
                      </Button>
                      <Button
                        onClick={() => openReason(turn, "cancel")}
                        size="sm"
                        variant="danger"
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState
            description={`No hay turnos en estado ${activeTab.toLowerCase()}.`}
            icon={CalendarDays}
            title={`Sin turnos ${tabs
              .find(([key]) => key === activeTab)[1]
              .toLowerCase()}`}
          />
        )}
      </div>

      <Modal
        onClose={() => setModal("")}
        open={modal === "detail" && Boolean(selected)}
        title="Detalle del turno"
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="rounded-2xl bg-white/[0.035] p-5">
              <h3 className="text-xl font-extrabold">
                {selected.cliente.usuario.nombre}{" "}
                {selected.cliente.usuario.apellido}
              </h3>
              <p className="mt-2 text-blue-300">
                {fullDate(selected.fechaInicio)} · {selected.horaInicio}–
                {selected.horaFin}
              </p>
            </div>
            {[
              ["Modalidad", selected.modalidad],
              ["Tarifa", money(selected.tarifa)],
              ["Estado", selected.estado.nombre],
              ["Observaciones", selected.observaciones || "Sin observaciones"],
              [
                "Motivo de cancelación",
                selected.motivoCancelacion || "No aplica",
              ],
            ].map(([label, value]) => (
              <div
                className="flex justify-between gap-5 border-b border-white/[0.07] pb-3"
                key={label}
              >
                <span className="text-slate-500">{label}</span>
                <strong className="max-w-xs text-right">{value}</strong>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        onClose={() => setModal("")}
        open={["reject", "cancel"].includes(modal) && Boolean(selected)}
        title={modal === "reject" ? "Rechazar turno" : "Cancelar turno"}
      >
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-300">
            Motivo
          </span>
          <textarea
            className="min-h-28 w-full rounded-2xl border border-white/10 bg-[#10131f] p-4 outline-none focus:border-rose-500/60"
            onChange={(event) => setReason(event.target.value)}
            placeholder="Indicá brevemente el motivo."
            value={reason}
          />
        </label>
        {feedback.type === "error" && feedback.message && (
          <p className="mt-4 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300">
            {feedback.message}
          </p>
        )}
        <Button
          className="mt-5 w-full"
          disabled={workingId === selected?.idTurno}
          onClick={() => runAction(selected, modal, { reason })}
          variant="danger"
        >
          {workingId === selected?.idTurno && (
            <LoaderCircle className="size-4 animate-spin" />
          )}
          Confirmar
        </Button>
      </Modal>
    </div>
  );
}
