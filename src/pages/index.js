"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// CONTENT — every section's real copy lives here, not buried
// in markup. Kept dense on purpose: each card carries a stat,
// a mechanism, and a consequence, not just a label.
// ============================================================

const PIPELINE = [
  {
    step: "01",
    title: "Sense",
    body: "Dissolved oxygen, pH, temperature and ammonia probes log every pond every 5 seconds — 17,280 readings per sensor, per day.",
    detail: "4 sensor types · 5s interval · sealed IP68 housing",
  },
  {
    step: "02",
    title: "Predict",
    body: "A Random Forest of 200 decision trees scores water-quality risk 30–90 minutes ahead, trained on 14 months of pond history.",
    detail: "200 trees · 94.2% validation accuracy",
  },
  {
    step: "03",
    title: "Reason",
    body: "An LLM reasoning layer reads the forecast and writes the decision in plain language — what to change, by how much, and why it matters.",
    detail: "Every decision logged with a written rationale",
  },
  {
    step: "04",
    title: "Act",
    body: "Aerators, dosing pumps and feeders execute within 8 seconds of the decision — no operator has to be awake to approve it.",
    detail: "Avg. response time: 8s · 24/7 unattended",
  },
];

const METRICS = [
  {
    label: "Dissolved Oxygen",
    unit: "mg/L",
    target: 6.8,
    decimals: 1,
    status: "Optimal",
    range: "Safe range: 5.0 – 8.5 mg/L",
    note: "Below 4 mg/L, tilapia stop feeding within the hour.",
  },
  {
    label: "pH Level",
    unit: "",
    target: 7.4,
    decimals: 1,
    status: "Stable",
    range: "Safe range: 6.5 – 8.5",
    note: "Swings of ±1.0 in a day stress gill tissue.",
  },
  {
    label: "Temperature",
    unit: "°C",
    target: 28.3,
    decimals: 1,
    status: "Normal",
    range: "Safe range: 25 – 32 °C",
    note: "Drives oxygen solubility — warmer water holds less.",
  },
  {
    label: "Ammonia (NH₃)",
    unit: "mg/L",
    target: 0.02,
    decimals: 2,
    status: "Safe",
    range: "Safe range: < 0.05 mg/L",
    note: "Builds up fastest after feeding — the metric NEELA watches hardest.",
  },
];

const SENSOR_HARDWARE = [
  {
    title: "DO Probe",
    spec: "Optical, 0–20 mg/L, stainless shell",
    note: "Fluorescence-based, no membrane to foul — reads in 5s and self-calibrates on cap install.",
  },
  {
    title: "pH Module",
    spec: "Glass electrode, RS485/ESP32 interface",
    note: "Calibrated against pH 4 / 7 / 10 buffers every 30 days to hold drift under 0.05.",
  },
  {
    title: "Feeder & Aerator",
    spec: "Programmable dosing, LCD control panel",
    note: "Receives the actuator command directly from the reasoning layer — no manual switch in the loop.",
  },
];

const DEEP_FEATURES = [
  {
    icon: "🌲",
    title: "Random Forest Engine",
    body: "200 trees vote independently on every reading; the majority call becomes the risk score. No single noisy sensor can swing the verdict.",
    bullets: [
      "Trained on 14 months of labeled pond outcomes",
      "Re-trained monthly as new data comes in",
      "94.2% validation accuracy on held-out ponds",
    ],
  },
  {
    icon: "💬",
    title: "LLM Reasoning Core",
    body: "The forest gives a number; the reasoning layer turns it into a sentence a farm manager can act on and a regulator can audit.",
    bullets: [
      '"DO trending down 0.4mg/L/hr — aerator to 80% for 20min"',
      "Every action is logged with the forecast that triggered it",
      "Flags low-confidence calls for human review instead of guessing",
    ],
  },
  {
    icon: "⚙️",
    title: "Autonomous Actuators",
    body: "The loop closes itself end-to-end. Aerators, dosing pumps, and feeders execute without anyone watching a screen at 3am.",
    bullets: [
      "8s average decision-to-action time",
      "Manual override available from any device",
      "Fails safe: defaults to last known-good state on signal loss",
    ],
  },
];

