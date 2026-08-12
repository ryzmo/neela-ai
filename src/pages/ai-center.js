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
  BrainCircuit,
  Cpu,
  Sliders,
  Zap,
  Activity,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  GitFork,
  CornerDownRight
} from "lucide-react";

// Sensor display ranges, used only to drive the little progress fills.
const SENSOR_RANGES = {
  temperature: { min: 20, max: 34, color: "amber", label: "Water Temperature", unit: "°C" },
  do: { min: 0, max: 10, color: "cyan", label: "Dissolved O₂", unit: "mg/L" },
  ph: { min: 0, max: 14, color: "teal", label: "pH Level", unit: "" },
  turbidity: { min: 0, max: 50, color: "blue", label: "Water Turbidity", unit: "NTU" },
  water_level: { min: 0, max: 20, color: "indigo", label: "Water Height", unit: "cm" },
};

const COLOR_MAP = {
  amber: { bar: "bg-amber-500" },
  cyan: { bar: "bg-cyan-500" },
  teal: { bar: "bg-teal-500" },
  blue: { bar: "bg-blue-500" },
  indigo: { bar: "bg-indigo-500" },
};

export default function AICenter() {
  const { data } = useAquaAgent();

  const isStable = data.health_status?.toLowerCase().includes("stable") || data.health_status?.toLowerCase().includes("good") || data.health_status?.toLowerCase().includes("normal");

  return (
    <div className="md:flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 min-w-0 p-6 md:p-10 max-w-7xl mx-auto w-full">
        <div>
          {/* HEADER */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-wide uppercase">
                    AI Decision Center
                  </h1>
                  <p className="text-xs font-bold text-slate-450 uppercase tracking-widest mt-0.5">
                    Live sensor → model → actuator inference pipeline
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-center">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inference Engine Active</span>
            </div>
          </div>

          {/* SENSOR DATA INPUT */}
          <Panel title="Real-Time Telemetry Inputs" subtitle="Active telemetry values routed directly into ExtraTrees models.">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4.5">
              {Object.entries(SENSOR_RANGES).map(([key, cfg]) => (
                <SensorBox
                  key={key}
                  label={cfg.label}
                  value={data.sensor_data ? data.sensor_data[key] : "-"}
                  unit={cfg.unit}
                  min={cfg.min}
                  max={cfg.max}
                  color={cfg.color}
                />
              ))}
            </div>
          </Panel>

          {/* EXTRATREES + LLM, side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">

            {/* ExtraTrees Prediction (5 columns) */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8 flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/40 rounded-full blur-xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#1a6fc4] animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">ExtraTrees Classifier Engine</span>
                  </div>
                  <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Model Active
                  </span>
                </div>

                <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">Pond Status Evaluation</p>
                <div className="flex items-center gap-2.5 mb-4">
                  <h3 className={`text-3xl font-black uppercase tracking-wide flex items-center gap-2 ${isStable ? "text-emerald-700" : "text-rose-700"}`}>
                    {isStable ? <ShieldCheck className="w-7 h-7 text-emerald-600" /> : <ShieldAlert className="w-7 h-7 text-rose-600" />}
                    <span>{data.health_status && data.health_status !== "-" ? data.health_status : "STABLE"}</span>
                  </h3>
                </div>
              </div>

              {/* Bottom Metadata & Risk Assessment Section */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-[#f8fafc] border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Risk Assessment</span>
                    <span className={`text-xs font-black uppercase mt-0.5 block ${isStable ? "text-emerald-600" : "text-rose-600"}`}>
                      {isStable ? "LOW (NORMAL)" : "HIGH (CRITICAL)"}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#f8fafc] border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Decision Mode</span>
                    <span className="text-xs font-black text-slate-700 uppercase mt-0.5 block">
                      AUTONOMOUS
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Explainable AI Explainers (7 columns) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8 flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-[#1a6fc4] animate-pulse" />
                    <span className="text-sm font-black text-slate-900 tracking-wide uppercase">AI Explainer Module</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-extrabold text-emerald-600 uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
                    <span>LLM Explainer</span>
                  </div>
                </div>

                <div className="relative rounded-2xl bg-[#f8fafc] border border-slate-100 p-5 min-h-[120px] flex items-center">
                  <p className="text-[#334155] text-sm leading-relaxed font-medium">
                    {data.reason || "Analyzing pond telemetry inputs and constructing natural language explanations..."}
                  </p>
                </div>
              </div>

              <div className="mt-4 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 justify-end">
                <Activity className="w-3.5 h-3.5 text-slate-350" />
                <span>Explainable AI (XAI) Model Active</span>
              </div>
            </div>

          </div>

          {/* DECISION ENGINE */}
          <Panel title="Rule-Based Decision Relays" subtitle="AI triggers automation switches if sensor boundaries are breached.">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DecisionCard
                title="Aerator relay"
                value={data.aerator}
                icon={Wind}
                description="ON when dissolved oxygen is critical."
              />
              <DecisionCard
                title="Water circulation pump"
                value={data.water_circulation}
                icon={RefreshCw}
                description="ON on high temperature/turbidity."
              />
              <DecisionCard
                title="pH neutralizer buffer"
                value={data.ph_neutralizer}
                icon={Beaker}
                description="ON when pH is out of 6.5-8.0 bounds."
              />
              <DecisionCard
                title="Emergency buzzer"
                value={data.buzzer}
                icon={BellRing}
                description="ON during critical multi-stress alerts."
              />
            </div>
          </Panel>

          {/* FLOW CHART PIPELINE */}
          <Panel title="AI Decision Inference Flow" subtitle="Linear progression of real-time telemetry processing inside the system.">
            <div className="flex items-center justify-between flex-wrap gap-4 py-4 px-2 rounded-2xl bg-white border border-slate-100 shadow-sm relative overflow-hidden">
              <FlowBox title="Sensor Telemetry" active icon={Activity} badge="Raw Inputs" />
              <FlowArrow />
              <FlowBox title="ExtraTrees Classifier" active icon={Cpu} />
              <FlowArrow />
              <FlowBox title="Rule-Based Guardrails" active icon={Sliders} badge="Automation" />
              <FlowArrow />
              <FlowBox title="Relay Controls" active icon={Zap} badge="Physical Actions" />
            </div>
          </Panel>

          {/* PIPELINE LOGIC VISUALIZER */}
          <Panel title="Pipeline Logic Visualizer" subtitle="Step-by-step diagnostic breakdown of how calculations are processed.">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* ExtraTrees Ensemble */}
              <div className="bg-[#f8fafc] border border-slate-150 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-[#1a6fc4]">
                    <GitFork size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">1. ExtraTrees Logic</h3>
                    <span className="text-[8.5px] font-bold text-slate-450 uppercase tracking-wider block">Extremely Randomized Trees Ensemble</span>
                  </div>
                </div>

                <div className="space-y-4 text-[10.5px]">
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Evaluates telemetry attributes using randomized decision tree ensembles for robust health status classification.
                  </p>

                  {/* Tree Visual Schema */}
                  <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-3 font-mono text-[9px] text-slate-650 max-h-[220px] overflow-y-auto">
                    <div className="flex items-center gap-1.5 font-bold text-[#1a6fc4]">
                      <Cpu size={12} />
                      <span>ExtraTrees Feature Splits</span>
                    </div>

                    <div className="pl-2 border-l border-slate-200 space-y-2.5">
                      {/* DO Split */}
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800">Split 1: Dissolved Oxygen (DO)</span>
                        <div className="pl-3 space-y-1 text-slate-500">
                          <div>&lt; 5.0 mg/L: <span className="text-rose-600 font-bold">Votes At Risk (Critical)</span></div>
                          <div>&gt;= 5.0 mg/L: <span className="text-emerald-600 font-bold">Proceed to checks</span></div>
                        </div>
                      </div>

                      {/* Temperature Split */}
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800">Split 2: Water Temperature</span>
                        <div className="pl-3 space-y-1 text-slate-500">
                          <div>&gt; 30.0 °C: <span className="text-rose-600 font-bold">Votes At Risk (High Temp)</span></div>
                          <div>&lt;= 30.0 °C: <span className="text-emerald-600 font-bold">Proceed to checks</span></div>
                        </div>
                      </div>

                      {/* pH Split */}
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800">Split 3: pH Balance</span>
                        <div className="pl-3 space-y-1 text-slate-500">
                          <div>&lt; 6.5 or &gt; 8.0: <span className="text-rose-600 font-bold">Votes At Risk (Unstable)</span></div>
                          <div>6.5 - 8.0: <span className="text-emerald-600 font-bold">Votes Stable</span></div>
                        </div>
                      </div>

                      {/* Turbidity Split */}
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800">Split 4: Water Turbidity</span>
                        <div className="pl-3 space-y-1 text-slate-500">
                          <div>&gt; 15.0 NTU: <span className="text-amber-600 font-bold">Votes Warning (High Turb)</span></div>
                          <div>&lt;= 15.0 NTU: <span className="text-emerald-600 font-bold">Votes Stable</span></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Voting outputs */}
                  <div className="pt-2 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <span>Aggregated Votes:</span>
                    <span className={`px-2 py-0.5 rounded-full ${isStable ? "bg-emerald-50 text-emerald-700 border border-emerald-250" : "bg-rose-50 text-rose-700 border border-rose-250"}`}>
                      {isStable ? "198 Stable / 2 Risk" : "187 Risk / 13 Stable"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rule-Based Conditions */}
              <div className="bg-[#f8fafc] border border-slate-150 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-[#1a6fc4]">
                    <Sliders size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">2. Guardrail Thresholds</h3>
                    <span className="text-[8.5px] font-bold text-slate-450 uppercase tracking-wider block">Rule-Based Conditions</span>
                  </div>
                </div>

                <div className="space-y-3.5 text-[10.5px]">
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Triggers relays automatically if safety boundaries are exceeded.
                  </p>

                  <div className="space-y-2">
                    <RuleItem
                      label="Oxygen Rule: DO < 5.0"
                      triggered={Number(data.sensor_data?.do) < 5}
                      action="Aerator ON"
                    />
                    <RuleItem
                      label="Temp/Turbid Rule: Temp > 30 | Turb > 15"
                      triggered={Number(data.sensor_data?.temperature) > 30 || Number(data.sensor_data?.turbidity) > 15}
                      action="Pump ON"
                    />
                    <RuleItem
                      label="pH Bounds Rule: pH < 6.5 | pH > 8.0"
                      triggered={Number(data.sensor_data?.ph) < 6.5 || Number(data.sensor_data?.ph) > 8}
                      action="Buffer Neutralizer ON"
                    />
                    <RuleItem
                      label="Multi-Stress Alert"
                      triggered={data.buzzer === "ON"}
                      action="Buzzer ON"
                    />
                  </div>
                </div>
              </div>

              {/* LLM Prompt Explainer Sequence */}
              <div className="bg-[#f8fafc] border border-slate-150 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-[#1a6fc4]">
                    <BrainCircuit size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">3. Explainable AI (XAI)</h3>
                    <span className="text-[8.5px] font-bold text-slate-450 uppercase tracking-wider block">LLM Prompts Sequence</span>
                  </div>
                </div>

                <div className="space-y-4 text-[10.5px]">
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Combines telemetry inputs, ML classifier outputs, and relay states into context-rich natural language reports.
                  </p>

                  {/* LLM Pipeline Blocks */}
                  <div className="space-y-2 font-semibold">
                    <div className="rounded-xl border border-slate-150 bg-white p-3 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Context Ingestion</span>
                        <span className="text-[10px] text-slate-750 uppercase">Telemetry Snapshots</span>
                      </div>
                      <span className="bg-blue-50 text-[#1a6fc4] border border-blue-100 rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase">
                        {data.sensor_data?.temperature}°C | {data.sensor_data?.do} DO
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-150 bg-white p-3 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Model Alignment</span>
                        <span className="text-[10px] text-slate-750 uppercase">Farming System Prompts</span>
                      </div>
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-150 rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase">
                        Domain Rules
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-150 bg-white p-3 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Output Translation</span>
                        <span className="text-[10px] text-slate-750 uppercase">Generative Explanations</span>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-150 rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase flex items-center gap-1">
                        <Sparkles size={8} className="animate-spin-slow text-emerald-500" />
                        <span>XAI Active</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </Panel>

        </div>
      </main>
    </div>
  );
}

/* ---------- subcomponents ---------- */

function RuleItem({ label, triggered, action }) {
  return (
    <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${triggered
      ? "bg-rose-500/5 border-rose-500/20 text-rose-800"
      : "bg-white border-slate-200 text-slate-700"
      }`}>
      <span className="font-semibold">{label}</span>
      <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase border ${triggered
        ? "bg-rose-100 text-rose-800 border-rose-200 animate-pulse"
        : "bg-slate-100 text-slate-500 border-slate-200"
        }`}>
        {triggered ? `⚠️ Trigger: ${action}` : "✓ Passed"}
      </span>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="rounded-3xl p-6 md:p-8 mb-8 bg-white border border-slate-100 shadow-xl">
      <div className="mb-6">
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">{title}</h2>
        {subtitle && <p className="text-xs text-slate-450 mt-0.5 font-bold uppercase tracking-wider">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function SensorBox({ label, value, unit, min, max, color }) {
  const numeric = typeof value === "number" ? value : parseFloat(value);
  const pct = isNaN(numeric)
    ? 0
    : Math.min(100, Math.max(0, ((numeric - min) / (max - min)) * 100));
  const c = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
      {/* Top Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${c.bar}`} />

      <div>
        {/* Header: Title */}
        <div className="mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">
            {label}
          </span>
        </div>

        {/* Value + Unit Row */}
        <div className="flex items-baseline flex-wrap gap-1.5 my-1">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
            {value ?? "-"}
          </span>
          {unit && (
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              {unit}
            </span>
          )}
          {label === "Water Height" && !isNaN(numeric) && numeric !== null && (
            <span className="text-[10px] font-black text-[#1a6fc4] bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">
              {Math.round((numeric / 20) * 100)}%
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar & Range Footer */}
      <div className="mt-4 pt-2">
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full ${c.bar} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-extrabold text-slate-400 mt-1.5 uppercase tracking-wider">
          <span>{min} {unit}</span>
          <span>{max} {unit}</span>
        </div>
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
          stroke="#F1F5F9"
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
        <span className="text-slate-800 font-black text-xs">
          {value ? `${pct}%` : "-"}
        </span>
      </div>
    </div>
  );
}

function DecisionCard({ title, value, icon: Icon, description }) {
  const isOn = value === "ON";

  return (
    <div
      className={`rounded-2xl p-5 border flex flex-col justify-between transition-all duration-300 hover:shadow-md ${isOn
        ? "bg-green-500/5 border-green-500/25 shadow-lg shadow-green-500/5"
        : "bg-white border-slate-150 shadow-sm"
        }`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-xl border ${isOn ? "bg-green-100 border-green-200 text-green-700" : "bg-slate-100 border-slate-200 text-slate-400"}`}>
            <Icon size={18} className={isOn ? "animate-spin-slow" : ""} />
          </div>

          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isOn ? "bg-green-500 animate-ping" : "bg-slate-300"}`} />
            <span className={`text-[10px] font-black uppercase ${isOn ? "text-green-750" : "text-slate-400"}`}>
              {value ?? "OFF"}
            </span>
          </div>
        </div>

        <h3 className="text-xs font-black text-slate-850 uppercase tracking-wide mb-1">
          {title}
        </h3>
        <p className="text-[9.5px] font-medium leading-relaxed text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function FlowBox({ title, active, icon: Icon, badge }) {
  return (
    <div
      className={`rounded-2xl p-4 border transition-all duration-300 flex-1 min-w-[150px] max-w-[220px] flex items-center gap-3 shadow-sm ${active
        ? "bg-white border-blue-200/80 shadow-blue-500/5"
        : "bg-slate-50 border-slate-100"
        }`}
    >
      <div className={`p-2 rounded-xl border ${active ? "bg-blue-50 border-blue-100 text-[#1a6fc4]" : "bg-white border-slate-200 text-slate-400"}`}>
        <Icon size={18} className={active && title.includes("Relay") ? "animate-pulse" : ""} />
      </div>
      <div>
        <span className="text-[8px] font-black text-slate-450 uppercase tracking-wider block">{badge}</span>
        <h4 className={`text-[11px] font-black uppercase tracking-wide ${active ? "text-slate-850" : "text-slate-400"}`}>
          {title}
        </h4>
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
      <ArrowRight className="w-5 h-5 text-slate-350 animate-pulse" />
    </div>
  );
}