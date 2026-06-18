import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  UserRoundCheck,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Brand } from "../components/Brand.jsx";
import { TrainerCard } from "../components/TrainerCard.jsx";
import { Button, Card } from "../components/ui.jsx";
import { api } from "../api/client.js";

export function LandingPage() {
  const [trainers, setTrainers] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [sport, setSport] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get("/trainers"), api.get("/specialties")])
      .then(([trainerResponse, specialtyResponse]) => {
        setTrainers(trainerResponse.data.trainers);
        setSpecialties(specialtyResponse.data.specialties);
      })
      .catch(() => {});
  }, []);

  const search = () => {
    const params = new URLSearchParams();
    if (sport) params.set("specialtyId", sport);
    if (location) params.set("q", location);
    navigate(`/entrenadores?${params}`);
  };

  return (
    <div className="app-shell">
      <header className="absolute inset-x-0 top-0 z-20 border-b border-white/[0.07] bg-black/20 backdrop-blur-md">
        <div className="page-container flex h-[78px] items-center justify-between">
          <Brand />
          <nav className="hidden items-center gap-8 text-sm font-bold text-slate-400 md:flex">
            <a href="#tendencias">Entrenadores</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#seguridad">Seguridad</a>
          </nav>
          <div className="flex gap-2">
            <Link to="/login"><Button variant="ghost">Ingresar</Button></Link>
            <Link to="/registro"><Button>Crear cuenta</Button></Link>
          </div>
        </div>
      </header>

      <section className="relative min-h-[850px] overflow-hidden">
        <img alt="Atleta preparándose para entrenar" className="absolute inset-0 h-full w-full object-cover" src="/assets/hero-athlete.png" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#05060d_0%,rgba(5,6,13,.95)_34%,rgba(5,6,13,.35)_72%,rgba(5,6,13,.58)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05060d] via-transparent to-transparent" />
        <div className="page-container relative z-10 flex min-h-[850px] items-center pt-28">
          <div className="max-w-4xl pb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
              <Zap className="size-4" /> Más de 50.000 atletas ya entrenan con nosotros
            </span>
            <h1 className="mt-8 max-w-4xl text-5xl font-extrabold leading-[1.02] tracking-[-0.055em] text-white md:text-7xl lg:text-[88px]">
              Encuentra Tu <span className="text-blue-500">Entrenador Ideal.</span>
              <span className="block text-slate-400">Entrena Como un Pro.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400 md:text-xl">
              Conectá con entrenadores certificados de élite. Planes personalizados,
              progreso medible y resultados reales.
            </p>
            <div className="mt-9 grid max-w-3xl gap-2 rounded-[24px] border border-white/10 bg-[#0c0f19]/90 p-2 shadow-2xl backdrop-blur md:grid-cols-[1fr_1fr_auto]">
              <select className="rounded-2xl bg-transparent px-5 py-4 font-semibold text-white outline-none" onChange={(e) => setSport(e.target.value)} value={sport}>
                <option className="bg-slate-950" value="">Todos los deportes</option>
                {specialties.map((item) => <option className="bg-slate-950" key={item.idEspecialidad} value={item.idEspecialidad}>{item.nombre}</option>)}
              </select>
              <label className="flex items-center gap-3 border-white/10 px-5 md:border-l">
                <MapPin className="size-5 text-slate-500" />
                <input className="w-full bg-transparent py-4 text-white outline-none placeholder:text-slate-500" onChange={(e) => setLocation(e.target.value)} placeholder="Ciudad o en línea" value={location} />
              </label>
              <Button className="rounded-[18px]" onClick={search} size="lg"><Search className="size-5" /> Buscar</Button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span>Popular:</span>
              {specialties.slice(0, 5).map((item) => (
                <button className="rounded-full border border-white/10 px-3 py-1.5 hover:border-blue-500/40 hover:text-blue-300" key={item.idEspecialidad} onClick={() => setSport(String(item.idEspecialidad))}>
                  {item.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-container relative z-10 -mt-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[["+50K", "Atletas Activos"], ["+2.400", "Entrenadores Verificados"], ["+40", "Disciplinas Deportivas"], ["4.9", "Calificación Promedio"]].map(([value, label]) => (
          <Card className="p-6 text-center backdrop-blur" key={label}>
            <p className="text-3xl font-extrabold text-white">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </Card>
        ))}
      </section>

      <section className="page-container py-28" id="tendencias">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Selección FitConnection</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight">Tendencia esta semana</h2>
            <p className="mt-3 text-slate-400">Profesionales destacados por resultados, experiencia y reseñas.</p>
          </div>
          <Link className="hidden items-center gap-2 font-bold text-blue-400 md:flex" to="/entrenadores">Ver todos <ChevronRight className="size-4" /></Link>
        </div>
        <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {trainers.slice(0, 3).map((trainer, index) => <TrainerCard index={index} key={trainer.idEntrenador} trainer={trainer} />)}
        </div>
      </section>

      <section className="border-y border-white/[0.06] bg-[#080a12] py-28" id="como-funciona">
        <div className="page-container">
          <div className="text-center">
            <p className="eyebrow">Simple y efectivo</p>
            <h2 className="mt-3 text-4xl font-extrabold">Cómo funciona FitConnection</h2>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              [Search, "01", "Encontrá a tu coach", "Filtrá por deporte, modalidad, precio y calificación."],
              [UserRoundCheck, "02", "Conectá de forma segura", "Enviá una solicitud y conversá directamente con el entrenador."],
              [Target, "03", "Entrená y progresá", "Reservá turnos, pagá y medí cada paso de tu evolución."],
            ].map(([Icon, number, title, text]) => (
              <Card className="p-8" hover key={title}>
                <div className="flex items-center justify-between">
                  <span className="grid size-14 place-items-center rounded-2xl bg-blue-500/12 text-blue-400"><Icon /></span>
                  <span className="text-5xl font-extrabold text-white/[0.05]">{number}</span>
                </div>
                <h3 className="mt-8 text-xl font-extrabold">{title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container py-28" id="seguridad">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Confianza sin atajos</p>
            <h2 className="mt-3 text-4xl font-extrabold leading-tight">Entrená con profesionales verificados.</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-400">Cada entrenador pasa por un proceso de validación administrativa y certificaciones. Tu historial, pagos y conexiones quedan protegidos en una plataforma transparente.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[[BadgeCheck, "Certificaciones validadas"], [ShieldCheck, "Pagos simulados seguros"], [Sparkles, "Calidad moderada"], [Star, "Reseñas verificadas"]].map(([Icon, label]) => (
              <Card className="flex items-center gap-4 p-5" key={label}><span className="grid size-11 place-items-center rounded-xl bg-blue-500/10 text-blue-400"><Icon className="size-5" /></span><strong>{label}</strong></Card>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container pb-24">
        <div className="overflow-hidden rounded-[36px] border border-blue-500/25 bg-[radial-gradient(circle_at_75%_30%,rgba(37,99,235,.35),transparent_35%),#0b1224] p-10 md:p-16">
          <p className="eyebrow">Tu experiencia cuenta</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-extrabold">¿Eres Entrenador Profesional?</h2>
          <p className="mt-4 max-w-xl text-slate-300">Sumate a una red de profesionales que transforma objetivos en resultados.</p>
          <Link to="/registro"><Button className="mt-8" size="lg">Comenzar postulación <ArrowRight /></Button></Link>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-10">
        <div className="page-container flex flex-col items-center justify-between gap-5 md:flex-row">
          <Brand />
          <p className="text-sm text-slate-500">© 2026 FitConnection. Entrená conectado.</p>
        </div>
      </footer>
    </div>
  );
}