const RF_FEATURE_IMPORTANCE = [
  { name: "Dissolved O₂", value: 34 },
  { name: "Ammonia", value: 27 },
  { name: "Temperature", value: 19 },
  { name: "pH", value: 12 },
  { name: "Turbidity", value: 8 },
];

const TRUST_STATS = [
  { value: "94.2%", label: "Model validation accuracy" },
  { value: "8s", label: "Avg. decision-to-action time" },
  { value: "17,280", label: "Readings per sensor / day" },
  { value: "0", label: "Manual aerator checks needed" },
];

// Ambient creatures, grouped by depth zone — each zone's set fades in and
// STAYS, so the deeper you scroll the more (and the stranger) creatures
// are stacked on screen at once.
const SURFACE_CREATURES = [
  { emoji: "🐟", pos: "top-[18%] left-[10%]", size: "text-6xl", opacity: "opacity-25", anim: "animate-[swim_16s_linear_infinite]", delay: "0s" },
  { emoji: "🐠", pos: "bottom-[16%] right-[8%]", size: "text-6xl", opacity: "opacity-20", anim: "animate-[swim_20s_linear_infinite]", delay: "2s" },
];

const MID_CREATURES = [
  { emoji: "🐬", pos: "top-[14%] right-[10%]", size: "text-7xl", opacity: "opacity-30", anim: "animate-[swim_22s_linear_infinite]", delay: "0s" },
  { emoji: "🐢", pos: "bottom-[20%] left-[8%]", size: "text-6xl", opacity: "opacity-25", anim: "animate-[floatBubble_10s_ease-in-out_infinite]", delay: "1s" },
  { emoji: "🦑", pos: "top-[55%] left-[42%]", size: "text-6xl", opacity: "opacity-20", anim: "animate-[driftSlow_14s_ease-in-out_infinite]", delay: "0.5s" },
];

const TWILIGHT_CREATURES = [
  { emoji: "🦈", pos: "top-[10%] left-[6%]", size: "text-7xl", opacity: "opacity-30", anim: "animate-[swim_24s_linear_infinite]", delay: "0s" },
  { emoji: "🐙", pos: "bottom-[18%] right-[8%]", size: "text-7xl", opacity: "opacity-25", anim: "animate-[driftSlow_16s_ease-in-out_infinite]", delay: "1.2s" },
  { emoji: "🪼", pos: "top-[48%] right-[32%]", size: "text-6xl", opacity: "opacity-20", anim: "animate-[floatBubble_9s_ease-in-out_infinite]", delay: "0.6s" },
];

const ABYSS_CREATURES = [
  { emoji: "🐳", pos: "top-[10%] right-[12%]", size: "text-8xl", opacity: "opacity-30", anim: "animate-[swim_28s_linear_infinite]", delay: "0s" },
  { emoji: "🦑", pos: "bottom-[14%] left-[6%]", size: "text-8xl", opacity: "opacity-25", anim: "animate-[driftSlow_18s_ease-in-out_infinite]", delay: "1s" },
  { emoji: "🪼", pos: "top-[40%] left-[36%]", size: "text-7xl", opacity: "opacity-25", anim: "animate-[floatBubble_11s_ease-in-out_infinite]", delay: "0.4s" },
  { emoji: "👾", pos: "bottom-[34%] right-[20%]", size: "text-7xl", opacity: "opacity-20", anim: "animate-[driftSlow_13s_ease-in-out_infinite]", delay: "1.6s" },
];

function CreatureLayer({ creatures }) {
  return creatures.map((c, i) => (
    <span
      key={i}
      className={`absolute select-none pointer-events-none ${c.pos} ${c.size} ${c.opacity} ${c.anim}`}
      style={{ animationDelay: c.delay }}
    >
      {c.emoji}
    </span>
  ));
}

