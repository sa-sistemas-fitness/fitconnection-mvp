import { Bell, LogOut, Menu, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { Brand } from "./Brand.jsx";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const signOut = () => {
    logout();
    navigate("/");
  };
  const links = user?.roles.includes("Administrador")
    ? [
        { to: "/panel", label: "Dashboard Admin" },
        { to: "/admin/usuarios", label: "Usuarios" },
        { to: "/admin/certificaciones", label: "Certificaciones" },
        { to: "/admin/moderacion", label: "Moderación" },
        { to: "/admin/comisiones", label: "Comisiones" },
        { to: "/admin/pagos", label: "Pagos" },
        { to: "/admin/reportes", label: "Reportes" },
      ]
    : [
        { to: "/entrenadores", label: "Buscar Entrenadores" },
        { to: "/panel", label: "Mi Panel" },
        { to: "/turnos", label: "Mis Turnos" },
        { to: "/portal-entrenador", label: "Portal del Entrenador" },
        ...(user?.entrenador
          ? [
              {
                to: "/portal-entrenador/perfil",
                label: "Perfil Profesional",
              },
              {
                to: "/portal-entrenador/certificaciones",
                label: "Certificaciones",
              },
              ...(user.entrenador.estado?.nombre === "Aprobado"
                ? [
                    {
                      to: "/portal-entrenador/dashboard",
                      label: "Dashboard",
                    },
                    {
                      to: "/portal-entrenador/solicitudes",
                      label: "Solicitudes",
                    },
                    {
                      to: "/portal-entrenador/turnos",
                      label: "Gestionar Turnos",
                    },
                    {
                      to: "/portal-entrenador/disponibilidad",
                      label: "Disponibilidad",
                    },
                    {
                      to: "/portal-entrenador/pagos",
                      label: "Pagos",
                    },
                    {
                      to: "/portal-entrenador/reportes",
                      label: "Reportes",
                    },
                  ]
                : []),
            ]
          : []),
      ];
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#05060d]/90 backdrop-blur-xl">
      <div className="page-container flex h-[74px] items-center justify-between">
        <Brand />
        <nav className="hidden items-center gap-2 lg:flex">
          {links.map((link) => (
            <NavLink
              className={({ isActive }) =>
                `rounded-2xl px-5 py-2.5 text-sm font-bold transition ${
                  isActive ? "border border-white/70 text-blue-400" : "text-slate-400 hover:text-white"
                }`
              }
              key={link.to}
              end={link.to === "/portal-entrenador"}
              to={link.to}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {!user?.roles.includes("Administrador") && (
            <NavLink className="relative rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white" to="/mensajes">
              <MessageSquare className="size-5" />
              <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-blue-500 text-[10px] font-bold text-white">1</span>
            </NavLink>
          )}
          <button className="rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white">
            <Bell className="size-5" />
          </button>
          <div className="ml-1 hidden items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-2 pr-4 md:flex">
            <span className="grid size-8 place-items-center rounded-full bg-blue-500/15 font-bold text-blue-400">
              {user?.nombre?.[0] ?? "F"}
            </span>
            <span className="max-w-28 truncate text-sm font-bold">{user ? `${user.nombre} ${user.apellido[0]}.` : "Invitado"}</span>
          </div>
          {user && (
            <button className="rounded-xl p-2.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-300" onClick={signOut} title="Cerrar sesión">
              <LogOut className="size-5" />
            </button>
          )}
          <button className="rounded-xl p-2 lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-white/10 bg-[#090b13] p-4 lg:hidden">
          {links.map((link) => (
            <NavLink className="block rounded-xl px-4 py-3 font-semibold text-slate-300" end={link.to === "/portal-entrenador"} key={link.to} onClick={() => setOpen(false)} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
