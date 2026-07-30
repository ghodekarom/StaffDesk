"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#34d399'];

export function DepartmentChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-line)', backgroundColor: 'var(--color-surface)', color: 'var(--color-ink)' }}
            itemStyle={{ color: 'var(--color-ink)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AttendanceTrendChart({ data }: { data: { date: string; present: number; absent: number }[] }) {
  return (
    <div className="h-64 w-full text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-line)" />
          <XAxis dataKey="date" stroke="var(--color-muted)" tickLine={false} axisLine={false} />
          <YAxis stroke="var(--color-muted)" tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-line)', backgroundColor: 'var(--color-surface)', color: 'var(--color-ink)' }}
          />
          <Area type="monotone" dataKey="present" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorPresent)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
