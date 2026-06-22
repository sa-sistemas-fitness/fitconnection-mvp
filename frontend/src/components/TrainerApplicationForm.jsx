import { FileBadge, LoaderCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button, Card, Input, Select } from "./ui.jsx";

const emptyCertification = {
  titulo: "",
  entidadEmisora: "",
  fechaEmision: "",
  fechaVencimiento: "",
  archivo: "",
};

export function TrainerApplicationForm({
  initialTrainer,
  specialties,
  loading,
  onSubmit,
}) {
  const [form, setForm] = useState({
    descripcion: initialTrainer?.descripcion ?? "",
    experiencia: initialTrainer?.experiencia ?? 1,
    tarifaBase: initialTrainer?.tarifaBase ?? 15000,
    modalidad: initialTrainer?.modalidad ?? "Online",
    trabajaConMenores: initialTrainer?.trabajaConMenores ?? false,
    specialtyIds:
      initialTrainer?.especialidades?.map(({ idEspecialidad }) =>
        String(idEspecialidad),
      ) ?? [],
  });
  const [certification, setCertification] = useState(emptyCertification);

  const toggleSpecialty = (id) => {
    const value = String(id);
    setForm((current) => ({
      ...current,
      specialtyIds: current.specialtyIds.includes(value)
        ? current.specialtyIds.filter((item) => item !== value)
        : [...current.specialtyIds, value],
    }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSubmit({
      trainer: {
        ...form,
        experiencia: Number(form.experiencia),
        tarifaBase: Number(form.tarifaBase),
        specialtyIds: form.specialtyIds.map(Number),
      },
      certification,
    });
  };

  return (
    <form className="space-y-6" onSubmit={submit}>
      <Card className="p-6 md:p-7">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-blue-500/10 text-blue-400">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold">Perfil profesional</h2>
            <p className="text-sm text-slate-500">
              Esta información será revisada por Administración.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-slate-300">
              Descripción profesional
            </span>
            <textarea
              className="min-h-36 w-full rounded-2xl border border-white/10 bg-[#10131f] p-4 text-white outline-none placeholder:text-slate-600 focus:border-blue-500/70"
              onChange={(event) =>
                setForm({ ...form, descripcion: event.target.value })
              }
              placeholder="Contá tu enfoque, experiencia y tipo de acompañamiento."
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
            label="Tarifa base por hora"
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
            label="¿Trabajás con menores?"
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
                    {specialty.nombre}
                  </button>
                );
              })}
            </div>
            {!form.specialtyIds.length && (
              <p className="mt-2 text-xs text-amber-300">
                Seleccioná al menos una especialidad.
              </p>
            )}
          </fieldset>
        </div>
      </Card>

      <Card className="p-6 md:p-7">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-violet-500/10 text-violet-400">
            <FileBadge className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold">
              Certificación para revisión
            </h2>
            <p className="text-sm text-slate-500">
              La carga es simulada; se registra el nombre del archivo.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Input
            label="Título"
            onChange={(event) =>
              setCertification({
                ...certification,
                titulo: event.target.value,
              })
            }
            placeholder="Entrenador personal certificado"
            required
            value={certification.titulo}
          />
          <Input
            label="Entidad emisora"
            onChange={(event) =>
              setCertification({
                ...certification,
                entidadEmisora: event.target.value,
              })
            }
            placeholder="Instituto o federación"
            required
            value={certification.entidadEmisora}
          />
          <Input
            label="Fecha de emisión"
            onChange={(event) =>
              setCertification({
                ...certification,
                fechaEmision: event.target.value,
              })
            }
            required
            type="date"
            value={certification.fechaEmision}
          />
          <Input
            label="Fecha de vencimiento"
            onChange={(event) =>
              setCertification({
                ...certification,
                fechaVencimiento: event.target.value,
              })
            }
            type="date"
            value={certification.fechaVencimiento}
          />
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-slate-300">
              Archivo simulado
            </span>
            <input
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full rounded-2xl border border-dashed border-white/15 bg-[#10131f] p-4 text-sm text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-500/15 file:px-4 file:py-2 file:font-bold file:text-blue-300"
              onChange={(event) =>
                setCertification({
                  ...certification,
                  archivo: event.target.files?.[0]?.name ?? "",
                })
              }
              required
              type="file"
            />
          </label>
        </div>
      </Card>

      <Button
        className="w-full"
        disabled={loading || !form.specialtyIds.length}
        size="lg"
        type="submit"
      >
        {loading && <LoaderCircle className="size-5 animate-spin" />}
        Enviar postulación
      </Button>
    </form>
  );
}
