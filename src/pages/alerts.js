import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import useAquaAgent from "../hooks/useAquaAgent";
import {
  Mail,
  Trash2,
  Send,
  Bell,
  ShieldAlert,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  PlusCircle
} from "lucide-react";

export default function AlertsPage() {
  const { data } = useAquaAgent();

  const [newEmail, setNewEmail] = useState("");
  const [emails, setEmails] = useState([]);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  function showToast(message, type = "success") {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4050);
  }

  useEffect(() => {
    const saved = localStorage.getItem("aquaagent_alert_emails");
    let initial = [];
    if (saved) {
      try {
        initial = JSON.parse(saved);
        if (Array.isArray(initial)) setEmails(initial);
      } catch (e) {
        console.error(e);
      }
    }

    fetch("http://127.0.0.1:8000/emails")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Backend offline");
      })
      .then((resData) => {
        if (Array.isArray(resData)) {
          setEmails(resData);
          localStorage.setItem("aquaagent_alert_emails", JSON.stringify(resData));
        }
      })
      .catch((err) => {
        console.log("Using local subscriber list:", err.message);
      });
  }, []);

  const activeAlerts = [
    Number(data.sensor_data?.do) < 5 && {
      title: "Low Dissolved Oxygen",
      severity: "CRITICAL",
      message: `Dissolved Oxygen level is currently ${data.sensor_data?.do} mg/L (Critical Limit: < 5.0 mg/L).`,
    },
    Number(data.sensor_data?.temperature) > 30 && {
      title: "High Temperature",
      severity: "WARNING",
      message: `Water temperature is currently ${data.sensor_data?.temperature}°C (Warning Threshold: > 30.0°C).`,
    },
    (Number(data.sensor_data?.ph) < 6.5 || Number(data.sensor_data?.ph) > 8) && {
      title: "Unstable pH Balance",
      severity: "WARNING",
      message: `pH is currently ${data.sensor_data?.ph} which is outside the safe range of 6.5 - 8.0.`,
    },
    Number(data.sensor_data?.water_level) > 85 && {
      title: "High Water Level",
      severity: "WARNING",
      message: `Water level is currently ${data.sensor_data?.water_level}% (Warning Threshold: > 85%).`,
    },
  ].filter(Boolean);

  async function addEmail() {
    const trimmed = newEmail.trim();
    if (!trimmed) {
      showToast("Harap masukkan alamat email terlebih dahulu!", "warning");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmed)) {
      showToast("Format email tidak valid!", "warning");
      return;
    }

    if (emails.includes(trimmed)) {
      showToast("Email tersebut sudah terdaftar di sistem!", "warning");
      return;
    }

    const updated = [...emails, trimmed];
    setEmails(updated);
    localStorage.setItem("aquaagent_alert_emails", JSON.stringify(updated));
    setNewEmail("");
    showToast("Email penerima notifikasi berhasil didaftarkan!", "success");

    try {
      await fetch("http://127.0.0.1:8000/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: trimmed
        })
      });
    } catch (err) {
      console.log("Saved locally, backend sync failed:", err);
    }
  }

  async function removeEmail(emailToRemove) {
    const updated = emails.filter((e) => e !== emailToRemove);
    setEmails(updated);
    localStorage.setItem("aquaagent_alert_emails", JSON.stringify(updated));
    showToast("Email penerima notifikasi berhasil dihapus.", "success");

    try {
      await fetch(`http://127.0.0.1:8000/emails/${encodeURIComponent(emailToRemove)}`, {
        method: "DELETE"
      });
    } catch (err) {
      console.log("Removed locally, backend sync failed:", err);
    }
  }

  async function sendEmail() {
    if (emails.length === 0) {
      showToast("Harap tambahkan minimal satu email penerima terlebih dahulu!", "warning");
      return;
    }

    try {
      setSending(true);
      const response = await fetch("/api/send-alert-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          emails,
          alerts: activeAlerts,
          sensorData: data?.sensor_data,
          buzzer: data.buzzer
        })
      });

      const result = await response.json();

      if (response.ok) {
        showToast(
          activeAlerts.length > 0
            ? "Email peringatan darurat berhasil dikirim ke semua penerima!"
            : "Email notifikasi status kolam berhasil dikirim!",
          "success"
        );
      } else {
        showToast(result.message || "Gagal mengirim email.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Terjadi kesalahan teknis saat mengirim email.", "error");
    } finally {
      setSending(false);
    }
  }

  function getInitials(email) {
    if (!email) return "U";
    return email.split("@")[0].substring(0, 2).toUpperCase();
  }

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

        <main className="flex-1 min-w-0 p-6 md:p-10 max-w-7xl mx-auto w-full">
          
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-wide uppercase">
                    Alerts & Notifications
                  </h1>
                  <p className="text-xs font-bold text-slate-450 uppercase tracking-widest mt-0.5">
                    Critical threshold monitors & email alert dispatch
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${data?.buzzer === "ON" ? "bg-rose-500 animate-ping" : "bg-emerald-500 animate-pulse"}`} />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Relay Status: {data?.buzzer === "ON" ? "Emergency Alarm Triggered" : "System Secured"}
              </span>
            </div>
          </div>

          {/* CRITICAL EMERGENCY BUZZER BANNER */}
          {data?.buzzer === "ON" && (
            <div className="bg-gradient-to-r from-rose-600 to-red-700 text-white rounded-3xl p-6 md:p-8 mb-8 shadow-xl shadow-rose-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden animate-pulse">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white/10 text-white border border-white/20 flex-shrink-0 animate-bounce">
                  <AlertOctagon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-wider">
                    Emergency Buzzer Activated
                  </h2>
                  <p className="text-xs text-white/80 leading-relaxed font-semibold mt-1">
                    AI models have detected multiple critical water conditions. Actuators have been triggered automatically to save livestock.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Email Notification Form (7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
                
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                      Email Notification Settings
                    </h2>
                    <p className="text-[11px] text-slate-450 uppercase font-bold tracking-widest mt-0.5">
                      Configure automated alerts recipients list
                    </p>
                  </div>
                  <span className="bg-blue-50 text-[#1a6fc4] border border-blue-200/50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {emails.length} Subscribers
                  </span>
                </div>

                {/* Add Email input */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addEmail();
                        }
                      }}
                      placeholder="Enter recipient email (e.g. operator@neela.ai)"
                      className="w-full bg-[#f8fafc] border border-slate-250 rounded-2xl py-4 pl-12 pr-6 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-[#1a6fc4] focus:bg-white transition-all text-slate-800"
                    />
                  </div>
                  <button
                    onClick={addEmail}
                    className="bg-gradient-to-r from-emerald-600 to-teal-650 hover:brightness-110 text-white font-black text-xs uppercase tracking-widest px-8 py-4 sm:py-0 rounded-2xl shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add email</span>
                  </button>
                </div>

                {/* Subscribers List */}
                <div className="space-y-3 mb-8">
                  {emails.length === 0 ? (
                    <div className="text-center py-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                      <Mail className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">No recipients subscribed yet</p>
                      <p className="text-[10px] text-slate-450 mt-1">Add emails above to receive automated farm alerts.</p>
                    </div>
                  ) : (
                    emails.map((email) => (
                      <div
                        key={email}
                        className="flex justify-between items-center border border-slate-150 rounded-2xl p-4 bg-[#f8fafc] hover:bg-white hover:border-[#1a6fc4]/20 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-black text-[#1a6fc4] tracking-wide">
                            {getInitials(email)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800">{email}</span>
                            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block">Subscribed Operator</span>
                          </div>
                        </div>

                        <button
                          onClick={() => removeEmail(email)}
                          className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 hover:text-rose-700 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Dispatch Alert Button */}
                <button
                  onClick={sendEmail}
                  disabled={sending || emails.length === 0}
                  className={`w-full py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                    activeAlerts.length > 0
                      ? "bg-gradient-to-r from-rose-600 to-red-650 shadow-rose-500/10 hover:brightness-110"
                      : "bg-gradient-to-r from-[#1a6fc4] to-[#1e9bd4] shadow-blue-500/10 hover:brightness-110"
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {sending 
                      ? "Dispatching Emails..." 
                      : activeAlerts.length > 0 
                        ? "Broadcast Urgent Alarm Notifs" 
                        : "Send System Status Update"}
                  </span>
                </button>

              </div>
            </div>

            {/* Right Column: Active Alerts Panel (5 Columns) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
                
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                  <ShieldAlert className="w-5 h-5 text-[#1a6fc4]" />
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                      Active Alerts
                    </h2>
                    <p className="text-[11px] text-slate-450 uppercase font-bold tracking-widest mt-0.5">
                      Real-time anomaly evaluation
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {activeAlerts.length === 0 ? (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center shadow-lg shadow-emerald-500/5">
                      <div className="w-12 h-12 bg-emerald-100 border border-emerald-250 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4 animate-pulse">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                      <h3 className="text-xs font-black uppercase text-emerald-800 tracking-wide mb-1">
                        All Parameters Secure
                      </h3>
                      <p className="text-[10px] font-medium leading-relaxed text-slate-500 max-w-[200px] mx-auto">
                        Telemetry parameters are verified stable. No threshold breach events detected.
                      </p>
                    </div>
                  ) : (
                    activeAlerts.map((alert, index) => (
                      <AlertCard key={index} {...alert} />
                    ))
                  )}
                </div>

              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

function AlertCard({ title, severity, message }) {
  const isCritical = severity === "CRITICAL";

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between hover:shadow-md ${
        isCritical
          ? "bg-rose-500/5 border-rose-500/25 shadow-lg shadow-rose-500/5"
          : "bg-amber-500/5 border-amber-500/25 shadow-lg shadow-amber-500/5"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          {isCritical ? (
            <AlertOctagon className="w-4 h-4 text-rose-600 animate-bounce" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          )}
          <h3 className={`text-xs font-black uppercase tracking-wide ${isCritical ? "text-rose-800" : "text-amber-800"}`}>
            {title}
          </h3>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider border ${
          isCritical 
            ? "bg-rose-100 text-rose-850 border-rose-200/50" 
            : "bg-amber-100 text-amber-850 border-amber-200/50"
        }`}>
          {severity}
        </span>
      </div>

      <p className="text-[10.5px] font-medium leading-relaxed text-slate-600">
        {message}
      </p>
    </div>
  );
}