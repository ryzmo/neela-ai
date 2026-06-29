import {
  Thermometer,
  Droplets,
  FlaskConical,
  Waves,
  Gauge,
} from "lucide-react";

const ICONS = {
  Temperature: Thermometer,
  DO: Droplets,
  pH: FlaskConical,
  Turbidity: Waves,
  "Water Level": Gauge,
};

export default function SensorCard({
  title,
  value,
  unit,
}) {
  const Icon = ICONS[title];

  const isWaterLevel =
    title === "Water Level";

  const percentage =
    isWaterLevel && value != null
      ? Math.min(
          Math.max(
            (value / 20) * 100,
            0
          ),
          100
        )
      : 0;

  const isLow =
    percentage <= 20;

  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">

      <div className="flex items-center gap-2 mb-3">
        {Icon && (
          <Icon
            size={16}
            className="text-cyan-600"
          />
        )}

        <h3 className="text-slate-500 text-sm">
          {title}
        </h3>
      </div>

      <div className="flex items-end gap-2">
        <h1 className="text-3xl font-bold text-slate-900">
          {value ?? "-"}
        </h1>

        <p className="text-slate-400 text-sm mb-1">
          {unit}
        </p>

        {isWaterLevel && (
          <span
            className={`text-sm font-semibold mb-1 ${
              isLow
                ? "text-red-600"
                : "text-blue-600"
            }`}
          >
            ({percentage.toFixed(0)}%)
          </span>
        )}
      </div>

      {isWaterLevel && (
        <div className="mt-4">

          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">

            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isLow
                  ? "bg-red-500"
                  : "bg-blue-500"
              }`}
              style={{
                width: `${percentage}%`,
              }}
            />

          </div>

          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>0 cm</span>
            <span>20 cm</span>
          </div>

        </div>
      )}
    </div>
  );
}