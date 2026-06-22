import { CheckCircle2, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";

import { money, trainerName, trainerSpecialties } from "../lib/format.js";
import { Button, StatusBadge } from "./ui.jsx";

export function TrainerCard({ trainer, index = 0 }) {
  const specialties = trainerSpecialties(trainer);
  const location = trainer.usuario?.cliente?.ubicacion ?? "Ubicación no informada";
  return (
    <article className="surface surface-hover group overflow-hidden">
      <Link className="block" to={`/entrenadores/${trainer.idEntrenador}`}>
        <div className="relative h-64 overflow-hidden">
          {trainer.usuario?.fotoPerfil ? (
            <img
              alt={trainerName(trainer)}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              src={trainer.usuario.fotoPerfil}
            />
          ) : (
            <div className={`coach-photo coach-${index % 6} h-full w-full bg-cover transition duration-500 group-hover:scale-105`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f19] via-transparent to-black/20" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <StatusBadge tone={trainer.calificacionPromedio >= 4.9 ? "amber" : "blue"}>
              {trainer.calificacionPromedio >= 4.9 ? "Élite" : "Pro"}
            </StatusBadge>
            <StatusBadge><CheckCircle2 className="size-3" /> Verificado</StatusBadge>
          </div>
          <StatusBadge className="absolute right-4 top-4" tone={trainer.modalidad === "Online" ? "green" : "amber"}>
            {trainer.modalidad}
          </StatusBadge>
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-sm font-semibold text-white">
            <MapPin className="size-4" /> {location}
          </div>
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link to={`/entrenadores/${trainer.idEntrenador}`}>
              <h3 className="text-xl font-extrabold text-white hover:text-blue-300">{trainerName(trainer)}</h3>
            </Link>
            <p className="mt-1 text-sm text-blue-300">{specialties.join(" · ")}</p>
          </div>
          <div className="text-right">
            <p className="font-extrabold text-white">{money(trainer.tarifaBase)}</p>
            <p className="text-xs text-slate-500">por hora</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <Star className="size-4 fill-amber-400 text-amber-400" />
          <strong>{Number(trainer.calificacionPromedio).toFixed(1)}</strong>
          <span className="text-slate-500">({trainer._count?.calificaciones ?? 0} reseñas)</span>
          <span className="text-slate-700">·</span>
          <span className="text-slate-400">{trainer._count?.turnos ?? 0} turnos</span>
        </div>
        <div className="mt-4 flex min-h-7 flex-wrap gap-2">
          {specialties.map((item) => (
            <span className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-slate-300" key={item}>{item}</span>
          ))}
        </div>
        <Link className="mt-5 block" to={`/entrenadores/${trainer.idEntrenador}`}>
          <Button className="w-full" variant="secondary">Ver Perfil</Button>
        </Link>
      </div>
    </article>
  );
}
