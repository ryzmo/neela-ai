import { Thermometer, Droplets, FlaskConical, Waves } from "lucide-react";

const ICONS = {
  Temperature: Thermometer,
  DO: Droplets,
  pH: FlaskConical,
  Turbidity: Waves,
};

export default function SensorCard({ title, value, unit }) {
  const Icon = ICONS[title];

  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon size={16} className="text-cyan-600" />}
        <h3 className="text-slate-500 text-sm">{title}</h3>
      </div>

      <div className="flex items-baseline gap-1.5">
        <h1 className="text-3xl font-bold text-slate-900">{value ?? "-"}</h1>
        <p className="text-slate-400 text-sm">{unit}</p>
      </div>
    </div>
  );
}