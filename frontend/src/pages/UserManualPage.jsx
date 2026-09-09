import {
  BadgeCheck,
  BookOpen,
  CalendarCheck2,
  ChevronDown,
  CircleDollarSign,
  FileCheck2,
  KeyRound,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  UserCog,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Card, StatusBadge } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const roles = [
  { id: "Cliente", description: "Encontrá entrenadores, coordiná turnos y seguí tu actividad.", icon: UserRound },
  { id: "Entrenador", description: "Gestioná tu perfil profesional, agenda, alumnos e ingresos.", icon: UsersRound },
  { id: "Administrador", description: "Supervisá usuarios, validaciones, operaciones y reportes.", icon: ShieldCheck },
];

const manuals = {
  Cliente: [
    {
      id: "inicio-cliente", title: "Primeros pasos y panel", summary: "Conocé el punto de partida de tu cuenta.", icon: Sparkles,
      steps: [
        "Al iniciar sesión accederás a Mi Panel, donde verás tus turnos, inversión, entrenadores activos y horas de entrenamiento.",
        "Usá Buscar entrenador para explorar profesionales aprobados o revisá tus próximos turnos desde la tarjeta de agenda.",
        "Desde el menú de usuario podés editar tu nombre y apellido, cambiar la contraseña o cerrar sesión.",
      ],
      tips: "La fecha de nacimiento es un dato protegido y no se modifica desde Mi perfil.",
      link: "/panel", linkLabel: "Ir a Mi Panel", keywords: "inicio cuenta perfil métricas contraseña",
    },
    {
      id: "buscar-entrenador", title: "Buscar y elegir un entrenador", summary: "Filtrá profesionales y revisá sus perfiles verificados.", icon: Search,
      steps: [
        "Entrá en Buscar Entrenadores desde la barra de navegación.",
        "Buscá por nombre, deporte o ubicación y combiná los filtros de especialidad, modalidad y calificación mínima.",
        "Abrí una tarjeta para consultar experiencia, tarifa, especialidades, servicios, certificaciones, disponibilidad y reseñas.",
        "Seleccioná Conectar para enviar una solicitud al profesional. Cuando sea aceptada, se habilitará la conversación.",
      ],
      tips: "En el marketplace solo aparecen entrenadores aprobados por la administración.",
      link: "/entrenadores", linkLabel: "Buscar entrenadores", keywords: "marketplace filtros especialidad modalidad conectar perfil reseñas",
    },
    {
      id: "solicitar-turno", title: "Solicitar y administrar turnos", summary: "Reservá un horario y seguí cada cambio de estado.", icon: CalendarCheck2,
      steps: [
        "Abrí el perfil del entrenador y elegí un bloque disponible.",
        "Indicá modalidad y observaciones útiles, y enviá la solicitud de turno.",
        "Consultá Mis Turnos para ver solicitudes, reservas, turnos finalizados y cancelados.",
        "Mientras el turno esté solicitado o reservado sin pago aprobado, podés cancelarlo indicando el motivo.",
      ],
      tips: "El entrenador debe aceptar la solicitud antes de que el turno quede Reservado.",
      link: "/turnos", linkLabel: "Ver Mis Turnos", keywords: "agenda horario reservar cancelar solicitado reservado",
    },
    {
      id: "pago-calificacion", title: "Pagar y calificar", summary: "Completá el circuito después de reservar y entrenar.", icon: CircleDollarSign,
      steps: [
        "Cuando el turno esté Reservado, abrilo desde Mis Turnos y seleccioná Pagar.",
        "Elegí un medio y un resultado para ejecutar el pago simulado del MVP. Si es rechazado, podés reintentarlo.",
        "Después de que el entrenador marque el turno como Finalizado y el pago esté aprobado, seleccioná Calificar.",
        "Asigná de 1 a 5 estrellas y agregá un comentario sobre tu experiencia.",
      ],
      tips: "La operación es de demostración: la aplicación no procesa dinero real.",
      link: "/turnos", linkLabel: "Gestionar pagos y reseñas", keywords: "pago tarjeta transferencia billetera calificar estrellas comentario",
    },
    {
      id: "mensajes-cliente", title: "Conversar con un entrenador", summary: "Usá el chat para coordinar detalles de la actividad.", icon: MessageSquare,
      steps: [
        "Una vez aceptada la conexión, abrí Mensajes desde el ícono de la barra superior.",
        "Elegí una conversación o buscala por nombre.",
        "Escribí el mensaje y presioná Enviar. Desde el encabezado también podés volver al perfil del entrenador.",
      ],
      tips: "No compartas contraseñas ni información financiera por el chat.",
      link: "/mensajes", linkLabel: "Abrir Mensajes", keywords: "chat conversación coordinar enviar seguridad",
    },
    {
      id: "ser-entrenador", title: "Postularme como entrenador", summary: "Convertí tu cuenta cliente en un perfil profesional.", icon: BadgeCheck,
      steps: [
        "Ingresá al Portal del Entrenador y completá datos profesionales, especialidades, experiencia, tarifa y modalidad.",
        "Adjuntá los datos de al menos una certificación y enviá la postulación.",
        "La cuenta conservará el rol Cliente mientras la administración revisa el perfil y la documentación.",
        "Si la postulación es rechazada, leé el motivo, corregí los datos y volvé a enviarla.",
      ],
      tips: "Las funciones de agenda, pagos y reportes se habilitan cuando el perfil queda Aprobado.",
      link: "/portal-entrenador", linkLabel: "Ir al Portal del Entrenador", keywords: "postulación certificación aprobación profesional",
    },
  ],
  Entrenador: [
    {
      id: "estado-entrenador", title: "Activación del perfil profesional", summary: "Entendé los estados de tu postulación.", icon: BadgeCheck,
      steps: [
        "Pendiente indica que administración está revisando el perfil y las certificaciones enviadas.",
        "Rechazado muestra el motivo de la observación y permite corregir y reenviar la postulación.",
        "Aprobado habilita dashboard, solicitudes, turnos, disponibilidad, pagos y reportes.",
      ],
      tips: "Aunque seas entrenador, tu cuenta mantiene las funciones de Cliente.",
      link: "/portal-entrenador", linkLabel: "Consultar estado", keywords: "postulación pendiente rechazado aprobado habilitación",
    },
    {
      id: "perfil-profesional", title: "Mantener el perfil profesional", summary: "Actualizá la información que ven los clientes.", icon: UserCog,
      steps: [
        "Abrí Opciones entrenador y elegí Perfil Profesional.",
        "Actualizá la URL de imagen, años de experiencia, tarifa base, modalidad y especialidades.",
        "Guardá los cambios y revisá que la información describa con claridad tu servicio.",
      ],
      tips: "Una tarifa y disponibilidad actualizadas evitan solicitudes que después no puedas aceptar.",
      link: "/portal-entrenador/perfil", linkLabel: "Editar perfil profesional", keywords: "foto experiencia tarifa modalidad especialidades editar",
    },
    {
      id: "certificaciones-entrenador", title: "Cargar certificaciones", summary: "Presentá y seguí tu documentación profesional.", icon: FileCheck2,
      steps: [
        "Ingresá en Certificaciones y seleccioná Agregar certificación.",
        "Completá título, entidad emisora, fecha de emisión, vencimiento y referencia del archivo.",
        "Revisá el estado: Pendiente, Validado, Rechazado o Expirado.",
        "Si se rechaza, corregí la documentación según el motivo informado por administración.",
      ],
      tips: "Una certificación validada forma parte de la confianza visible para el cliente.",
      link: "/portal-entrenador/certificaciones", linkLabel: "Gestionar certificaciones", keywords: "documentación título entidad validado expirado archivo",
    },
    {
      id: "disponibilidad-entrenador", title: "Configurar disponibilidad", summary: "Publicá los bloques que los clientes pueden solicitar.", icon: CalendarCheck2,
      steps: [
        "Entrá en Disponibilidad y elegí día, hora de inicio, hora de fin y modalidad.",
        "Agregá ubicación u observaciones cuando sean necesarias y guardá el bloque.",
        "Revisá los turnos activos que la aplicación compara con tu agenda.",
        "Eliminá un bloque solo cuando ya no quieras ofrecer ese horario.",
      ],
      tips: "Los bloques no deben superponerse y la hora de fin debe ser posterior a la de inicio.",
      link: "/portal-entrenador/disponibilidad", linkLabel: "Configurar disponibilidad", keywords: "agenda bloque día hora modalidad ubicación superposición",
    },
    {
      id: "solicitudes-entrenador", title: "Responder solicitudes de conexión", summary: "Aceptá o rechazá nuevos vínculos con clientes.", icon: UsersRound,
      steps: [
        "Abrí Solicitudes para consultar las peticiones recibidas y filtralas por estado.",
        "Revisá la información del cliente y el mensaje de presentación.",
        "Seleccioná Aceptar para habilitar el vínculo y el chat, o Rechazar si no podés tomarlo.",
      ],
      tips: "Aceptar una conexión no reserva automáticamente un turno.",
      link: "/portal-entrenador/solicitudes", linkLabel: "Ver solicitudes", keywords: "conexión cliente aceptar rechazar vínculo",
    },
    {
      id: "turnos-entrenador", title: "Gestionar turnos", summary: "Confirmá solicitudes y cerrá las sesiones realizadas.", icon: CalendarCheck2,
      steps: [
        "Entrá en Gestionar Turnos y filtrá por Solicitado, Reservado, Finalizado o Cancelado.",
        "Abrí el detalle para verificar cliente, fecha, horario, modalidad, tarifa y observaciones.",
        "Aceptá o rechazá los turnos solicitados. Indicá un motivo cuando corresponda.",
        "Luego de realizar la sesión, marcá el turno reservado como Finalizado para habilitar la calificación del cliente.",
      ],
      tips: "Antes de aceptar, comprobá que el horario continúe disponible.",
      link: "/portal-entrenador/turnos", linkLabel: "Gestionar turnos", keywords: "aceptar rechazar finalizar cancelar sesión reservado",
    },
    {
      id: "pagos-reportes-entrenador", title: "Consultar pagos y rendimiento", summary: "Controlá ingresos, comisión y evolución profesional.", icon: CircleDollarSign,
      steps: [
        "En Pagos consultá monto bruto aprobado, comisión de la plataforma, neto recibido y detalle de operaciones.",
        "La comisión se calcula automáticamente según tu promedio de calificaciones.",
        "En Reportes revisá ingresos, sesiones, alumnos, tasa de aceptación y evolución histórica.",
        "Usá el Dashboard para una vista rápida de próximos turnos y alumnos recientes.",
      ],
      tips: "Los importes corresponden a pagos simulados dentro del MVP.",
      link: "/portal-entrenador/reportes", linkLabel: "Ver reportes", keywords: "ingresos comisión neto métricas dashboard rendimiento",
    },
  ],
  Administrador: [
    {
      id: "panel-admin", title: "Centro de administración", summary: "Usá el panel para priorizar tareas y revisar indicadores.", icon: ShieldCheck,
      steps: [
        "Al iniciar sesión, Mi Panel muestra usuarios activos, clientes, entrenadores aprobados, pagos y comisiones.",
        "Revisá las colas de certificaciones, entrenadores y moderaciones pendientes.",
        "Usá los accesos de Administración para entrar en cada módulo operativo.",
      ],
      tips: "Actualizá la vista de cada módulo después de realizar una acción administrativa.",
      link: "/panel", linkLabel: "Abrir centro de administración", keywords: "indicadores métricas cola tareas dashboard",
    },
    {
      id: "usuarios-admin", title: "Gestionar usuarios y entrenadores", summary: "Buscá cuentas y aplicá acciones de seguridad.", icon: UserCog,
      steps: [
        "Entrá en Usuarios y buscá por nombre, email, rol o estado.",
        "Activá o desactivá una cuenta según corresponda.",
        "Para entrenadores, aprobá o rechazá la postulación; las acciones sensibles solicitan motivo o comentario.",
        "Confirmá siempre la identidad y el contexto antes de modificar un estado.",
      ],
      tips: "Una cuenta desactivada pierde el acceso hasta que vuelva a ser activada.",
      link: "/admin/usuarios", linkLabel: "Gestionar usuarios", keywords: "activar desactivar aprobar rechazar seguridad cuenta entrenador",
    },
    {
      id: "certificaciones-admin", title: "Validar certificaciones", summary: "Revisá la documentación enviada por entrenadores.", icon: FileCheck2,
      steps: [
        "Abrí Certificaciones para ver la cola pendiente.",
        "Comprobá título, entidad emisora, fechas y referencia documental.",
        "Seleccioná Validar cuando los datos sean correctos.",
        "Si elegís Rechazar, escribí un motivo claro para que el entrenador pueda corregir la presentación.",
      ],
      tips: "La aprobación del perfil profesional requiere una revisión coherente con la documentación.",
      link: "/admin/certificaciones", linkLabel: "Revisar certificaciones", keywords: "validar documento pendiente rechazar motivo entrenador",
    },
    {
      id: "moderacion-admin", title: "Moderar calificaciones", summary: "Protegé la calidad del contenido publicado.", icon: MessageSquare,
      steps: [
        "Entrá en Moderación para consultar calificaciones pendientes.",
        "Revisá puntuación y comentario dentro del contexto de la operación.",
        "Aprobá el contenido válido u ocultalo cuando sea ofensivo, inválido o spam.",
        "Al ocultar, registrá el motivo para mantener trazabilidad.",
      ],
      tips: "Moderá el contenido, no la valoración legítima de una experiencia.",
      link: "/admin/moderacion", linkLabel: "Abrir moderación", keywords: "reseña puntuación comentario aprobar ocultar spam",
    },
    {
      id: "pagos-admin", title: "Supervisar pagos", summary: "Filtrá operaciones y corregí su estado cuando corresponda.", icon: CircleDollarSign,
      steps: [
        "Entrá en Pagos y filtrá por estado, entrenador, cliente o fecha.",
        "Abrí el detalle para revisar turno, importe, comisión, método y participantes.",
        "Usá Cambiar estado únicamente cuando sea necesario corregir una operación simulada.",
      ],
      tips: "Los pagos del MVP son simulados y no representan transferencias reales.",
      link: "/admin/pagos", linkLabel: "Supervisar pagos", keywords: "operación estado filtro importe comisión método",
    },
    {
      id: "comisiones-admin", title: "Consultar la escala de comisiones", summary: "Entendé la regla automática aplicada a entrenadores.", icon: BadgeCheck,
      steps: [
        "Abrí Comisiones para consultar los porcentajes vigentes por rango de calificación.",
        "La aplicación recalcula la comisión cuando cambia el promedio del entrenador.",
        "Esta pantalla es informativa; la escala no se edita desde la interfaz actual.",
      ],
      tips: "No comuniques un porcentaje sin comprobar primero el promedio vigente del entrenador.",
      link: "/admin/comisiones", linkLabel: "Ver escala de comisiones", keywords: "porcentaje promedio regla cálculo automático",
    },
    {
      id: "reportes-admin", title: "Analizar reportes", summary: "Consultá actividad, finanzas y desempeño de la plataforma.", icon: BookOpen,
      steps: [
        "Seleccioná un período para consolidar la información.",
        "En Conexiones revisá solicitudes, estados, tasa de aceptación y deportes más demandados.",
        "En Finanzas consultá facturación, comisiones y pagos por estado.",
        "En Entrenadores analizá los indicadores comparativos disponibles.",
      ],
      tips: "El período seleccionado se aplica a los datos históricos de los reportes.",
      link: "/admin/reportes", linkLabel: "Abrir reportes", keywords: "período conexiones finanzas facturación estadísticas",
    },
  ],
};

