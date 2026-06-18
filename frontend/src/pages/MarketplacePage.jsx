import { BadgeCheck, Filter, Search, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { api } from "../api/client.js";
import { ErrorState, LoadingState } from "../components/RequestState.jsx";
import { TrainerCard } from "../components/TrainerCard.jsx";
import { Button, Card, EmptyState, Input, Select } from "../components/ui.jsx";

const initialFilters = (params) => ({
  q: params.get("q") ?? "",
  specialtyId: params.get("specialtyId") ?? "",
  modality: "",
  maxPrice: 50000,
  rating: 0,
  verified: true,
});

export function MarketplacePage() {
  const [params] = useSearchParams();
  const [trainers, setTrainers] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [filters, setFilters] = useState(() => initialFilters(params));
  const [sort, setSort] = useState("rating");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMarketplace = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [trainerResponse, specialtyResponse] = await Promise.all([
        api.get("/trainers"),
        api.get("/specialties"),
      ]);
      setTrainers(trainerResponse.data.trainers);
      setSpecialties(specialtyResponse.data.specialties);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "No fue posible cargar los entrenadores.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarketplace();
  }, [loadMarketplace]);

  const filtered = useMemo(() => {
    const result = trainers.filter((trainer) => {
      const searchable = [
        trainer.usuario.nombre,
        trainer.usuario.apellido,
        trainer.usuario.cliente?.ubicacion,
        ...trainer.especialidades.map(
          ({ especialidad }) => especialidad.nombre,
        ),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (!filters.q || searchable.includes(filters.q.toLowerCase())) &&
        (!filters.specialtyId ||
          trainer.especialidades.some(
            ({ idEspecialidad }) =>
              String(idEspecialidad) === filters.specialtyId,
          )) &&
        (!filters.modality || trainer.modalidad === filters.modality) &&
        trainer.tarifaBase <= filters.maxPrice &&
        trainer.calificacionPromedio >= filters.rating &&
        (!filters.verified || trainer.estado.nombre === "Aprobado")
      );
    });
    return result.sort((a, b) => {
      if (sort === "price-low") return a.tarifaBase - b.tarifaBase;
      if (sort === "experience") return b.experiencia - a.experiencia;
      return b.calificacionPromedio - a.calificacionPromedio;
    });
  }, [trainers, filters, sort]);

  const resetFilters = () => setFilters(initialFilters(new URLSearchParams()));

  return (
    <div className="page-container py-10">
      <div>
        <p className="eyebrow">Profesionales aprobados</p>
        <h1 className="mt-2 text-4xl font-extrabold">Buscar Entrenadores</h1>
        <p className="mt-2 text-slate-400">
          Compará especialidades, modalidad, experiencia y valoraciones reales.
        </p>
      </div>
      <Input
        className="mt-7 py-4"
        icon={Search}
        onChange={(event) =>
          setFilters({ ...filters, q: event.target.value })
        }
        placeholder="Buscar por entrenador, deporte o ubicación..."
        value={filters.q}
      />

      <div className="mt-8 grid gap-7 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit p-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-xl font-extrabold">
              <Filter className="text-blue-400" /> Filtros
            </h2>
            <button
              className="text-xs font-bold text-slate-500 hover:text-blue-300"
              onClick={resetFilters}
            >
              Limpiar
            </button>
          </div>
          <div className="mt-7 space-y-6">
            <Select
              label="Especialidad / deporte"
              onChange={(event) =>
                setFilters({ ...filters, specialtyId: event.target.value })
              }
              value={filters.specialtyId}
            >
              <option value="">Todos los deportes</option>
              {specialties.map((specialty) => (
                <option
                  key={specialty.idEspecialidad}
                  value={specialty.idEspecialidad}
                >
                  {specialty.nombre}
                </option>
              ))}
            </Select>
            <Select
              label="Modalidad"
              onChange={(event) =>
                setFilters({ ...filters, modality: event.target.value })
              }
              value={filters.modality}
            >
              <option value="">Todas</option>
              <option>Online</option>
              <option>Presencial</option>
              <option>Híbrida</option>
            </Select>
            <div>
              <label className="text-sm font-semibold text-slate-300">
                Precio máximo: ${filters.maxPrice.toLocaleString("es-AR")}
              </label>
              <input
                className="mt-4 w-full accent-blue-500"
                max="50000"
                min="10000"
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    maxPrice: Number(event.target.value),
                  })
                }
                step="1000"
                type="range"
                value={filters.maxPrice}
              />
            </div>
            <Select
              label="Calificación mínima"
              onChange={(event) =>
                setFilters({
                  ...filters,
                  rating: Number(event.target.value),
                })
              }
              value={filters.rating}
            >
              <option value="0">Todas</option>
              <option value="4">4.0 o más</option>
              <option value="4.5">4.5 o más</option>
              <option value="4.8">4.8 o más</option>
            </Select>
            <label className="flex cursor-pointer gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/8 p-4">
              <input
                checked={filters.verified}
                className="mt-1 size-4 accent-blue-500"
                onChange={(event) =>
                  setFilters({ ...filters, verified: event.target.checked })
                }
                type="checkbox"
              />
              <span className="text-sm text-blue-200">
                <strong className="flex items-center gap-2">
                  <BadgeCheck className="size-4" /> Solo verificados
                </strong>
                <span className="mt-1 block text-blue-300/60">
                  Aprobados por FitConnection.
                </span>
              </span>
            </label>
          </div>
        </Card>

        <section>
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-slate-400">
              <strong className="text-white">{filtered.length}</strong>{" "}
              entrenadores encontrados
            </p>
            <Select
              className="min-w-52 py-2.5"
              onChange={(event) => setSort(event.target.value)}
              value={sort}
            >
              <option value="rating">Mejor calificados</option>
              <option value="price-low">Menor tarifa</option>
              <option value="experience">Más experiencia</option>
            </Select>
          </div>

          {loading ? (
            <LoadingState label="Buscando entrenadores aprobados..." />
          ) : error ? (
            <ErrorState message={error} onRetry={loadMarketplace} />
          ) : filtered.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((trainer, index) => (
                <TrainerCard
                  index={index}
                  key={trainer.idEntrenador}
                  trainer={trainer}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              action={
                <Button onClick={resetFilters} variant="secondary">
                  Restablecer filtros
                </Button>
              }
              description="Probá ajustando el precio, la modalidad o buscando otra disciplina."
              icon={SlidersHorizontal}
              title="No encontramos coincidencias"
            />
          )}
        </section>
      </div>
    </div>
  );
}
