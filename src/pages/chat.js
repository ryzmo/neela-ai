import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import useAquaAgent from "../hooks/useAquaAgent";
import {
  BrainCircuit,
  Sparkles,
  Send,
  Cpu,
  Thermometer,
  Droplets,
  FlaskConical,
  Waves,
  Activity,
  Bot,
  User
} from "lucide-react";

export default function ChatPage() {
  const { data } = useAquaAgent();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize welcome message when telemetry is loaded
  useEffect(() => {
    if (data && data.sensor_data && messages.length === 0) {
      const temp = data.sensor_data.temperature || "-";
      const do_val = data.sensor_data.do || "-";
      const ph = data.sensor_data.ph || "-";
      const health = data.health_status || "Stable";

      setTimeout(() => {
        setMessages([
          {
            id: "welcome",
            sender: "ai",
            content: `Halo! Saya adalah **NEELA AI**, asisten keputusan tambak Anda.
          
Saya telah menganalisis kondisi kolam Anda saat ini:
- **Status Kesehatan**: ${health}
- **Suhu**: ${temp}°C
- **Kadar Oksigen (DO)**: ${do_val} mg/L
- **Tingkat pH**: ${ph}

Silakan ajukan pertanyaan atau konsultasikan langkah mitigasi yang optimal untuk kualitas air kolam ikan Anda hari ini.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 0);
    }
  }, [data, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: data
        })
      });

      const payload = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          content: payload.reply || "Maaf, terjadi kesalahan koneksi.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          content: "Maaf, sistem tidak dapat memproses pertanyaan Anda saat ini.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="md:flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50">
        
        {/* Chat Header */}
        <header className="bg-white border-b border-slate-100 p-6 shadow-sm flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-blue-50">
                  <BrainCircuit className="w-6 h-6 text-[#1a6fc4] animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-wide uppercase flex items-center gap-1.5">
                    <span>Neela AI Chat Assistant</span>
                    <Sparkles className="w-4 h-4 text-emerald-500 animate-bounce" />
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

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((m) => {
              const isAI = m.sender === "ai";
              return (
                <div 
                  key={m.id} 
                  className={`flex gap-3.5 ${isAI ? "justify-start" : "justify-end"}`}
                >
                  {isAI && (
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#1a6fc4] to-[#1e9bd4] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div className={`max-w-[75%] rounded-3xl p-5 shadow-sm border relative ${
                    isAI 
                      ? "bg-white border-slate-100 text-slate-800 rounded-tl-none" 
                      : "bg-[#1a6fc4] border-[#1a6fc4]/20 text-white rounded-tr-none shadow-blue-500/5"
                  }`}>
                    {/* Render text content */}
                    <div className="text-[13.5px] leading-relaxed whitespace-pre-wrap font-medium">
                      {m.content}
                    </div>
                    
                    <span className={`text-[9px] font-bold block text-right mt-2 ${
                      isAI ? "text-slate-400" : "text-white/60"
                    }`}>
                      {m.timestamp}
                    </span>
                  </div>

                  {!isAI && (
                    <div className="w-9 h-9 rounded-2xl bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex gap-3.5 justify-start">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#1a6fc4] to-[#1e9bd4] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-white border border-slate-100 rounded-3xl rounded-tl-none p-5 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-350 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-slate-350 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-slate-350 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Panel */}
        <footer className="bg-white border-t border-slate-100 p-6 flex-shrink-0">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-3">
            <input
              type="text"
              placeholder="Tanyakan rekomendasi, status pH kolam, atau kondisi aerator..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-[#f8fafc] border border-slate-250 rounded-2xl py-4 px-6 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-[#1a6fc4] focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-800"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-4 rounded-2xl bg-gradient-to-r from-[#1a6fc4] to-[#1e9bd4] text-white hover:brightness-110 shadow-lg shadow-blue-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </footer>

      </main>
    </div>
  );
}
