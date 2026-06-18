import {
  BadgeCheck,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileBadge,
  PencilLine,
  ShieldAlert,
  Star,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import { api } from "../api/client.js";
import { ErrorState, LoadingState } from "../components/RequestState.jsx";
import { TrainerApplicationForm } from "../components/TrainerApplicationForm.jsx";
import {
  Button,
  Card,
  EmptyState,
  MetricCard,
  StatusBadge,
} from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fullDate, money } from "../lib/format.js";

const certificationTone = {
  Pendiente: "amber",
  Validado: "green",
  Rechazado: "rose",
  Expirado: "slate",
};

function CertificationList({ certifications }) {
  if (!certifications.length) {
    return (
      <p className="rounded-2xl bg-white/[0.03] p-4 text-sm text-slate-500">
        No hay documentación registrada.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {certifications.map((certification) => (
        <div
          className="flex flex-col justify-between gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:flex-row sm:items-center"
          key={certification.idCertificacion}
        >
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-400">
              <FileBadge className="size-5" />
            </span>
            <div>
              <strong>{certification.titulo}</strong>
              <p className="text-sm text-slate-500">
                {certification.entidadEmisora} ·{" "}
                {certification.archivo || "Archivo no informado"}
              </p>
            </div>
          </div>
          <StatusBadge tone={certificationTone[certification.estado.nombre]}>
            {certification.estado.nombre}
          </StatusBadge>
        </div>
      ))}
    </div>
  );
}

export function TrainerPortalPage() {
  const { refreshUser } = useAuth();
  const [trainer, setTrainer] = useState(undefined);
  const [specialties, setSpecialties] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [report, setReport] = useState(null);
  const [turns, setTurns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [specialtyResponse, certificationResponse] = await Promise.all([
        api.get("/specialties"),
        api.get("/certifications/my"),
      ]);
      setSpecialties(specialtyResponse.data.specialties);
      setCertifications(certificationResponse.data.certifications);

      try {
        const { data } = await api.get("/trainers/me");
        setTrainer(data.trainer);
        if (data.trainer.estado.nombre === "Aprobado") {
          const [reportResponse, turnResponse] = await Promise.all([
            api.get("/reports/trainer/me"),
            api.get("/turns/received"),
          ]);
          setReport(reportResponse.data);
          setTurns(turnResponse.data.turns);
        } else {
          setReport(null);
          setTurns([]);
        }
      } catch (requestError) {
        if (requestError.response?.status === 404) {
          setTrainer(null);
          setReport(null);
          setTurns([]);
        } else {
          throw requestError;
        }
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "No fue posible cargar el Portal del Entrenador.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const apply = async ({ trainer: trainerPayload, certification }) => {
    setSubmitting(true);
    setFeedback({ type: "", message: "" });
    try {
      await api.post("/trainers/apply", trainerPayload);
      try {
        await api.post("/certifications", certification);
        setFeedback({
          type: "success",
          message:
            "Postulación y certificación enviadas. Administración debe revisarlas.",
        });
      } catch (certificationError) {
        setFeedback({
          type: "warning",
          message:
            certificationError.response?.data?.message ??
            "La postulación fue enviada, pero no pudimos registrar la certificación. Podés cargarla desde Certificaciones.",
        });
      }
      await refreshUser();
      await load();
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError.response?.data?.message ??
          "No se pudo enviar la postulación.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const students = useMemo(
    () => new Map(turns.map((turn) => [turn.idCliente, turn.cliente])),
    [turns],
  );

  if (loading) {
    return (
      <div className="page-container py-10">
        <LoadingState label="Preparando el Portal del Entrenador..." />
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

  if (!trainer || trainer.estado.nombre === "Rechazado") {
    const rejected = trainer?.estado.nombre === "Rechazado";
    return (
      <div className="page-container py-12">
        <div className="mx-auto max-w-4xl">
          <p className="eyebrow">Portal del Entrenador</p>
          <h1 className="mt-3 text-4xl font-extrabold">
            {rejected ? "Corregí y reenviá tu postulación" : "Conviértete en Entrenador"}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-400">
            Tu cuenta continúa siendo Cliente. El rol Entrenador se habilitará
            únicamente después de la aprobación administrativa.
          </p>

          {rejected && (
            <Card className="mt-7 border-rose-500/20 bg-rose-500/[0.06] p-6">
              <div className="flex items-start gap-4">
                <ShieldAlert className="mt-1 size-7 shrink-0 text-rose-400" />
                <div>
                  <StatusBadge tone="rose">Rechazado</StatusBadge>
                  <h2 className="mt-3 text-xl font-extrabold">
                    La postulación necesita correcciones
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {trainer.rejectionReason ||
                      "Administración rechazó la postulación sin agregar un motivo."}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {feedback.message && (
            <p
              className={`mt-6 rounded-2xl border p-4 text-sm ${
                feedback.type === "error"
                  ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
                  : feedback.type === "warning"
                    ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              }`}
            >
              {feedback.message}
            </p>
          )}

          <div className="mt-7">
            <TrainerApplicationForm
              initialTrainer={trainer}
              loading={submitting}
              onSubmit={apply}
              specialties={specialties}
            />
          </div>
        </div>
      </div>
    );
  }

  if (trainer.estado.nombre === "Pendiente") {
    return (
      <div className="page-container py-12">
        <div className="mx-auto max-w-4xl">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-amber-500/15 bg-amber-500/[0.06] p-8 text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-amber-500/15 text-amber-300">
                <Clock3 className="size-8" />
              </span>
              <StatusBadge className="mt-5" tone="amber">
                Pendiente de validación
              </StatusBadge>
              <h1 className="mt-4 text-3xl font-extrabold">
                Tu postulación está siendo revisada
              </h1>
              <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-400">
                Administración debe validar el perfil y la documentación antes
                de habilitar las operaciones de Entrenador.
              </p>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">Documentación enviada</p>
                  <h2 className="mt-1 text-xl font-extrabold">
                    Certificaciones
                  </h2>
                </div>
                <Link to="/portal-entrenador/certificaciones">
                  <Button size="sm" variant="secondary">
                    Gestionar documentación
                  </Button>
                </Link>
              </div>
              <div className="mt-5">
                <CertificationList certifications={certifications} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (trainer.estado.nombre === "Aprobado") {
    return <Navigate replace to="/portal-entrenador/dashboard" />;
  }

  const financial = report?.financial ?? {};
  const recentTurns = turns.slice(0, 5);
  return (
    <div className="page-container py-10">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Portal del Entrenador</p>
          <h1 className="mt-2 text-4xl font-extrabold">
            Hola, {trainer.usuario.nombre}
          </h1>
          <p className="mt-2 text-slate-400">
            Tu perfil fue aprobado y está disponible para recibir clientes.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/portal-entrenador/perfil">
            <Button variant="secondary">
              <PencilLine className="size-4" /> Perfil Profesional
            </Button>
          </Link>
          <Link to="/portal-entrenador/certificaciones">
            <Button>
              <FileBadge className="size-4" /> Certificaciones
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mt-7 flex flex-col justify-between gap-4 border-emerald-500/15 bg-emerald-500/[0.05] p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <BadgeCheck className="size-7 text-emerald-400" />
          <div>
            <strong>Entrenador aprobado</strong>
            <p className="text-sm text-slate-500">
              Perfil profesional visible y operaciones habilitadas.
            </p>
          </div>
        </div>
        <StatusBadge tone="green">
          <CheckCircle2 className="size-4" /> Disponible para reservas
        </StatusBadge>
      </Card>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {[
          [
            UserRoundCheck,
            "Solicitudes Recibidas",
            "Aceptá conexiones y habilitá chats.",
            "/portal-entrenador/solicitudes",
          ],
          [
            CalendarDays,
            "Gestionar Turnos",
            "Confirmá, cancelá o finalizá turnos.",
            "/portal-entrenador/turnos",
          ],
          [
            CalendarRange,
            "Disponibilidad",
            "Organizá tus bloques semanales.",
            "/portal-entrenador/disponibilidad",
          ],
        ].map(([Icon, title, description, to]) => (
          <Link className="surface surface-hover p-6" key={title} to={to}>
            <Icon className="size-7 text-blue-400" />
            <h2 className="mt-4 text-xl font-extrabold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={DollarSign}
          label="Ingresos aprobados"
          note={`${financial.approvedPayments ?? 0} pagos`}
          tone="green"
          value={money(financial.grossVolume)}
        />
        <MetricCard
          icon={Users}
          label="Alumnos"
          note="Con turnos registrados"
          value={students.size}
        />
        <MetricCard
          icon={CalendarDays}
          label="Turnos recibidos"
          note={`${turns.filter((turn) => turn.estado.nombre === "Solicitado").length} pendientes`}
          tone="violet"
          value={turns.length}
        />
        <MetricCard
          icon={Star}
          label="Calificación promedio"
          note={`${trainer._count?.calificaciones ?? 0} reseñas`}
          tone="amber"
          value={`${trainer.calificacionPromedio.toFixed(1)}★`}
        />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
        <Card className="p-6 md:p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold">Turnos recientes</h2>
            <StatusBadge tone="blue">{turns.length} totales</StatusBadge>
          </div>
          <div className="mt-5 space-y-3">
            {recentTurns.length ? (
              recentTurns.map((turn) => (
                <div
                  className="flex flex-col justify-between gap-3 rounded-2xl bg-white/[0.035] p-4 sm:flex-row sm:items-center"
                  key={turn.idTurno}
                >
                  <div>
                    <strong>
                      {turn.cliente.usuario.nombre}{" "}
                      {turn.cliente.usuario.apellido}
                    </strong>
                    <p className="mt-1 text-sm text-slate-500">
                      {fullDate(turn.fechaInicio)} · {turn.horaInicio}–
                      {turn.horaFin} · {turn.modalidad}
                    </p>
                  </div>
                  <StatusBadge
                    tone={
                      turn.estado.nombre === "Reservado"
                        ? "green"
                        : turn.estado.nombre === "Solicitado"
                          ? "amber"
                          : "slate"
                    }
                  >
                    {turn.estado.nombre}
                  </StatusBadge>
                </div>
              ))
            ) : (
              <EmptyState
                description="Los turnos solicitados por clientes aparecerán aquí."
                icon={CalendarDays}
                title="Todavía no recibiste turnos"
              />
            )}
          </div>
        </Card>

        <Card className="p-6 md:p-7">
          <p className="eyebrow">Estado profesional</p>
          <h2 className="mt-1 text-2xl font-extrabold">Tu configuración</h2>
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between border-b border-white/[0.07] pb-4">
              <span className="text-slate-500">Modalidad</span>
              <strong>{trainer.modalidad}</strong>
            </div>
            <div className="flex justify-between border-b border-white/[0.07] pb-4">
              <span className="text-slate-500">Tarifa base</span>
              <strong>{money(trainer.tarifaBase)}</strong>
            </div>
            <div className="flex justify-between border-b border-white/[0.07] pb-4">
              <span className="text-slate-500">Experiencia</span>
              <strong>{trainer.experiencia} años</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Certificaciones</span>
              <strong>{certifications.length}</strong>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
