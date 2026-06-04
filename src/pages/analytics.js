import Sidebar from "../components/Sidebar";
import useAquaAgent from "../hooks/useAquaAgent";

export default function AnalyticsPage() {

  const { history } =
    useAquaAgent();

  const avgTemperature =
    history.length
      ? (
          history.reduce(
            (a,b)=>
              a + Number(
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
            (a,b)=>
              a + Number(
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
            (a,b)=>
              a + Number(
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

  return (

    <div className="md:flex">

      <Sidebar />

      <main className="flex-1 p-4 md:p-10">

        <h1 className="text-4xl font-bold mb-8">

          Analytics & Reports

        </h1>

        {/* WATER QUALITY */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold mb-6">

            Water Quality Analytics

          </h2>

          <div className="grid grid-cols-3 gap-5">

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

          <div className="grid grid-cols-3 gap-5">

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

        {/* DECISION ANALYTICS */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold mb-6">

            Decision Analytics

          </h2>

          <div className="space-y-5">

            <ProgressBar
              label="LOW Risk Decisions"
              value={lowRisk}
              total={history.length}
              color="bg-green-500"
            />

            <ProgressBar
              label="MEDIUM Risk Decisions"
              value={mediumRisk}
              total={history.length}
              color="bg-yellow-500"
            />

            <ProgressBar
              label="HIGH Risk Decisions"
              value={highRisk}
              total={history.length}
              color="bg-red-500"
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

        {/* ACTUATOR ANALYTICS */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold mb-6">

            Actuator Usage Analytics

          </h2>

          <div className="grid grid-cols-2 gap-5">

            <AnalyticsCard
              title="Aerator Runtime"
              value="4.5 Hours"
            />

            <AnalyticsCard
              title="Feeding Activity"
              value="37 Actions"
            />

          </div>

        </div>

        {/* EXPORT */}

        <div className="bg-white rounded-2xl shadow p-8">

          <h2 className="text-2xl font-bold mb-6">

            Export Report

          </h2>

          <div className="flex gap-4">

            <button
              className="
              px-6 py-3
              bg-red-600
              text-white
              rounded-xl
            "
            >

              Export PDF

            </button>

            <button
              className="
              px-6 py-3
              bg-green-600
              text-white
              rounded-xl
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
      ? (value / total) * 100
      : 0;

  return (

    <div>

      <div className="flex justify-between mb-2">

        <span>

          {label}

        </span>

        <span>

          {percentage.toFixed(1)}%

        </span>

      </div>

      <div className="h-5 bg-slate-200 rounded-full">

        <div
          className={`${color} h-5 rounded-full`}
          style={{
            width:
              `${percentage}%`
          }}
        />

      </div>

    </div>

  );

}