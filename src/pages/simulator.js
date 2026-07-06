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
    temperature: 28,
    ph: 7.2,
    turbidity: 8,
    water_level: 17,
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
      showToast("Data sensor kolam nila berhasil dikirim ke AI Engine!", "success");
      console.log(response.data);
    } catch (err) {
      showToast("Gagal terhubung ke Server AI. Pastikan backend Anda aktif.", "error");
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
      min: 20,
      max: 40,
      step: 0.01,
      description: "Optimal: 25-30°C. Temperature stress reduces oxygen solubility."
    },
    {
      key: "ph",
      label: "pH level",
      unit: "",
      icon: FlaskConical,
      iconColor: "text-teal-650 bg-teal-50 border-teal-100",
      min: 4,
      max: 10,
      step: 0.01,
      description: "Optimal: 6.5-8.0. Extremes degrade mucus coats and cause stress."
    },
    {
      key: "turbidity",
      label: "Water Turbidity",
      unit: "NTU",
      icon: Waves,
      iconColor: "text-blue-600 bg-blue-50 border-blue-100",
      min: 0,
      max: 50,
      step: 0.1,
      description: "Optimal: <15 NTU. Organic loads clog tilapia gills."
    },
    {
      key: "water_level",
      label: "Water Level",
      unit: "cm",
      icon: Droplets,
      iconColor: "text-cyan-600 bg-cyan-50 border-cyan-100",
      min: 0,
      max: 25,
      step: 1,
      description: "Optimal: 20 cm height. Critical limits trigger water relays."
    },
    {
      key: "hour",
      label: "Simulation hour",
      unit: "h",
      icon: Clock,
      iconColor: "text-indigo-650 bg-indigo-50 border-indigo-100",
      min: 0,
      max: 23,
      step: 1,
      description: "Diurnal cycles dictate biological oxygen consumption rates."
    }
  ];

  const SCENARIOS = [
    {
      title: "Normal Morning",
      description: "Typical stable parameters in early morning hours. Water conditions are clean.",
      values: { temperature: 27.18, ph: 7.91, turbidity: 3.25, water_level: 20, hour: 6 },
      theme: {
        border: "border-emerald-200 hover:border-emerald-400 bg-emerald-50/20",
        badge: "bg-emerald-100 text-emerald-800 border-emerald-200/50",
        label: "Stable Morning"
      }
    },
    {
      title: "Low Water Level",
      description: "Simulates dry seasons and high evaporation. Increased risk of thermal stress.",
      values: { temperature: 28, ph: 7.3, turbidity: 3, water_level: 5, hour: 14 },
      theme: {
        border: "border-cyan-200 hover:border-cyan-400 bg-cyan-50/20",
        badge: "bg-cyan-100 text-cyan-800 border-cyan-200/50",
        label: "Water Warning"
      }
    },
    {
      title: "Thermal Stress",
      description: "Peak solar radiation raising pond temperature above the critical 30°C limit.",
      values: { temperature: 28.35, ph: 8.00, turbidity: 2.79, water_level: 18, hour: 15 },
      theme: {
        border: "border-orange-200 hover:border-orange-400 bg-orange-50/20",
        badge: "bg-orange-100 text-orange-850 border-orange-200/50",
        label: "Heat Stress"
      }
    },
    {
      title: "Critical Emergency",
      description: "Acidic runoff, severe water level drop, and high solids contamination.",
      values: { temperature: 33.00, ph: 5.80, turbidity: 30.00, water_level: 2, hour: 14 },
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

        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 shadow-sm">
                  <Radio className="w-6 h-6 text-[#1a6fc4] animate-pulse" />
                </div>
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
                        <span>pH: {sc.values.ph}</span>
                        <span>DO: {sc.values.turbidity} NTU</span>
                        <span>Level: {sc.values.water_level}cm</span>
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