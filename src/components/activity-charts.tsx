"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

/* ── Timeline Area Chart ─────────────────────────────────────────── */

export function TimelineChart({
  data,
}: {
  data: { hour: string; count: number; label: string }[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted">
        Loading chart...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ff6c37" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ff6c37" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "#1e293b",
            border: "none",
            borderRadius: "8px",
            color: "#f8fafc",
            fontSize: "12px",
          }}
          labelStyle={{ color: "#94a3b8" }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#ff6c37"
          strokeWidth={2}
          fill="url(#areaGrad)"
          name="Events"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ── Service Breakdown Bar Chart ─────────────────────────────────── */

export function ServiceBarChart({
  data,
}: {
  data: { name: string; color: string; count: number }[];
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
      <BarChart data={shortNames} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="short"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
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
        <Bar dataKey="count" name="Events" radius={[4, 4, 0, 0]}>
          {shortNames.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
