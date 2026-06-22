import { X } from "lucide-react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "bg-brand-500 text-white hover:bg-brand-400 shadow-[0_12px_32px_rgba(37,99,235,.24)]",
    secondary:
      "border border-white/10 bg-white/[0.04] text-white hover:border-blue-500/50 hover:bg-blue-500/10",
    ghost: "text-slate-300 hover:bg-white/[0.06] hover:text-white",
    danger: "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25",
  };
  const sizes = { sm: "px-4 py-2 text-sm", md: "px-5 py-3", lg: "px-7 py-4 text-lg" };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "", hover = false }) {
  return (
    <div className={`surface ${hover ? "surface-hover" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function Input({ label, icon: Icon, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-semibold text-slate-300">{label}</span>}
      <span className="relative block">
        {Icon && <Icon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" />}
        <input
          className={`w-full rounded-2xl border border-white/10 bg-[#10131f] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10 ${Icon ? "pl-12" : ""} ${className}`}
          {...props}
        />
      </span>
    </label>
  );
}

export function Select({ label, children, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-semibold text-slate-300">{label}</span>}
      <select
        className={`w-full appearance-none rounded-2xl border border-white/10 bg-[#10131f] px-4 py-3.5 text-white outline-none focus:border-blue-500/70 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function StatusBadge({ children, tone = "blue", className = "" }) {
  const tones = {
    blue: "border-blue-500/25 bg-blue-500/12 text-blue-300",
    green: "border-emerald-500/25 bg-emerald-500/12 text-emerald-300",
    amber: "border-amber-500/25 bg-amber-500/12 text-amber-300",
    rose: "border-rose-500/25 bg-rose-500/12 text-rose-300",
    slate: "border-white/10 bg-white/[0.06] text-slate-300",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function MetricCard({ icon: Icon, label, value, note, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-500/12 text-blue-400",
    green: "bg-emerald-500/12 text-emerald-400",
    violet: "bg-violet-500/12 text-violet-400",
    amber: "bg-amber-500/12 text-amber-400",
  };
  return (
    <Card className="p-6 lg:p-7">
      <span className={`grid size-12 place-items-center rounded-2xl ${tones[tone]}`}>
        <Icon className="size-5" />
      </span>
      <p className="mt-6 text-3xl font-extrabold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
      {note && <p className="mt-2 text-sm font-semibold text-emerald-400">{note}</p>}
    </Card>
  );
}

export function ChartCard({ title, action, children, className = "" }) {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-extrabold text-white">{title}</h3>
        {action}
      </div>
      {children}
    </Card>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <Card className="grid min-h-64 place-items-center p-8 text-center">
      <div>
        {Icon && <Icon className="mx-auto size-10 text-blue-400" />}
        <h3 className="mt-4 text-xl font-bold text-white">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </Card>
  );
}

export function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
      <Card className="max-h-[90vh] w-full max-w-xl overflow-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white">{title}</h2>
          <button className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white" onClick={onClose}>
            <X className="size-5" />
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
}

export function DataTable({ columns, rows, empty = "Sin datos" }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
            {columns.map((column) => <th className="px-4 py-3" key={column.key}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, index) => (
            <tr className="border-b border-white/[0.06] text-sm text-slate-300" key={row.id ?? index}>
              {columns.map((column) => (
                <td className="px-4 py-4" key={column.key}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          )) : (
            <tr><td className="px-4 py-10 text-center text-slate-500" colSpan={columns.length}>{empty}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
