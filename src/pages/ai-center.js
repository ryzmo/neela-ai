import Sidebar from "../components/Sidebar";
import useAquaAgent from "../hooks/useAquaAgent";
import {
  Thermometer,
  Droplets,
  FlaskConical,
  Waves,
  Gauge,
  Wind,
  RefreshCw,
  Beaker,
  BellRing,
  Sparkles,
} from "lucide-react";

// Sensor display ranges, used only to drive the little progress fills.
// Tweak min/max if your real sensor bounds differ.
const SENSOR_RANGES = {
  temperature: { min: 20, max: 34, icon: Thermometer, color: "amber" },
  do: { min: 0, max: 10, icon: Droplets, color: "cyan" },
  ph: { min: 0, max: 14, icon: FlaskConical, color: "teal" },
  turbidity: { min: 0, max: 50, icon: Waves, color: "blue" },
  water_level: {
    min: 0,
    max: 20, // 20 cm = 100%
    icon: Gauge,
    color: "blue",
  },
};

const COLOR_MAP = {
  amber: { bar: "bg-amber-400", text: "text-amber-600", glow: "shadow-amber-400/30" },
  cyan: { bar: "bg-cyan-400", text: "text-cyan-600", glow: "shadow-cyan-300/30" },
  teal: { bar: "bg-teal-400", text: "text-teal-600", glow: "shadow-teal-300/30" },
  blue: { bar: "bg-blue-400", text: "text-blue-600", glow: "shadow-blue-300/30" },
};

export default function AICenter() {
  const { data } = useAquaAgent();

  return (
    <div className="md:flex min-h-screen bg-[#0a2540]">
      <Sidebar />

      <main className="flex-1 p-4 md:p-10 bg-white">
        <div>
          {/* HEADER */}
          <div className="flex items-center gap-3 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900">
                AI Decision Center
              </h1>
              <p className="text-slate-500 text-sm">
                Live sensor → model → actuator pipeline
              </p>
            </div>
          </div>

          {/* SENSOR DATA */}
          <Panel title="Input sensor data">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(SENSOR_RANGES).map(([key, cfg]) => (
                <SensorBox
                  key={key}
                  label={labelFor(key)}
                  value={data.sensor_data[key]}
                  unit={unitFor(key)}
                  min={cfg.min}
                  max={cfg.max}
                  icon={cfg.icon}
                  color={cfg.color}
                />
              ))}
            </div>
          </Panel>

          {/* RANDOM FOREST + LLM, side by side */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Panel title="Random forest output">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                    Classification
                  </p>
                  <h3
                    className={`text-2xl font-bold ${statusColor(
                      data.health_status
                    )}`}
                  >
                    {data.health_status ?? "—"}
                  </h3>
                </div>

                <ConfidenceRing value={data.rf_confidence} />
              </div>
            </Panel>

            <Panel title="LLM reasoning">
              <p className="text-slate-700 text-[15px] leading-relaxed">
                {data.reason ?? "Waiting for analysis…"}
              </p>
            </Panel>
          </div>

          {/* DECISION ENGINE */}
          <Panel title="Rule-based decision engine">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DecisionCard
                title="Aerator"
                value={data.aerator}
                icon={Wind}
              />
              <DecisionCard
                title="Water circulation"
                value={data.water_circulation}
                icon={RefreshCw}
              />
              <DecisionCard
                title="pH stabilizer"
                value={data.ph_neutralizer}
                icon={Beaker}
              />
              <DecisionCard
                title="Buzzer"
                value={data.buzzer}
                icon={BellRing}
              />
            </div>
          </Panel>

          {/* FLOW */}
          <Panel title="AI decision flow">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <FlowBox title="Sensor data" active />
              <FlowArrow />
              <FlowBox title="Random forest" active />
              <FlowArrow />
              <FlowBox title="Rule-based engine" active />
              <FlowArrow />
              <FlowBox title="Control actions" active />
            </div>
          </Panel>
        </div>
      </main>
    </div>
  );
}

/* ---------- helpers ---------- */

function labelFor(key) {
  return { temperature: "Temperature", do: "Dissolved O₂", ph: "pH", turbidity: "Turbidity", water_level: "Water Level",}[key];
}

