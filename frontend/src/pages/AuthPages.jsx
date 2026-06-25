import { ArrowRight, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { api } from "../api/client.js";
import { Brand } from "../components/Brand.jsx";
import { Button, Input } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function AuthShell({ children }) {
  return (
    <main className="grid min-h-screen bg-[#05060d] lg:grid-cols-[1.08fr_.92fr]">
      <section className="relative hidden overflow-hidden lg:block">
        <img alt="" className="absolute inset-0 h-full w-full object-cover" src="/assets/hero-athlete.png" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#05060d]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05060d] via-black/20 to-black/30" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Brand />
          <div className="max-w-xl">
            <p className="eyebrow">Tu próximo nivel empieza aquí</p>
            <h1 className="mt-4 text-6xl font-extrabold leading-[1.05] tracking-tight">La conexión correcta cambia tu entrenamiento.</h1>
          </div>
          <p className="text-sm text-slate-500">Entrenadores verificados · Progreso real · Comunidad activa</p>
        </div>
      </section>
      <section className="grid place-items-center p-6 md:p-12">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}

export function LoginPage() {
  const { user, authenticate } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "cliente@fitconnection.com", password: "cliente123" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  if (user) return <Navigate to={location.state?.from ?? "/panel"} />;
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      authenticate(data);
      navigate(location.state?.from ?? "/panel");
    } catch (err) { setError(err.response?.data?.message ?? "No se pudo iniciar sesión."); }
    finally { setLoading(false); }
  };
  return (
    <AuthShell>
      <div className="mb-10 lg:hidden"><Brand /></div>
      <p className="eyebrow">Bienvenido de nuevo</p>
      <h2 className="mt-3 text-4xl font-extrabold">Ingresá a FitConnection</h2>
      <p className="mt-3 text-slate-400">Tu progreso y tus entrenadores te esperan.</p>
      <form className="mt-8 space-y-5" onSubmit={submit}>
        <Input label="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" value={form.email} />
        <Input label="Contraseña" onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" value={form.password} />
        <div className="-mt-3 text-right">
          <Link className="text-sm font-bold text-blue-400 hover:text-blue-300" to="/recuperar-contrasena">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        {error && <p className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
        <Button className="w-full" size="lg" type="submit">{loading ? <LoaderCircle className="animate-spin" /> : <>Ingresar <ArrowRight /></>}</Button>
      </form>
      <p className="mt-7 text-center text-sm text-slate-400">¿No tenés cuenta? <Link className="font-bold text-blue-400" to="/registro">Registrate</Link></p>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { user, authenticate } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", dni: "", password: "", ubicacion: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  if (user) return <Navigate to="/panel" />;
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      authenticate(data); navigate("/panel");
    } catch (err) { setError(err.response?.data?.message ?? "No se pudo crear la cuenta."); }
    finally { setLoading(false); }
  };
  return (
    <AuthShell>
      <div className="mb-10 lg:hidden"><Brand /></div>
      <p className="eyebrow">Empezá como Cliente</p>
      <h2 className="mt-3 text-4xl font-extrabold">Creá tu cuenta</h2>
      <p className="mt-3 text-slate-400">Luego podrás postularte desde el Portal del Entrenador.</p>
      <form className="mt-8 space-y-4" onSubmit={submit}>
        <div className="grid grid-cols-2 gap-4"><Input label="Nombre" name="nombre" onChange={update} value={form.nombre} /><Input label="Apellido" name="apellido" onChange={update} value={form.apellido} /></div>
        <Input label="Email" name="email" onChange={update} type="email" value={form.email} />
        <Input label="DNI" inputMode="numeric" name="dni" onChange={update} placeholder="Sin puntos ni guiones" value={form.dni} />
        <Input label="Contraseña" minLength={6} name="password" onChange={update} type="password" value={form.password} />
        <Input label="Ubicación" name="ubicacion" onChange={update} placeholder="Buenos Aires" value={form.ubicacion} />
        {error && <p className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
        <Button className="w-full" size="lg" type="submit">{loading ? <LoaderCircle className="animate-spin" /> : "Crear cuenta"}</Button>
      </form>
      <p className="mt-7 text-center text-sm text-slate-400">¿Ya tenés cuenta? <Link className="font-bold text-blue-400" to="/login">Ingresá</Link></p>
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  if (user) return <Navigate to="/panel" />;

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setStatus({
        type: "success",
        message:
          data.message ??
          "Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.message ??
          "No pudimos procesar la solicitud. Intentá nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-10 lg:hidden"><Brand /></div>
      <p className="eyebrow">Recuperación segura</p>
      <h2 className="mt-3 text-4xl font-extrabold">Recuperá tu contraseña</h2>
      <p className="mt-3 text-slate-400">
        Ingresá tu email y te enviaremos instrucciones si existe una cuenta asociada.
      </p>
      <form className="mt-8 space-y-5" onSubmit={submit}>
        <Input label="Email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        {status.message && (
          <p className={`rounded-xl p-3 text-sm ${
            status.type === "success"
              ? "bg-emerald-500/10 text-emerald-300"
              : "bg-rose-500/10 text-rose-300"
          }`}>
            {status.message}
          </p>
        )}
        <Button className="w-full" size="lg" type="submit">
          {loading ? <LoaderCircle className="animate-spin" /> : "Enviar instrucciones"}
        </Button>
      </form>
      <p className="mt-7 text-center text-sm text-slate-400">
        ¿Recordaste la contraseña? <Link className="font-bold text-blue-400" to="/login">Volver al login</Link>
      </p>
    </AuthShell>
  );
}

export function ResetPasswordPage() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [status, setStatus] = useState({ type: token ? "" : "error", message: token ? "" : "El token es inválido." });
  const [loading, setLoading] = useState(false);
  if (user) return <Navigate to="/panel" />;

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    if (form.password.length < 6) {
      setStatus({ type: "error", message: "La nueva contraseña debe tener al menos 6 caracteres." });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setStatus({ type: "error", message: "Las contraseñas no coinciden." });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/reset-password", { token, password: form.password });
      setStatus({
        type: "success",
        message: data.message ?? "Contraseña actualizada correctamente.",
      });
      setForm({ password: "", confirmPassword: "" });
    } catch (err) {
      const message = err.response?.data?.message ?? "El token es inválido o expiró.";
      setStatus({
        type: "error",
        message: message.toLowerCase().includes("expir")
          ? "El token expiró. Solicitá un nuevo enlace."
          : message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-10 lg:hidden"><Brand /></div>
      <p className="eyebrow">Nueva credencial</p>
      <h2 className="mt-3 text-4xl font-extrabold">Restablecé tu contraseña</h2>
      <p className="mt-3 text-slate-400">
        Elegí una contraseña nueva para volver a ingresar a FitConnection.
      </p>
      <form className="mt-8 space-y-5" onSubmit={submit}>
        <Input
          disabled={!token || status.type === "success"}
          label="Nueva contraseña"
          minLength={6}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          type="password"
          value={form.password}
        />
        <Input
          disabled={!token || status.type === "success"}
          label="Confirmar contraseña"
          minLength={6}
          onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
          type="password"
          value={form.confirmPassword}
        />
        {status.message && (
          <p className={`rounded-xl p-3 text-sm ${
            status.type === "success"
              ? "bg-emerald-500/10 text-emerald-300"
              : "bg-rose-500/10 text-rose-300"
          }`}>
            {status.message}
          </p>
        )}
        <Button className="w-full" disabled={!token || loading || status.type === "success"} size="lg" type="submit">
          {loading ? <LoaderCircle className="animate-spin" /> : "Actualizar contraseña"}
        </Button>
      </form>
      <p className="mt-7 text-center text-sm text-slate-400">
        <Link className="font-bold text-blue-400" to="/login">Volver al login</Link>
      </p>
    </AuthShell>
  );
}
