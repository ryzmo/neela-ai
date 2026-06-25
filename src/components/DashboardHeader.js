export default function DashboardHeader({ serverConnected, lastSync }) {
  return (
    <div className="flex justify-between items-start mb-8">
      <h1 className="text-3xl md:text-4xl font-black text-slate-900">
        Dashboard
      </h1>

      <div className="text-right">
        <div className="flex items-center gap-2 justify-end">
          <div
            className={`w-2 h-2 rounded-full ${
              serverConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />

          <span
            className={`text-sm font-semibold ${
              serverConnected ? "text-green-600" : "text-red-600"
            }`}
          >
            {serverConnected ? "Server connected" : "Server offline"}
          </span>
        </div>

        <p className="text-xs text-slate-400 mt-0.5">Last sync: {lastSync}</p>
      </div>
    </div>
  );
}