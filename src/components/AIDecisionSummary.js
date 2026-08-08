import { 
  Wind, 
  Utensils, 
  RefreshCw, 
  Beaker, 
  BellRing,
  BrainCircuit,
  Sparkles,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Activity
} from "lucide-react";

const ACTUATORS = [
  { key: "aerator", label: "Aerator", icon: Wind },
  { key: "feeder", label: "Feeder", icon: Utensils },
  { key: "water_circulation", label: "Water circulation", icon: RefreshCw },
  { key: "ph_neutralizer", label: "pH neutralizer", icon: Beaker },
  { key: "buzzer", label: "Buzzer", icon: BellRing },
];

const getStatusTheme = (status) => {
  if (!status || status === "-") return {
    bg: "bg-slate-50 border-slate-200",
    text: "text-slate-500",
    glow: "shadow-slate-200/50",
    badgeBg: "bg-slate-100 text-slate-600 border-slate-200",
    glowLight: "bg-slate-500/10",
    icon: ShieldCheck
  };
  const s = status.toLowerCase();
  if (s.includes("good") || s.includes("healthy") || s.includes("normal") || s.includes("stable")) {
    return {
      bg: "bg-emerald-50/70 border-emerald-250",
      text: "text-emerald-700",
      glow: "shadow-emerald-300/20",
      badgeBg: "bg-emerald-100/80 text-emerald-850 border-emerald-200/50",
      glowLight: "bg-emerald-500/10",
      icon: ShieldCheck
    };
  }
  if (s.includes("warn") || s.includes("moderate")) {
    return {
      bg: "bg-amber-50/70 border-amber-250",
      text: "text-amber-700",
      glow: "shadow-amber-300/20",
      badgeBg: "bg-amber-100/80 text-amber-850 border-amber-200/50",
      glowLight: "bg-amber-500/10",
      icon: ShieldAlert
    };
  }
  return {
    bg: "bg-rose-50/70 border-rose-250",
    text: "text-rose-700",
    glow: "shadow-rose-300/20",
    badgeBg: "bg-rose-100/80 text-rose-850 border-rose-200/50",
    glowLight: "bg-rose-500/10",
    icon: ShieldAlert
  };
};

export default function AIDecisionSummary({ data }) {
  const theme = getStatusTheme(data.health_status);

  return (
    <div className="space-y-6">
      
      {/* Visual Header Grid: ET Output (Left) & LLM Reasoning (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Extra Trees Classifier Output Card */}
        <div className={`lg:col-span-5 rounded-3xl border ${theme.bg} p-6 md:p-8 flex flex-col justify-between shadow-xl ${theme.glow} relative overflow-hidden transition-all duration-300 hover:scale-[1.01]`}>
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/20 blur-xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-slate-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">ET Classifier Engine</span>
              </div>

            </div>

            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Pond Status</span>
            <div className="flex items-center gap-3">
              <h3 className={`text-3xl md:text-4xl font-black uppercase tracking-wide ${theme.text}`}>
                {data.health_status && data.health_status !== "-" ? data.health_status : "STABLE"}
              </h3>
              <div className="relative flex h-3.5 w-3.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${theme.text.replace('text-', 'bg-')}`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${theme.text.replace('text-', 'bg-')}`} />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200/40 grid grid-cols-2 gap-4">
            <div className="p-3 rounded-2xl bg-white/60 border border-white/50">
              <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Risk Assessment</span>
              <span className={`text-xs font-black uppercase mt-0.5 block ${theme.text}`}>
                {data.risk_level && data.risk_level !== "-" ? data.risk_level : (data.health_status?.toLowerCase().includes("risk") ? "HIGH" : "LOW")}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/60 border border-white/50">
              <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Decision Mode</span>
              <span className="text-xs font-black text-slate-700 uppercase mt-0.5 block">
                AUTONOMOUS
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Explainable AI (LLM Reasoning) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-100 bg-white p-6 md:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all duration-300 hover:scale-[1.01]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/40 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#1a6fc4] animate-pulse" />
                <span className="text-sm font-black text-slate-900 tracking-wide uppercase">NEELA AI Reasoning</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-extrabold text-emerald-600 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
                <span>LLM Explainer Layer</span>
              </div>
            </div>

            <div className="relative rounded-2xl bg-[#f8fafc] border border-slate-100 p-4 min-h-[100px] flex items-center">
              <p className="text-[#334155] text-sm md:text-[14.5px] leading-relaxed font-medium">
                {data.reason || "Analyzing pond telemetry and constructing natural language explanation..."}
              </p>
            </div>
          </div>

          <div className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 justify-end">
            <Activity className="w-3.5 h-3.5 text-slate-350" />
            <span>Telemetry Synced Live via Fast API</span>
          </div>
        </div>

      </div>

      {/* Actuators Control & Relay Status */}
      <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Cpu className="w-4 h-4 text-slate-450" />
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Actuator Automation Relays</h4>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {ACTUATORS.map(({ key, label, icon: Icon }) => {
            const val = data[key];
            const isOn = val === "ON";
            return (
              <div 
                key={key} 
                className={`rounded-2xl p-4 border transition-all duration-300 ${
                  isOn 
                    ? "bg-green-550/5 border-green-500/25 shadow-sm" 
                    : "bg-slate-50/50 border-slate-100"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${isOn ? "bg-green-100" : "bg-slate-100"}`}>
                    <Icon size={16} className={isOn ? "text-green-600 animate-spin-slow" : "text-slate-400"} />
                  </div>
                  <span className={`w-2 h-2 rounded-full ${isOn ? "bg-green-500 animate-ping" : "bg-slate-300"}`} />
                </div>
                
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <span className={`text-xs font-black uppercase ${isOn ? "text-green-700" : "text-slate-500"}`}>
                  {val || "OFF"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}