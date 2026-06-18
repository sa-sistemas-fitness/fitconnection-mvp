import {
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  MessageSquareWarning,
  RefreshCw,
  Star,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { api } from "../api/client.js";
import { ErrorState, LoadingState } from "../components/RequestState.jsx";
import { Button, Card, EmptyState, Modal, StatusBadge } from "../components/ui.jsx";
import { fullDate } from "../lib/format.js";

export function AdminModerationPage() {
  const [reviews, setReviews] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState("");
  const [hideOpen, setHideOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/reviews/pending-moderation");
      setReviews(data.reviews);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "No fue posible cargar las calificaciones pendientes.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const moderate = async (review, status, comment = "") => {
    setWorkingId(review.idCalificacion);
    setFeedback({ type: "", message: "" });
    try {
      await api.patch(`/reviews/${review.idCalificacion}/moderate`, {
        status,
        comment,
      });
      setHideOpen(false);
      setSelected(null);
      setReason("");
      setFeedback({
        type: "success",
        message:
          status === "Visible"
            ? "La calificación fue revisada y se mantiene visible."
            : "La calificación fue ocultada y marcada como moderada.",
      });
      await load();
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError.response?.data?.message ??
          "No se pudo moderar la calificación.",
      });
    } finally {
      setWorkingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <LoadingState label="Cargando moderaciones pendientes..." />
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
          <p className="eyebrow">ADMIN-04</p>
          <h1 className="mt-2 text-4xl font-extrabold">
            Moderar Calificaciones
          </h1>
          <p className="mt-2 text-slate-400">
            Revisá contenido ofensivo, inválido o contrario a las reglas.
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
        {reviews.length ? (
          reviews.map((review) => (
            <Card className="p-6" key={review.idCalificacion}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Cliente</p>
                  <strong>
                    {review.cliente.usuario.nombre}{" "}
                    {review.cliente.usuario.apellido}
                  </strong>
                  <p className="mt-3 text-sm text-slate-500">Entrenador</p>
                  <strong>
                    {review.entrenador.usuario.nombre}{" "}
                    {review.entrenador.usuario.apellido}
                  </strong>
                </div>
                <StatusBadge tone="amber">
                  {review.estadoModeracion}
                </StatusBadge>
              </div>

              <div className="mt-5 flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    className={`size-5 ${
                      index < review.puntuacion ? "fill-current" : "text-slate-700"
                    }`}
                    key={index}
                  />
                ))}
                <strong className="ml-2 text-white">
                  {review.puntuacion}/5
                </strong>
              </div>
              <div className="mt-4 rounded-2xl bg-[#10131f] p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                  {review.comentario || "Sin comentario."}
                </p>
              </div>
              <p className="mt-3 text-xs text-slate-600">
                {fullDate(review.fecha)}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button
                  disabled={workingId === review.idCalificacion}
                  onClick={() => moderate(review, "Visible")}
                >
                  {workingId === review.idCalificacion ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                  Mantener visible
                </Button>
                <Button
                  disabled={workingId === review.idCalificacion}
                  onClick={() => {
                    setSelected(review);
                    setReason("");
                    setFeedback({ type: "", message: "" });
                    setHideOpen(true);
                  }}
                  variant="danger"
                >
                  <EyeOff className="size-4" /> Ocultar
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="xl:col-span-2">
            <EmptyState
              description="No hay calificaciones esperando revisión."
              icon={CheckCircle2}
              title="Moderación al día"
            />
          </div>
        )}
      </div>

      <Card className="mt-6 flex items-start gap-3 border-amber-500/15 bg-amber-500/[0.05] p-5">
        <MessageSquareWarning className="mt-0.5 size-5 shrink-0 text-amber-400" />
        <p className="text-sm leading-6 text-slate-400">
          El backend no ofrece borrado físico. La moderación usa
          `estadoModeracion`: Visible u Oculta. Al ocultar, el motivo se registra
          en auditoría y se anexa al comentario.
        </p>
      </Card>

      <Modal
        onClose={() => setHideOpen(false)}
        open={hideOpen}
        title="Ocultar calificación"
      >
        {selected && (
          <>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-300">
                Motivo de moderación
              </span>
              <textarea
                className="min-h-32 w-full rounded-2xl border border-white/10 bg-[#10131f] p-4 outline-none placeholder:text-slate-600 focus:border-rose-500/60"
                onChange={(event) => setReason(event.target.value)}
                placeholder="Contenido ofensivo, información inválida, spam..."
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
              disabled={!reason.trim() || workingId === selected.idCalificacion}
              onClick={() => moderate(selected, "Oculta", reason)}
              variant="danger"
            >
              {workingId === selected.idCalificacion && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              Ocultar y marcar moderada
            </Button>
          </>
        )}
      </Modal>
    </div>
  );
}