function unitFor(key) {
  return { temperature: "°C", do: "mg/L", ph: "", turbidity: "NTU", water_level: "cm", }[key];
}

function statusColor(status) {
  if (!status) return "text-slate-400";
  const s = status.toLowerCase();
  if (s.includes("good") || s.includes("healthy") || s.includes("normal"))
    return "text-green-600";
  if (s.includes("warn") || s.includes("moderate")) return "text-amber-600";
  if (s.includes("bad") || s.includes("critical") || s.includes("danger"))
    return "text-red-600";
  return "text-cyan-700";
}

/* ---------- subcomponents ---------- */

function Panel({ title, children }) {
  return (
    <div
      className="
        rounded-3xl
        p-6 md:p-8
        mb-6
        bg-white
        border border-slate-100
        shadow-sm
      "
    >
      <h2 className="text-lg font-bold text-slate-800 mb-5">{title}</h2>
      {children}
    </div>
  );
}

function SensorBox({ label, value, unit, min, max, icon: Icon, color }) {
  const numeric = typeof value === "number" ? value : parseFloat(value);
  const pct = isNaN(numeric)
    ? 0
    : Math.min(100, Math.max(0, ((numeric - min) / (max - min)) * 100));
  const c = COLOR_MAP[color];

  return (
    <div className="rounded-2xl p-4 bg-slate-50 border border-slate-100">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className={c.text} />
        <p className="text-slate-500 text-xs">{label}</p>
      </div>

      <h3 className="text-2xl font-bold text-slate-900 mb-3">
        {value ?? "-"}

        <span className="text-sm text-slate-400 font-medium ml-1">
          {unit}
        </span>

        {label === "Water Level" && (
          <span className="ml-2 text-base font-semibold text-blue-600">
            ({Math.round((value / 20) * 100)}%)
          </span>
        )}
      </h3>

      <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full rounded-full ${c.bar} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ConfidenceRing({ value }) {
  const pct = value ? Math.round(value * 100) : 0;
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative w-[72px] h-[72px] flex-shrink-0">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle
          cx="36"
          cy="36"
          r="28"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="6"
        />
        <circle
          cx="36"
          cy="36"
          r="28"
          fill="none"
          stroke="#0E9FD6"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 36 36)"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-slate-800 font-bold text-sm">
          {value ? `${pct}%` : "-"}
        </span>
      </div>
    </div>
  );
}

function DecisionCard({ title, value, icon: Icon }) {
  const isOn = value === "ON";

  return (
    <div
      className={`
        rounded-2xl p-4 text-center border
        transition-all duration-300
        ${
          isOn
            ? "bg-green-50 border-green-200"
            : "bg-slate-50 border-slate-100"
        }
      `}
    >
      <div
        className={`
          w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center
          ${isOn ? "bg-green-100" : "bg-slate-200"}
        `}
      >
        <Icon size={18} className={isOn ? "text-green-600" : "text-slate-400"} />
      </div>

      <p className="text-slate-500 text-xs mb-2">{title}</p>

      <div className="flex items-center justify-center gap-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isOn ? "bg-green-500 animate-pulse" : "bg-slate-300"
          }`}
        />
        <span
          className={`text-sm font-bold ${
            isOn ? "text-green-600" : "text-slate-400"
          }`}
        >
          {value ?? "OFF"}
        </span>
      </div>
    </div>
  );
}

function FlowBox({ title, active }) {
  return (
    <div
      className={`
        rounded-2xl px-5 py-3.5 font-semibold text-sm text-center
        border transition-colors
        ${
          active
            ? "bg-cyan-50 border-cyan-200 text-cyan-700"
            : "bg-slate-50 border-slate-100 text-slate-400"
        }
      `}
      style={{ minWidth: 130 }}
    >
      {title}
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex-1 min-w-[24px] flex items-center justify-center px-1">
      <svg width="100%" height="16" viewBox="0 0 60 16" preserveAspectRatio="none">
        <line
          x1="0"
          y1="8"
          x2="50"
          y2="8"
          stroke="#94CFE8"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
        <path d="M48 3 L56 8 L48 13" fill="none" stroke="#3FA8CE" strokeWidth="2" />
      </svg>
    </div>
  );
}