import { Wind, Utensils, RefreshCw, Beaker, BellRing } from "lucide-react";

const ACTUATORS = [
  { key: "aerator", label: "Aerator", icon: Wind },
  { key: "feeder", label: "Feeder", icon: Utensils },
  { key: "water_circulation", label: "Water circulation", icon: RefreshCw },
  { key: "ph_neutralizer", label: "pH neutralizer", icon: Beaker },
  { key: "buzzer", label: "Buzzer", icon: BellRing },
];

function StatusBadge({ value }) {
  const isOn = value === "ON";

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${
        isOn ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      {value ?? "OFF"}
    </span>
  );
}

function healthColor(status) {
  if (!status) return "text-slate-400";
  const s = status.toLowerCase();
  if (s.includes("good") || s.includes("healthy") || s.includes("normal"))
    return "text-green-600";
  if (s.includes("warn") || s.includes("moderate")) return "text-amber-600";
  if (s.includes("bad") || s.includes("critical") || s.includes("danger"))
    return "text-red-600";
  return "text-slate-800";
}

export default function AIDecisionSummary({ data }) {
  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 md:p-8 mt-6">
      <h2 className="text-lg font-bold text-slate-800 mb-5">
        Decision Summary
      </h2>

      {/* Health status */}
      <div className="mb-6">
        <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
          Health status
        </p>
        <p className={`font-bold text-xl ${healthColor(data.health_status)}`}>
          {data.health_status ?? "—"}
        </p>
      </div>

      {/* Actuator status */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
        {ACTUATORS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Icon size={14} className="text-slate-400" />
              <p className="text-slate-500 text-xs">{label}</p>
            </div>
            <StatusBadge value={data[key]} />
          </div>
        ))}
      </div>

      {/* Reason */}
      <div className="bg-slate-50 rounded-xl p-4">
        <p className="text-sm font-medium text-slate-500">AI reasoning</p>
        <p className="mt-1.5 text-slate-700 text-[15px] leading-relaxed">
          {data.reason}
        </p>
      </div>
    </div>
  );
}