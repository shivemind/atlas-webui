"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

export function ServicePieChart({
  data,
}: {
  data: { name: string; color: string; value: number }[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted">
        Loading chart...
      </div>
    );
  }

  const filtered = data.filter((d) => d.value > 0);
  if (filtered.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={filtered}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
          strokeWidth={0}
        >
          {filtered.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#1e293b",
            border: "none",
            borderRadius: "8px",
            color: "#f8fafc",
            fontSize: "12px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function EndpointDistributionChart({
  data,
}: {
  data: { name: string; color: string; ops: number }[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted">
        Loading chart...
      </div>
    );
  }

  const shortNames = data.map((d) => ({
    ...d,
    short: d.name.replace("Atlas ", ""),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={shortNames}
        layout="vertical"
        margin={{ top: 4, right: 30, left: 0, bottom: 4 }}
      >
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <YAxis
          dataKey="short"
          type="category"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          width={100}
        />
        <Tooltip
          contentStyle={{
            background: "#1e293b",
            border: "none",
            borderRadius: "8px",
            color: "#f8fafc",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="ops" name="Endpoints" radius={[0, 4, 4, 0]}>
          {shortNames.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
