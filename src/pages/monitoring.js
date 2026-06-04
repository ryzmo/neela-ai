import Sidebar from "../components/Sidebar";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import useAquaAgent from "../hooks/useAquaAgent";

export default function Monitoring() {

  const {

    history

  } = useAquaAgent();

  const latest =
    history.length > 0
      ? history[history.length - 1]
      : null;

  function getTrend(dataKey) {

    if(history.length < 2)
      return "No Data";

    const last =
      history[history.length - 1][dataKey];

    const prev =
      history[history.length - 2][dataKey];

    if(last > prev)
      return "📈 Increasing";

    if(last < prev)
      return "📉 Decreasing";

    return "➡ Stable";

  }

  return (

    <div className="md:flex">

      <Sidebar />

      <main className="flex-1 p-4 md:p-10">

        <h1 className="text-4xl font-bold mb-8">

          Realtime Sensor Monitoring

        </h1>

        {/* SENSOR CARDS */}

        <div className="grid grid-cols-5 gap-5">

          <SensorBox
            title="DO"
            value={latest?.do}
            unit="mg/L"
            trend={getTrend("do")}
          />

          <SensorBox
            title="pH"
            value={latest?.ph}
            unit=""
            trend={getTrend("ph")}
          />

          <SensorBox
            title="Temperature"
            value={latest?.temperature}
            unit="°C"
            trend={getTrend("temperature")}
          />

          <SensorBox
            title="Turbidity"
            value={latest?.turbidity}
            unit="NTU"
            trend={getTrend("turbidity")}
          />

          <SensorBox
            title="Ammonia"
            value="0.12"
            unit="ppm"
            trend="➡ Stable"
          />

        </div>

        {/* CHART */}

        <div className="bg-white rounded-2xl shadow p-8 mt-8">

          <div className="flex justify-between">

            <h2 className="text-2xl font-bold">

              Interactive Charts

            </h2>

            <div className="flex gap-3">

              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl">

                Last 1 Hour

              </button>

              <button className="px-4 py-2 bg-slate-100 rounded-xl">

                Last 24 Hours

              </button>

              <button className="px-4 py-2 bg-slate-100 rounded-xl">

                Last 7 Days

              </button>

            </div>

          </div>

          <ResponsiveContainer
            width="100%"
            height={400}
          >

            <LineChart
              data={history}
            >

              <XAxis
                dataKey="id"
              />

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

        {/* THRESHOLD */}

        <div className="grid grid-cols-4 gap-5 mt-8">

          <ThresholdCard
            title="DO"
            value={latest?.do}
            safe="> 5"
            warning="3 - 5"
            critical="< 3"
          />

          <ThresholdCard
            title="pH"
            value={latest?.ph}
            safe="6.5 - 8"
            warning="6 - 6.5"
            critical="< 6"
          />

          <ThresholdCard
            title="Temperature"
            value={latest?.temperature}
            safe="26 - 30"
            warning="30 - 32"
            critical="> 32"
          />

          <ThresholdCard
            title="Turbidity"
            value={latest?.turbidity}
            safe="< 15"
            warning="15 - 25"
            critical="> 25"
          />

        </div>

      </main>

    </div>

  );

}

function SensorBox({
  title,
  value,
  unit,
  trend
}) {

  return (

    <div className="bg-white rounded-2xl shadow p-5">

      <p className="text-gray-500">

        {title}

      </p>

      <h3 className="text-3xl font-bold">

        {value} {unit}

      </h3>

      <p className="text-sm mt-2">

        {trend}

      </p>

    </div>

  );

}

function ThresholdCard({
  title,
  value,
  safe,
  warning,
  critical
}) {

  return (

    <div className="bg-white rounded-2xl shadow p-5">

      <h3 className="font-bold mb-4">

        {title}

      </h3>

      <p>

        Current:
        <b> {value}</b>

      </p>

      <div className="mt-4">

        <p className="text-green-600">

          Safe: {safe}

        </p>

        <p className="text-yellow-600">

          Warning: {warning}

        </p>

        <p className="text-red-600">

          Critical: {critical}

        </p>

      </div>

    </div>

  );

}