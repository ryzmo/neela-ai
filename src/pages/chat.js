import Link from "next/link";
import Sidebar from "../components/Sidebar";
import useAquaAgent from "../hooks/useAquaAgent";
import {
  BrainCircuit,
  Sparkles,
  Cpu,
  Thermometer,
  Droplets,
  FlaskConical,
  Waves,
  Activity,
  MessageSquare,
  Lock,
  LayoutDashboard,
  ArrowRight
} from "lucide-react";

export default function ChatPage() {
  const { data } = useAquaAgent();

  const getStatusColor = (status) => {
    if (!status) return "text-slate-450";
    const s = status.toLowerCase();
    if (s.includes("good") || s.includes("healthy") || s.includes("normal") || s.includes("stable"))
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (s.includes("warn") || s.includes("moderate"))
      return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-rose-500 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <div className="md:flex">
        <Sidebar />

        <main className="flex-1 min-w-0 flex flex-col min-h-screen bg-slate-50/50">
          
          {/* Chat Header */}
          <header className="bg-white border-b border-slate-100 p-6 shadow-sm flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-wide uppercase flex items-center gap-1.5">
                      <span>Neela AI Chat Assistant</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Decision Support & Explainability Agent</p>
                  </div>
                </div>
              </div>

              {/* Context Status pill */}
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pond Health:</span>
                <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusColor(data.health_status)}`}>
                  {data.health_status && data.health_status !== "-" ? data.health_status : "STABLE"}
                </div>
              </div>
            </div>

            {/* Real-time Telemetry Context Bar */}
            <div className="mt-4 p-3 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-center justify-between flex-wrap gap-4 text-[10px] font-bold text-slate-500 tracking-wide uppercase">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span className="text-slate-400">Telemetry Context Loaded:</span>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                  <span>Suhu: {data.sensor_data?.temperature}°C</span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                  <span>DO: {data.sensor_data?.do} mg/L</span>
                </div>
                <div className="flex items-center gap-1">
                  <FlaskConical className="w-3.5 h-3.5 text-teal-500" />
                  <span>pH: {data.sensor_data?.ph}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Waves className="w-3.5 h-3.5 text-blue-500" />
                  <span>Kekeruhan: {data.sensor_data?.turbidity} NTU</span>
                </div>
              </div>
            </div>
          </header>

          {/* Feature Not Available Body */}
          <div className="flex-1 p-6 py-12 md:py-16 flex flex-col items-center justify-center bg-gradient-to-b from-slate-50/50 via-blue-50/20 to-sky-50/30">
            <div className="max-w-2xl w-full text-center space-y-8 p-8 md:p-10 rounded-3xl bg-white border border-slate-100 shadow-2xl relative overflow-hidden">
              {/* Ambient Background Glow */}
              <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

              {/* Glowing Icon Container */}
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#1a6fc4] to-[#1e9bd4] opacity-20 blur-lg animate-pulse" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[#1a6fc4]/10 to-[#1e9bd4]/10 border border-blue-200/50 flex items-center justify-center text-[#1a6fc4]">
                  <MessageSquare className="w-10 h-10" />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-amber-500 border-2 border-white text-white flex items-center justify-center shadow-md">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Content Text */}
              <div className="space-y-4 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span>Fokus Pengembangan MVP</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
                  Fitur Belum Tersedia
                </h2>
                <p className="text-slate-500 font-medium text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                  Asisten Neela AI Chat saat ini ditutup sementara. Kami sedang memfokuskan pengembangan pada modul utama (MVP) untuk memastikan kestabilan pemantauan tambak dan otomatisasi kontrol perangkat.
                </p>
              </div>

              {/* MVP Core Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto relative z-10 text-left">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 hover:border-blue-100 transition-all hover:bg-blue-50/10">
                  <div className="p-2 rounded-xl bg-blue-50 text-[#1a6fc4]">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Monitoring Telemetri</h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Pemantauan kualitas air kolam secara real-time melalui dashboard.</p>
                  </div>
                </div>
                
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 hover:border-blue-100 transition-all hover:bg-blue-50/10">
                  <div className="p-2 rounded-xl bg-cyan-50 text-[#1e9bd4]">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Otomasi Kontrol</h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Kontrol aerator, auto-feeder, dan sirkulasi air kolam.</p>
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <div className="relative z-10 pt-2">
                <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#1a6fc4] to-[#1e9bd4] text-white hover:brightness-110 shadow-lg shadow-blue-500/20 font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Kembali ke Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