// Tiny decision-tree SVG glyph used inside the Random Forest section.
// Three of these, each voting slightly differently, sell the "forest" idea
// better than one big illustration would.
function MiniTree({ vote, className = "" }) {
  const voteColor = vote === "safe" ? "#5EE6C7" : vote === "watch" ? "#F5C56B" : "#F08C6B";
  return (
    <svg viewBox="0 0 120 110" className={className}>
      <line x1="60" y1="14" x2="34" y2="42" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
      <line x1="60" y1="14" x2="86" y2="42" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
      <line x1="34" y1="42" x2="18" y2="70" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
      <line x1="34" y1="42" x2="48" y2="70" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
      <line x1="86" y1="42" x2="74" y2="70" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
      <line x1="86" y1="42" x2="102" y2="70" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
      <circle cx="60" cy="14" r="7" fill="rgba(255,255,255,0.85)" />
      <circle cx="34" cy="42" r="6" fill="rgba(255,255,255,0.6)" />
      <circle cx="86" cy="42" r="6" fill="rgba(255,255,255,0.6)" />
      <circle cx="18" cy="70" r="5" fill="rgba(255,255,255,0.4)" />
      <circle cx="48" cy="70" r="5" fill="rgba(255,255,255,0.4)" />
      <circle cx="74" cy="70" r="5" fill="rgba(255,255,255,0.4)" />
      <circle cx="102" cy="70" r="5" fill="rgba(255,255,255,0.4)" />
      <rect x="36" y="92" width="48" height="16" rx="8" fill={voteColor} opacity="0.9" />
      <text x="60" y="103" textAnchor="middle" fontSize="9" fontWeight="700" fill="#04222a">
        {vote.toUpperCase()}
      </text>
    </svg>
  );
}

// Three hand-drawn SVG glyphs standing in for product photography — each
// traces the real silhouette of its hardware (probe shaft + sensing tip,
// electrode + connector, feeder hopper + auger) so they read as devices,
// not abstract icons.
function DOProbeIllustration({ className = "" }) {
  return (
    <svg viewBox="0 0 200 200" className={className}>
      <rect x="0" y="0" width="200" height="200" fill="#0a3a52" />
      <circle cx="160" cy="34" r="3" fill="#5EE6C7" opacity="0.7" />
      <circle cx="40" cy="160" r="2" fill="#5EE6C7" opacity="0.5" />
      {/* probe cable */}
      <path d="M100 20 L100 55" stroke="#9fb8c4" strokeWidth="6" strokeLinecap="round" />
      {/* probe body */}
      <rect x="82" y="52" width="36" height="78" rx="10" fill="#c7d3d8" />
      <rect x="88" y="60" width="24" height="14" rx="3" fill="#6f8a96" />
      <circle cx="100" cy="60" r="2.5" fill="#1a3a44" />
      {/* sensing tip */}
      <path d="M82 130 L100 162 L118 130 Z" fill="#5EE6C7" />
      <circle cx="100" cy="138" r="6" fill="#0a3a52" />
      {/* waterline */}
      <path d="M0 150 Q50 142 100 150 T200 150 V200 H0 Z" fill="#0d4a68" opacity="0.6" />
      <path d="M0 160 Q50 153 100 160 T200 160 V200 H0 Z" fill="#0d557a" opacity="0.5" />
      <text x="100" y="190" textAnchor="middle" fontSize="9" fontWeight="700" fill="#9fd8e8">
        IP68 SEALED
      </text>
    </svg>
  );
}

function PHModuleIllustration({ className = "" }) {
  return (
    <svg viewBox="0 0 200 200" className={className}>
      <rect x="0" y="0" width="200" height="200" fill="#0a3a52" />
      {/* circuit board */}
      <rect x="34" y="100" width="84" height="56" rx="6" fill="#1f4a3a" stroke="#3a7a5e" strokeWidth="2" />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={48 + i * 18} cy={112} r="3" fill="#5EE6C7" />
      ))}
      <rect x="44" y="124" width="64" height="22" rx="3" fill="#16312a" />
      <text x="76" y="139" textAnchor="middle" fontSize="8" fontWeight="700" fill="#5EE6C7">
        ESP32
      </text>
      {/* electrode wire to glass bulb */}
      <path d="M76 100 C76 80, 76 70, 130 60" stroke="#9fb8c4" strokeWidth="4" fill="none" strokeLinecap="round" />
      <rect x="124" y="36" width="16" height="40" rx="8" fill="#dce8ea" opacity="0.9" />
      <circle cx="132" cy="74" r="9" fill="#cfe3e6" />
      <circle cx="132" cy="74" r="4" fill="#6f8a96" />
      <path d="M0 150 Q50 142 100 150 T200 150 V200 H0 Z" fill="#0d4a68" opacity="0.6" />
      <text x="100" y="186" textAnchor="middle" fontSize="9" fontWeight="700" fill="#9fd8e8">
        GLASS ELECTRODE
      </text>
    </svg>
  );
}

