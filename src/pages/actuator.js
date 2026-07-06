import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  Wind,
  Utensils,
  RefreshCw,
  Beaker,
  BellRing,
  Cpu,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Hourglass,
  Save,
  Power,
  Lock,
  Unlock
} from "lucide-react";

export default function ActuatorPage() {
  const API_URL = "http://localhost:8000/actuator";

  const [mode, setMode] = useState("AUTONOMOUS");
  const [actuator, setActuator] = useState({
    aerator: false,
    feeder: false,
    pump: false,
    stabilizer: false,
    buzzer: false
  });

  const [feedingSchedule, setFeedingSchedule] = useState({
    interval: 6,
    feedingTime: "08:00"
  });

  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  function showToast(message, type = "success") {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4000);
  }

  // ============================
  // LOAD DATA DARI BACKEND
  // ============================
  async function loadActuator() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      setMode(data.mode);
      setActuator({
        aerator: data.aerator === "ON" || data.aerator === true,
        feeder: data.feeder === "ON" || data.feeder === true,
        pump: data.pump === "ON" || data.pump === true || data.water_circulation === "ON" || data.water_circulation === true,
        stabilizer: data.stabilizer === "ON" || data.stabilizer === true || data.ph_neutralizer === "ON" || data.ph_neutralizer === true,
        buzzer: data.buzzer === "ON" || data.buzzer === true
      });
    } catch (err) {
      console.log("Error loading actuator states, fallback to defaults.", err);
    }
  }

  async function loadFeedingSchedule() {

  try {

    const response =
      await fetch(
        "http://localhost:8000/feeding-schedule"
      );

    const data =
      await response.json();

    setFeedingSchedule({
      interval: data.interval,
      feedingTime: data.feedingTime
    });

  }

  catch (err) {

    console.log(
      "Schedule Error:",
      err
    );

  }

}

  useEffect(() => {
    setTimeout(() => {
      loadActuator();
      loadFeedingSchedule();
    }, 0);
  }, []);

  // ============================
  // KIRIM KE FASTAPI
  // ============================
  async function sendActuator(dataToSend) {
    try {
      // Map true/false values to "ON"/"OFF" string formats that the FastAPI backend expects
      const payload = {
        mode: dataToSend.mode,
        aerator: dataToSend.aerator ? "ON" : "OFF",
        feeder: dataToSend.feeder ? "ON" : "OFF",
        pump: dataToSend.pump ? "ON" : "OFF",
        stabilizer: dataToSend.stabilizer ? "ON" : "OFF",
        buzzer: dataToSend.buzzer ? "ON" : "OFF"
      };

      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.log("Error updating actuator states in backend:", err);
    }
  }

  // ============================
  // GANTI MODE
  // ============================
  async function changeMode(newMode) {
    setMode(newMode);
    showToast(`Mode operasi berhasil diubah ke ${newMode === "AUTONOMOUS" ? "Otomatis (AI)" : "Manual Override"}!`, "success");
    await sendActuator({
      mode: newMode,
      ...actuator
    });
  }

  // ============================
  // TOGGLE ACTUATOR
  // ============================
  async function toggleActuator(name) {
    if (mode !== "MANUAL") {
      showToast("Ubah ke Mode Manual terlebih dahulu untuk mengontrol actuator secara langsung!", "warning");
      return;
    }

    const newValue = !actuator[name];
    const updated = {
      ...actuator,
      [name]: newValue
    };

    setActuator(updated);
    showToast(`Actuator ${name.toUpperCase()} berhasil diubah menjadi ${newValue ? "ON" : "OFF"}.`, "success");

    await sendActuator({
      mode,
      ...updated
    });

    // khusus feeder
    if (name === "feeder" && newValue) {
      setTimeout(async () => {
        const reset = {
          ...updated,
          feeder: false
        };

        setActuator(reset);
        showToast("Proses pemberian pakan selesai, katup auto-feeder ditutup kembali.", "success");

        await sendActuator({
          mode,
          ...reset
        });
      }, 4000);
    }
  }

  const handleSaveSchedule = async (e) => {

  e.preventDefault();

  try {

    await fetch(
      "http://localhost:8000/feeding-schedule",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          feedingTime: feedingSchedule.feedingTime,
          interval: feedingSchedule.interval,
          enabled: true
        })
      }
    );

    showToast(
      "Feeding schedule saved successfully!",
      "success"
    );

  }

  catch {

    showToast(
      "Failed to save feeding schedule.",
      "warning"
    );

  }

};

  const actuatorList = [
    { key: "aerator", label: "Pond Aerator", description: "Pumps oxygen into water.", icon: Wind, iconColor: "text-blue-600 bg-blue-50 border-blue-100" },
    { key: "feeder", label: "Auto Feeder", description: "Dispenses tilapia pellets.", icon: Utensils, iconColor: "text-amber-600 bg-amber-50 border-amber-100" },
    { key: "pump", label: "Circulation Pump", description: "Filters turbidity & heat.", icon: RefreshCw, iconColor: "text-cyan-600 bg-cyan-50 border-cyan-100" },
    { key: "stabilizer", label: "pH Stabilizer", description: "Dispenses pH balancing buffers.", icon: Beaker, iconColor: "text-teal-650 bg-teal-50 border-teal-100" },
    { key: "buzzer", label: "Alarm Buzzer", description: "Warning audio for risk anomalies.", icon: BellRing, iconColor: "text-rose-600 bg-rose-50 border-rose-100" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative">
      
      {/* Toast Notifications */}
      {toast.visible && (
        <div className={`fixed top-6 right-6 z-50 rounded-2xl border p-4 shadow-2xl flex items-center gap-3 transition-all duration-300 ${
          toast.type === "success" 
            ? "bg-emerald-50 border-emerald-250 text-emerald-800" 
            : "bg-amber-50 border-amber-250 text-amber-800"
        }`}>
          {toast.type === "success" 
            ? <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-pulse" /> 
            : <AlertTriangle className="w-5 h-5 text-amber-600 animate-bounce" />
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
                  <Power className="w-6 h-6 text-[#1a6fc4] animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-wide uppercase">
                    Actuator Control Center
                  </h1>
                  <p className="text-xs font-bold text-slate-450 uppercase tracking-widest mt-0.5">
                    Physical automation relays & override panel
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${mode === "AUTONOMOUS" ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-ping"}`} />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                System Mode: {mode}
              </span>
            </div>
          </div>

          {/* Operating Mode Selector */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 mb-8">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide mb-6">
              Relay Operation Mode
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Autonomous Mode Option */}
              <button
                onClick={() => changeMode("AUTONOMOUS")}
                className={`p-6 rounded-2xl border text-left transition-all duration-300 hover:scale-[1.01] hover:shadow-md cursor-pointer flex items-start gap-4 ${
                  mode === "AUTONOMOUS"
                    ? "bg-emerald-500/5 border-emerald-500/30 shadow-lg shadow-emerald-500/5"
                    : "bg-slate-50/50 border-slate-150"
                }`}
              >
                <div className={`p-3 rounded-xl border ${
                  mode === "AUTONOMOUS" ? "bg-emerald-100 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-450"
                }`}>
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black text-xs uppercase tracking-wide ${mode === "AUTONOMOUS" ? "text-emerald-800" : "text-slate-800"}`}>
                      Autonomous Control (AI)
                    </h3>
                    {mode === "AUTONOMOUS" && (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-200/50 text-[8.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed text-slate-500 mt-2">
                    The Random Forest classifier automatically determines and triggers relays based on real-time sensor streams.
                  </p>
                </div>
              </button>

              {/* Manual Override Option */}
              <button
                onClick={() => changeMode("MANUAL")}
                className={`p-6 rounded-2xl border text-left transition-all duration-300 hover:scale-[1.01] hover:shadow-md cursor-pointer flex items-start gap-4 ${
                  mode === "MANUAL"
                    ? "bg-amber-500/5 border-amber-500/30 shadow-lg shadow-amber-500/5"
                    : "bg-slate-50/50 border-slate-150"
                }`}
              >
                <div className={`p-3 rounded-xl border ${
                  mode === "MANUAL" ? "bg-amber-100 border-amber-200 text-amber-700" : "bg-white border-slate-200 text-slate-450"
                }`}>
                  <Sliders className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black text-xs uppercase tracking-wide ${mode === "MANUAL" ? "text-amber-800" : "text-slate-800"}`}>
                      Manual Override Mode
                    </h3>
                    {mode === "MANUAL" && (
                      <span className="bg-amber-100 text-amber-800 border border-amber-200/50 text-[8.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed text-slate-500 mt-2">
                    Bypasses AI decision loop. Grants complete manual remote control over all pond actuators & relays.
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Actuator Relay Switches Grid (8 Columns) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
                <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                    Automation Relays Panel
                  </h2>
                  <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest">
                    Status: {mode === "MANUAL" ? "Manual Enabled" : "Read-Only (AI Controlled)"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {actuatorList.map((item) => {
                    const isOn = actuator[item.key];
                    const isDisabled = mode === "AUTONOMOUS";
                    return (
                      <div
                        key={item.key}
                        onClick={() => toggleActuator(item.key)}
                        className={`p-5 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between hover:shadow-md ${
                          isOn
                            ? "bg-green-500/5 border-green-500/35 shadow-lg shadow-green-500/5"
                            : "bg-white border-slate-150"
                        } ${isDisabled ? "cursor-not-allowed hover:scale-100" : "cursor-pointer hover:scale-[1.01]"}`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-4 mb-4">
                            <div className={`p-2.5 rounded-xl border ${item.iconColor}`}>
                              <item.icon className={`w-5 h-5 ${isOn ? "animate-spin-slow" : ""}`} />
                            </div>
                            
                            {/* State Badge */}
                            <div className="flex items-center gap-1.5">
                              {isDisabled ? (
                                <span className="flex items-center gap-0.5 text-[8.5px] font-black text-slate-450 uppercase tracking-wider bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                                  <Lock className="w-2.5 h-2.5" />
                                  Auto
                                </span>
                              ) : (
                                <span className="flex items-center gap-0.5 text-[8.5px] font-black text-[#1a6fc4] uppercase tracking-wider bg-blue-50 border border-blue-200/50 px-2 py-0.5 rounded-full">
                                  <Unlock className="w-2.5 h-2.5" />
                                  Manual
                                </span>
                              )}
                            </div>
                          </div>

                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-1">
                            {item.label}
                          </h3>
                          <p className="text-[10px] font-medium leading-relaxed text-slate-500">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className={`text-xs font-black uppercase ${isOn ? "text-green-700" : "text-slate-450"}`}>
                            {isOn ? "ACTIVE (ON)" : "INACTIVE (OFF)"}
                          </span>
                          
                          {/* iOS Style Switch Toggler */}
                          <div 
                            className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                              isOn ? "bg-green-500" : "bg-slate-200"
                            } ${isDisabled ? "opacity-45" : ""}`}
                          >
                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                              isOn ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Feeding Schedule Settings (4 Columns) */}
            <div className="lg:col-span-4 space-y-6">
              <form onSubmit={handleSaveSchedule} className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <Clock className="w-5 h-5 text-[#1a6fc4]" />
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                    Feeding Schedule
                  </h2>
                </div>

                <div className="space-y-5 mb-8">
                  {/* Interval input */}
                  <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-150">
                    <label className="flex items-center gap-1 text-[10px] font-black text-slate-450 uppercase tracking-wider mb-2">
                      <Hourglass className="w-3.5 h-3.5" />
                      Feed Interval (Hours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={feedingSchedule.interval}
                      onChange={(e) =>
                        setFeedingSchedule((prev) => ({
                          ...prev,
                          interval: Number(e.target.value)
                        }))
                      }
                      className="w-full bg-white border border-slate-250 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-[#1a6fc4] transition-all text-slate-800"
                    />
                  </div>

                  {/* Feed time input */}
                  <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-150">
                    <label className="flex items-center gap-1 text-[10px] font-black text-slate-450 uppercase tracking-wider mb-2">
                      <Clock className="w-3.5 h-3.5" />
                      Starting Feeding Time
                    </label>
                    <input
                      type="time"
                      value={feedingSchedule.feedingTime}
                      onChange={(e) =>
                        setFeedingSchedule((prev) => ({
                          ...prev,
                          feedingTime: e.target.value
                        }))
                      }
                      className="w-full bg-white border border-slate-250 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-[#1a6fc4] transition-all text-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#1a6fc4] to-[#1e9bd4] hover:brightness-110 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-2xl shadow-lg shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Schedule</span>
                </button>
              </form>

              {/* Status Info Panel */}
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 text-center">
                <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider mb-2">
                  Override Status Indicator
                </h3>
                <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide border shadow-sm ${
                  mode === "MANUAL" 
                    ? "bg-amber-100 border-amber-250 text-amber-800 shadow-amber-200/20" 
                    : "bg-emerald-100 border-emerald-250 text-emerald-800 shadow-emerald-200/20"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${mode === "MANUAL" ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
                  <span>{mode === "MANUAL" ? "Manual Override Active" : "AI Managed Loop"}</span>
                </div>
                <p className="text-[10px] font-medium leading-relaxed text-slate-500 mt-4 max-w-[220px] mx-auto">
                  {mode === "MANUAL" 
                    ? "Careful: AI safety overrides are paused. Ensure you verify DO levels before leaving." 
                    : "System safety is active. The AI will spin up relays when anomaly flags are raised."}
                </p>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}