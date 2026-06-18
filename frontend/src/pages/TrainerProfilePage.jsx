import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  LoaderCircle,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "../api/client.js";
import { ErrorState, LoadingState } from "../components/RequestState.jsx";
import { TrainerAvatar } from "../components/TrainerAvatar.jsx";
import {
  Button,
  Card,
  Modal,
  Select,
  StatusBadge,
} from "../components/ui.jsx";
import { money, trainerName, trainerSpecialties } from "../lib/format.js";

function addOneHour(time) {
  const [hour, minute] = time.split(":").map(Number);
  return `${String((hour + 1) % 24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function TrainerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [connections, setConnections] = useState([]);
  const [turns, setTurns] = useState([]);
  const [chats, setChats] = useState([]);
  const [tab, setTab] = useState("about");
  const [connectionModal, setConnectionModal] = useState(false);
  const [turnModal, setTurnModal] = useState(false);
  const [message, setMessage] = useState(
    "Hola, me gustaría conocer más sobre tu forma de trabajo.",
  );
  const [reservation, setReservation] = useState({
    date: "",
    startTime: "18:00",
    endTime: "19:00",
    modality: "",
    observations: "",
  });
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [trainerResponse, reviewResponse, connectionResponse, turnResponse, chatResponse] =
        await Promise.all([
          api.get(`/trainers/${id}`),
          api.get(`/reviews/trainer/${id}`),
          api.get("/connection-requests/my"),
          api.get("/turns/my"),
          api.get("/chats"),
        ]);
      const loadedTrainer = trainerResponse.data.trainer;
      setTrainer(loadedTrainer);
      setReviews(reviewResponse.data.reviews);
      setConnections(connectionResponse.data.connectionRequests);
      setTurns(turnResponse.data.turns);
      setChats(chatResponse.data.chats);
      setReservation((current) => ({
        ...current,
        modality: current.modality || loadedTrainer.modalidad,
      }));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "No fue posible cargar el perfil del entrenador.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const trainerConnections = useMemo(
    () =>
      connections
        .filter(
          (connection) =>
            String(connection.idEntrenador) === String(id),
        )
        .sort(
          (a, b) =>
            new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud),
        ),
    [connections, id],
  );
  const acceptedConnection = trainerConnections.find(
    (connection) => connection.estado.nombre === "Aceptada",
  );
  const pendingConnection = trainerConnections.find(
    (connection) => connection.estado.nombre === "Pendiente",
  );
  const activeChat = chats.find(
    (chat) => String(chat.solicitud.idEntrenador) === String(id),
  );
  const trainerTurns = turns.filter(
    (turn) => String(turn.idEntrenador) === String(id),
  );

  const sendConnection = async () => {
    setSubmitting(true);
    setFeedback({ type: "", message: "" });
    try {
      await api.post("/connection-requests", {
        trainerId: trainer.idEntrenador,
        mensajeInicial: message,
      });
      setFeedback({
        type: "success",
        message:
          "Solicitud enviada. Te avisaremos cuando el entrenador responda.",
      });
      setConnectionModal(false);
      await loadProfile();
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError.response?.data?.message ??
          "No se pudo enviar la solicitud.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const requestTurn = async () => {
    if (!acceptedConnection) {
      setFeedback({
        type: "error",
        message: "Necesitás una conexión aceptada para solicitar un turno.",
      });
      return;
    }
    if (!reservation.date) {
      setFeedback({
        type: "error",
        message: "Seleccioná una fecha para solicitar el turno.",
      });
      return;
    }
    if (reservation.endTime <= reservation.startTime) {
      setFeedback({
        type: "error",
        message: "La hora de fin debe ser posterior a la hora de inicio.",
      });
      return;
    }
    setSubmitting(true);
    setFeedback({ type: "", message: "" });
    try {
      await api.post("/turns", {
        requestId: acceptedConnection.idSolicitud,
        fechaInicio: reservation.date,
        fechaFin: reservation.date,
        horaInicio: reservation.startTime,
        horaFin: reservation.endTime,
        modalidad: reservation.modality,
        observaciones: reservation.observations,
      });
      setFeedback({
        type: "success",
        message:
          "Turno solicitado. Ya aparece en Mis Turnos con estado Solicitado.",
      });
      setTurnModal(false);
      await loadProfile();
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError.response?.data?.message ??
          "No se pudo solicitar el turno.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <LoadingState label="Cargando perfil verificado..." />
      </div>
    );
  }
  if (error || !trainer) {
    return (
      <div className="page-container py-10">
        <ErrorState message={error} onRetry={loadProfile} />
      </div>
    );
  }

  const specialties = trainerSpecialties(trainer);
  const validatedCertifications = trainer.certificaciones.filter(
    (certification) => certification.estado.nombre === "Validado",
  );
  const profileIndex = (trainer.idEntrenador - 1) % 6;

  return (
    <div className="page-container py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_390px]">
        <div>
          <section className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative">
              <TrainerAvatar
                className="size-32 rounded-[28px]"
                index={profileIndex}
                src={trainer.usuario.fotoPerfil}
              />
              <span className="absolute -bottom-2 -right-2 grid size-10 place-items-center rounded-full border-4 border-[#05060d] bg-blue-500">
                <BadgeCheck className="size-5" />
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-extrabold">
                  {trainerName(trainer)}
                </h1>
                <StatusBadge>
                  <BadgeCheck className="size-3.5" /> Verificado
                </StatusBadge>
                {trainer.calificacionPromedio >= 4.9 && (
                  <StatusBadge tone="amber">Élite</StatusBadge>
                )}
              </div>
              <p className="mt-2 text-lg text-blue-300">
                {specialties.join(" · ")}
              </p>
              <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <strong className="text-white">
                    {trainer.calificacionPromedio.toFixed(1)}
                  </strong>{" "}
                  ({reviews.length} reseñas)
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  {trainer.usuario.cliente?.ubicacion ??
                    "Ubicación no informada"}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="size-4" /> Respuesta habitual en menos de 1
                  hora
                </span>
              </div>
            </div>
          </section>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              [trainer._count?.turnos ?? 0, "Turnos realizados"],
              [`${trainer.experiencia} años`, "Experiencia"],
              [trainer.modalidad, "Modalidad"],
            ].map(([value, label]) => (
              <Card className="p-6 text-center" key={label}>
                <p className="text-xl font-extrabold">{value}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </Card>
            ))}
          </div>

          <div className="mt-10 flex rounded-2xl bg-[#141622] p-1">
            {[
              ["about", "Acerca de"],
              ["services", "Servicios"],
              ["reviews", "Reseñas"],
            ].map(([key, label]) => (
              <button
                className={`flex-1 rounded-xl px-4 py-3 font-bold ${
                  tab === key
                    ? "bg-[#0b0d15] text-white"
                    : "text-slate-500"
                }`}
                key={key}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-7 space-y-5">
            {tab === "about" && (
              <>
                <Card className="p-7">
                  <h2 className="text-xl font-extrabold">
                    Sobre el entrenador
                  </h2>
                  <p className="mt-4 leading-8 text-slate-400">
                    {trainer.descripcion}
                  </p>
                </Card>
                <Card className="p-7">
                  <h2 className="text-xl font-extrabold">Especialidades</h2>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {specialties.map((specialty) => (
                      <StatusBadge key={specialty}>{specialty}</StatusBadge>
                    ))}
                  </div>
                </Card>
                <Card className="p-7">
                  <h2 className="text-xl font-extrabold">
                    Certificaciones validadas
                  </h2>
                  <div className="mt-5 space-y-3">
                    {validatedCertifications.length ? (
                      validatedCertifications.map((certification) => (
                        <div
                          className="flex items-center gap-4 rounded-2xl bg-white/[0.035] p-4"
                          key={certification.idCertificacion}
                        >
                          <ShieldCheck className="shrink-0 text-blue-400" />
                          <div>
                            <strong>{certification.titulo}</strong>
                            <p className="text-sm text-slate-500">
                              {certification.entidadEmisora}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No hay certificaciones públicas disponibles.
                      </p>
                    )}
                  </div>
                </Card>
              </>
            )}
            {tab === "services" && (
              <Card className="p-7">
                <h2 className="text-xl font-extrabold">Servicios</h2>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {[
                    "Evaluación inicial",
                    "Plan personalizado",
                    `Entrenamiento ${trainer.modalidad.toLowerCase()}`,
                    "Seguimiento de progreso",
                  ].map((service) => (
                    <div
                      className="rounded-2xl bg-white/[0.04] p-5 font-semibold"
                      key={service}
                    >
                      {service}
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {tab === "reviews" && (
              <Card className="p-7">
                <h2 className="text-xl font-extrabold">
                  Reseñas verificadas
                </h2>
                <div className="mt-5 space-y-4">
                  {reviews.length ? (
                    reviews.map((review) => (
                      <div
                        className="border-b border-white/10 pb-4"
                        key={review.idCalificacion}
                      >
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: review.puntuacion }).map(
                            (_, index) => (
                              <Star
                                className="size-4 fill-current"
                                key={index}
                              />
                            ),
                          )}
                        </div>
                        <p className="mt-2 text-slate-300">
                          {review.comentario}
                        </p>
                        <p className="mt-2 text-xs text-slate-600">
                          {review.cliente.usuario.nombre}{" "}
                          {review.cliente.usuario.apellido}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500">
                      Todavía no hay reseñas visibles.
                    </p>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>

        <Card className="h-fit p-7 lg:sticky lg:top-24">
          <p className="text-3xl font-extrabold">
            {money(trainer.tarifaBase)}
            <span className="text-base font-medium text-slate-500">/hora</span>
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <strong>{trainer.calificacionPromedio.toFixed(1)}</strong>
            <span className="text-slate-500">
              ({reviews.length} reseñas)
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-white/[0.07] bg-[#171a2a] p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">
              Estado de conexión
            </p>
            {!acceptedConnection && !pendingConnection && (
              <div className="mt-3 flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-slate-500" />
                <p className="text-sm leading-6 text-slate-400">
                  Enviá una solicitud para habilitar el chat y la reserva de
                  turnos.
                </p>
              </div>
            )}
            {pendingConnection && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <StatusBadge tone="amber">Solicitud pendiente</StatusBadge>
                  <p className="mt-2 text-sm text-slate-500">
                    Esperando respuesta del entrenador.
                  </p>
                </div>
                <Clock className="size-7 text-amber-400" />
              </div>
            )}
            {acceptedConnection && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <StatusBadge tone="green">
                    <CheckCircle2 className="size-3.5" /> Conexión aceptada
                  </StatusBadge>
                  <p className="mt-2 text-sm text-slate-500">
                    Chat y solicitud de turnos habilitados.
                  </p>
                </div>
                <ShieldCheck className="size-7 text-emerald-400" />
              </div>
            )}
          </div>

          {!acceptedConnection && !pendingConnection && (
            <Button
              className="mt-6 w-full"
              onClick={() => setConnectionModal(true)}
              size="lg"
            >
              Solicitar Conexión
            </Button>
          )}
          {pendingConnection && (
            <Button className="mt-6 w-full" disabled size="lg">
              Solicitud pendiente
            </Button>
          )}
          {acceptedConnection && (
            <Button
              className="mt-6 w-full"
              onClick={() => {
                setFeedback({ type: "", message: "" });
                setTurnModal(true);
              }}
              size="lg"
            >
              <CalendarDays className="size-5" />
              Solicitar Turno
            </Button>
          )}
          {activeChat && (
            <Button
              className="mt-3 w-full"
              onClick={() => navigate("/mensajes")}
              variant="secondary"
            >
              <MessageSquare className="size-5" /> Enviar Mensaje
            </Button>
          )}

          {feedback.message && (
            <p
              className={`mt-4 rounded-xl p-3 text-sm ${
                feedback.type === "error"
                  ? "bg-rose-500/10 text-rose-300"
                  : "bg-blue-500/10 text-blue-300"
              }`}
            >
              {feedback.message}
            </p>
          )}
          {trainerTurns.length > 0 && (
            <p className="mt-4 text-center text-xs text-slate-500">
              Ya tenés {trainerTurns.length} turno
              {trainerTurns.length === 1 ? "" : "s"} con este entrenador.
            </p>
          )}
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-5 text-center text-xs text-slate-500">
            <span>Seguro</span>
            <span>Sin membresía</span>
            <span>Verificado</span>
          </div>
        </Card>
      </div>

      <Modal
        onClose={() => setConnectionModal(false)}
        open={connectionModal}
        title={`Conectar con ${trainerName(trainer)}`}
      >
        <div className="mb-5 flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
          <TrainerAvatar
            className="size-16 rounded-2xl"
            index={profileIndex}
            src={trainer.usuario.fotoPerfil}
          />
          <div className="min-w-0">
            <strong className="block truncate text-lg">
              {trainerName(trainer)}
            </strong>
            <p className="mt-1 truncate text-sm text-blue-300">
              {specialties.join(" · ")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {trainer.modalidad} · {money(trainer.tarifaBase)}/hora
            </p>
          </div>
        </div>
        <p className="mb-4 text-sm leading-6 text-slate-400">
          Contale brevemente qué objetivo querés trabajar. El chat se habilitará
          cuando el entrenador acepte.
        </p>
        <textarea
          className="min-h-32 w-full rounded-2xl border border-white/10 bg-[#10131f] p-4 text-white outline-none focus:border-blue-500"
          onChange={(event) => setMessage(event.target.value)}
          value={message}
        />
        <Button
          className="mt-5 w-full"
          disabled={submitting || !message.trim()}
          onClick={sendConnection}
        >
          {submitting ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            <>
              Enviar solicitud <ArrowRight className="size-5" />
            </>
          )}
        </Button>
      </Modal>

      <Modal
        onClose={() => setTurnModal(false)}
        open={turnModal}
        title="Solicitar turno"
      >
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-blue-500/15 bg-blue-500/[0.06] p-4">
          <TrainerAvatar
            className="size-16 rounded-2xl"
            index={profileIndex}
            src={trainer.usuario.fotoPerfil}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Entrenador
            </p>
            <strong className="mt-1 block truncate text-lg">
              {trainerName(trainer)}
            </strong>
            <p className="text-sm text-slate-400">{specialties.join(" · ")}</p>
          </div>
          <div className="text-right">
            <strong>{money(trainer.tarifaBase)}</strong>
            <p className="text-xs text-slate-500">tarifa por hora</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-slate-300">
              Fecha
            </span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-[#10131f] px-4 py-3.5 text-white outline-none focus:border-blue-500/70"
              min={new Date().toISOString().slice(0, 10)}
              onChange={(event) =>
                setReservation({ ...reservation, date: event.target.value })
              }
              type="date"
              value={reservation.date}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">
              Hora de inicio
            </span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-[#10131f] px-4 py-3.5 text-white outline-none focus:border-blue-500/70"
              onChange={(event) => {
                const startTime = event.target.value;
                setReservation({
                  ...reservation,
                  startTime,
                  endTime: addOneHour(startTime),
                });
              }}
              type="time"
              value={reservation.startTime}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">
              Hora de fin
            </span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-[#10131f] px-4 py-3.5 text-white outline-none focus:border-blue-500/70"
              onChange={(event) =>
                setReservation({
                  ...reservation,
                  endTime: event.target.value,
                })
              }
              type="time"
              value={reservation.endTime}
            />
          </label>
          <div className="sm:col-span-2">
            <Select
              label="Modalidad"
              onChange={(event) =>
                setReservation({
                  ...reservation,
                  modality: event.target.value,
                })
              }
              value={reservation.modality}
            >
              {trainer.modalidad === "Híbrida" ? (
                <>
                  <option>Online</option>
                  <option>Presencial</option>
                  <option>Híbrida</option>
                </>
              ) : (
                <option>{trainer.modalidad}</option>
              )}
            </Select>
          </div>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-slate-300">
              Observaciones
            </span>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-white/10 bg-[#10131f] p-4 text-white outline-none placeholder:text-slate-600 focus:border-blue-500/70"
              onChange={(event) =>
                setReservation({
                  ...reservation,
                  observations: event.target.value,
                })
              }
              placeholder="Objetivo del turno, lesiones a considerar o cualquier detalle útil."
              value={reservation.observations}
            />
          </label>
        </div>

        {feedback.type === "error" && feedback.message && (
          <p className="mt-4 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300">
            {feedback.message}
          </p>
        )}
        <Button
          className="mt-6 w-full"
          disabled={submitting || !reservation.date}
          onClick={requestTurn}
          size="lg"
        >
          {submitting ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            <>
              Confirmar solicitud <ArrowRight className="size-5" />
            </>
          )}
        </Button>
        <p className="mt-3 text-center text-xs text-slate-500">
          El turno se creará con estado Solicitado hasta que el entrenador lo
          confirme.
        </p>
      </Modal>
    </div>
  );
}
