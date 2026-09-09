import { LoaderCircle, Save, KeyRound } from "lucide-react";
import { useState } from "react";

import { api } from "../api/client.js";
import { Button, Card, Input } from "../components/ui.jsx";

export function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const submit = async (event) => {
    event.preventDefault();
    setFeedback({ type: "", message: "" });

    if (form.newPassword.length < 6) {
      setFeedback({ type: "error", message: "La nueva contraseña debe tener al menos 6 caracteres." });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setFeedback({ type: "error", message: "Las contraseñas no coinciden." });
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.post("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setFeedback({ type: "success", message: data.message ?? "Contraseña actualizada correctamente." });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setFeedback({ type: "error", message: error.response?.data?.message ?? "No se pudo actualizar la contraseña." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container py-10">
      <p className="eyebrow">Cuenta</p>
      <h1 className="mt-2 text-4xl font-extrabold">Cambiar contraseña</h1>
      <Card className="mt-7 max-w-2xl p-6 md:p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-400"><KeyRound /></span>
          <div><strong>Actualizá tu contraseña</strong><div className="mt-1 text-sm text-slate-400">Te recomendamos usar una contraseña segura.</div></div>
        </div>
        <form className="mt-7 space-y-5" onSubmit={submit}>
          <Input 
            label="Contraseña actual" 
            type="password" 
            required 
            value={form.currentPassword}
            onChange={(event) => setForm({ ...form, currentPassword: event.target.value })}
          />
          <Input 
            label="Nueva contraseña" 
            type="password" 
            minLength={6} 
            required 
            value={form.newPassword}
            onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
          />
          <Input 
            label="Confirmar nueva contraseña" 
            type="password" 
            minLength={6} 
            required 
            value={form.confirmPassword}
            onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
          />
          {feedback.message && (
            <p className={`rounded-xl p-3 text-sm ${feedback.type === "success" ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"}`}>
              {feedback.message}
            </p>
          )}
          <Button disabled={saving} type="submit">
            {saving ? <LoaderCircle className="animate-spin" /> : <Save />} Guardar contraseña
          </Button>
        </form>
      </Card>
    </div>
  );
}

