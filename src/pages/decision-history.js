import { useState } from "react";
import Sidebar from "../components/Sidebar";
import useAquaAgent from "../hooks/useAquaAgent";

export default function DecisionHistory() {

  const { history } =
    useAquaAgent();

  const [filterLevel,setFilterLevel] =
    useState("ALL");

  const filteredData =
    filterLevel === "ALL"
      ? history
      : history.filter(
          item =>
            item.risk_level ===
            filterLevel
        );

  const total =
    history.length;

  const low =
    history.filter(
      h => h.risk_level === "LOW"
    ).length;

  const medium =
    history.filter(
      h => h.risk_level === "MEDIUM"
    ).length;

  const high =
    history.filter(
      h => h.risk_level === "HIGH"
    ).length;

  return (

    <div className="md:flex">

      <Sidebar />

      <main className="flex-1 p-4 md:p-10">

        <h1 className="text-4xl font-bold mb-8">

          Decision Logs & History

        </h1>

        {/* FILTER */}

        <div className="bg-white rounded-2xl shadow p-6 mb-8">

          <h2 className="text-xl font-bold mb-4">

            Filter Options

          </h2>

          <select
            value={filterLevel}
            onChange={(e)=>
              setFilterLevel(
                e.target.value
              )
            }
            className="border rounded-xl px-4 py-2"
          >

            <option value="ALL">

              All Alert Levels

            </option>

            <option value="LOW">

              LOW

            </option>

            <option value="MEDIUM">

              MEDIUM

            </option>

            <option value="HIGH">

              HIGH

            </option>

          </select>

        </div>

        {/* STATISTICS */}

        <div className="grid grid-cols-4 gap-5 mb-8">

          <StatCard
            title="Total Decisions"
            value={total}
          />

          <StatCard
            title="LOW Risk"
            value={low}
          />

          <StatCard
            title="MEDIUM Risk"
            value={medium}
          />

          <StatCard
            title="HIGH Risk"
            value={high}
          />

        </div>

        {/* DISTRIBUTION */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold mb-4">

            Decision Distribution

          </h2>

          <div className="space-y-4">

            <ProgressBar
              label="LOW"
              value={low}
              total={total}
              color="bg-green-500"
            />

            <ProgressBar
              label="MEDIUM"
              value={medium}
              total={total}
              color="bg-yellow-500"
            />

            <ProgressBar
              label="HIGH"
              value={high}
              total={total}
              color="bg-red-500"
            />

          </div>

        </div>

        {/* HISTORY TABLE */}

        <div className="bg-white rounded-2xl shadow p-8">

          <h2 className="text-2xl font-bold mb-6">

            AI Decision History Table

          </h2>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b">

                  <th className="text-left p-3">

                    Timestamp

                  </th>

                  <th className="text-left p-3">

                    Sensor Snapshot

                  </th>

                  <th className="text-left p-3">

                    RF Result

                  </th>

                  <th className="text-left p-3">

                    Alert Level

                  </th>

                  <th className="text-left p-3">

                    Final Decision

                  </th>

                </tr>

              </thead>

              <tbody>

                {

                  filteredData.map(
                    item => (

                      <tr
                        key={item.id}
                        className="border-b"
                      >

                        <td className="p-3">

                          {item.timestamp}

                        </td>

                        <td className="p-3">

                          T:
                          {item.temperature}

                          °C

                          <br/>

                          DO:
                          {item.do}

                          <br/>

                          pH:
                          {item.ph}

                        </td>

                        <td className="p-3">

                          {item.health_status}

                        </td>

                        <td className="p-3">

                          <span
                            className={`
                              px-3 py-1 rounded-full text-sm
                              ${
                                item.risk_level === "LOW"
                                ? "bg-green-100 text-green-700"
                                : item.risk_level === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                              }
                            `}
                          >

                            {item.risk_level}

                          </span>

                        </td>

                        <td className="p-3">

                          AI Decision

                        </td>

                      </tr>

                    )
                  )

                }

              </tbody>

            </table>

          </div>

        </div>

      </main>

    </div>

  );

}

function StatCard({
  title,
  value
}) {

  return (

    <div className="bg-white rounded-2xl shadow p-5">

      <p className="text-gray-500">

        {title}

      </p>

      <h3 className="text-3xl font-bold">

        {value}

      </h3>

    </div>

  );

}

function ProgressBar({
  label,
  value,
  total,
  color
}) {

  const percentage =
    total > 0
      ? (value / total) * 100
      : 0;

  return (

    <div>

      <div className="flex justify-between mb-1">

        <span>

          {label}

        </span>

        <span>

          {percentage.toFixed(1)}%

        </span>

      </div>

      <div className="bg-slate-200 rounded-full h-4">

        <div
          className={`${color} h-4 rounded-full`}
          style={{
            width: `${percentage}%`
          }}
        />

      </div>

    </div>

  );

}