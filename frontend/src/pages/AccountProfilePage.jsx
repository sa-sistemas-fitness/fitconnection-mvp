import { LoaderCircle, Save, UserRound } from "lucide-react";
import { useState } from "react";

import { api } from "../api/client.js";
import { Button, Card, Input, StatusBadge } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export function AccountProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ nombre: user.nombre, apellido: user.apellido });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback({ type: "", message: "" });
    try {
      await api.patch("/users/me", form);
      await refreshUser();
      setFeedback({ type: "success", message: "Nombre y apellido actualizados correctamente." });
    } catch (error) {
      setFeedback({ type: "error", message: error.response?.data?.message ?? "No se pudo actualizar el perfil." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container py-10">
      <p className="eyebrow">Cuenta</p>
      <h1 className="mt-2 text-4xl font-extrabold">Mi perfil</h1>
      <Card className="mt-7 max-w-2xl p-6 md:p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-400"><UserRound /></span>
          <div><strong>{user.email}</strong><div className="mt-1 flex gap-2">{user.roles.map((role) => <StatusBadge key={role}>{role}</StatusBadge>)}</div></div>
        </div>
        <form className="mt-7 space-y-5" onSubmit={submit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Nombre" maxLength={60} minLength={2} onChange={(event) => setForm({ ...form, nombre: event.target.value })} required value={form.nombre} />
            <Input label="Apellido" maxLength={60} minLength={2} onChange={(event) => setForm({ ...form, apellido: event.target.value })} required value={form.apellido} />
          </div>
          <Input disabled label="Fecha de nacimiento" type="date" value={String(user.fechaNacimiento).slice(0, 10)} />
          {feedback.message && <p className={`rounded-xl p-3 text-sm ${feedback.type === "success" ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"}`}>{feedback.message}</p>}
          <Button disabled={saving} type="submit">{saving ? <LoaderCircle className="animate-spin" /> : <Save />} Guardar cambios</Button>
        </form>
      </Card>
    </div>
  );
}
