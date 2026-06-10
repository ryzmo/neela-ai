import Sidebar from "../components/Sidebar";
import useAquaAgent from "../hooks/useAquaAgent";

export default function AICenter() {

  const { data } = useAquaAgent();

  return (

    <div className="md:flex">

      <Sidebar />

      <main className="flex-1 p-4 md:p-10">

        <h1 className="text-4xl font-bold mb-8">

          AI Decision Center

        </h1>

        {/* INPUT SENSOR */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold mb-6">

            Input Sensor Data

          </h2>

          <div className="grid grid-cols-4 gap-5">

            <SensorBox
              title="Temperature"
              value={data.sensor_data.temperature}
              unit="°C"
            />

            <SensorBox
              title="DO"
              value={data.sensor_data.do}
              unit="mg/L"
            />

            <SensorBox
              title="pH"
              value={data.sensor_data.ph}
              unit=""
            />

            <SensorBox
              title="Turbidity"
              value={data.sensor_data.turbidity}
              unit="NTU"
            />

          </div>

        </div>

        {/* RANDOM FOREST */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold mb-6">

            Random Forest Output

          </h2>

          <div className="grid grid-cols-2 gap-6">

            <div>

              <p className="text-gray-500">

                Classification Result

              </p>

              <h3 className="text-3xl font-bold">

                {data.health_status}

              </h3>

            </div>

            <div>

              <p className="text-gray-500">

                Confidence Score

              </p>

              <h3 className="text-3xl font-bold">

                {data.rf_confidence
                  ? `${(
                      data.rf_confidence * 100
                    ).toFixed(1)}%`
                  : "-"
                }

              </h3>

            </div>

          </div>

        </div>

        {/* LLM REASONING */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold mb-6">

            LLM Analysis / Reasoning

          </h2>

          <div className="bg-blue-50 p-5 rounded-xl">

            <p className="text-lg">

              {data.reason}

            </p>

          </div>

        </div>

        {/* FINAL DECISION */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold mb-6">

            Final AI Decision

          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">

            <DecisionCard
              title="Aerator"
              value={data.aerator}
            />

            <DecisionCard
              title="Feeding"
              value={data.feeder}
            />

            <DecisionCard
              title="Water Circulation"
              value={data.water_circulation}
            />

            <DecisionCard
              title="pH Stabilizer"
              value={data.ph_neutralizer}
            />

            <DecisionCard
            title="Buzzer"
            value={data.buzzer}
            />

          </div>

        </div>

        {/* CONFIDENCE */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold mb-6">

            Decision Confidence Level

          </h2>

          <div className="w-full bg-slate-200 rounded-full h-6">

            <div
              className="bg-green-500 h-6 rounded-full"
              style={{
                width: `${
                  data.rf_confidence
                    ? data.rf_confidence * 100
                    : 0
                }%`
              }}
            />
          </div>

          <p className="mt-3 font-semibold">

            {data.rf_confidence
              ? `${(
                  data.rf_confidence * 100
                ).toFixed(1)}%`
              : "-"
            }

          </p>

        </div>

        {/* AI FLOW */}

        <div className="bg-white rounded-2xl shadow p-8">

          <h2 className="text-2xl font-bold mb-6">

            AI Decision Flow Visualization

          </h2>

          <div className="flex justify-between items-center">

            <FlowBox
              title="Sensor Data"
            />

            <Arrow />

            <FlowBox
              title="Random Forest"
            />

            <Arrow />

            <FlowBox
              title="AI Reasoning"
            />

            <Arrow />

            <FlowBox
              title="Final Action"
            />

          </div>

        </div>

      </main>

    </div>

  );

}

function SensorBox({
  title,
  value,
  unit
}) {

  return (

    <div className="bg-slate-50 rounded-xl p-5">

      <p className="text-gray-500">

        {title}

      </p>

      <h3 className="text-3xl font-bold">

        {value} {unit}

      </h3>

    </div>

  );

}

function DecisionCard({
  title,
  value
}) {

  return (

    <div className="bg-slate-50 rounded-xl p-5 text-center">

      <p className="text-gray-500 mb-2">

        {title}

      </p>

      <div
        className={`

          text-2xl font-bold

          ${
            value === "ON"
              ? "text-green-600"
              : "text-red-600"
          }

        `}
      >

        {value}

      </div>

    </div>

  );

}

function FlowBox({
  title
}) {

  return (

    <div className="bg-blue-100 rounded-xl px-6 py-4 font-bold">

      {title}

    </div>

  );

}

function Arrow() {

  return (

    <div className="text-3xl font-bold">

      →

    </div>

  );

}