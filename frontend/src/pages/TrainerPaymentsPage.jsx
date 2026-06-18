import {
  CircleDollarSign,
  CreditCard,
  Percent,
  RefreshCw,
  WalletCards,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "../api/client.js";
import { ErrorState, LoadingState } from "../components/RequestState.jsx";
import {
  Button,
  Card,
  DataTable,
  MetricCard,
  StatusBadge,
} from "../components/ui.jsx";
import { approvedPayments, paymentNet } from "../lib/trainerAnalytics.js";
import { fullDate, money } from "../lib/format.js";

const statusTone = {
  Aprobado: "green",
  Rechazado: "rose",
  Pendiente: "amber",
  Reembolsado: "slate",
};

const commissionRules = [
  ["Sin calificaciones", "15%"],
  ["4.5 a 5.0", "8%"],
  ["4.0 a 4.4", "12%"],
  ["3.5 a 3.9", "16%"],
  ["3.0 a 3.4", "20%"],
  ["Menor a 3.0", "25%"],
];

export function TrainerPaymentsPage() {
  const [trainer, setTrainer] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [trainerResponse, paymentResponse] = await Promise.all([
        api.get("/trainers/me"),
        api.get("/payments/received"),
      ]);
      setTrainer(trainerResponse.data.trainer);
      setPayments(paymentResponse.data.payments);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ??
          "No fue posible cargar los pagos recibidos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    const approved = approvedPayments(payments);
    return {
      gross: approved.reduce((sum, payment) => sum + payment.monto, 0),
      commission: approved.reduce(
        (sum, payment) => sum + payment.comision,
        0,
      ),
      net: approved.reduce((sum, payment) => sum + paymentNet(payment), 0),
    };
  }, [payments]);

  if (loading) {
    return (
      <div className="page-container py-10">
        <LoadingState label="Cargando pagos recibidos..." />
      </div>
    );
  }
  if (error || !trainer) {
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
          <p className="eyebrow">ENT-08</p>
          <h1 className="mt-2 text-4xl font-extrabold">Pagos recibidos</h1>
          <p className="mt-2 text-slate-400">
            Bruto, comisión y neto de cada operación simulada.
          </p>
        </div>
        <Button onClick={load} variant="secondary">
          <RefreshCw className="size-4" /> Actualizar
        </Button>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={CircleDollarSign}
          label="Monto bruto aprobado"
          tone="blue"
          value={money(totals.gross)}
        />
        <MetricCard
          icon={Percent}
          label="Comisión plataforma"
          tone="violet"
          value={money(totals.commission)}
        />
        <MetricCard
          icon={WalletCards}
          label="Neto recibido"
          tone="green"
          value={money(totals.net)}
        />
        <MetricCard
          icon={CreditCard}
          label="Comisión actual"
          note={`${trainer._count.calificaciones} calificaciones`}
          tone="amber"
          value={`${trainer.porcentajeComision}%`}
        />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_300px]">
        <Card className="p-6">
          <h2 className="text-2xl font-extrabold">Detalle de operaciones</h2>
          <div className="mt-5">
            <DataTable
              columns={[
                {
                  key: "client",
                  label: "Cliente",
                  render: (payment) =>
                    `${payment.cliente.usuario.nombre} ${payment.cliente.usuario.apellido}`,
                },
                {
                  key: "turn",
                  label: "Turno",
                  render: (payment) =>
                    `${fullDate(payment.turno.fechaInicio)} · ${payment.turno.horaInicio}`,
                },
                {
                  key: "gross",
                  label: "Bruto",
                  render: (payment) => money(payment.monto),
                },
                {
                  key: "commission",
                  label: "Comisión",
                  render: (payment) => money(payment.comision),
                },
                {
                  key: "net",
                  label: "Neto",
                  render: (payment) => (
                    <strong className="text-emerald-300">
                      {money(paymentNet(payment))}
                    </strong>
                  ),
                },
                {
                  key: "status",
                  label: "Estado",
                  render: (payment) => (
                    <StatusBadge tone={statusTone[payment.estado.nombre]}>
                      {payment.estado.nombre}
                    </StatusBadge>
                  ),
                },
                {
                  key: "date",
                  label: "Fecha",
                  render: (payment) =>
                    payment.fechaPago
                      ? fullDate(payment.fechaPago)
                      : "Sin fecha",
                },
              ]}
              empty="Todavía no recibiste pagos."
              rows={payments.map((payment) => ({
                ...payment,
                id: payment.idPago,
              }))}
            />
          </div>
        </Card>

        <Card className="h-fit p-6">
          <p className="eyebrow">Escala vigente</p>
          <h2 className="mt-1 text-xl font-extrabold">Regla de comisión</h2>
          <div className="mt-5 space-y-3 text-sm">
            {commissionRules.map(([rating, rate]) => (
              <div
                className={`flex justify-between rounded-xl px-3 py-2 ${
                  rate === `${trainer.porcentajeComision}%`
                    ? "bg-blue-500/10 text-blue-200"
                    : "bg-white/[0.025] text-slate-400"
                }`}
                key={rating}
              >
                <span>{rating}</span>
                <strong>{rate}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
