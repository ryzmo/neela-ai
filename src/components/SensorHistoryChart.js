import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function SensorHistoryChart({
  history
}) {

  return (

    <div className="bg-white rounded-2xl shadow p-8 mt-8">

      <h2 className="text-2xl font-bold mb-6">

        Sensor History

      </h2>

      <ResponsiveContainer
        width="100%"
        height={350}
      >

        <LineChart data={history}>

          <XAxis dataKey="id" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#2563eb"
            strokeWidth={3}
          />

          <Line
            type="monotone"
            dataKey="do"
            stroke="#16a34a"
            strokeWidth={3}
          />

          <Line
            type="monotone"
            dataKey="ph"
            stroke="#ea580c"
            strokeWidth={3}
          />

          <Line
            type="monotone"
            dataKey="turbidity"
            stroke="#9333ea"
            strokeWidth={3}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  );

}