function FeederIllustration({ className = "" }) {
  return (
    <svg viewBox="0 0 200 200" className={className}>
      <rect x="0" y="0" width="200" height="200" fill="#0a3a52" />
      {/* hopper */}
      <path d="M60 30 L140 30 L122 100 L78 100 Z" fill="#c7d3d8" />
      <rect x="78" y="100" width="44" height="18" fill="#9fb0b6" />
      {/* LCD panel */}
      <rect x="64" y="36" width="36" height="20" rx="2" fill="#16312a" />
      <text x="82" y="50" textAnchor="middle" fontSize="8" fontWeight="700" fill="#5EE6C7">
        12:00
      </text>
      {/* auger spout */}
      <rect x="92" y="118" width="16" height="20" fill="#6f8a96" />
      {/* feed pellets falling */}
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={92 + (i % 3) * 8 + (i % 2) * 3} cy={146 + i * 9} r="2.5" fill="#e8c46b" />
      ))}
      <path d="M0 175 Q50 168 100 175 T200 175 V200 H0 Z" fill="#0d4a68" opacity="0.6" />
      <text x="100" y="192" textAnchor="middle" fontSize="9" fontWeight="700" fill="#9fd8e8">
        PROGRAMMABLE DOSING
      </text>
    </svg>
  );
}

