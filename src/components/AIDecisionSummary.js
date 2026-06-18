export default function AIDecisionSummary({
  data
}) {

  function StatusBadge({ value }) {

    return (

      <span
        className={`
          px-3 py-1 rounded-full text-sm font-semibold
          ${
            value === "ON"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }
        `}
      >
        {value}
      </span>

    );

  }

  return (

    <div className="bg-white rounded-2xl shadow p-8 mt-8">

      <h2 className="text-2xl font-bold mb-6">

        AI Decision Summary

      </h2>

      {/* Status */}

      <div className="grid grid-cols-2 gap-4 mb-6">

        <div>

          <p className="text-gray-500">

            Health Status

          </p>

          <p className="font-bold text-lg">

            {data.health_status}

          </p>

        </div>

      </div>

      {/* Actuator Status */}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">

        <div>

          <p className="text-gray-500 mb-2">

            Aerator

          </p>

          <StatusBadge
            value={data.aerator}
          />

        </div>

        <div>

          <p className="text-gray-500 mb-2">

            Feeder

          </p>

          <StatusBadge
            value={data.feeder}
          />

        </div>

        <div>

          <p className="text-gray-500 mb-2">

            Water Circulation

          </p>

          <StatusBadge
            value={data.water_circulation}
          />

        </div>

        <div>

          <p className="text-gray-500 mb-2">

            pH Neutralizer

          </p>

          <StatusBadge
            value={data.ph_neutralizer}
          />

        </div>

        <div>

        <p className="text-gray-500 mb-2">

            Buzzer

        </p>

        <StatusBadge
            value={data.buzzer}
        />

        </div>

      </div>

      {/* Reason */}

      <div className="bg-slate-50 rounded-xl p-4">

        <p className="text-sm text-gray-600">

          AI Reasoning

        </p>

        <p className="mt-2">

          {data.reason}

        </p>

      </div>

    </div>

  );

}