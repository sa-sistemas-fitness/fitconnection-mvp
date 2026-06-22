import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "../api/client.js";
import { ErrorState, LoadingState } from "../components/RequestState.jsx";
import { Button, Card, EmptyState, Select, StatusBadge } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fullDate } from "../lib/format.js";

const days = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
const dayByIndex = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const emptyForm = {
  dia: "Lunes",
  horaInicio: "09:00",
  horaFin: "10:00",
  modalidad: "Online",
  observaciones: "",
};

function overlaps(slot, turn) {
  const turnDay = dayByIndex[new Date(turn.fechaInicio).getDay()];
  return (
    slot.dia === turnDay &&
    slot.horaInicio < turn.horaFin &&
    slot.horaFin > turn.horaInicio
  );
}

export function TrainerAvailabilityPage() {
  const { user } = useAuth();
  const storageKey = `fitconnection_trainer_availability_${user.idUsuario}`;
  const [slots, setSlots] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    } catch {
      return [];
    }
  });
  const [turns, setTurns] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const loadTurns = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/turns/received");
      setTurns(
        data.turns.filter((turn) =>
          ["Solicitado", "Reservado"].includes(turn.estado.nombre),
        ),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "No fue posible cargar los turnos para comparar la disponibilidad.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTurns();
  }, [loadTurns]);

  const saveSlots = (nextSlots) => {
    setSlots(nextSlots);
    localStorage.setItem(storageKey, JSON.stringify(nextSlots));
  };

  const addSlot = (event) => {
    event.preventDefault();
    if (form.horaFin <= form.horaInicio) {
      setFeedback({
        type: "error",
        message: "La hora de fin debe ser posterior a la hora de inicio.",
      });
      return;
    }
    const duplicate = slots.some(
      (slot) =>
        slot.dia === form.dia &&
        slot.horaInicio === form.horaInicio &&
        slot.horaFin === form.horaFin &&
        slot.modalidad === form.modalidad,
    );
    if (duplicate) {
      setFeedback({
        type: "error",
        message: "Ese bloque de disponibilidad ya existe.",
      });
      return;
    }
    saveSlots([...slots, { ...form, id: crypto.randomUUID() }]);
    setForm(emptyForm);
    setFeedback({
      type: "success",
      message: "Bloque guardado localmente en este navegador.",
    });
  };

  const sortedSlots = useMemo(
    () =>
      [...slots].sort(
        (a, b) =>
          days.indexOf(a.dia) - days.indexOf(b.dia) ||
          a.horaInicio.localeCompare(b.horaInicio),
      ),
    [slots],
  );

  if (loading) {
    return (
      <div className="page-container py-10">
        <LoadingState label="Comparando disponibilidad y turnos..." />
      </div>
    );
  }
  if (error) {
    return (
      <div className="page-container py-10">
        <ErrorState message={error} onRetry={loadTurns} />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <div>
        <p className="eyebrow">ENT-04</p>
        <h1 className="mt-2 text-4xl font-extrabold">
          Disponibilidad básica
        </h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          Organizá bloques semanales. Se guardan localmente y se comparan con
          tus turnos solicitados y reservados de la API.
        </p>
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

      <div className="mt-7 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <Card className="h-fit p-6 md:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-blue-500/10 text-blue-400">
              <Plus className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold">Nuevo bloque</h2>
              <p className="text-sm text-slate-500">Disponibilidad semanal</p>
            </div>
          </div>
          <form className="mt-6 space-y-5" onSubmit={addSlot}>
            <Select
              label="Día"
              onChange={(event) => setForm({ ...form, dia: event.target.value })}
              value={form.dia}
            >
              {days.map((day) => (
                <option key={day}>{day}</option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-300">
                  Hora inicio
                </span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-[#10131f] px-4 py-3.5 outline-none focus:border-blue-500/70"
                  onChange={(event) =>
                    setForm({ ...form, horaInicio: event.target.value })
                  }
                  type="time"
                  value={form.horaInicio}
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-300">
                  Hora fin
                </span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-[#10131f] px-4 py-3.5 outline-none focus:border-blue-500/70"
                  onChange={(event) =>
                    setForm({ ...form, horaFin: event.target.value })
                  }
                  type="time"
                  value={form.horaFin}
                />
              </label>
            </div>
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
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-300">
                Observaciones
              </span>
              <textarea
                className="min-h-24 w-full rounded-2xl border border-white/10 bg-[#10131f] p-4 outline-none placeholder:text-slate-600 focus:border-blue-500/70"
                onChange={(event) =>
                  setForm({ ...form, observaciones: event.target.value })
                }
                placeholder="Lugar, límites o notas internas."
                value={form.observaciones}
              />
            </label>
            <Button className="w-full" type="submit">
              <Save className="size-4" /> Guardar disponibilidad
            </Button>
          </form>
        </Card>

        <Card className="p-6 md:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Agenda semanal</p>
              <h2 className="mt-1 text-2xl font-extrabold">
                Bloques disponibles
              </h2>
            </div>
            <StatusBadge tone="blue">{slots.length} bloques</StatusBadge>
          </div>
          <div className="mt-6 space-y-3">
            {sortedSlots.length ? (
              sortedSlots.map((slot) => {
                const relatedTurns = turns.filter((turn) =>
                  overlaps(slot, turn),
                );
                return (
                  <div
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
                    key={slot.id}
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-lg">{slot.dia}</strong>
                          <StatusBadge
                            tone={relatedTurns.length ? "amber" : "green"}
                          >
                            {relatedTurns.length
                              ? `${relatedTurns.length} turno(s) en el bloque`
                              : "Sin turnos asignados"}
                          </StatusBadge>
                        </div>
                        <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                          <Clock3 className="size-4 text-blue-400" />
                          {slot.horaInicio}–{slot.horaFin} · {slot.modalidad}
                        </p>
                        {slot.observaciones && (
                          <p className="mt-2 text-sm text-slate-500">
                            {slot.observaciones}
                          </p>
                        )}
                      </div>
                      <Button
                        aria-label="Eliminar disponibilidad"
                        onClick={() =>
                          saveSlots(
                            slots.filter((item) => item.id !== slot.id),
                          )
                        }
                        size="sm"
                        variant="danger"
                      >
                        <Trash2 className="size-4" /> Eliminar
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState
                description="Agregá tus días y horarios habituales para organizar la agenda."
                icon={CalendarCheck}
                title="Sin disponibilidad configurada"
              />
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-7 p-6 md:p-7">
        <div className="flex items-center gap-3">
          <CalendarDays className="size-6 text-blue-400" />
          <div>
            <h2 className="text-xl font-extrabold">Turnos activos de la API</h2>
            <p className="text-sm text-slate-500">
              Referencia real para organizar tus bloques.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {turns.length ? (
            turns.map((turn) => (
              <div
                className="rounded-2xl bg-white/[0.035] p-4"
                key={turn.idTurno}
              >
                <div className="flex justify-between gap-3">
                  <strong>
                    {turn.cliente.usuario.nombre}{" "}
                    {turn.cliente.usuario.apellido}
                  </strong>
                  <StatusBadge
                    tone={
                      turn.estado.nombre === "Reservado" ? "green" : "amber"
                    }
                  >
                    {turn.estado.nombre}
                  </StatusBadge>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {fullDate(turn.fechaInicio)} · {turn.horaInicio}–
                  {turn.horaFin} · {turn.modalidad}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              No hay turnos solicitados ni reservados.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
