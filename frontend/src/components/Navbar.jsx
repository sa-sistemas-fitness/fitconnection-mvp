import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  MessageSquare,
  UserCircle2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { Brand } from "./Brand.jsx";

const mainLinks = [
  { to: "/entrenadores", label: "Buscar Entrenadores", roles: ["Cliente"] },
  { to: "/panel", label: "Mi Panel" },
  { to: "/portal-entrenador", label: "Portal del Entrenador", roles: ["Cliente"] },
];

const trainerLinks = [
  { to: "/portal-entrenador/dashboard", label: "Dashboard", approvedOnly: true },
  { to: "/portal-entrenador/perfil", label: "Perfil Profesional" },
  { to: "/portal-entrenador/certificaciones", label: "Certificaciones" },
  { to: "/portal-entrenador/solicitudes", label: "Solicitudes", approvedOnly: true },
  { to: "/portal-entrenador/turnos", label: "Gestionar Turnos", approvedOnly: true },
  { to: "/portal-entrenador/disponibilidad", label: "Disponibilidad", approvedOnly: true },
  { to: "/portal-entrenador/pagos", label: "Pagos", approvedOnly: true },
  { to: "/portal-entrenador/reportes", label: "Reportes", approvedOnly: true },
];

const adminLinks = [
  { to: "/admin/usuarios", label: "Usuarios" },
  { to: "/admin/certificaciones", label: "Certificaciones" },
  { to: "/admin/moderacion", label: "Moderación" },
  { to: "/admin/comisiones", label: "Comisiones" },
  { to: "/admin/pagos", label: "Pagos" },
  { to: "/admin/reportes", label: "Reportes" },
];

function itemClass(isActive) {
  return `rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
    isActive
      ? "border border-white/60 bg-white/[0.04] text-blue-300"
      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
  }`;
}

function Dropdown({ label, children, active, ariaLabel }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        className={`${itemClass(active)} inline-flex items-center gap-2 whitespace-nowrap`}
        aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {label}
        <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+.75rem)] z-50 w-72 rounded-3xl border border-white/10 bg-[#090b13] p-2 shadow-2xl shadow-black/40"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownLink({ to, children, end = false, onClick }) {
  return (
    <NavLink
      className={({ isActive }) =>
        `block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
          isActive && !end
            ? "bg-blue-500/10 text-blue-300"
            : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
        }`
      }
      end={end}
      onClick={onClick}
      to={to}
    >
      {children}
    </NavLink>
  );
}

