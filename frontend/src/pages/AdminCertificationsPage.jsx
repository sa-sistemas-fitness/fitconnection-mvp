import {
  Award,
  CalendarDays,
  Check,
  FileBadge,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { api } from "../api/client.js";
import { ErrorState, LoadingState } from "../components/RequestState.jsx";
import {
  Button,
  Card,
  EmptyState,
  Modal,
  StatusBadge,
} from "../components/ui.jsx";
import { fullDate } from "../lib/format.js";

export function AdminCertificationsPage() {
  const [certifications, setCertifications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/certifications/pending");
      setCertifications(data.certifications);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "No fue posible cargar las certificaciones pendientes.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (certification) => {
    setWorkingId(certification.idCertificacion);
    setFeedback({ type: "", message: "" });
    try {
      await api.patch(
        `/certifications/${certification.idCertificacion}/approve`,
        { comment: "Documentación verificada por Administración." },
      );
      setFeedback({
        type: "success",
        message: `La certificación “${certification.titulo}” fue validada.`,
      });
      await load();
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError.response?.data?.message ??
          "No se pudo aprobar la certificación.",
      });
    } finally {
      setWorkingId(null);
    }
  };

  const reject = async () => {
    if (!comment.trim()) {
      setFeedback({
        type: "error",
        message: "Ingresá un motivo para rechazar la certificación.",
      });
      return;
    }
    setWorkingId(selected.idCertificacion);
    setFeedback({ type: "", message: "" });
    try {
      await api.patch(`/certifications/${selected.idCertificacion}/reject`, {
        comment,
      });
      setRejectOpen(false);
      setFeedback({
        type: "success",
        message: `La certificación “${selected.titulo}” fue rechazada.`,
      });
      setSelected(null);
      setComment("");
      await load();
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError.response?.data?.message ??
          "No se pudo rechazar la certificación.",
      });
    } finally {
      setWorkingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <LoadingState label="Cargando certificaciones pendientes..." />
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
          <p className="eyebrow">ADMIN-03</p>
          <h1 className="mt-2 text-4xl font-extrabold">
            Validar Certificaciones
          </h1>
          <p className="mt-2 text-slate-400">
            Revisá la documentación presentada por entrenadores.
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

      <div className="mt-7 grid gap-5 xl:grid-cols-2">
        {certifications.length ? (
          certifications.map((certification) => (
            <Card className="p-6" key={certification.idCertificacion}>
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-500/10 text-violet-400">
                  <Award className="size-6" />
                </span>
                <StatusBadge tone="amber">
                  {certification.estado.nombre}
                </StatusBadge>
              </div>

              <h2 className="mt-5 text-xl font-extrabold">
                {certification.titulo}
              </h2>
              <p className="mt-1 text-sm text-blue-300">
                {certification.entidadEmisora}
              </p>
              <p className="mt-3 text-sm font-semibold text-white">
                {certification.entrenador.usuario.nombre}{" "}
                {certification.entrenador.usuario.apellido}
              </p>
              <p className="text-xs text-slate-500">
                {certification.entrenador.usuario.email}
              </p>

              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-[#10131f] p-3">
                  <p className="flex items-center gap-2 text-slate-500">
                    <CalendarDays className="size-4" /> Fecha de emisión
                  </p>
                  <strong className="mt-1 block">
                    {fullDate(certification.fechaEmision)}
                  </strong>
                </div>
                <div className="rounded-xl bg-[#10131f] p-3">
                  <p className="text-slate-500">Vencimiento</p>
                  <strong className="mt-1 block">
                    {certification.fechaVencimiento
                      ? fullDate(certification.fechaVencimiento)
                      : "Sin vencimiento"}
                  </strong>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/[0.07] px-4 py-3 text-sm">
                <FileBadge className="size-5 text-blue-400" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Archivo simulado</p>
                  <strong className="block truncate">
                    {certification.archivo || "No informado"}
                  </strong>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button
                  disabled={workingId === certification.idCertificacion}
                  onClick={() => approve(certification)}
                >
                  {workingId === certification.idCertificacion ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  Aprobar
                </Button>
                <Button
                  disabled={workingId === certification.idCertificacion}
                  onClick={() => {
                    setSelected(certification);
                    setComment("");
                    setFeedback({ type: "", message: "" });
                    setRejectOpen(true);
                  }}
                  variant="danger"
                >
                  <X className="size-4" /> Rechazar
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="xl:col-span-2">
            <EmptyState
              description="No hay documentación esperando revisión administrativa."
              icon={ShieldCheck}
              title="No hay certificaciones pendientes"
            />
          </div>
        )}
      </div>

      <Modal
        onClose={() => setRejectOpen(false)}
        open={rejectOpen}
        title="Rechazar certificación"
      >
        {selected && (
          <>
            <div className="rounded-2xl bg-white/[0.035] p-4">
              <strong>{selected.titulo}</strong>
              <p className="mt-1 text-sm text-slate-500">
                {selected.entrenador.usuario.nombre}{" "}
                {selected.entrenador.usuario.apellido}
              </p>
            </div>
            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-slate-300">
                Comentario administrativo
              </span>
              <textarea
                className="min-h-32 w-full rounded-2xl border border-white/10 bg-[#10131f] p-4 outline-none placeholder:text-slate-600 focus:border-rose-500/60"
                onChange={(event) => setComment(event.target.value)}
                placeholder="Explicá qué debe corregir o volver a presentar."
                value={comment}
              />
            </label>
            {feedback.type === "error" && feedback.message && (
              <p className="mt-4 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300">
                {feedback.message}
              </p>
            )}
            <Button
              className="mt-5 w-full"
              disabled={workingId === selected.idCertificacion}
              onClick={reject}
              variant="danger"
            >
              {workingId === selected.idCertificacion && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              Confirmar rechazo
            </Button>
          </>
        )}
      </Modal>
    </div>
  );
}
