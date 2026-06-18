import {
  CalendarDays,
  Eye,
  Filter,
  LoaderCircle,
  RefreshCw,
  WalletCards,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "../api/client.js";
import { ErrorState, LoadingState } from "../components/RequestState.jsx";
import {
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Select,
  StatusBadge,
} from "../components/ui.jsx";
import { fullDate, money } from "../lib/format.js";

const statusTone = {
  Pendiente: "amber",
  Aprobado: "green",
  Rechazado: "rose",
  Reembolsado: "slate",
};

export function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    trainer: "",
    client: "",
    date: "",
  });
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/payments");
      setPayments(data.payments);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "No fue posible cargar los pagos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () =>
      payments.filter((payment) => {
        const trainerName =
          `${payment.entrenador.usuario.nombre} ${payment.entrenador.usuario.apellido}`.toLowerCase();
        const clientName =
          `${payment.cliente.usuario.nombre} ${payment.cliente.usuario.apellido}`.toLowerCase();
        const paymentDate = payment.fechaPago
          ? new Date(payment.fechaPago).toISOString().slice(0, 10)
          : "";
        return (
          (!filters.status || payment.estado.nombre === filters.status) &&
          (!filters.trainer ||
            trainerName.includes(filters.trainer.toLowerCase())) &&
          (!filters.client ||
            clientName.includes(filters.client.toLowerCase())) &&
          (!filters.date || paymentDate === filters.date)
        );
      }),
    [filters, payments],
  );

  const updateStatus = async (payment, status) => {
    setWorkingId(payment.idPago);
    setFeedback({ type: "", message: "" });
    try {
      await api.patch(`/payments/${payment.idPago}/status`, {
        status,
        comment: "Actualizado desde Supervisión de Pagos.",
      });
      setFeedback({
        type: "success",
        message: `Pago #${payment.idPago} actualizado a ${status}.`,
      });
      await load();
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError.response?.data?.message ??
          "No se pudo actualizar el estado del pago.",
      });
    } finally {
      setWorkingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <LoadingState label="Cargando supervisión de pagos..." />
      </div>
    );
  }
  if (error) {
    return (
      <div className="page-container py-10">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">ADMIN-06</p>
          <h1 className="mt-2 text-4xl font-extrabold">Supervisar Pagos</h1>
          <p className="mt-2 text-slate-400">
            Controlá operaciones, comisiones y estados.
          </p>
        </div>
        <Button onClick={load} variant="secondary">
          <RefreshCw className="size-4" /> Actualizar
        </Button>
      </div>

      {feedback.message && (
        <p
          className={`mt-6 rounded-2xl border p-4 text-sm ${
            feedback.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/20 bg-rose-500/10 text-rose-300"
          }`}
        >
          {feedback.message}
        </p>
      )}

      <Card className="mt-7 p-5">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Filter className="size-4 text-blue-400" /> Filtros
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Select
            label="Estado"
            onChange={(event) =>
              setFilters({ ...filters, status: event.target.value })
            }
            value={filters.status}
          >
            <option value="">Todos</option>
            <option>Pendiente</option>
            <option>Aprobado</option>
            <option>Rechazado</option>
            <option>Reembolsado</option>
          </Select>
          <Input
            label="Entrenador"
            onChange={(event) =>
              setFilters({ ...filters, trainer: event.target.value })
            }
            placeholder="Nombre..."
            value={filters.trainer}
          />
          <Input
            label="Cliente"
            onChange={(event) =>
              setFilters({ ...filters, client: event.target.value })
            }
            placeholder="Nombre..."
            value={filters.client}
          />
          <Input
            label="Fecha"
            onChange={(event) =>
              setFilters({ ...filters, date: event.target.value })
            }
            type="date"
            value={filters.date}
          />
        </div>
      </Card>

      <Card className="mt-6 overflow-hidden p-0">
        {visible.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1450px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.025] text-xs uppercase tracking-wider text-slate-500">
                  {[
                    "Cliente",
                    "Entrenador",
                    "Turno",
                    "Fecha",
                    "Bruto",
                    "Descuento",
                    "Comisión",
                    "Neto",
                    "Método",
                    "Estado",
                    "Acciones",
                  ].map((label) => (
                    <th className="px-4 py-4" key={label}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((payment) => (
                  <tr
                    className="border-b border-white/[0.06] text-slate-300"
                    key={payment.idPago}
                  >
                    <td className="px-4 py-5 font-bold text-white">
                      {payment.cliente.usuario.nombre}{" "}
                      {payment.cliente.usuario.apellido}
                    </td>
                    <td className="px-4 py-5">
                      {payment.entrenador.usuario.nombre}{" "}
                      {payment.entrenador.usuario.apellido}
                    </td>
                    <td className="px-4 py-5">#{payment.idTurno}</td>
                    <td className="px-4 py-5">
                      {payment.fechaPago ? fullDate(payment.fechaPago) : "—"}
                    </td>
                    <td className="px-4 py-5">{money(payment.monto)}</td>
                    <td className="px-4 py-5">{money(payment.descuento)}</td>
                    <td className="px-4 py-5">{money(payment.comision)}</td>
                    <td className="px-4 py-5 font-bold text-emerald-300">
                      {money(payment.monto - payment.comision)}
                    </td>
                    <td className="px-4 py-5">{payment.metodoPago}</td>
                    <td className="px-4 py-5">
                      <StatusBadge tone={statusTone[payment.estado.nombre]}>
                        {payment.estado.nombre}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelected(payment)}
                          size="sm"
                          variant="secondary"
                        >
                          <Eye className="size-4" /> Detalle
                        </Button>
                        <Select
                          aria-label="Cambiar estado"
                          className="min-w-36 py-2"
                          disabled={workingId === payment.idPago}
                          onChange={(event) =>
                            updateStatus(payment, event.target.value)
                          }
                          value={payment.estado.nombre}
                        >
                          <option>Pendiente</option>
                          <option>Aprobado</option>
                          <option>Rechazado</option>
                          <option>Reembolsado</option>
                        </Select>
                        {workingId === payment.idPago && (
                          <LoaderCircle className="size-5 animate-spin text-blue-400" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            description="No hay operaciones que coincidan con los filtros."
            icon={WalletCards}
            title="Sin pagos"
          />
        )}
      </Card>

      <Modal
        onClose={() => setSelected(null)}
        open={Boolean(selected)}
        title="Detalle del pago"
      >
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="rounded-2xl bg-blue-500/[0.06] p-5">
              <p className="text-slate-500">Pago #{selected.idPago}</p>
              <p className="mt-1 text-3xl font-extrabold">
                {money(selected.monto)}
              </p>
              <StatusBadge
                className="mt-3"
                tone={statusTone[selected.estado.nombre]}
              >
                {selected.estado.nombre}
              </StatusBadge>
            </div>
            {[
              [
                "Cliente",
                `${selected.cliente.usuario.nombre} ${selected.cliente.usuario.apellido}`,
              ],
              [
                "Entrenador",
                `${selected.entrenador.usuario.nombre} ${selected.entrenador.usuario.apellido}`,
              ],
              [
                "Turno",
                `${fullDate(selected.turno.fechaInicio)} · ${selected.turno.horaInicio}–${selected.turno.horaFin}`,
              ],
              ["Método", selected.metodoPago],
              ["Descuento", money(selected.descuento)],
              ["Comisión", money(selected.comision)],
              ["Neto entrenador", money(selected.monto - selected.comision)],
            ].map(([label, value]) => (
              <div
                className="flex justify-between gap-4 border-b border-white/[0.07] pb-3"
                key={label}
              >
                <span className="text-slate-500">{label}</span>
                <strong className="text-right">{value}</strong>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