function preferredRole(user) {
  if (user?.roles.includes("Administrador")) return "Administrador";
  if (user?.roles.includes("Entrenador")) return "Entrenador";
  return "Cliente";
}

function ManualSection({ section, open, onToggle }) {
  const Icon = section.icon;
  return (
    <Card className="overflow-hidden p-0" id={section.id}>
      <button aria-expanded={open} className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-white/[0.025] sm:p-6" onClick={onToggle} type="button">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-500/10 text-blue-300"><Icon className="size-5" /></span>
        <span className="min-w-0 flex-1">
          <strong className="block text-lg text-white">{section.title}</strong>
          <span className="mt-1 block text-sm leading-6 text-slate-400">{section.summary}</span>
        </span>
        <ChevronDown className={`size-5 shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-white/[0.07] px-5 pb-6 pt-5 sm:px-6">
          <ol className="space-y-4">
            {section.steps.map((step, index) => (
              <li className="flex gap-4 text-sm leading-6 text-slate-300" key={step}>
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-blue-500/15 text-xs font-extrabold text-blue-300">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 rounded-2xl border border-amber-500/15 bg-amber-500/[0.06] p-4 text-sm leading-6 text-amber-100/80">
            <strong className="text-amber-300">Tené en cuenta:</strong> {section.tips}
          </div>
          <Link className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-blue-400 transition hover:text-blue-300" to={section.link}>
            {section.linkLabel} <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </Card>
  );
}

export function UserManualPage() {
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState(() => preferredRole(user));
  const [query, setQuery] = useState("");
  const [openSections, setOpenSections] = useState(() => new Set());
  const currentRole = roles.find((role) => role.id === activeRole);
  const sections = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");
    if (!normalizedQuery) return manuals[activeRole];
    return manuals[activeRole].filter((section) =>
      `${section.title} ${section.summary} ${section.keywords} ${section.steps.join(" ")}`.toLocaleLowerCase("es").includes(normalizedQuery),
    );
  }, [activeRole, query]);

  const changeRole = (role) => {
    setActiveRole(role);
    setQuery("");
    setOpenSections(new Set());
  };

  const toggleSection = (id) => {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="page-container py-10">
      <section className="relative overflow-hidden rounded-[32px] border border-blue-500/20 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,.18),transparent_38%),#0d0f19] p-6 sm:p-9">
        <div className="relative max-w-3xl">
          <StatusBadge tone="blue"><BookOpen className="size-3.5" /> Centro de ayuda</StatusBadge>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">Manual de usuario</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-400">Encontrá instrucciones paso a paso según el rol con el que usás FitConnection.</p>
          <label className="relative mt-7 block max-w-xl">
            <span className="sr-only">Buscar en el manual</span>
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
            <input className="w-full rounded-2xl border border-white/10 bg-[#080a12]/80 py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10" onChange={(event) => setQuery(event.target.value)} placeholder={`Buscar ayuda para ${currentRole.id.toLowerCase()}...`} type="search" value={query} />
          </label>
        </div>
      </section>

      <div className="mt-7 grid gap-3 md:grid-cols-3" role="tablist" aria-label="Manuales por rol">
        {roles.map((role) => {
          const Icon = role.icon;
          const active = role.id === activeRole;
          const assigned = user?.roles.includes(role.id);
          return (
            <button aria-selected={active} className={`rounded-3xl border p-5 text-left transition ${active ? "border-blue-500/50 bg-blue-500/10 shadow-[0_18px_45px_rgba(37,99,235,.1)]" : "border-white/[0.08] bg-[#0d0f19] hover:border-white/20"}`} key={role.id} onClick={() => changeRole(role.id)} role="tab" type="button">
              <span className="flex items-center justify-between gap-3">
                <span className={`grid size-11 place-items-center rounded-2xl ${active ? "bg-blue-500 text-white" : "bg-white/[0.05] text-slate-400"}`}><Icon className="size-5" /></span>
                {assigned && <StatusBadge tone="green">Tu rol</StatusBadge>}
              </span>
              <strong className="mt-4 block text-lg text-white">{role.id}</strong>
              <span className="mt-1 block text-sm leading-6 text-slate-500">{role.description}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid items-start gap-7 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="surface p-5 lg:sticky lg:top-[98px]">
          <p className="eyebrow">En esta guía</p>
          <nav className="mt-4 space-y-1" aria-label={`Temas para ${currentRole.id}`}>
            {manuals[activeRole].map((section, index) => (
              <button className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white" key={section.id} onClick={() => {
                setQuery("");
                setOpenSections((current) => new Set(current).add(section.id));
                requestAnimationFrame(() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "center" }));
              }} type="button">
                <span className="font-extrabold text-blue-400">{String(index + 1).padStart(2, "0")}</span><span>{section.title}</span>
              </button>
            ))}
          </nav>
          <div className="mt-5 border-t border-white/[0.07] pt-5">
            <p className="flex gap-3 text-xs leading-5 text-slate-500"><KeyRound className="mt-0.5 size-4 shrink-0 text-slate-400" />Nunca compartas tu contraseña. FitConnection no te la solicitará por mensajes.</p>
          </div>
        </aside>

        <main>
          <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div><p className="eyebrow">Manual por rol</p><h2 className="mt-2 text-3xl font-extrabold">Guía para {currentRole.id}</h2></div>
            <span className="text-sm text-slate-500">{sections.length} {sections.length === 1 ? "tema" : "temas"}</span>
          </div>
          {sections.length ? (
            <div className="space-y-3">
              {sections.map((section) => <ManualSection key={section.id} onToggle={() => toggleSection(section.id)} open={Boolean(query) || openSections.has(section.id)} section={section} />)}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Search className="mx-auto size-9 text-slate-600" />
              <h3 className="mt-4 text-xl font-extrabold">No encontramos ese tema</h3>
              <p className="mt-2 text-sm text-slate-500">Probá con palabras como “turno”, “pago”, “perfil” o “contraseña”.</p>
              <button className="mt-5 text-sm font-bold text-blue-400 hover:text-blue-300" onClick={() => setQuery("")} type="button">Limpiar búsqueda</button>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
