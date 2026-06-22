import { Calculator, Info, Percent, ShieldCheck } from "lucide-react";

import { Card, StatusBadge } from "../components/ui.jsx";

const rules = [
  ["Sin calificaciones", "15%", "Comisión inicial hasta recibir la primera reseña."],
  ["4.5 a 5.0", "8%", "Beneficio máximo para perfiles con excelencia sostenida."],
  ["4.0 a 4.4", "12%", "Comisión reducida por buen rendimiento."],
  ["3.5 a 3.9", "16%", "Nivel intermedio de comisión."],
  ["3.0 a 3.4", "20%", "Comisión elevada por desempeño mejorable."],
  ["Menor a 3.0", "25%", "Comisión máxima de la escala."],
];

export function AdminCommissionsPage() {
  return (
    <div className="page-container py-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">ADMIN-05</p>
          <h1 className="mt-2 text-4xl font-extrabold">
            Configurar Comisiones
          </h1>
          <p className="mt-2 text-slate-400">
            Escala aplicada automáticamente al promedio del entrenador.
          </p>
        </div>
        <StatusBadge className="px-4 py-2" tone="blue">
          <Calculator className="size-4" /> Cálculo automático
        </StatusBadge>
      </div>

      <Card className="mt-7 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.025] text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Rango de calificación</th>
                <th className="px-6 py-4">Comisión</th>
                <th className="px-6 py-4">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(([range, rate, description], index) => (
                <tr
                  className="border-b border-white/[0.06]"
                  key={range}
                >
                  <td className="px-6 py-5 font-bold">{range}</td>
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex min-w-16 justify-center rounded-xl px-3 py-2 text-lg font-extrabold ${
                        index < 2
                          ? "bg-emerald-500/10 text-emerald-300"
                          : index < 4
                            ? "bg-blue-500/10 text-blue-300"
                            : "bg-amber-500/10 text-amber-300"
                      }`}
                    >
                      {rate}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-400">
                    {description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="flex items-start gap-4 p-6">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-500/10 text-blue-400">
            <Percent className="size-5" />
          </span>
          <div>
            <h2 className="font-extrabold">Sin endpoint editable</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Actualmente no existe una configuración persistente para modificar
              la escala desde la API.
            </p>
          </div>
        </Card>
        <Card className="flex items-start gap-4 p-6">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h2 className="font-extrabold">Lógica real del backend</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              La función `commissionRateForAverage` recalcula y guarda la
              comisión cuando cambia el promedio por una calificación.
            </p>
          </div>
        </Card>
      </div>

      <p className="mt-5 flex items-center gap-2 text-xs text-slate-600">
        <Info className="size-4" /> Esta pantalla es informativa y refleja la
        escala actualmente implementada.
      </p>
    </div>
  );
}
