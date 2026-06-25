import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const LINES = [
  { key: "temperature", label: "Temperature", color: "#0E9FD6" },
  { key: "do", label: "DO", color: "#16A34A" },
  { key: "ph", label: "pH", color: "#D97706" },
  { key: "turbidity", label: "Turbidity", color: "#9333EA" },
];

export default function SensorHistoryChart({ history }) {
  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 md:p-8 mt-6">
      <h2 className="text-lg font-bold text-slate-800 mb-5">Sensor history</h2>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={history} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid stroke="#F1F5F9" vertical={false} />

          <XAxis
            dataKey="id"
            tick={{ fontSize: 12, fill: "#94A3B8" }}
            axisLine={{ stroke: "#E2E8F0" }}
            tickLine={false}
          />

          <YAxis
            tick={{ fontSize: 12, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #E2E8F0",
              fontSize: 13,
            }}
          />

          <Legend
            wrapperStyle={{ fontSize: 13, color: "#64748B" }}
            iconType="circle"
            iconSize={8}
          />

          {LINES.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.label}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}