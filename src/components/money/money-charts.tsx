"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

/* Data colors: neutral-friendly palette anchored on profit green */
const PIE_COLORS = [
  "#10b981",
  "#a3a3a3",
  "#8b5cf6",
  "#f43f5e",
  "#f59e0b",
  "#14b8a6",
  "#e5e5e5",
  "#737373",
];

export function TrendBarChart({
  data,
}: {
  data: {
    label: string;
    fullLabel: string;
    income: number;
    expenses: number;
  }[];
}) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="label" stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#a3a3a3"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => (v >= 1000 ? `£${v / 1000}k` : `£${v}`)}
          />
          <Tooltip
            contentStyle={{
              background: "#171717",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
            }}
            formatter={(v: number, name: string) => [
              formatCurrency(Number(v)),
              name === "income" ? "Income" : "Expenses",
            ]}
          />
          <Legend formatter={(v) => (v === "income" ? "Income" : "Expenses")} />
          <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="income" />
          <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} name="expenses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryPieChart({
  data,
  colorOffset = 0,
}: {
  data: { category: string; amount: number }[];
  colorOffset?: number;
}) {
  const total = data.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="flex flex-col lg:flex-row items-center gap-4">
      <div className="h-[220px] w-full lg:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[(i + colorOffset) % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#171717",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
              }}
              formatter={(v: number) => formatCurrency(v)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex-1 w-full space-y-2 max-h-[220px] overflow-y-auto">
        {data.map((item, i) => {
          const pct = total > 0 ? Math.round((item.amount / total) * 100) : 0;
          return (
            <li key={item.category} className="flex items-center justify-between text-sm gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{
                    background: PIE_COLORS[(i + colorOffset) % PIE_COLORS.length],
                  }}
                />
                <span className="truncate">{item.category}</span>
              </div>
              <span className="text-muted-foreground shrink-0 tabular-nums">
                {formatCurrency(item.amount)} <span className="text-xs">({pct}%)</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
