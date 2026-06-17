"use client";

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface ChartProps {
  type: "line" | "bar" | "pie";
  data: any[];
  dataKey: string | string[];
  title?: string;
  height?: number;
  colors?: string[];
  className?: string;
}

const defaultColors = ["#3a5f84", "#b6612e", "#059669", "#f59e0b", "#be3c2d"];

export function Chart({ type, data, dataKey, title, height = 300, colors = defaultColors, className }: ChartProps) {
  const chartHeight = height;

  return (
    <div className={cn("w-full", className)}>
      {title && (
        <h3 className="font-display text-lg font-bold mb-4 text-[rgb(var(--color-text))]">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={chartHeight}>
        {type === "line" && (
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
            <XAxis stroke="rgb(var(--color-text-secondary))" style={{ fontSize: "12px" }} />
            <YAxis stroke="rgb(var(--color-text-secondary))" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgb(var(--color-surface))",
                border: "1px solid rgb(var(--color-border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "rgb(var(--color-text))" }}
            />
            <Legend />
            {Array.isArray(dataKey) ? (
              dataKey.map((key, idx) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                />
              ))
            ) : (
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={colors[0]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
              />
            )}
          </LineChart>
        )}

        {type === "bar" && (
          <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
            <XAxis stroke="rgb(var(--color-text-secondary))" style={{ fontSize: "12px" }} />
            <YAxis stroke="rgb(var(--color-text-secondary))" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgb(var(--color-surface))",
                border: "1px solid rgb(var(--color-border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "rgb(var(--color-text))" }}
            />
            <Legend />
            {Array.isArray(dataKey) ? (
              dataKey.map((key, idx) => (
                <Bar key={key} dataKey={key} fill={colors[idx % colors.length]} radius={[8, 8, 0, 0]} />
              ))
            ) : (
              <Bar dataKey={dataKey} fill={colors[0]} radius={[8, 8, 0, 0]} />
            )}
          </BarChart>
        )}

        {type === "pie" && (
          <PieChart>
            <Pie
              data={data}
              dataKey={Array.isArray(dataKey) ? dataKey[0] : dataKey}
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
              isAnimationActive={true}
            >
              {data.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgb(var(--color-surface))",
                border: "1px solid rgb(var(--color-border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "rgb(var(--color-text))" }}
            />
            <Legend />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
