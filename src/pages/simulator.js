import { useState } from "react";
import API from "../lib/api";
import Sidebar from "../components/Sidebar";
import {
  Radio,
  Send,
  Thermometer,
  Droplets,
  FlaskConical,
  Waves,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Zap,
  BookOpen
} from "lucide-react";

export default function Simulator() {
  const [sensor, setSensor] = useState({
    temperature: 27.5,
    do: 6.2,
    ph: 7.6,
    turbidity: 8.5,
    water_level: 75,
    hour: 14,
    source: "simulator"
  });

  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const [sending, setSending] = useState(false);

  function showToast(message, type = "success") {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4000);
  }

  async function sendData() {
    setSending(true);
    try {
      const response = await API.post("/analyze", sensor);
      showToast("Data sensor kolam nila berhasil dikirim ke AI Engine v4_v3!", "success");
      console.log(response.data);
    } catch (err) {
      showToast("Gagal terhubung ke Server AI. Pastikan backend v4_v3 Anda aktif.", "error");
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  const fields = [
    {
      key: "temperature",
      label: "Water Temperature",
      unit: "°C",
      icon: Thermometer,
      iconColor: "text-amber-600 bg-amber-50 border-amber-100",
      min: 15,
      max: 40,
      step: 0.01,
      description: "Optimal: 25.0–32.0°C (El-Sayed 1999, FAO 2023). Heat stress (>32°C) reduces oxygen solubility."
    },
    {
      key: "do",
      label: "Dissolved Oxygen (DO)",
      unit: "mg/L",
      icon: Droplets,
      iconColor: "text-sky-600 bg-sky-50 border-sky-100",
      min: 0,
      max: 12,
      step: 0.1,
      description: "Optimal: ≥5.0 mg/L (Pedrazzani 2020). Oxygen drops (<5.0 mg/L) induce respiratory distress."
    },
    {
      key: "ph",
      label: "pH Level",
      unit: "",
      icon: FlaskConical,
      iconColor: "text-teal-600 bg-teal-50 border-teal-100",
      min: 4,
      max: 10,
      step: 0.01,
      description: "Optimal: 7.0–8.0 (Lemos 2018, Mengistu 2020). Extremes (<7.0 or >8.0) impair tilapia growth & immunity."
    },
    {
      key: "turbidity",
      label: "Water Turbidity",
      unit: "NTU",
      icon: Waves,
      iconColor: "text-blue-600 bg-blue-50 border-blue-100",
      min: 0,
      max: 60,
      step: 0.1,
      description: "Optimal: ≤25.0 NTU. High suspended solids clog tilapia gills and cause respiratory distress."
    },
    {
      key: "water_level",
      label: "Water Level",
      unit: "%",
      icon: Droplets,
      iconColor: "text-cyan-600 bg-cyan-50 border-cyan-100",
      min: 0,
      max: 100,
      step: 1,
      description: "Optimal: 60–80% (Ketinggian optimal kolam ~5-6 cm). Nilai kritis (>85% atau <30%) memicu intervensi."
    },
    {
      key: "hour",
      label: "Simulation Hour",
      unit: "h",
      icon: Clock,
      iconColor: "text-indigo-600 bg-indigo-50 border-indigo-100",
      min: 0,
      max: 23,
      step: 1,
      description: "Diurnal cycles dictate photosynthetic oxygen production and metabolic rates."
    }
  ];

  const SCENARIOS = [
    {
      title: "Normal Morning",
      description: "Typical stable parameters in early morning hours. Clean water with optimal temperature, DO, and pH.",
      values: { temperature: 27.18, do: 6.5, ph: 7.91, turbidity: 3.25, water_level: 80, hour: 6 },
      theme: {
        border: "border-emerald-200 hover:border-emerald-400 bg-emerald-50/20",
        badge: "bg-emerald-100 text-emerald-800 border-emerald-200/50",
        label: "Stable Morning"
      }
    },
    {
      title: "Normal Afternoon",
      description: "Stable mid-day telemetry. Optimal temperature and DO levels under moderate sunlight.",
      values: { temperature: 29.50, do: 5.80, ph: 7.60, turbidity: 8.20, water_level: 75, hour: 13 },
      theme: {
        border: "border-blue-200 hover:border-blue-400 bg-blue-50/20",
        badge: "bg-blue-100 text-blue-800 border-blue-200/50",
        label: "Stable Afternoon"
      }
    },
    {
      title: "Thermal Stress (>32°C)",
      description: "Peak solar radiation raising water temperature above the critical 32°C optimal threshold.",
      values: { temperature: 34.80, do: 4.50, ph: 8.35, turbidity: 18.0, water_level: 70, hour: 14 },
      theme: {
        border: "border-orange-200 hover:border-orange-400 bg-orange-50/20",
        badge: "bg-orange-100 text-orange-850 border-orange-200/50",
        label: "Heat Stress"
      }
    },
    {
      title: "Hypoxia / DO Drop",
      description: "Critical oxygen depletion below 5.0 mg/L during early dawn due to respiration.",
      values: { temperature: 28.50, do: 2.80, ph: 7.30, turbidity: 10.0, water_level: 75, hour: 4 },
      theme: {
        border: "border-amber-200 hover:border-amber-400 bg-amber-50/20",
        badge: "bg-amber-100 text-amber-800 border-amber-200/50",
        label: "Low Oxygen"
      }
    },
    {
      title: "High Turbidity / Bloom",
      description: "Algal bloom or sediment suspension elevating turbidity beyond standard 25.0 NTU limit.",
      values: { temperature: 29.00, do: 4.20, ph: 8.50, turbidity: 38.5, water_level: 70, hour: 16 },
      theme: {
        border: "border-purple-200 hover:border-purple-400 bg-purple-50/20",
        badge: "bg-purple-100 text-purple-800 border-purple-200/50",
        label: "High Turbidity"
      }
    },
    {
      title: "Critical Emergency",
      description: "Acidic runoff, severe water level drop, thermal stress, DO drop, and heavy turbidity.",
      values: { temperature: 33.00, do: 3.40, ph: 5.80, turbidity: 45.0, water_level: 15, hour: 15 },
      theme: {
        border: "border-rose-200 hover:border-rose-450 bg-rose-50/20",
        badge: "bg-rose-100 text-rose-800 border-rose-200/50",
        label: "Severe Emergency"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative">
      
      {/* Premium Toast Container */}
      {toast.visible && (
        <div className={`fixed top-6 right-6 z-50 rounded-2xl border p-4 shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 scale-100 ${
          toast.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          {toast.type === "success" 
            ? <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-pulse" /> 
            : <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
          }
          <span className="text-xs font-black tracking-wide uppercase">{toast.message}</span>
        </div>
      )}

      <div className="md:flex">
        <Sidebar />

        <main className="flex-1 min-w-0 p-6 md:p-10 max-w-7xl mx-auto w-full">
          
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-wide uppercase">
                    IoT Device Simulator
                  </h1>
                  <p className="text-xs font-bold text-slate-450 uppercase tracking-widest mt-0.5">
                    Aquaculture telemetry control console
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5 self-start sm:self-center">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Simulator Ready</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Sensor Configuration (8 columns) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
                <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                    Live Telemetry Controls
                  </h2>
                  <span className="text-[9px] font-black text-[#1a6fc4] bg-blue-100 border border-blue-200/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Fine Tune Mode
                  </span>
                </div>

                <div className="space-y-6">
                  {fields.map((field) => (
                    <div 
                      key={field.key} 
                      className="p-5 rounded-2xl bg-white border border-slate-150 shadow-sm hover:border-[#1a6fc4]/30 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl border ${field.iconColor}`}>
                            <field.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Parameter</span>
                            <span className="text-sm font-black text-slate-800 tracking-wide">{field.label}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 bg-[#f8fafc] border border-slate-200/80 rounded-xl px-3 py-1">
                          <input
                            type="number"
                            value={sensor[field.key]}
                            step={field.step}
                            min={field.min}
                            max={field.max}
                            onChange={(e) => {
                              let val = Number(e.target.value);
                              setSensor((prev) => ({ ...prev, [field.key]: val }));
                            }}
                            className="w-16 bg-transparent text-right text-xs font-black text-slate-800 focus:outline-none"
                          />
                          {field.unit && (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {field.unit}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-1">
                        <input
                          type="range"
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          value={sensor[field.key]}
                          onChange={(e) => {
                            let val = Number(e.target.value);
                            setSensor((prev) => ({ ...prev, [field.key]: val }));
                          }}
                          className="w-full accent-[#1a6fc4] h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                          <span>Min: {field.min}{field.unit}</span>
                          <span>Max: {field.max}{field.unit}</span>
                        </div>
                      </div>

                      <p className="text-[9.5px] font-medium leading-relaxed text-slate-500 italic mt-2 border-t border-slate-100 pt-2">
                        {field.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={sendData}
                    disabled={sending}
                    className="bg-gradient-to-r from-[#1a6fc4] to-[#1e9bd4] hover:brightness-110 text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/10 transition-all cursor-pointer flex items-center gap-2 active:scale-[0.98] disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sending ? "Sending..." : "Transmit Data to AI Engine"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Scenarios (4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-[#1a6fc4]" />
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                    Scenario Presets
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-6">
                  Select a predefined sample condition from tilapia farm water telemetry in Montería, Colombia (2024).
                </p>

                <div className="space-y-4">
                  {SCENARIOS.map((sc, index) => (
                    <button
                      key={index}
                      onClick={() => setSensor({
                          ...sc.values,
                          source: "simulator"
                      })}
                      className={`w-full text-left rounded-2xl border p-4 transition-all duration-300 flex flex-col justify-between hover:scale-[1.01] hover:shadow-md cursor-pointer ${sc.theme.border}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2 w-full">
                        <h3 className="text-xs font-black uppercase text-slate-800 tracking-wide">
                          {sc.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider border ${sc.theme.badge}`}>
                          {sc.theme.label}
                        </span>
                      </div>
                      
                      <p className="text-[10px] font-medium leading-relaxed text-slate-500 mb-3.5">
                        {sc.description}
                      </p>

                      <div className="w-full pt-2.5 border-t border-slate-200/50 flex flex-wrap gap-x-3 gap-y-1.5 text-[8.5px] font-bold text-slate-450 uppercase tracking-wide">
                        <span className="flex items-center gap-0.5">
                          <Zap className="w-3 h-3 text-slate-350" />
                          T: {sc.values.temperature}°C
                        </span>
                        <span>DO: {sc.values.do}mg/L</span>
                        <span>pH: {sc.values.ph}</span>
                        <span>TURB: {sc.values.turbidity} NTU</span>
                        <span>Level: {sc.values.water_level}%</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}