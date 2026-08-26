import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const CHARTS = [
  {
    key: "temperature",
    title: "Temperature History",
    color: "#0E9FD6",
    unit: "°C",
  },
  {
    key: "do",
    title: "Dissolved Oxygen History",
    color: "#16A34A",
    unit: "mg/L",
  },
  {
    key: "ph",
    title: "pH History",
    color: "#D97706",
    unit: "",
  },
  {
    key: "turbidity",
    title: "Turbidity History",
    color: "#9333EA",
    unit: "NTU",
  },
  {
    key: "water_level",
    title: "Water Level History",
    color: "#2563EB",
    unit: "%",
  },
];

export default function SensorCharts({
  history,
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
      {CHARTS.map((chart) => (
        <div
          key={chart.key}
          className="
            bg-white
            rounded-3xl
            border
            border-slate-100
            shadow-sm
            p-6
            md:p-8
          "
        >
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">
              {chart.title}
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Historical trend analysis
            </p>
          </div>

          <ResponsiveContainer
            width="100%"
            height={280}
          >
            <LineChart
              data={history}
              margin={{
                top: 5,
                right: 20,
                left: -15,
                bottom: 0,
              }}
            >
              <CartesianGrid
                stroke="#F1F5F9"
                vertical={false}
              />

              <XAxis
                dataKey="id"
                tick={{
                  fontSize: 12,
                  fill: "#94A3B8",
                }}
                axisLine={{
                  stroke: "#E2E8F0",
                }}
                tickLine={false}
              />

              <YAxis
                tick={{
                  fontSize: 12,
                  fill: "#94A3B8",
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                formatter={(value) => [
                  `${value} ${chart.unit}`,
                  chart.title,
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />

              <Line
                type="monotone"
                dataKey={chart.key}
                stroke={chart.color}
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 0,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}