import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Star,
  WalletCards,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client.js";
import { ErrorState, LoadingState } from "../components/RequestState.jsx";
import { TrainerAvatar } from "../components/TrainerAvatar.jsx";
import {
  Button,
  Card,
  EmptyState,
  Modal,
  Select,
  StatusBadge,
} from "../components/ui.jsx";
import { fullDate, money, trainerName } from "../lib/format.js";

const tabs = [
  { key: "Solicitado", label: "Solicitados", icon: Clock3 },
  { key: "Reservado", label: "Reservados", icon: CalendarDays },
  { key: "Cancelado", label: "Cancelados", icon: XCircle },
  { key: "Finalizado", label: "Finalizados", icon: CheckCircle2 },
];

const statusTone = {
  Solicitado: "amber",
  Reservado: "green",
  Cancelado: "rose",
  Finalizado: "blue",
};

function specialties(turn) {
  return (
    turn.entrenador.especialidades
      ?.map(({ especialidad }) => especialidad.nombre)
      .join(" · ") || "Entrenamiento personalizado"
  );
}

function TurnSummary({ turn, payment }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5">
      <div className="flex items-center gap-4">
        <TrainerAvatar
          className="size-16 rounded-2xl"
          index={(turn.idEntrenador - 1) % 6}
        />
        <div className="min-w-0 flex-1">
          <strong className="block truncate text-lg">
            {trainerName(turn.entrenador)}
          </strong>
          <p className="mt-1 truncate text-sm text-blue-300">
            {specialties(turn)}
          </p>
        </div>
        <StatusBadge tone={statusTone[turn.estado.nombre]}>
          {turn.estado.nombre}
        </StatusBadge>
      </div>
      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl bg-[#10131f] p-3">
          <p className="text-slate-500">Fecha y hora</p>
          <strong className="mt-1 block">
            {fullDate(turn.fechaInicio)} · {turn.horaInicio}–{turn.horaFin}
          </strong>
        </div>
        <div className="rounded-xl bg-[#10131f] p-3">
          <p className="text-slate-500">Modalidad y tarifa</p>
          <strong className="mt-1 block">
            {turn.modalidad} · {money(turn.tarifa)}
          </strong>
        </div>
      </div>
      {payment && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-white/[0.07] px-4 py-3 text-sm">
          <span className="text-slate-400">Pago asociado</span>
          <StatusBadge
            tone={payment.estado.nombre === "Aprobado" ? "green" : "rose"}
          >
            {payment.estado.nombre}
          </StatusBadge>
        </div>
      )}
    </div>
  );
}

