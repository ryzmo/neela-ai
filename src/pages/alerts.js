import Sidebar from "../components/Sidebar";
import useAquaAgent from "../hooks/useAquaAgent";

export default function AlertsPage() {

  const { data, history } =
    useAquaAgent();

  const activeAlerts = [];

  if (
    Number(data.sensor_data?.do) < 5
  ) {

    activeAlerts.push({

      title: "Low Dissolved Oxygen",

      severity: "CRITICAL",

      message:
        "DO level below recommended threshold."

    });

  }

  if (
    Number(data.sensor_data?.temperature) > 30
  ) {

    activeAlerts.push({

      title: "High Temperature",

      severity: "WARNING",

      message:
        "Water temperature exceeds optimal range."

    });

  }

  if (
    Number(data.sensor_data?.ph) < 6.5 ||
    Number(data.sensor_data?.ph) > 8
  ) {

    activeAlerts.push({

      title: "Unstable pH",

      severity: "WARNING",

      message:
        "pH outside safe operating range."

    });

  }

  if (
    Number(data.sensor_data?.ammonia) > 0.5
  ) {

    activeAlerts.push({

      title: "High Ammonia",

      severity: "CRITICAL",

      message:
        "Ammonia concentration is dangerous."

    });

  }

  return (

    <div className="md:flex">

      <Sidebar />

      <main className="flex-1 p-4 md:p-10">

        <h1 className="text-4xl font-bold mb-8">

          Alerts & Notifications

        </h1>

        {/* ACTIVE ALERTS */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold mb-6">

            Active Alerts

          </h2>

          <div className="space-y-4">

            {
              activeAlerts.length === 0 &&

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">

                ✅ No active alerts detected.

              </div>
            }

            {
              activeAlerts.map(
                (alert,index) => (

                  <AlertCard
                    key={index}
                    {...alert}
                  />

                )
              )
            }

          </div>

        </div>

        {/* SEVERITY */}

        <div className="grid grid-cols-3 gap-5 mb-8">

          <SeverityCard
            title="Info"
            color="blue"
            count={0}
          />

          <SeverityCard
            title="Warning"
            color="yellow"
            count={
              activeAlerts.filter(
                a =>
                  a.severity ===
                  "WARNING"
              ).length
            }
          />

          <SeverityCard
            title="Critical"
            color="red"
            count={
              activeAlerts.filter(
                a =>
                  a.severity ===
                  "CRITICAL"
              ).length
            }
          />

        </div>

        {/* TIMELINE */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold mb-6">

            Alert Timeline

          </h2>

          <div className="space-y-4">

            {
              activeAlerts.map(
                (alert,index) => (

                  <div
                    key={index}
                    className="border-l-4 border-red-500 pl-4"
                  >

                    <p className="font-bold">

                      {alert.title}

                    </p>

                    <p className="text-sm text-gray-500">

                      {new Date()
                        .toLocaleString()
                      }

                    </p>

                  </div>

                )
              )
            }

          </div>

        </div>

        {/* RESOLVED ALERTS */}

        <div className="bg-white rounded-2xl shadow p-8">

          <h2 className="text-2xl font-bold mb-6">

            Resolved Alerts History

          </h2>

          <table className="w-full">

            <thead>

              <tr className="border-b">

                <th className="text-left p-3">

                  Timestamp

                </th>

                <th className="text-left p-3">

                  Status

                </th>

                <th className="text-left p-3">

                  Alert Level

                </th>

              </tr>

            </thead>

            <tbody>

              {

                history.slice(-10).map(
                  item => (

                    <tr
                      key={item.id}
                      className="border-b"
                    >

                      <td className="p-3">

                        {item.timestamp}

                      </td>

                      <td className="p-3">

                        {item.health_status}

                      </td>

                      <td className="p-3">

                        {item.risk_level}

                      </td>

                    </tr>

                  )
                )

              }

            </tbody>

          </table>

        </div>

      </main>

    </div>

  );

}

function AlertCard({
  title,
  severity,
  message
}) {

  return (

    <div
      className={`
        p-4 rounded-xl border

        ${
          severity === "CRITICAL"
          ? "bg-red-50 border-red-300"
          : "bg-yellow-50 border-yellow-300"
        }
      `}
    >

      <div className="flex justify-between">

        <h3 className="font-bold">

          {title}

        </h3>

        <span
          className={`
            px-3 py-1 rounded-full text-xs

            ${
              severity === "CRITICAL"
              ? "bg-red-500 text-white"
              : "bg-yellow-500 text-white"
            }
          `}
        >

          {severity}

        </span>

      </div>

      <p className="mt-2">

        {message}

      </p>

    </div>

  );

}

function SeverityCard({
  title,
  count,
  color
}) {

  const styles = {

    blue:
      "bg-blue-50 text-blue-700",

    yellow:
      "bg-yellow-50 text-yellow-700",

    red:
      "bg-red-50 text-red-700"

  };

  return (

    <div
      className={`rounded-2xl shadow p-6 ${styles[color]}`}
    >

      <p>

        {title}

      </p>

      <h3 className="text-4xl font-bold">

        {count}

      </h3>

    </div>

  );

}