import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  CheckCircle2,
  LoaderCircle,
  Save,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client.js";
import { ErrorState, LoadingState } from "../components/RequestState.jsx";
import { TrainerAvatar } from "../components/TrainerAvatar.jsx";
import { Button, Card, Input, Select, StatusBadge } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { money } from "../lib/format.js";

export function TrainerProfessionalProfilePage() {
  const { refreshUser } = useAuth();
  const [trainer, setTrainer] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [trainerResponse, specialtyResponse] = await Promise.all([
        api.get("/trainers/me"),
        api.get("/specialties"),
      ]);
      const loadedTrainer = trainerResponse.data.trainer;
      setTrainer(loadedTrainer);
      setSpecialties(specialtyResponse.data.specialties);
      setForm({
        descripcion: loadedTrainer.descripcion,
        experiencia: loadedTrainer.experiencia,
        tarifaBase: loadedTrainer.tarifaBase,
        modalidad: loadedTrainer.modalidad,
        trabajaConMenores: loadedTrainer.trabajaConMenores,
        fotoPerfil: loadedTrainer.usuario.fotoPerfil ?? "",
        specialtyIds: loadedTrainer.especialidades.map(({ idEspecialidad }) =>
          String(idEspecialidad),
        ),
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "No fue posible cargar el perfil profesional.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSpecialty = (id) => {
    const value = String(id);
    setForm((current) => ({
      ...current,
      specialtyIds: current.specialtyIds.includes(value)
        ? current.specialtyIds.filter((item) => item !== value)
        : [...current.specialtyIds, value],
    }));
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.specialtyIds.length) {
      setFeedback({
        type: "error",
        message: "Seleccioná al menos una especialidad.",
      });
      return;
    }
    setSaving(true);
    setFeedback({ type: "", message: "" });
    try {
      const { data } = await api.patch("/trainers/me", {
        ...form,
        experiencia: Number(form.experiencia),
        tarifaBase: Number(form.tarifaBase),
        specialtyIds: form.specialtyIds.map(Number),
      });
      setTrainer(data.trainer);
      await refreshUser();
      setFeedback({
        type: "success",
        message: "Perfil profesional actualizado correctamente.",
      });
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError.response?.data?.message ??
          "No se pudo actualizar el perfil.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <LoadingState label="Cargando tu perfil profesional..." />
      </div>
    );
  }
  if (error || !form) {
    return (
      <div className="page-container py-10">
        <ErrorState message={error} onRetry={load} />
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

      <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">ENT-03</p>
          <h1 className="mt-2 text-4xl font-extrabold">Perfil Profesional</h1>
          <p className="mt-2 text-slate-400">
            Actualizá la información que ven tus clientes.
          </p>
        </div>
        <StatusBadge
          tone={trainer.estado.nombre === "Aprobado" ? "green" : "amber"}
        >
          <BadgeCheck className="size-4" /> {trainer.estado.nombre}
        </StatusBadge>
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

      <form
        className="mt-7 grid gap-6 xl:grid-cols-[340px_1fr]"
        onSubmit={save}
      >
        <Card className="h-fit p-6 text-center xl:sticky xl:top-24">
          <div className="relative mx-auto w-fit">
            <TrainerAvatar
              className="size-40 rounded-[32px]"
              index={(trainer.idEntrenador - 1) % 6}
              src={form.fotoPerfil}
            />
            <span className="absolute -bottom-2 -right-2 grid size-11 place-items-center rounded-full border-4 border-[#0d0f19] bg-blue-500">
              <Camera className="size-5" />
            </span>
          </div>
          <h2 className="mt-6 text-xl font-extrabold">
            {trainer.usuario.nombre} {trainer.usuario.apellido}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {money(Number(form.tarifaBase) || 0)} por hora
          </p>
          <div className="mt-6 text-left">
            <Input
              label="URL de foto o imagen"
              onChange={(event) =>
                setForm({ ...form, fotoPerfil: event.target.value })
              }
              placeholder="https://..."
              type="url"
              value={form.fotoPerfil}
            />
            <p className="mt-2 text-xs leading-5 text-slate-600">
              La imagen se guarda en tu perfil mediante la API existente.
            </p>
          </div>
        </Card>

        <Card className="p-6 md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-300">
                Descripción profesional
              </span>
              <textarea
                className="min-h-40 w-full rounded-2xl border border-white/10 bg-[#10131f] p-4 text-white outline-none focus:border-blue-500/70"
                onChange={(event) =>
                  setForm({ ...form, descripcion: event.target.value })
                }
                required
                value={form.descripcion}
              />
            </label>
            <Input
              label="Años de experiencia"
              min="0"
              onChange={(event) =>
                setForm({ ...form, experiencia: event.target.value })
              }
              required
              type="number"
              value={form.experiencia}
            />
            <Input
              label="Tarifa base"
              min="0"
              onChange={(event) =>
                setForm({ ...form, tarifaBase: event.target.value })
              }
              required
              type="number"
              value={form.tarifaBase}
            />
            <Select
              label="Modalidad"
              onChange={(event) =>
                setForm({ ...form, modalidad: event.target.value })
              }
              value={form.modalidad}
            >
              <option>Online</option>
              <option>Presencial</option>
              <option>Híbrida</option>
            </Select>
            <Select
              label="Trabaja con menores"
              onChange={(event) =>
                setForm({
                  ...form,
                  trabajaConMenores: event.target.value === "true",
                })
              }
              value={String(form.trabajaConMenores)}
            >
              <option value="false">No</option>
              <option value="true">Sí</option>
            </Select>

            <fieldset className="md:col-span-2">
              <legend className="text-sm font-semibold text-slate-300">
                Especialidades
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {specialties.map((specialty) => {
                  const selected = form.specialtyIds.includes(
                    String(specialty.idEspecialidad),
                  );
                  return (
                    <button
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        selected
                          ? "border-blue-500/50 bg-blue-500/15 text-blue-200"
                          : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25"
                      }`}
                      key={specialty.idEspecialidad}
                      onClick={() => toggleSpecialty(specialty.idEspecialidad)}
                      type="button"
                    >
                      {selected && (
                        <CheckCircle2 className="mr-1 inline size-4" />
                      )}
                      {specialty.nombre}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <div className="mt-8 flex justify-end border-t border-white/[0.07] pt-6">
            <Button disabled={saving} size="lg" type="submit">
              {saving ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <Save className="size-5" />
              )}
              Guardar cambios
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