export function MyTurnsPage() {
  const [turns, setTurns] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState("Solicitado");
  const [selectedTurn, setSelectedTurn] = useState(null);
  const [modal, setModal] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [cancelReason, setCancelReason] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    descuento: 0,
    metodoPago: "Tarjeta simulada",
    resultado: "Aprobado",
  });
  const [reviewForm, setReviewForm] = useState({
    puntuacion: 5,
    comentario: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [turnResponse, paymentResponse] = await Promise.all([
        api.get("/turns/my"),
        api.get("/payments/my"),
      ]);
      setTurns(turnResponse.data.turns);
      setPayments(paymentResponse.data.payments);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "No fue posible cargar tus turnos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const paymentByTurn = useMemo(
    () => new Map(payments.map((payment) => [payment.idTurno, payment])),
    [payments],
  );

  const visibleTurns = useMemo(
    () =>
      turns
        .filter((turn) => turn.estado.nombre === activeTab)
        .sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio)),
    [activeTab, turns],
  );

  const counts = useMemo(
    () =>
      turns.reduce((result, turn) => {
        result[turn.estado.nombre] = (result[turn.estado.nombre] ?? 0) + 1;
        return result;
      }, {}),
    [turns],
  );

  const selectedPayment = selectedTurn
    ? paymentByTurn.get(selectedTurn.idTurno)
    : null;
  const discount = Math.max(0, Number(paymentForm.descuento) || 0);
  const paymentTotal = selectedTurn
    ? Math.max(0, selectedTurn.tarifa - discount)
    : 0;

  const openModal = (type, turn) => {
    setSelectedTurn(turn);
    setModal(type);
    setFeedback({ type: "", message: "" });
    if (type === "cancel") setCancelReason("");
    if (type === "payment") {
      const previousPayment = paymentByTurn.get(turn.idTurno);
      setPaymentForm({
        descuento: previousPayment?.descuento ?? 0,
        metodoPago: previousPayment?.metodoPago ?? "Tarjeta simulada",
        resultado: "Aprobado",
      });
    }
    if (type === "review") {
      setReviewForm({ puntuacion: 5, comentario: "" });
    }
  };

  const closeModal = () => {
    if (submitting) return;
    setModal("");
    setSelectedTurn(null);
  };

  const cancelTurn = async () => {
    setSubmitting(true);
    setFeedback({ type: "", message: "" });
    try {
      await api.patch(`/turns/${selectedTurn.idTurno}/cancel`, {
        reason: cancelReason.trim() || "Cancelado por el cliente.",
      });
      setModal("");
      setSelectedTurn(null);
      setActiveTab("Cancelado");
      setFeedback({
        type: "success",
        message: "El turno fue cancelado correctamente.",
      });
      await loadData();
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError.response?.data?.message ??
          "No se pudo cancelar el turno.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmPayment = async () => {
    if (discount > selectedTurn.tarifa) {
      setFeedback({
        type: "error",
        message: "El descuento no puede superar la tarifa.",
      });
      return;
    }
    setSubmitting(true);
    setFeedback({ type: "", message: "" });
    try {
      const { data } = await api.post("/payments", {
        turnId: selectedTurn.idTurno,
        descuento: discount,
        metodoPago: paymentForm.metodoPago,
        resultado: paymentForm.resultado,
      });
      setModal("");
      setSelectedTurn(null);
      setFeedback({
        type: data.payment.estado.nombre === "Aprobado" ? "success" : "error",
        message:
          data.payment.estado.nombre === "Aprobado"
            ? "Pago simulado aprobado. La calificación se habilitará al finalizar el turno."
            : "Pago simulado rechazado. Podés reintentarlo desde este turno.",
      });
      await loadData();
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError.response?.data?.message ?? "No se pudo procesar el pago.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitReview = async () => {
    setSubmitting(true);
    setFeedback({ type: "", message: "" });
    try {
      await api.post("/reviews", {
        paymentId: selectedPayment.idPago,
        puntuacion: reviewForm.puntuacion,
        comentario: reviewForm.comentario,
      });
      await api.get(`/reviews/trainer/${selectedTurn.idEntrenador}`);
      setModal("");
      setSelectedTurn(null);
      setFeedback({
        type: "success",
        message:
          "Calificación enviada. El promedio del entrenador fue actualizado.",
      });
      await loadData();
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError.response?.data?.message ??
          "No se pudo enviar la calificación.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <LoadingState label="Organizando tus turnos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container py-10">
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Agenda y actividad</p>
          <h1 className="mt-2 text-4xl font-extrabold">Mis Turnos</h1>
          <p className="mt-2 text-slate-400">
            Gestioná solicitudes, reservas, pagos y calificaciones.
          </p>
        </div>
        <Button onClick={loadData} variant="secondary">
          <RefreshCw className="size-4" /> Actualizar
        </Button>
      </div>

      {feedback.message && (
        <div
          className={`mt-6 flex items-center gap-3 rounded-2xl border p-4 text-sm ${
            feedback.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/20 bg-rose-500/10 text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="size-5 shrink-0" />
          ) : (
            <XCircle className="size-5 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            className={`flex items-center justify-between rounded-2xl border p-5 text-left transition ${
              activeTab === key
                ? "border-blue-500/50 bg-blue-500/10 shadow-[0_16px_35px_rgba(37,99,235,.1)]"
                : "border-white/[0.07] bg-[#0d0f19] hover:border-white/20"
            }`}
            key={key}
            onClick={() => setActiveTab(key)}
          >
            <span className="flex items-center gap-3">
              <span
                className={`grid size-10 place-items-center rounded-xl ${
                  activeTab === key
                    ? "bg-blue-500 text-white"
                    : "bg-white/[0.05] text-slate-500"
                }`}
              >
                <Icon className="size-5" />
              </span>
              <strong>{label}</strong>
            </span>
            <span className="text-2xl font-extrabold">
              {counts[key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-7 space-y-4">
        {visibleTurns.length ? (
          visibleTurns.map((turn) => {
            const payment = paymentByTurn.get(turn.idTurno);
            const paymentApproved = payment?.estado.nombre === "Aprobado";
            const paymentRejected = payment?.estado.nombre === "Rechazado";
            const canReview =
              turn.estado.nombre === "Finalizado" &&
              paymentApproved &&
              !payment.calificacion;

            return (
              <Card className="overflow-hidden p-0" key={turn.idTurno}>
                <div className="grid gap-5 p-5 lg:grid-cols-[auto_1.2fr_1fr_auto] lg:items-center lg:p-6">
                  <TrainerAvatar
                    className="size-20 rounded-2xl"
                    index={(turn.idEntrenador - 1) % 6}
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        className="text-xl font-extrabold hover:text-blue-300"
                        to={`/entrenadores/${turn.idEntrenador}`}
                      >
                        {trainerName(turn.entrenador)}
                      </Link>
                      <StatusBadge tone={statusTone[turn.estado.nombre]}>
                        {turn.estado.nombre}
                      </StatusBadge>
                      {payment && (
                        <StatusBadge
                          tone={paymentApproved ? "green" : "rose"}
                        >
                          Pago {payment.estado.nombre.toLowerCase()}
                        </StatusBadge>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-blue-300">
                      {specialties(turn)}
                    </p>
                    {turn.observaciones && (
                      <p className="mt-2 line-clamp-1 text-sm text-slate-500">
                        {turn.observaciones}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                    <p className="flex items-center gap-2 text-sm text-slate-300">
                      <CalendarDays className="size-4 text-blue-400" />
                      {fullDate(turn.fechaInicio)}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-slate-300">
                      <Clock3 className="size-4 text-blue-400" />
                      {turn.horaInicio}–{turn.horaFin}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-slate-300">
                      <MapPin className="size-4 text-blue-400" />
                      {turn.modalidad} · {money(turn.tarifa)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:max-w-56 lg:justify-end">
                    <Button
                      onClick={() => openModal("detail", turn)}
                      size="sm"
                      variant="secondary"
                    >
                      <Eye className="size-4" /> Detalle
                    </Button>
                    {turn.estado.nombre === "Solicitado" && (
                      <Button
                        onClick={() => openModal("cancel", turn)}
                        size="sm"
                        variant="danger"
                      >
                        Cancelar
                      </Button>
                    )}
                    {turn.estado.nombre === "Reservado" &&
                      !paymentApproved && (
                        <>
                          <Button
                            onClick={() => openModal("payment", turn)}
                            size="sm"
                          >
                            <CreditCard className="size-4" />
                            {paymentRejected ? "Reintentar pago" : "Pagar"}
                          </Button>
                          <Button
                            onClick={() => openModal("cancel", turn)}
                            size="sm"
                            variant="danger"
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                    {canReview && (
                      <Button
                        onClick={() => openModal("review", turn)}
                        size="sm"
                      >
                        <Star className="size-4" /> Calificar
                      </Button>
                    )}
                    {turn.estado.nombre === "Finalizado" &&
                      payment?.calificacion && (
                        <StatusBadge tone="green">
                          <CheckCircle2 className="size-3.5" /> Calificado
                        </StatusBadge>
                      )}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <EmptyState
            action={
              activeTab === "Solicitado" ? (
                <Link to="/entrenadores">
                  <Button>Buscar entrenador</Button>
                </Link>
              ) : null
            }
            description={`No hay turnos en estado ${activeTab.toLowerCase()}.`}
            icon={CalendarDays}
            title={`Sin turnos ${tabs
              .find((tab) => tab.key === activeTab)
              .label.toLowerCase()}`}
          />
        )}
      </div>

      <Modal
        onClose={closeModal}
        open={modal === "detail" && Boolean(selectedTurn)}
        title="Detalle del turno"
      >
        {selectedTurn && (
          <>
            <TurnSummary turn={selectedTurn} payment={selectedPayment} />
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between border-b border-white/[0.07] pb-3">
                <span className="text-slate-500">Fecha de solicitud</span>
                <strong>{fullDate(selectedTurn.fechaSolicitud)}</strong>
              </div>
              <div className="flex justify-between border-b border-white/[0.07] pb-3">
                <span className="text-slate-500">Observaciones</span>
                <strong className="max-w-xs text-right">
                  {selectedTurn.observaciones || "Sin observaciones"}
                </strong>
              </div>
              {selectedTurn.motivoCancelacion && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Motivo de cancelación</span>
                  <strong className="max-w-xs text-right text-rose-300">
                    {selectedTurn.motivoCancelacion}
                  </strong>
                </div>
              )}
            </div>
          </>
        )}
      </Modal>

      <Modal
        onClose={closeModal}
        open={modal === "cancel" && Boolean(selectedTurn)}
        title="Cancelar turno"
      >
        {selectedTurn && (
          <>
            <TurnSummary turn={selectedTurn} payment={selectedPayment} />
            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-slate-300">
                Motivo de cancelación
              </span>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-white/10 bg-[#10131f] p-4 text-white outline-none placeholder:text-slate-600 focus:border-rose-500/60"
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Contanos brevemente por qué cancelás."
                value={cancelReason}
              />
            </label>
            {feedback.type === "error" && feedback.message && (
              <p className="mt-4 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300">
                {feedback.message}
              </p>
            )}
            <Button
              className="mt-5 w-full"
              disabled={submitting}
              onClick={cancelTurn}
              variant="danger"
            >
              {submitting && (
                <LoaderCircle className="size-5 animate-spin" />
              )}
              Confirmar cancelación
            </Button>
          </>
        )}
      </Modal>

      <Modal
        onClose={closeModal}
        open={modal === "payment" && Boolean(selectedTurn)}
        title={selectedPayment ? "Reintentar pago simulado" : "Pago simulado"}
      >
        {selectedTurn && (
          <>
            <TurnSummary turn={selectedTurn} payment={selectedPayment} />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-300">
                  Descuento
                </span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-[#10131f] px-4 py-3.5 text-white outline-none focus:border-blue-500/70"
                  max={selectedTurn.tarifa}
                  min="0"
                  onChange={(event) =>
                    setPaymentForm({
                      ...paymentForm,
                      descuento: event.target.value,
                    })
                  }
                  type="number"
                  value={paymentForm.descuento}
                />
              </label>
              <Select
                label="Método de pago"
                onChange={(event) =>
                  setPaymentForm({
                    ...paymentForm,
                    metodoPago: event.target.value,
                  })
                }
                value={paymentForm.metodoPago}
              >
                <option>Tarjeta simulada</option>
                <option>Transferencia simulada</option>
                <option>Billetera virtual simulada</option>
              </Select>
              <div className="sm:col-span-2">
                <Select
                  label="Resultado de la simulación"
                  onChange={(event) =>
                    setPaymentForm({
                      ...paymentForm,
                      resultado: event.target.value,
                    })
                  }
                  value={paymentForm.resultado}
                >
                  <option>Aprobado</option>
                  <option>Rechazado</option>
                </Select>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-blue-500/15 bg-blue-500/[0.06] p-5">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Monto</span>
                <span>{money(selectedTurn.tarifa)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm text-slate-400">
                <span>Descuento</span>
                <span>− {money(discount)}</span>
              </div>
              <div className="mt-4 flex justify-between border-t border-white/10 pt-4">
                <strong>Total</strong>
                <strong className="text-2xl text-white">
                  {money(paymentTotal)}
                </strong>
              </div>
            </div>
            {feedback.type === "error" && feedback.message && (
              <p className="mt-4 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300">
                {feedback.message}
              </p>
            )}
            <Button
              className="mt-5 w-full"
              disabled={submitting}
              onClick={confirmPayment}
              size="lg"
            >
              {submitting ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <WalletCards className="size-5" />
              )}
              Confirmar Pago
            </Button>
            <p className="mt-3 text-center text-xs text-slate-500">
              Operación de demostración. No se procesa dinero real.
            </p>
          </>
        )}
      </Modal>

      <Modal
        onClose={closeModal}
        open={modal === "review" && Boolean(selectedTurn)}
        title="Calificar entrenador"
      >
        {selectedTurn && selectedPayment && (
          <>
            <TurnSummary turn={selectedTurn} payment={selectedPayment} />
            <div className="mt-6 text-center">
              <p className="text-sm font-semibold text-slate-300">
                ¿Cómo fue tu experiencia?
              </p>
              <div className="mt-3 flex justify-center gap-2">
                {Array.from({ length: 5 }, (_, index) => index + 1).map(
                  (value) => (
                    <button
                      aria-label={`${value} estrellas`}
                      className="rounded-xl p-2 transition hover:bg-amber-500/10"
                      key={value}
                      onClick={() =>
                        setReviewForm({
                          ...reviewForm,
                          puntuacion: value,
                        })
                      }
                      type="button"
                    >
                      <Star
                        className={`size-8 ${
                          value <= reviewForm.puntuacion
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-700"
                        }`}
                      />
                    </button>
                  ),
                )}
              </div>
              <strong className="mt-2 block text-amber-300">
                {reviewForm.puntuacion} de 5
              </strong>
            </div>
            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-slate-300">
                Comentario
              </span>
              <textarea
                className="min-h-32 w-full rounded-2xl border border-white/10 bg-[#10131f] p-4 text-white outline-none placeholder:text-slate-600 focus:border-amber-500/60"
                onChange={(event) =>
                  setReviewForm({
                    ...reviewForm,
                    comentario: event.target.value,
                  })
                }
                placeholder="Contá qué destacarías del entrenamiento."
                value={reviewForm.comentario}
              />
            </label>
            {feedback.type === "error" && feedback.message && (
              <p className="mt-4 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300">
                {feedback.message}
              </p>
            )}
            <Button
              className="mt-5 w-full"
              disabled={submitting}
              onClick={submitReview}
              size="lg"
            >
              {submitting ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <Star className="size-5" />
              )}
              Enviar Calificación
            </Button>
          </>
        )}
      </Modal>
    </div>
  );
}
