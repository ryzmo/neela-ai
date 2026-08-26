import {
  Thermometer,
  Droplets,
  FlaskConical,
  Waves,
  Gauge,
} from "lucide-react";

const CONFIG = {
  Temperature: {
    icon: Thermometer,
    min: 20,
    max: 34,
    bar: "bg-amber-400",
    text: "text-amber-600",
  },

  DO: {
    icon: Droplets,
    min: 0,
    max: 10,
    bar: "bg-cyan-400",
    text: "text-cyan-600",
  },

  "Dissolved O₂": {
    icon: Droplets,
    min: 0,
    max: 10,
    bar: "bg-cyan-400",
    text: "text-cyan-600",
  },

  pH: {
    icon: FlaskConical,
    min: 0,
    max: 14,
    bar: "bg-teal-400",
    text: "text-teal-600",
  },

  Turbidity: {
    icon: Waves,
    min: 0,
    max: 100,
    bar: "bg-purple-500",
    text: "text-purple-600",
  },

  "Water Level": {
    icon: Gauge,
    min: 0,
    max: 100,
    bar: "bg-blue-400",
    text: "text-blue-600",
  },
};

export default function SensorCard({
  title,
  value,
  unit,
}) {
  const cfg = CONFIG[title];

  if (!cfg) {
    console.error(
      "Unknown sensor title:",
      title
    );

    return null;
  }

  const Icon = cfg.icon;

  const numeric =
    typeof value === "number"
      ? value
      : parseFloat(value);

  const percentage = isNaN(numeric)
    ? 0
    : Math.min(
        100,
        Math.max(
          0,
          ((numeric - cfg.min) /
            (cfg.max - cfg.min)) *
            100
        )
      );

  // Status for Turbidity: JERNIH (<25%), SEDANG (25-75%), PEKAT (>=75%)
  let turbidityStatus = null;
  let turbidityBadge = "";
  if (title === "Turbidity" && !isNaN(numeric)) {
    if (numeric >= 75) {
      turbidityStatus = "PEKAT";
      turbidityBadge = "bg-rose-100 text-rose-750 border-rose-200";
    } else if (numeric >= 25) {
      turbidityStatus = "SEDANG";
      turbidityBadge = "bg-amber-100 text-amber-800 border-amber-200";
    } else {
      turbidityStatus = "JERNIH";
      turbidityBadge = "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
  }

  return (
    <div
      className="
        rounded-3xl
        p-4
        bg-slate-50
        border
        border-slate-200
        transition-all
        duration-200
        hover:shadow-md
      "
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={16} className={cfg.text} />

          <p className="text-sm text-slate-500 font-medium">
            {title}
          </p>
        </div>

        {turbidityStatus && (
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${turbidityBadge}`}>
            {turbidityStatus}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mb-4">
        <h2 className="text-[28px] font-bold text-slate-900 leading-none">
          {value ?? "-"}
        </h2>

        <span className="text-base font-normal text-slate-400">
          {unit}
        </span>
      </div>

      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${cfg.bar} transition-all duration-500`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      {title === "Water Level" && (
        <div className="flex justify-between mt-1.5 text-[11px] text-slate-400 font-medium">
          <span>0%</span>
          <span>100%</span>
        </div>
      )}

      {title === "Turbidity" && (
        <div className="flex justify-between mt-1.5 text-[11px] text-slate-400 font-medium">
          <span>0% (Jernih)</span>
          <span>100% (Pekat)</span>
        </div>
      )}
    </div>
  );
}