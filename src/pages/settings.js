import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  Sliders,
  Save,
  Cpu,
  Clock,
  Thermometer,
  Droplets,
  FlaskConical,
  Waves,
  CheckCircle2,
  AlertTriangle,
  Activity,
  BellOff,
  Timer,
  Wind,
  Zap,
  ShieldAlert,
  Utensils
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    autoMode: true,
    doThreshold: 5,
    phMin: 6.5,
    phMax: 8.0,
    tempMax: 30,
    turbidityMax: 15,
    waterLevelMax: 85,
    aiEnabled: true,
    iotEnabled: true,
    refreshInterval: 5,
    alertCooldownMinutes: 30,
    alertCooldownSeconds: 0,
    aeratorDuration: 5.0,
    pumpDuration: 0.5,
    stabilizerDuration: 0.5,
    buzzerDuration: 5.0,
    feederDuration: 0.8
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  function showToast(message, type = "success") {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4000);
  }

  async function loadSettings() {
    try {
      const res = await axios.get("http://localhost:8000/settings");
      setSettings((prev) => ({
        ...prev,
        ...res.data
      }));
    } catch (err) {
      console.error("Error loading system settings:", err);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      loadSettings();
    }, 0);
  }, []);

  // === Alert Cooldown Live Status ===
  const [cooldownStatus, setCooldownStatus] = useState({ remaining: 0, active: false, cooldownTotal: 0, lastAlertTime: null });
  const remainingRef = useRef(0);

  useEffect(() => {
    async function fetchCooldownStatus() {
      try {
        const res = await axios.get("http://localhost:8000/alert-cooldown-status");
        setCooldownStatus(res.data);
        remainingRef.current = res.data.remaining;
      } catch (err) {
        // silent
      }
    }
    fetchCooldownStatus();
    const poll = setInterval(fetchCooldownStatus, 5000);
    return () => clearInterval(poll);
  }, []);

  // Local 1-second tick for smooth countdown
  useEffect(() => {
    const tick = setInterval(() => {
      setCooldownStatus((prev) => {
        if (!prev.active || prev.remaining <= 0) return prev;
        const next = Math.max(0, prev.remaining - 1);
        return { ...prev, remaining: next, active: next > 0 };
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  function updateSetting(key, value) {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  }

  async function saveSettings() {
    try {
      setSaving(true);
      await axios.post("http://localhost:8000/settings", settings);
      showToast("Pengaturan sistem berhasil disimpan dan diterapkan!", "success");
    } catch (err) {
      console.error(err);
      showToast("Gagal menyimpan pengaturan ke database.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 relative">
      
      {/* Toast Notifications */}
      {toast.visible && (
        <div className={`fixed top-6 right-6 z-50 rounded-2xl border p-4 shadow-2xl flex items-center gap-3 transition-all duration-300 ${
          toast.type === "success" 
            ? "bg-emerald-50 border-emerald-250 text-emerald-800" 
            : "bg-rose-50 border-rose-250 text-rose-800"
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

        <main className="flex-1 min-w-0 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-wide uppercase">
                    System Settings
                  </h1>
                  <p className="text-xs font-bold text-slate-450 uppercase tracking-widest mt-0.5">
                    Configure thresholds, triggers, and timing variables
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Configuration Sync Active</span>
            </div>
          </div>

          {/* SENSOR THRESHOLD CONFIGURATION */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
            <div className="mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                Sensor Threshold Parameters
              </h2>
              <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest mt-0.5">
                Set baseline boundaries to trigger warning flags and automation relays
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <InputField
                label="Minimum Dissolved O₂"
                value={settings.doThreshold}
                onChange={(v) => updateSetting("doThreshold", v)}
                unit="mg/L"
                icon={Droplets}
                iconColor="text-cyan-600 bg-cyan-50 border-cyan-100"
              />
              <InputField
                label="Maximum Temperature"
                value={settings.tempMax}
                onChange={(v) => updateSetting("tempMax", v)}
                unit="°C"
                icon={Thermometer}
                iconColor="text-amber-600 bg-amber-50 border-amber-100"
              />
              <InputField
                label="Minimum pH Level"
                value={settings.phMin}
                onChange={(v) => updateSetting("phMin", v)}
                unit="pH"
                icon={FlaskConical}
                iconColor="text-teal-650 bg-teal-50 border-teal-100"
              />
              <InputField
                label="Maximum pH Level"
                value={settings.phMax}
                onChange={(v) => updateSetting("phMax", v)}
                unit="pH"
                icon={FlaskConical}
                iconColor="text-teal-650 bg-teal-50 border-teal-100"
              />
              <InputField
                label="Maximum Turbidity"
                value={settings.turbidityMax}
                onChange={(v) => updateSetting("turbidityMax", v)}
                unit="%"
                icon={Waves}
                iconColor="text-purple-600 bg-purple-50 border-purple-100"
              />
              <InputField
                label="Maximum Water Level"
                value={settings.waterLevelMax}
                onChange={(v) => updateSetting("waterLevelMax", v)}
                unit="%"
                icon={Droplets}
                iconColor="text-indigo-600 bg-indigo-50 border-indigo-100"
              />
            </div>
          </div>

          {/* AI SETTINGS & REFRESH CONFIGURATION */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
            <div className="mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                AI & Interval Parameters
              </h2>
              <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest mt-0.5">
                Enable decision model tree logic and configure polling schedules
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* IoT Receiver */}
<div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-150 flex items-center justify-between shadow-sm">

    <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-[#1a6fc4] flex-shrink-0">
            <Activity className="w-6 h-6 animate-pulse" />
        </div>

        <div>
            <h3 className="font-black text-xs uppercase tracking-wide text-slate-800">
                IoT Data Receiver
            </h3>

            <p className="text-[10px] font-medium text-slate-500 leading-relaxed mt-0.5">
                Enable or disable incoming telemetry from ESP32 devices.
            </p>
        </div>
    </div>

    <button
        onClick={() => updateSetting("iotEnabled", !settings.iotEnabled)}
        className={`w-12 h-6 rounded-full transition-all duration-300 relative flex items-center cursor-pointer ${
            settings.iotEnabled
                ? "bg-emerald-500 shadow-lg shadow-emerald-500/20"
                : "bg-slate-300"
        }`}
    >
        <span
            className={`absolute bg-white w-4.5 h-4.5 rounded-full transition-all duration-300 shadow ${
                settings.iotEnabled
                    ? "left-6.5"
                    : "left-1"
            }`}
        />
    </button>

</div>

              {/* Refresh Interval Input */}
              <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-150 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[#1a6fc4] flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-wide text-slate-800">
                      Refresh Interval
                    </h3>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                      Set telemetry pulling intervals in seconds.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    value={settings.refreshInterval}
                    onChange={(e) => updateSetting("refreshInterval", Number(e.target.value))}
                    min={1}
                    max={600}
                    className="w-full bg-white border border-slate-250 rounded-xl py-3 px-4 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#1a6fc4] transition-colors pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9.5px] font-black uppercase text-slate-400">
                    sec
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* ALERT COOLDOWN CONFIGURATION */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
            <div className="mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                Alert Cooldown Configuration
              </h2>
              <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest mt-0.5">
                Minimum interval between repeated alert notifications and buzzer activations when risk persists
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              
              {/* Minutes Input */}
              <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-150 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex-shrink-0">
                    <BellOff className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-wide text-slate-800">
                      Cooldown Minutes
                    </h3>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                      Suppress duplicate alerts for this many minutes.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={settings.alertCooldownMinutes}
                    onChange={(e) => updateSetting("alertCooldownMinutes", Math.max(0, Math.min(1440, Number(e.target.value))))}
                    min={0}
                    max={1440}
                    className="w-full bg-white border border-slate-250 rounded-xl py-3 px-4 text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-400 transition-colors pr-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9.5px] font-black uppercase text-slate-400">
                    min
                  </span>
                </div>
              </div>

              {/* Seconds Input */}
              <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-150 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex-shrink-0">
                    <Timer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-wide text-slate-800">
                      Cooldown Seconds
                    </h3>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                      Additional seconds on top of the minute setting.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={settings.alertCooldownSeconds}
                    onChange={(e) => updateSetting("alertCooldownSeconds", Math.max(0, Math.min(59, Number(e.target.value))))}
                    min={0}
                    max={59}
                    className="w-full bg-white border border-slate-250 rounded-xl py-3 px-4 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-400 transition-colors pr-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9.5px] font-black uppercase text-slate-400">
                    sec
                  </span>
                </div>
              </div>

              {/* Live Countdown */}
              <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-center items-center min-h-[140px] transition-all duration-500 ${
                cooldownStatus.active
                  ? "bg-gradient-to-br from-amber-900 to-amber-950 border-amber-700"
                  : "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700"
              }`}>
                {cooldownStatus.active ? (
                  <>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400 mb-1 animate-pulse">
                      ⏳ Cooldown Active
                    </span>
                    <span className="text-3xl font-black text-white tracking-tight tabular-nums">
                      {Math.floor(cooldownStatus.remaining / 60)}m {cooldownStatus.remaining % 60}s
                    </span>
                    <span className="text-[9px] font-bold text-amber-400/60 uppercase tracking-widest mt-1">
                      Remaining
                    </span>
                    {/* Progress bar */}
                    <div className="w-full mt-3 h-1.5 bg-amber-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${cooldownStatus.cooldownTotal > 0 ? (cooldownStatus.remaining / cooldownStatus.cooldownTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                      {cooldownStatus.lastAlertTime ? "Cooldown Complete" : "Active Cooldown"}
                    </span>
                    <span className="text-3xl font-black text-white tracking-tight">
                      {settings.alertCooldownMinutes}m {settings.alertCooldownSeconds}s
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                      {cooldownStatus.lastAlertTime ? "Ready For Next Alert" : "Between Repeated Alerts"}
                    </span>
                  </>
                )}
              </div>

            </div>
          </div>

          {/* ACTUATOR ACTIVE DURATION CONFIGURATION */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
            <div className="mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                Actuator Active Duration
              </h2>
              <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest mt-0.5">
                Set runtime duration (in seconds) for each hardware actuator during execution
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <InputField
                label="Aerator Relay"
                value={settings.aeratorDuration}
                onChange={(v) => updateSetting("aeratorDuration", v)}
                unit="sec"
                icon={Wind}
                iconColor="text-sky-600 bg-sky-50 border-sky-100"
              />
              <InputField
                label="pH UP Pump"
                value={settings.pumpDuration}
                onChange={(v) => updateSetting("pumpDuration", v)}
                unit="sec"
                icon={Droplets}
                iconColor="text-blue-600 bg-blue-50 border-blue-100"
              />
              <InputField
                label="pH DOWN Pump"
                value={settings.stabilizerDuration}
                onChange={(v) => updateSetting("stabilizerDuration", v)}
                unit="sec"
                icon={FlaskConical}
                iconColor="text-teal-600 bg-teal-50 border-teal-100"
              />
              <InputField
                label="Buzzer Alarm"
                value={settings.buzzerDuration}
                onChange={(v) => updateSetting("buzzerDuration", v)}
                unit="sec"
                icon={ShieldAlert}
                iconColor="text-rose-600 bg-rose-50 border-rose-100"
              />
              <InputField
                label="Servo Feeder"
                value={settings.feederDuration}
                onChange={(v) => updateSetting("feederDuration", v)}
                unit="sec"
                icon={Utensils}
                iconColor="text-amber-600 bg-amber-50 border-amber-100"
              />
            </div>
          </div>

          {/* SAVE SETTINGS BUTTON */}
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-8 py-4 bg-gradient-to-r from-[#1a6fc4] to-[#1e9bd4] hover:brightness-110 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Save className="w-4.5 h-4.5" />
            <span>{saving ? "Applying settings..." : "Save configurations"}</span>
          </button>

        </main>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, unit, icon: Icon, iconColor }) {
  return (
    <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-150 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 rounded-xl border ${iconColor} flex-shrink-0`}>
            <Icon size={18} />
          </div>
          <h3 className="font-black text-xs uppercase tracking-wide text-slate-800">
            {label}
          </h3>
        </div>
      </div>

      <div className="relative">
        <input
          type="number"
          value={value ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
          step={unit === "pH" || unit === "sec" ? 0.1 : 1}
          min={0}
          className="w-full bg-white border border-slate-250 rounded-xl py-3 px-4 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#1a6fc4] transition-colors pr-14"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9.5px] font-black uppercase text-slate-400">
          {unit}
        </span>
      </div>
    </div>
  );
}