function UserDropdown({ user, signOut }) {
  const location = useLocation();
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  const close = () => setOpen(false);

  const updatePosition = () => {
    const button = buttonRef.current;
    if (!button) return;

    const gap = 10;
    const margin = 12;
    const menuWidth = Math.min(256, window.innerWidth - margin * 2);
    const menuHeight = menuRef.current?.offsetHeight ?? 180;
    const rect = button.getBoundingClientRect();
    const left = Math.min(
      Math.max(margin, rect.right - menuWidth),
      window.innerWidth - menuWidth - margin,
    );
    let top = rect.bottom + gap;

    if (top + menuHeight > window.innerHeight - margin) {
      top = Math.max(margin, rect.top - menuHeight - gap);
    }

    setPosition({ left, top });
  };

  useEffect(() => {
    if (!open) return undefined;

    updatePosition();
    const onPointerDown = (event) => {
      if (
        buttonRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return;
      }
      close();
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    close();
  }, [location.pathname]);

  const menu =
    open &&
    createPortal(
      <div
        className="fixed z-[9999] w-64 max-w-[calc(100vw-24px)] rounded-3xl border border-white/15 bg-[#090b13] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        ref={menuRef}
        role="menu"
        style={{ left: position.left, top: position.top }}
      >
        <DropdownLink onClick={close} to="/cuenta">
          Mi perfil
        </DropdownLink>
        <DropdownLink onClick={close} to="/recuperar-contrasena">
          Cambiar contraseña
        </DropdownLink>
        <div className="my-2 h-px bg-white/10" />
        <button
          className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-bold text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
          onClick={() => {
            close();
            signOut();
          }}
          role="menuitem"
          type="button"
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </button>
      </div>,
      document.body,
    );

  return (
    <>
      <button
        aria-expanded={open}
        aria-label="Menú de usuario"
        className={`${itemClass(location.pathname === "/cuenta")} inline-flex min-w-0 items-center gap-2 whitespace-nowrap`}
        onClick={() => {
          setOpen((current) => !current);
          requestAnimationFrame(updatePosition);
        }}
        ref={buttonRef}
        type="button"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-500/15 font-bold text-blue-400">
          {user?.nombre?.[0] ?? "F"}
        </span>
        <span className="max-w-28 truncate">
          {user ? `${user.nombre} ${user.apellido?.[0] ?? ""}.` : "Invitado"}
        </span>
        <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {menu}
    </>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.roles.includes("Administrador");
  const isTrainerApproved = user?.entrenador?.estado?.nombre === "Aprobado";

  const visibleMainLinks = useMemo(
    () =>
      mainLinks.filter(
        (link) =>
          !link.roles || link.roles.some((role) => user?.roles.includes(role)),
      ),
    [user],
  );

  const visibleTrainerLinks = trainerLinks.filter(
    (link) => !link.approvedOnly || isTrainerApproved,
  );

  const signOut = () => {
    setOpen(false);
    logout();
    navigate("/login");
  };

  const goAndClose = () => setOpen(false);
  const trainerActive = location.pathname.startsWith("/portal-entrenador/");
  const adminActive = location.pathname.startsWith("/admin/");

  return (
    <header className="fixed inset-x-0 top-0 z-[80] border-b border-white/[0.07] bg-[#05060d]/90 backdrop-blur-xl">
      <div className="page-container flex h-[74px] min-w-0 items-center justify-between gap-3">
        <div className="min-w-0 shrink-0">
          <Brand />
        </div>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2 xl:flex">
          {isAdmin ? (
            <>
              <NavLink className={({ isActive }) => itemClass(isActive)} to="/panel">
                Mi Panel
              </NavLink>
              <Dropdown active={adminActive} label="Administración">
                {adminLinks.map((link) => (
                  <DropdownLink key={link.to} to={link.to}>
                    {link.label}
                  </DropdownLink>
                ))}
              </Dropdown>
            </>
          ) : (
            <>
              {visibleMainLinks.map((link) => (
                <NavLink
                  className={({ isActive }) => itemClass(isActive)}
                  end={link.to === "/portal-entrenador"}
                  key={link.to}
                  to={link.to}
                >
                  {link.label}
                </NavLink>
              ))}
              {user?.entrenador && (
                <Dropdown active={trainerActive} label="Opciones entrenador">
                  {visibleTrainerLinks.map((link) => (
                    <DropdownLink key={link.to} to={link.to}>
                      {link.label}
                    </DropdownLink>
                  ))}
                </Dropdown>
              )}
            </>
          )}
        </nav>

        <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
          {!isAdmin && (
            <NavLink
              aria-label="Mensajes"
              className="relative rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white"
              to="/mensajes"
            >
              <MessageSquare className="size-5" />
              <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-blue-500 text-[10px] font-bold text-white">1</span>
            </NavLink>
          )}
          <button aria-label="Notificaciones" className="hidden rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white sm:inline-flex" type="button">
            <Bell className="size-5" />
          </button>

          <div className="hidden md:block">
            <UserDropdown signOut={signOut} user={user} />
          </div>

          <button
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="rounded-xl p-2 text-slate-300 hover:bg-white/5 hover:text-white xl:hidden"
            onClick={() => setOpen(!open)}
            type="button"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="max-h-[calc(100vh-74px)] overflow-y-auto border-t border-white/10 bg-[#090b13] p-4 xl:hidden">
          <div className="space-y-2">
            {isAdmin ? (
              <>
                <DropdownLink onClick={goAndClose} to="/panel">Mi Panel</DropdownLink>
                {adminLinks.map((link) => (
                  <NavLink
                    className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                    key={link.to}
                    onClick={goAndClose}
                    to={link.to}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </>
            ) : (
              <>
                {visibleMainLinks.map((link) => (
                  <NavLink
                    className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                    end={link.to === "/portal-entrenador"}
                    key={link.to}
                    onClick={goAndClose}
                    to={link.to}
                  >
                    {link.label}
                  </NavLink>
                ))}
                {user?.entrenador && (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-2">
                    <p className="px-3 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-blue-400">
                      Entrenador
                    </p>
                    {visibleTrainerLinks.map((link) => (
                      <NavLink
                        className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                        key={link.to}
                        onClick={goAndClose}
                        to={link.to}
                      >
                        {link.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-2">
              <p className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-white">
                <UserCircle2 className="size-5 text-blue-300" />
                {user ? `${user.nombre} ${user.apellido}` : "Invitado"}
              </p>
              <NavLink className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300" onClick={goAndClose} to="/cuenta">
                Mi perfil
              </NavLink>
              <NavLink className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300" onClick={goAndClose} to="/recuperar-contrasena">
                Cambiar contraseña
              </NavLink>
              <button
                className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-bold text-rose-300 hover:bg-rose-500/10"
                onClick={signOut}
                type="button"
              >
                <LogOut className="size-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
