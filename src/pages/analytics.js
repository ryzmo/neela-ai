import { useState } from "react";
import Sidebar from "../components/Sidebar";
import useAquaAgent from "../hooks/useAquaAgent";

export default function AnalyticsPage() {

  const { history } =
    useAquaAgent();

  const [filterLevel, setFilterLevel] =
    useState("ALL");

  const filteredData =
  filterLevel === "ALL"
    ? history
    : history.filter(
        item =>
          item.health_status ===
          filterLevel
      );

  const avgTemperature =
    history.length
      ? (
          history.reduce(
            (a, b) =>
              a +
              Number(
                b.temperature
              ),
            0
          ) /
          history.length
        ).toFixed(1)
      : "-";

  const avgDO =
    history.length
      ? (
          history.reduce(
            (a, b) =>
              a +
              Number(
                b.do
              ),
            0
          ) /
          history.length
        ).toFixed(2)
      : "-";

  const avgPH =
    history.length
      ? (
          history.reduce(
            (a, b) =>
              a +
              Number(
                b.ph
              ),
            0
          ) /
          history.length
        ).toFixed(2)
      : "-";

  const lowRisk =
    history.filter(
      h =>
        h.risk_level ===
        "LOW"
    ).length;

  const mediumRisk =
    history.filter(
      h =>
        h.risk_level ===
        "MEDIUM"
    ).length;

  const highRisk =
    history.filter(
      h =>
        h.risk_level ===
        "HIGH"
    ).length;

  const sortedData =
  [...filteredData].sort(
    (a, b) => b.id - a.id
  );

  const [showAll, setShowAll] =
  useState(false);

  const displayedData =
  showAll
    ? sortedData
    : sortedData.slice(0, 5);

  return (

    <div className="md:flex">

      <Sidebar />

      <main className="flex-1 p-4 md:p-10 bg-slate-50 min-h-screen">

        <h1 className="text-4xl font-bold mb-8">

          Analytics & Reports

        </h1>

        {/* WATER QUALITY */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold mb-6">

            Water Quality Analytics

          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <AnalyticsCard
              title="Average Temperature"
              value={`${avgTemperature} °C`}
            />

            <AnalyticsCard
              title="Average DO"
              value={`${avgDO} mg/L`}
            />

            <AnalyticsCard
              title="Average pH"
              value={avgPH}
            />

          </div>

        </div>

        {/* WEEKLY PERFORMANCE */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold mb-6">

            Weekly Performance

          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <AnalyticsCard
              title="Total Records"
              value={history.length}
            />

            <AnalyticsCard
              title="Healthy Conditions"
              value={lowRisk}
            />

            <AnalyticsCard
              title="Critical Events"
              value={highRisk}
            />

          </div>

        </div>

        {/* AI ACCURACY */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold mb-6">

            Accuracy Summary

          </h2>

          <div className="text-5xl font-bold text-green-600">

            92.4%

          </div>

          <p className="mt-3 text-gray-600">

            Estimated AI Decision Confidence

          </p>

        </div>
        {/* DECISION HISTORY */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

            <h2 className="text-2xl font-bold">

              AI Decision History

            </h2>

            <div className="flex flex-wrap gap-3">

              {[
                  "ALL",
                  "Stable",
                  "At Risk"
                ].map(level => (

                <button
                  key={level}
                  onClick={() =>
                    setFilterLevel(
                      level
                    )
                  }
                  className={`
                    px-4 py-2 rounded-xl font-medium transition
                    ${
                      filterLevel ===
                      level
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 hover:bg-slate-200"
                    }
                  `}
                >

                  {level}

                </button>

              ))}

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead>

                <tr className="border-b bg-slate-50">

                  <th className="p-4 text-left">

                    Timestamp

                  </th>

                  <th className="p-4 text-left">

                    Sensor Snapshot

                  </th>

                  <th className="p-4 text-left">

                    RF Result

                  </th>

                  <th className="p-4 text-left">

                    Final Decision

                  </th>

                </tr>

              </thead>

              <tbody>

                {

                  filteredData.length >

                  0 ? (

                   displayedData.map(
                      item => (

                        <tr
                          key={
                            item.id
                          }
                          className="border-b hover:bg-slate-50"
                        >

                          <td className="p-4">

                            {
                              item.timestamp
                            }

                          </td>

                          <td className="p-4">

                            <div>

                              <strong>

                                T:

                              </strong>{" "}

                              {
                                item.temperature
                              }
                              °C

                            </div>

                            <div>

                              <strong>

                                DO:

                              </strong>{" "}

                              {
                                item.do
                              }

                            </div>

                            <div>

                              <strong>

                                pH:

                              </strong>{" "}

                              {
                                item.ph
                              }

                            </div>

                          </td>

                          <td className="p-4">

  <span
    className={`
      px-3 py-1 rounded-full text-sm font-semibold
      ${
        item.health_status ===
        "Stable"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }
    `}
  >

    {item.health_status}

  </span>

</td>

                          <td className="p-4">

  {
    item.health_status ===
    "At Risk"
      ? "Corrective Action Required"
      : "No Action Required"
  }

</td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan={
                          4
                        }
                        className="text-center py-10 text-gray-500"
                      >

                        No decision history found.

                      </td>

                    </tr>

                  )

                }

              </tbody>

            </table>
            {
  sortedData.length > 10 && (

    <div className="mt-5 text-center">

      <button
        onClick={() =>
          setShowAll(!showAll)
        }
        className="
          px-5 py-2
          bg-blue-600
          text-white
          rounded-xl
        "
      >

        {
          showAll
            ? "Show Less"
            : "View More"
        }

      </button>

    </div>

  )
}

          </div>

        </div>

        {/* EXPORT */}

        <div className="bg-white rounded-2xl shadow p-8">

          <h2 className="text-2xl font-bold mb-6">

            Export Report

          </h2>

          <div className="flex flex-wrap gap-4">

            <button
              className="
                px-6 py-3
                bg-red-600
                hover:bg-red-700
                text-white
                rounded-xl
                transition
              "
            >

              Export PDF

            </button>

            <button
              className="
                px-6 py-3
                bg-green-600
                hover:bg-green-700
                text-white
                rounded-xl
                transition
              "
            >

              Export CSV

            </button>

          </div>

        </div>

      </main>

    </div>

  );

}

function AnalyticsCard({
  title,
  value
}) {

  return (

    <div className="bg-slate-50 rounded-xl p-5">

      <p className="text-gray-500">

        {title}

      </p>

      <h3 className="text-3xl font-bold mt-2">

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
      ? (
          value /
          total
        ) * 100
      : 0;

  return (

    <div>

      <div className="flex justify-between mb-2">

        <span>

          {label}

        </span>

        <span>

          {percentage.toFixed(
            1
          )}%

        </span>

      </div>

      <div className="h-5 bg-slate-200 rounded-full overflow-hidden">

        <div
          className={`${color} h-5 rounded-full transition-all duration-500`}
          style={{
            width:
              `${percentage}%`
          }}
        />

      </div>

    </div>

  );

}