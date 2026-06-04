export default function DashboardHeader({
  serverConnected,
  lastSync
}) {

  return (

    <div className="flex justify-between items-center mb-8">

      <h1 className="text-4xl font-bold">
        AQUAAGENT Dashboard
      </h1>

      <div>

        <div className="flex items-center gap-2">

          <div
            className={`
              w-3 h-3 rounded-full
              ${
                serverConnected
                  ? "bg-green-500"
                  : "bg-red-500"
              }
            `}
          />

          <span
            className={`
              text-sm font-semibold
              ${
                serverConnected
                  ? "text-green-600"
                  : "text-red-600"
              }
            `}
          >
            {
              serverConnected
                ? "Server Connected"
                : "Server Offline"
            }
          </span>

        </div>

        <div className="text-xs text-gray-500">

          Last Sync: {lastSync}

        </div>

      </div>

    </div>

  );

}