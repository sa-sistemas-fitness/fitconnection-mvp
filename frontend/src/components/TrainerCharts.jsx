import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard } from "./ui.jsx";

const tooltipStyle = {
  background: "#10131f",
  border: "1px solid #29304a",
  borderRadius: 14,
};

export function IncomeChart({ data, title = "Ingresos por mes" }) {
  return (
    <ChartCard title={title}>
      <ResponsiveContainer height={280} width="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="trainer-income" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#3474ff" stopOpacity=".4" />
              <stop offset="1" stopColor="#3474ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1b2030" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="#66708f" />
          <YAxis stroke="#66708f" />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            dataKey="neto"
            fill="url(#trainer-income)"
            name="Ingreso neto"
            stroke="#3474ff"
            strokeWidth={3}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function SessionsChart({ data, title = "Sesiones por semana" }) {
  return (
    <ChartCard title={title}>
      <ResponsiveContainer height={280} width="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#1b2030" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="#66708f" />
          <YAxis allowDecimals={false} stroke="#66708f" />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar
            dataKey="sesiones"
            fill="#2867f0"
            name="Sesiones"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