export default function LandingPage() {
  const rootRef = useRef(null);
  const layerRefs = useRef([]);
  const dotRef = useRef(null);
  const depthLabelRef = useRef(null);
  const [barsVisible, setBarsVisible] = useState(false);
  const barsSectionRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      const clamp01 = (n) => Math.min(1, Math.max(0, n));
      const map = (v, a, b) => clamp01((v - a) / (b - a));

      // Depth descent — background gets darker/deeper the further you scroll.
      // Each layer only fades IN, never back out, so the dive never reverses.
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(layerRefs.current[0], { opacity: map(p, 0.12, 0.38) });
          gsap.set(layerRefs.current[1], { opacity: map(p, 0.4, 0.66) });
          gsap.set(layerRefs.current[2], { opacity: map(p, 0.68, 0.95) });

          const meters = Math.round(p * 60);
          if (depthLabelRef.current) depthLabelRef.current.textContent = `${meters}m`;
          if (dotRef.current) gsap.set(dotRef.current, { top: `${p * 100}%` });
        },
      });

      // Generic reveal-on-scroll for any section marked .reveal
      gsap.utils.toArray(".reveal").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 50,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 82%" },
        });
      });

      // Pipeline steps stagger in together
      gsap.from(".pipeline-step", {
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ".pipeline-steps", start: "top 75%" },
      });

      // Sensor hardware cards stagger in
      gsap.from(".sensor-card", {
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ".sensor-cards", start: "top 78%" },
      });

      // Metric count-up
      gsap.utils.toArray(".metric-value").forEach((el) => {
        const target = parseFloat(el.dataset.target || "0");
        const decimals = parseInt(el.dataset.decimals || "0", 10);
        const proxy = { val: 0 };
        gsap.to(proxy, {
          val: target,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = proxy.val.toFixed(decimals);
          },
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      // Trust stat count-up (numeric ones only — strings like "8s" handled via data-suffix)
      gsap.utils.toArray(".trust-value").forEach((el) => {
        const raw = el.dataset.target || "0";
        const numeric = parseFloat(raw.replace(/[^0-9.]/g, ""));
        const suffix = raw.replace(/[0-9.]/g, "");
        if (isNaN(numeric)) return;
        const proxy = { val: 0 };
        gsap.to(proxy, {
          val: numeric,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = `${Math.round(proxy.val).toLocaleString()}${suffix}`;
          },
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });

      // Background fish/bubbles drift at a different speed than the page (parallax)
      gsap.utils.toArray(".parallax-slow").forEach((el, i) => {
        gsap.to(el, {
          yPercent: i % 2 === 0 ? -30 : 30,
          ease: "none",
          scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom bottom", scrub: true },
        });
      });

      // Deep-dive feature rows slide in from alternating sides
      gsap.utils.toArray(".feature-row").forEach((el, i) => {
        gsap.from(el, {
          opacity: 0,
          x: i % 2 === 0 ? -60 : 60,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 78%" },
        });
      });

      // Trigger the RF bar-chart fill once its section enters view
      ScrollTrigger.create({
        trigger: barsSectionRef.current,
        start: "top 75%",
        onEnter: () => setBarsVisible(true),
      });

      ScrollTrigger.refresh();
    }, rootRef);

    return () => {
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(tickerCallback);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative text-white">
      {/* Fixed depth background — descends from sunlit surface to abyss as you scroll */}
      <div className="fixed inset-0 -z-20">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #1a6fc4 0%, #1e9bd4 40%, #5dd3f0 80%, #a8edff 100%)",
          }}
        >
          <CreatureLayer creatures={SURFACE_CREATURES} />
        </div>
        <div
          ref={(el) => { layerRefs.current[0] = el; }}
          className="absolute inset-0 opacity-0"
          style={{
            background:
              "linear-gradient(160deg, #0c4a8a 0%, #115e93 40%, #1583a8 80%, #1fa3b8 100%)",
          }}
        >
          <CreatureLayer creatures={MID_CREATURES} />
        </div>
        <div
          ref={(el) => { layerRefs.current[1] = el; }}
          className="absolute inset-0 opacity-0"
          style={{
            background:
              "linear-gradient(160deg, #062544 0%, #073a5c 40%, #0a5270 80%, #0f6f86 100%)",
          }}
        >
          <CreatureLayer creatures={TWILIGHT_CREATURES} />
        </div>
        <div
          ref={(el) => { layerRefs.current[2] = el; }}
          className="absolute inset-0 opacity-0"
          style={{
            background:
              "linear-gradient(160deg, #020a14 0%, #041422 40%, #06202f 70%, #082a38 100%)",
          }}
        >
          <CreatureLayer creatures={ABYSS_CREATURES} />
          {/* bioluminescent plankton, only visible once this layer fades in */}
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-cyan-300"
              style={{
                width: 3,
                height: 3,
                top: `${(i * 37) % 100}%`,
                left: `${(i * 53) % 100}%`,
                boxShadow: "0 0 6px 2px rgba(125,230,255,0.8)",
                animation: `twinkle ${2 + (i % 4)}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Depth gauge — a literal readout of how deep you've scrolled into the pond */}
      <div className="hidden md:flex fixed right-5 top-1/2 -translate-y-1/2 z-50 flex-col items-center gap-2">
        <span className="text-[10px] font-bold tracking-widest text-white/50">0m</span>
        <div className="relative w-px h-44 bg-white/20">
          <div
            ref={dotRef}
            className="absolute -left-0.75 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_2px_rgba(125,230,255,0.8)]"
            style={{ top: "0%" }}
          />
        </div>
        <span ref={depthLabelRef} className="text-[10px] font-bold tracking-widest text-cyan-200">
          0m
        </span>
      </div>

      {/* ===================== HERO ===================== */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 left-[15%] w-64 h-[140%] bg-white/10 blur-3xl rotate-12" />
          <div className="absolute -top-40 right-[20%] w-52 h-[140%] bg-white/10 blur-3xl -rotate-12" />
        </div>

        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <svg className="w-full h-full">
            <defs>
              <pattern id="pond-grid" width="120" height="120" patternUnits="userSpaceOnUse">
                <rect x="10" y="10" width="100" height="100" rx="18" fill="none" stroke="white" strokeWidth="2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pond-grid)" />
          </svg>
        </div>

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
            className={`parallax-slow absolute rounded-full bg-white/10 border border-white/10 animate-[floatBubble_6s_ease-in-out_infinite] ${cls}`}
            style={{ animationDelay: `${i * 0.8}s` }}
          />
        ))}

        {[
          { pos: "top-[22%] left-[8%]", fish: "🐟" },
          { pos: "top-[45%] right-[12%]", fish: "🐠" },
          { pos: "bottom-[30%] left-[15%]", fish: "🐟" },
          { pos: "top-[65%] right-[20%]", fish: "🐡" },
          { pos: "top-[35%] left-[80%]", fish: "🐠" },
        ].map((item, i) => (
          <div
            key={i}
            className={`parallax-slow absolute ${item.pos} text-6xl opacity-25 animate-[swim_18s_linear_infinite]`}
            style={{ animationDelay: `${i * 3}s` }}
          >
            {item.fish}
          </div>
        ))}

        <div className="absolute bottom-16 left-4 text-7xl opacity-20 select-none">🌿🌿🌿</div>
        <div className="absolute bottom-20 right-6 text-6xl opacity-20 select-none">🌿🌿</div>
        <div className="absolute bottom-24 left-[25%] text-5xl opacity-15 select-none">🌿</div>
        <div className="absolute bottom-12 left-[12%] text-4xl opacity-25">🪨🪨</div>
        <div className="absolute bottom-14 right-[18%] text-5xl opacity-25">🪨</div>

        <div className="text-center max-w-2xl w-full relative z-10">
          <div className="flex justify-center items-end gap-6 mb-4">
            <div className="text-3xl animate-bounce">🐟</div>
            <div className="text-5xl animate-[bounce_2.5s_ease-in-out_infinite]">🐸</div>
            <div className="text-3xl animate-bounce" style={{ animationDelay: "0.7s" }}>🐠</div>
          </div>

          <div className="inline-block bg-white/20 backdrop-blur-md border border-white/40 rounded-full px-4 py-1 text-xs font-bold tracking-widest mb-3">
            Smart Aquaculture Platform
          </div>

          <h1 className="text-6xl md:text-7xl font-black tracking-wider drop-shadow-lg mb-2 animate-pulse">
            NEELA AI
          </h1>

          <p className="text-lg font-bold text-white/95 mb-2">
            Autonomous AI Fish Farm Management System
          </p>

          <p className="text-sm font-semibold text-white/75 leading-relaxed mb-8 max-w-md mx-auto">
            Real-Time Water Quality Monitoring,
            <br />
            Random Forest Prediction,
            <br />
            AI Decision Making &amp;
            <br />
            Autonomous Actuator Control
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { title: "AI", label: "Random Forest +\nAI Decision Engine" },
              { title: "IoT", label: "Realtime Sensor\nMonitoring" },
              { title: "24/7", label: "Autonomous Pond\nManagement" },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white/20 backdrop-blur-md border border-white/35 rounded-2xl p-4 hover:-translate-y-1 hover:bg-white/30 transition-all cursor-default"
              >
                <div className="text-xl font-black">{f.title}</div>
                <div className="text-xs font-bold text-white/80 leading-snug whitespace-pre-line">{f.label}</div>
              </div>
            ))}
          </div>

          {/* Trust stats row — concrete numbers right under the fold */}
          <div className="grid grid-cols-4 gap-2 mb-8">
            {TRUST_STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-lg md:text-xl font-black text-cyan-200">{s.value}</div>
                <div className="text-[9px] font-bold text-white/55 leading-tight mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <Link href="/dashboard">
            <button className="bg-white text-blue-700 font-extrabold text-base px-8 py-3 rounded-full shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all active:scale-95">
              Enter Dashboard →
            </button>
          </Link>

          <p className="mt-6 text-xs font-semibold text-white/50 tracking-wide">
            Smart Aquaculture Platform powered by Artificial Intelligence and Internet of Things
          </p>

          <div className="mt-6 flex flex-col items-center gap-1 opacity-70">
            <span className="text-[11px] font-bold tracking-widest">DIVE DEEPER</span>
            <span className="text-lg animate-bounce">⌄</span>
          </div>
        </div>

        <svg className="absolute bottom-0 left-0 w-full h-24 opacity-20" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            fill="rgba(255,255,255,0.15)"
            d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,53.3C840,53,960,75,1080,85.3C1200,96,1320,96,1380,96L1440,96L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
          />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full h-20 opacity-30" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            fill="rgba(255,255,255,0.1)"
            d="M0,96L80,85.3C160,75,320,53,480,53.3C640,53,800,75,960,85.3C1120,96,1280,96,1360,90.7L1440,85L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          />
        </svg>
      </section>

      {/* ===================== PIPELINE ===================== */}
      <section className="relative px-4 py-28 max-w-5xl mx-auto">
        <div className="reveal text-center mb-16">
          <span className="text-xs font-bold tracking-widest text-cyan-200">HOW NEELA THINKS</span>
          <h2 className="text-3xl md:text-4xl font-black mt-2">Sensor data in. A decision out.</h2>
          <p className="text-sm text-white/70 mt-3 max-w-lg mx-auto">
            Four stages run continuously, every pond, every cycle. Each one hands off a concrete
            artifact to the next — a reading, a score, a sentence, an action — so nothing in the
            loop is a black box.
          </p>
        </div>

        <div className="pipeline-steps grid md:grid-cols-4 gap-5">
          {PIPELINE.map((p) => (
            <div
              key={p.step}
              className="pipeline-step bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 flex flex-col"
            >
              <div className="text-xs font-black text-cyan-300 mb-3">{p.step}</div>
              <div className="text-lg font-black mb-2">{p.title}</div>
              <p className="text-xs text-white/70 leading-relaxed flex-1">{p.body}</p>
              <div className="mt-4 pt-3 border-t border-white/10 text-[10px] font-bold text-cyan-200/90 tracking-wide">
                {p.detail}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== SENSOR HARDWARE (with real photos) ===================== */}
      <section className="relative px-4 py-28 max-w-5xl mx-auto">
        <div className="reveal text-center mb-16">
          <span className="text-xs font-bold tracking-widest text-cyan-200">THE HARDWARE IN THE WATER</span>
          <h2 className="text-3xl md:text-4xl font-black mt-2">What's actually bolted to the pond.</h2>
          <p className="text-sm text-white/70 mt-3 max-w-lg mx-auto">
            No abstraction here — these are the physical probes and actuators NEELA reads from and
            commands, mounted at every pond.
          </p>
        </div>

        <div className="sensor-cards grid md:grid-cols-3 gap-6">
          {SENSOR_HARDWARE.map((s, i) => (
            <div
              key={s.title}
              className="sensor-card bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl overflow-hidden"
            >
              <div className="aspect-4/3 overflow-hidden">
                {i === 0 && <DOProbeIllustration className="w-full h-full" />}
                {i === 1 && <PHModuleIllustration className="w-full h-full" />}
                {i === 2 && <FeederIllustration className="w-full h-full" />}
              </div>
              <div className="p-5">
                <div className="text-base font-black mb-1">{s.title}</div>
                <div className="text-[11px] font-bold text-cyan-200 mb-2 tracking-wide">{s.spec}</div>
                <p className="text-xs text-white/70 leading-relaxed">{s.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== LIVE METRICS ===================== */}
      <section className="relative px-4 py-28 max-w-5xl mx-auto">
        <div className="reveal text-center mb-16">
          <span className="text-xs font-bold tracking-widest text-cyan-200">LIVE POND SNAPSHOT</span>
          <h2 className="text-3xl md:text-4xl font-black mt-2">What the sensors see right now.</h2>
          <p className="text-sm text-white/70 mt-3 max-w-lg mx-auto">
            Each metric here carries its own safe range and a one-line reason it matters — not just
            a number floating with no context.
          </p>
        </div>

        <div className="reveal grid grid-cols-2 md:grid-cols-4 gap-5">
          {METRICS.map((m) => (
            <div key={m.label} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 text-center flex flex-col">
              <div className="text-3xl font-black">
                <span className="metric-value" data-target={m.target} data-decimals={m.decimals}>
                  0
                </span>
                <span className="text-base font-bold text-white/60 ml-1">{m.unit}</span>
              </div>
              <div className="text-xs font-bold text-white/70 mt-2">{m.label}</div>
              <div className="text-[10px] font-bold text-cyan-300 mt-1 tracking-wide">{m.status}</div>
              <div className="text-[10px] text-white/50 mt-3 font-semibold">{m.range}</div>
              <p className="text-[11px] text-white/65 leading-snug mt-2 flex-1">{m.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== RANDOM FOREST VISUALIZATION ===================== */}
      <section ref={barsSectionRef} className="relative px-4 py-28 max-w-5xl mx-auto">
        <div className="reveal text-center mb-16">
          <span className="text-xs font-bold tracking-widest text-cyan-200">INSIDE THE PREDICTION ENGINE</span>
          <h2 className="text-3xl md:text-4xl font-black mt-2">200 trees, one verdict.</h2>
          <p className="text-sm text-white/70 mt-3 max-w-lg mx-auto">
            A Random Forest doesn't ask one model for an opinion — it asks 200 slightly different
            ones and takes the majority vote. Three are sketched below, each reading the same
            reading and landing on a different call.
          </p>
        </div>

        <div className="reveal grid md:grid-cols-3 gap-6 mb-6 place-items-center">
          <MiniTree vote="safe" className="w-32 h-28" />
          <MiniTree vote="watch" className="w-32 h-28" />
          <MiniTree vote="safe" className="w-32 h-28" />
        </div>
        <p className="reveal text-center text-[11px] font-bold text-white/50 tracking-wide mb-16">
          2 of 3 trees shown vote SAFE → forest-wide majority resolves to SAFE
        </p>

        {/* Feature importance bar chart — which inputs the forest actually leans on */}
        <div className="reveal bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 md:p-8">
          <div className="text-sm font-black mb-1">Feature importance</div>
          <p className="text-xs text-white/60 mb-6">
            How much weight each sensor input carries across all 200 trees' splits.
          </p>
          <div className="space-y-4">
            {RF_FEATURE_IMPORTANCE.map((f) => (
              <div key={f.name}>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-white/80">{f.name}</span>
                  <span className="text-cyan-200">{f.value}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-cyan-300 to-emerald-300 transition-[width] duration-1200 ease-out"
                    style={{ width: barsVisible ? `${f.value}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-white/55 leading-relaxed mt-6 pt-5 border-t border-white/10">
            Dissolved oxygen and ammonia dominate the split decisions — which tracks biology:
            they're the two parameters that turn fatal fastest after a feeding event or a power cut
            to the aerators.
          </p>
        </div>
      </section>

      {/* ===================== DEEP FEATURES ===================== */}
      <section className="relative px-4 py-28 max-w-3xl mx-auto space-y-20">
        <div className="reveal text-center mb-4">
          <span className="text-xs font-bold tracking-widest text-cyan-200">UNDER THE HOOD</span>
          <h2 className="text-3xl md:text-4xl font-black mt-2">Three layers, one closed loop.</h2>
        </div>

        {DEEP_FEATURES.map((f, i) => (
          <div
            key={f.title}
            className={`feature-row flex items-start gap-6 ${i % 2 === 1 ? "flex-row-reverse text-right" : ""}`}
          >
            <div className="text-5xl shrink-0 bg-white/10 border border-white/15 rounded-2xl w-20 h-20 flex items-center justify-center">
              {f.icon}
            </div>
            <div className="flex-1">
              <div className="text-xl font-black mb-1">{f.title}</div>
              <p className="text-sm text-white/70 leading-relaxed mb-3">{f.body}</p>
              <ul className={`text-xs text-white/60 space-y-1.5 ${i % 2 === 1 ? "list-none" : "list-none"}`}>
                {f.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    {i % 2 === 1 ? (
                      <>
                        <span className="leading-relaxed">{b}</span>
                        <span className="text-cyan-300 mt-0.5">•</span>
                      </>
                    ) : (
                      <>
                        <span className="text-cyan-300 mt-0.5">•</span>
                        <span className="leading-relaxed">{b}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      {/* ===================== FINAL CTA ===================== */}
      <section className="relative px-4 py-32 text-center">
        <div className="reveal max-w-lg mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-3">You've reached the bottom of the pond.</h2>
          <p className="text-sm text-white/70 mb-4">
            Everything above is already running: sensors streaming, trees voting, the reasoning
            layer writing decisions, actuators executing them. Step into the dashboard to see it on
            your own ponds.
          </p>
          <div className="grid grid-cols-3 gap-3 mb-8 max-w-sm mx-auto">
            {[
              { value: "4", label: "sensor types" },
              { value: "200", label: "trees voting" },
              { value: "24/7", label: "unattended" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-xl font-black text-cyan-200">{s.value}</div>
                <div className="text-[10px] font-bold text-white/55 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <Link href="/dashboard">
            <button className="bg-white text-blue-700 font-extrabold text-base px-8 py-3 rounded-full shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all active:scale-95">
              Enter Dashboard →
            </button>
          </Link>
          <p className="mt-10 text-xs font-semibold text-white/40 tracking-wide">
            NEELA AI — Smart Aquaculture Platform powered by AI and IoT
          </p>
        </div>
      </section>

      <style jsx global>{`
        @keyframes floatBubble {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }
        @keyframes swim {
          0% { transform: translateX(-20px); }
          50% { transform: translateX(20px); }
          100% { transform: translateX(-20px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 1; }
        }
        @keyframes driftSlow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(18px, -22px) rotate(6deg); }
        }
      `}</style>
    </div>
  );
}