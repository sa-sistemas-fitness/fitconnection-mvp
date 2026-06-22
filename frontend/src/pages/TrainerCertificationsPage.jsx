import {
  AlertTriangle,
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  FileBadge,
  LoaderCircle,
  Plus,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client.js";
import { ErrorState, LoadingState } from "../components/RequestState.jsx";
import { Button, Card, EmptyState, Input, StatusBadge } from "../components/ui.jsx";
import { fullDate } from "../lib/format.js";

const emptyForm = {
  titulo: "",
  entidadEmisora: "",
  fechaEmision: "",
  fechaVencimiento: "",
  archivo: "",
};

const tone = {
  Pendiente: "amber",
  Validado: "green",
  Rechazado: "rose",
  Expirado: "slate",
};

const statusIcon = {
  Pendiente: LoaderCircle,
  Validado: CheckCircle2,
  Rechazado: XCircle,
  Expirado: AlertTriangle,
};

export function TrainerCertificationsPage() {
  const [trainer, setTrainer] = useState(undefined);
  const [certifications, setCertifications] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      try {
        const trainerResponse = await api.get("/trainers/me");
        setTrainer(trainerResponse.data.trainer);
      } catch (requestError) {
        if (requestError.response?.status === 404) {
          setTrainer(null);
          setCertifications([]);
          return;
        }
        throw requestError;
      }
      const { data } = await api.get("/certifications/my");
      setCertifications(data.certifications);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "No fue posible cargar tus certificaciones.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback({ type: "", message: "" });
    try {
      await api.post("/certifications", form);
      setFeedback({
        type: "success",
        message:
          "Certificación enviada. Quedó Pendiente hasta la revisión administrativa.",
      });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError.response?.data?.message ??
          "No se pudo cargar la certificación.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <LoadingState label="Cargando certificaciones..." />
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
  if (!trainer) {
    return (
      <div className="page-container py-12">
        <EmptyState
          action={
            <Link to="/portal-entrenador">
              <Button>Crear postulación</Button>
            </Link>
          }
          description="Primero debés completar el formulario del Portal del Entrenador."
          icon={Award}
          title="Todavía no tenés perfil profesional"
        />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-300"
        to="/portal-entrenador"
      >
        <ArrowLeft className="size-4" /> Volver al portal
      </Link>

      <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">ENT-07</p>
          <h1 className="mt-2 text-4xl font-extrabold">Certificaciones</h1>
          <p className="mt-2 text-slate-400">
            Cargá documentación y seguí su estado de validación.
          </p>
        </div>
        <Button onClick={() => setShowForm((current) => !current)}>
          <Plus className="size-5" />
          {showForm ? "Cerrar formulario" : "Nueva certificación"}
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

      {showForm && (
        <Card className="mt-7 p-6 md:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-400">
              <FileBadge className="size-6" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold">
                Cargar certificación simulada
              </h2>
              <p className="text-sm text-slate-500">
                Se registra la referencia del archivo, no se almacena el binario.
              </p>
            </div>
          </div>
          <form className="mt-6 grid gap-5 md:grid-cols-2" onSubmit={submit}>
            <Input
              label="Título"
              onChange={(event) =>
                setForm({ ...form, titulo: event.target.value })
              }
              required
              value={form.titulo}
            />
            <Input
              label="Entidad emisora"
              onChange={(event) =>
                setForm({ ...form, entidadEmisora: event.target.value })
              }
              required
              value={form.entidadEmisora}
            />
            <Input
              label="Fecha de emisión"
              onChange={(event) =>
                setForm({ ...form, fechaEmision: event.target.value })
              }
              required
              type="date"
              value={form.fechaEmision}
            />
            <Input
              label="Fecha de vencimiento"
              onChange={(event) =>
                setForm({ ...form, fechaVencimiento: event.target.value })
              }
              type="date"
              value={form.fechaVencimiento}
            />
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-300">
                Archivo simulado
              </span>
              <input
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full rounded-2xl border border-dashed border-white/15 bg-[#10131f] p-4 text-sm text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-500/15 file:px-4 file:py-2 file:font-bold file:text-blue-300"
                onChange={(event) =>
                  setForm({
                    ...form,
                    archivo: event.target.files?.[0]?.name ?? "",
                  })
                }
                required
                type="file"
              />
            </label>
            <Button
              className="md:col-span-2"
              disabled={submitting}
              size="lg"
              type="submit"
            >
              {submitting && (
                <LoaderCircle className="size-5 animate-spin" />
              )}
              Enviar certificación
            </Button>
          </form>
        </Card>
      )}

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        {certifications.length ? (
          certifications.map((certification) => {
            const Icon = statusIcon[certification.estado.nombre] ?? ShieldCheck;
            return (
              <Card className="p-6" key={certification.idCertificacion}>
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-500/10 text-violet-400">
                    <Award className="size-6" />
                  </span>
                  <StatusBadge tone={tone[certification.estado.nombre]}>
                    <Icon
                      className={`size-4 ${
                        certification.estado.nombre === "Pendiente"
                          ? "animate-spin"
                          : ""
                      }`}
                    />
                    {certification.estado.nombre}
                  </StatusBadge>
                </div>
                <h2 className="mt-5 text-xl font-extrabold">
                  {certification.titulo}
                </h2>
                <p className="mt-1 text-sm text-blue-300">
                  {certification.entidadEmisora}
                </p>
                <div className="mt-5 space-y-3 text-sm">
                  <p className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-slate-500">
                      <CalendarDays className="size-4" /> Emisión
                    </span>
                    <strong>{fullDate(certification.fechaEmision)}</strong>
                  </p>
                  <p className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Vencimiento</span>
                    <strong>
                      {certification.fechaVencimiento
                        ? fullDate(certification.fechaVencimiento)
                        : "Sin vencimiento"}
                    </strong>
                  </p>
                  <p className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Archivo</span>
                    <strong className="truncate">
                      {certification.archivo || "No informado"}
                    </strong>
                  </p>
                </div>
                {certification.estado.nombre === "Rechazado" && (
                  <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/[0.07] p-4">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-rose-300">
                      Comentario de Administración
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {certification.comentarioAdmin ||
                        "La certificación fue rechazada sin comentario."}
                    </p>
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <div className="lg:col-span-2">
            <EmptyState
              action={
                <Button onClick={() => setShowForm(true)}>
                  Cargar certificación
                </Button>
              }
              description="Tus certificaciones y su estado de revisión aparecerán aquí."
              icon={Award}
              title="Todavía no cargaste certificaciones"
            />
          </div>
        )}
      </div>
    </div>
  );
}
