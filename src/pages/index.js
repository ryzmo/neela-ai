import Link from "next/link";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #1a6fc4 0%, #1e9bd4 40%, #5dd3f0 80%, #a8edff 100%)",
      }}
    >
      {/* Sunlight Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-[15%] w-64 h-[140%] bg-white/10 blur-3xl rotate-12" />
        <div className="absolute -top-40 right-[20%] w-52 h-[140%] bg-white/10 blur-3xl -rotate-12" />
      </div>

      {/* Pond Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <pattern
              id="pond-grid"
              width="120"
              height="120"
              patternUnits="userSpaceOnUse"
            >
              <rect
                x="10"
                y="10"
                width="100"
                height="100"
                rx="18"
                fill="none"
                stroke="white"
                strokeWidth="2"
              />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#pond-grid)" />
        </svg>
      </div>

      {/* Bubble Decorations */}
      {[
        "w-20 h-20 top-[8%] left-[5%]",
        "w-12 h-12 top-[15%] right-[8%]",
        "w-28 h-28 bottom-[20%] left-[3%]",
        "w-10 h-10 bottom-[30%] right-[5%]",
        "w-16 h-16 top-[50%] left-[12%]",
        "w-8 h-8 top-[70%] right-[15%]",
        "w-24 h-24 bottom-[10%] right-[25%]",
      ].map((cls, i) => (
        <div
          key={i}
          className={`absolute rounded-full bg-white/10 border border-white/10 animate-[floatBubble_6s_ease-in-out_infinite] ${cls}`}
          style={{
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}

      {/* Swimming Fish Background */}
      {[
        { pos: "top-[22%] left-[8%]", fish: "🐟" },
        { pos: "top-[45%] right-[12%]", fish: "🐠" },
        { pos: "bottom-[30%] left-[15%]", fish: "🐟" },
        { pos: "top-[65%] right-[20%]", fish: "🐡" },
        { pos: "top-[35%] left-[80%]", fish: "🐠" },
      ].map((item, i) => (
        <div
          key={i}
          className={`absolute ${item.pos} text-4xl opacity-20 animate-[swim_18s_linear_infinite]`}
          style={{
            animationDelay: `${i * 3}s`,
          }}
        >
          {item.fish}
        </div>
      ))}

      {/* Seaweed */}
      <div className="absolute bottom-16 left-4 text-7xl opacity-20 select-none">
        🌿🌿🌿
      </div>

      <div className="absolute bottom-20 right-6 text-6xl opacity-20 select-none">
        🌿🌿
      </div>

      <div className="absolute bottom-24 left-[25%] text-5xl opacity-15 select-none">
        🌿
      </div>

      {/* Rocks */}
      <div className="absolute bottom-12 left-[12%] text-4xl opacity-25">
        🪨🪨
      </div>

      <div className="absolute bottom-14 right-[18%] text-5xl opacity-25">
        🪨
      </div>

      {/* Main Content */}
      <div className="text-center text-white max-w-2xl w-full relative z-10">
        {/* Mascot */}
        <div className="flex justify-center items-end gap-6 mb-4">
          <div className="text-3xl animate-bounce">🐟</div>

          <div className="text-5xl animate-[bounce_2.5s_ease-in-out_infinite]">
            🐸
          </div>

          <div
            className="text-3xl animate-bounce"
            style={{ animationDelay: "0.7s" }}
          >
            🐠
          </div>
        </div>

        {/* Badge */}
        <div className="inline-block bg-white/20 backdrop-blur-md border border-white/40 rounded-full px-4 py-1 text-xs font-bold tracking-widest mb-3">
          🌊 Smart Aquaculture Platform
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-7xl font-black tracking-wider drop-shadow-lg mb-2 animate-pulse">
          NEELA AI
        </h1>

        {/* Subtitle */}
        <p className="text-lg font-bold text-white/95 mb-2">
          Autonomous AI Fish Farm Management System 🐟
        </p>

        {/* Description */}
        <p className="text-sm font-semibold text-white/75 leading-relaxed mb-8 max-w-md mx-auto">
          Real-Time Water Quality Monitoring,
          <br />
          Random Forest Prediction,
          <br />
          AI Decision Making &
          <br />
          Autonomous Actuator Control
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            {
              title: "AI",
              label: "Random Forest +\nAI Decision Engine",
            },
            {
              title: "IoT",
              label: "Realtime Sensor\nMonitoring",
            },
            {
              title: "24/7",
              label: "Autonomous Pond\nManagement",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white/20 backdrop-blur-md border border-white/35 rounded-2xl p-4 hover:-translate-y-1 hover:bg-white/30 transition-all cursor-default"
            >
              <div className="text-3xl mb-1">{f.icon}</div>

              <div className="text-xl font-black">{f.title}</div>

              <div className="text-xs font-bold text-white/80 leading-snug whitespace-pre-line">
                {f.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link href="/dashboard">
          <button className="bg-white text-blue-700 font-extrabold text-base px-8 py-3 rounded-full shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all active:scale-95">
            Enter Dashboard →
          </button>
        </Link>

        <p className="mt-6 text-xs font-semibold text-white/50 tracking-wide">
          Smart Aquaculture Platform powered by Artificial
          Intelligence and Internet of Things
        </p>
      </div>

      {/* Wave Layer 1 */}
      <svg
        className="absolute bottom-0 left-0 w-full h-24 opacity-20"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          fill="rgba(255,255,255,0.15)"
          d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,53.3C840,53,960,75,1080,85.3C1200,96,1320,96,1380,96L1440,96L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
        />
      </svg>

      {/* Wave Layer 2 */}
      <svg
        className="absolute bottom-0 left-0 w-full h-20 opacity-30"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          fill="rgba(255,255,255,0.1)"
          d="M0,96L80,85.3C160,75,320,53,480,53.3C640,53,800,75,960,85.3C1120,96,1280,96,1360,90.7L1440,85L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
        />
      </svg>
    </div>
  );
}