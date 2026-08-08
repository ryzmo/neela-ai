"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  Fish,
  Cpu,
  BrainCircuit,
  MessageSquareCode,
  MailWarning,
  Database,
  Lock,
  Mail,
  ArrowRight,
  Award,
  Layers,
  LogOut,
  ShieldAlert
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// SYSTEM TECHNOLOGY CARDS DATA
// ============================================================

const TECH_LAYERS = [
  {
    id: 1,
    title: "01. IoT SENSING NODE",
    subtitle: "ESP32 + MULTI-SENSOR NODE",
    body: "Acquires real-time water quality parameters using a DS18B20 temperature probe, Gravity pH sensor V2, Gravity Optical DO (dissolved oxygen) sensor, and SEN0189 turbidity sensor. Connected via Wi-Fi to post telemetry every hour.",
    accent: "text-[#1a6fc4]"
  },
  {
    id: 2,
    title: "02. EXTRA TREES CLASSIFIER",
    subtitle: "96% CLASSIFICATION MODEL",
    body: "Trained on 4,383 hourly observations using 200 estimators. Evaluates Temperature, pH, DO, Turbidity, and Hour of the day to instantly classify pond health status into 'Stable' or 'At Risk' with validation accuracy of 99.88%.",
    accent: "text-[#1a6fc4]"
  },
  {
    id: 3,
    title: "03. RULE-BASED ACTUATION",
    subtitle: "DETERMINISTIC DECISION ENGINE",
    body: "Automatically controls relay actuators to safeguard fish. Activates the Aerator (air pump) on low oxygen, Water Circulation (water pump) on high temperature/turbidity, pH neutralizer on abnormal pH, and alarm buzzer on critical risk states.",
    accent: "text-[#1a6fc4]"
  },
  {
    id: 4,
    title: "04. LLM EXPLAINABLE REASONING",
    subtitle: "EXPLAINABLE AI (XAI) LAYER",
    body: "Injects telemetry context and actuator commands into a Large Language Model. Generates plain, clear, natural language audit logs and recommendations explaining *why* decisions were made to improve operational transparency.",
    accent: "text-[#1a6fc4]"
  },
  {
    id: 5,
    title: "05. EMERGENCY ALERT SYSTEM",
    subtitle: "NODE MAILER NOTIFICATION ENGINE",
    body: "Monitors system status 24/7. When sensor thresholds are breached or the Extra Trees model flags an 'At Risk' pond health status, it automatically dispatches emergency email alerts to operators.",
    accent: "text-[#1a6fc4]"
  }
];

// Research Credits representing the authors and paper from the PDF (Cheerful light-mode cards)
const AUTHORS = [
  {
    name: "Eirene Christi",
    role: "Lead Author & Researcher",
    id: "NIM: 2902726100",
    bg: "bg-blue-50/80 border-blue-200 shadow-sm"
  },
  {
    name: "Muhammad Farhan Fadlurrohman",
    role: "Machine Learning & AI Architect",
    id: "NIM: 2902726265",
    bg: "bg-sky-50/80 border-sky-200 shadow-sm"
  },
  {
    name: "Kelly Callista Subandi",
    role: "Full-Stack Software Engineer",
    id: "NIM: 2902726214",
    bg: "bg-indigo-50/80 border-indigo-200/60 shadow-sm"
  },
  {
    name: "Vin Cen",
    role: "IoT Hardware & Firmware Lead",
    id: "NIM: 2902726353",
    bg: "bg-emerald-50/80 border-emerald-200/60 shadow-sm"
  }
];

// ============================================================
// CHEERFUL CARTOON SVG ILLUSTRATIONS FOR THE SYSTEM STAGES
// Inline vector drawings designed to float gently with eyes/faces.
// ============================================================

function IoTNodeCartoon({ className = "w-24 h-24" }) {
  return (
    <svg viewBox="0 0 120 120" className={className}>
      <path d="M15 80 Q50 65 95 75 Q115 90 90 105 Q50 115 20 100 Q5 90 15 80 Z" fill="#e0f2fe" opacity="0.6" />
      <rect x="35" y="25" width="50" height="50" rx="10" fill="#1e293b" stroke="#475569" strokeWidth="2.5" />
      <rect x="40" y="30" width="40" height="40" rx="6" fill="#334155" />
      <rect x="29" y="32" width="6" height="5" rx="1" fill="#94a3b8" />
      <rect x="29" y="42" width="6" height="5" rx="1" fill="#94a3b8" />
      <rect x="29" y="52" width="6" height="5" rx="1" fill="#94a3b8" />
      <rect x="29" y="62" width="6" height="5" rx="1" fill="#94a3b8" />
      <rect x="85" y="32" width="6" height="5" rx="1" fill="#94a3b8" />
      <rect x="85" y="42" width="6" height="5" rx="1" fill="#94a3b8" />
      <rect x="85" y="52" width="6" height="5" rx="1" fill="#94a3b8" />
      <rect x="85" y="62" width="6" height="5" rx="1" fill="#94a3b8" />
      <circle cx="50" cy="45" r="4.5" fill="#fff" />
      <circle cx="51" cy="45" r="2" fill="#000" />
      <circle cx="70" cy="45" r="4.5" fill="#fff" />
      <circle cx="69" cy="45" r="2" fill="#000" />
      <path d="M55 54 Q60 58 65 54" stroke="#e2f1ff" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M75 65 C85 75 80 85 90 90" fill="none" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
      <g transform="translate(85, 80) scale(0.75)">
        <rect x="0" y="0" width="16" height="30" rx="8" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
        <circle cx="8" cy="20" r="4" fill="#ef4444" />
        <circle cx="6" cy="10" r="1.5" fill="#fff" />
        <circle cx="10" cy="10" r="1.5" fill="#fff" />
      </g>
    </svg>
  );
}

function ExtraTreesCartoon({ className = "w-24 h-24" }) {
  return (
    <svg viewBox="0 0 120 120" className={className}>
      <ellipse cx="60" cy="95" rx="45" ry="12" fill="#d1fae5" opacity="0.7" />
      <g transform="translate(20, 35)">
        <rect x="12" y="30" width="6" height="20" rx="2" fill="#78350f" />
        <path d="M15 5 C5 20 5 35 15 38 C25 35 25 20 15 5 Z" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
        <circle cx="12" cy="22" r="2" fill="#fff" />
        <circle cx="18" cy="22" r="2" fill="#fff" />
        <path d="M13 27 Q15 29 17 27" stroke="#fff" strokeWidth="1" fill="none" />
      </g>
      <g transform="translate(45, 15)">
        <rect x="16" y="45" width="8" height="30" rx="3" fill="#78350f" />
        <path d="M20 5 C5 25 5 45 20 50 C35 45 35 25 20 5 Z" fill="#059669" stroke="#065f46" strokeWidth="2" />
        <circle cx="14" cy="26" r="3" fill="#fff" />
        <circle cx="26" cy="26" r="3" fill="#fff" />
        <circle cx="15" cy="26" r="1.2" fill="#000" />
        <circle cx="25" cy="26" r="1.2" fill="#000" />
        <path d="M17 33 Q20 37 23 33" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </g>
      <g transform="translate(75, 15) scale(0.85)">
        <circle cx="18" cy="18" r="16" fill="#10b981" stroke="#fff" strokeWidth="2.5" />
        <path d="M10 18 L15 23 L25 12" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function RuleBasedActuatorCartoon({ className = "w-24 h-24" }) {
  return (
    <svg viewBox="0 0 120 120" className={className}>
      <rect x="20" y="85" width="80" height="15" rx="5" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
      <g transform="translate(30, 25)">
        <circle cx="25" cy="25" r="20" fill="#0284c7" stroke="#0369a1" strokeWidth="2.5" />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect
            key={i}
            x="21"
            y="-2"
            width="8"
            height="8"
            rx="1.5"
            fill="#0284c7"
            stroke="#0369a1"
            strokeWidth="1.5"
            transform={`rotate(${i * 45} 25 25)`}
          />
        ))}
        <circle cx="25" cy="25" r="10" fill="#f0f7ff" />
        <circle cx="21" cy="23" r="2.5" fill="#000" />
        <circle cx="29" cy="23" r="2.5" fill="#000" />
        <path d="M22 28 Q25 31 28 28" stroke="#000" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </g>
      <g transform="translate(72, 12) scale(0.8)">
        <path d="M10 30 L30 30 L40 45 L10 45 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
        <rect x="15" y="15" width="10" height="15" fill="#f87171" stroke="#b91c1c" strokeWidth="2" />
        <circle cx="20" cy="15" r="5" fill="#facc15" />
        <path d="M35 15 Q43 10 43 25" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

function LlmExplainerCartoon({ className = "w-24 h-24" }) {
  return (
    <svg viewBox="0 0 120 120" className={className}>
      <path d="M20 70 C10 70 5 60 15 50 C10 38 25 30 35 38 C45 25 65 25 75 35 C88 28 98 38 92 50 C102 60 92 72 80 70 Z" fill="#faf5ff" opacity="0.8" />
      <g transform="translate(30, 30)">
        <rect x="25" y="32" width="10" height="12" rx="2" fill="#94a3b8" />
        <rect x="10" y="2" width="40" height="32" rx="8" fill="#cbd5e1" stroke="#64748b" strokeWidth="2.5" />
        <rect x="16" y="8" width="28" height="20" rx="5" fill="#1e293b" />
        <circle cx="24" cy="18" r="3.5" fill="#22d3ee" className="animate-pulse" />
        <circle cx="36" cy="18" r="3.5" fill="#22d3ee" className="animate-pulse" />
        <path d="M27 23 Q30 25 33 23" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <line x1="30" y1="2" x2="30" y2="-10" stroke="#64748b" strokeWidth="3" />
        <circle cx="30" cy="-10" r="4" fill="#a855f7" />
      </g>
    </svg>
  );
}

function AlertSystemCartoon({ className = "w-24 h-24" }) {
  return (
    <svg viewBox="0 0 120 120" className={className}>
      <circle cx="60" cy="60" r="40" fill="#ffe4e6" opacity="0.4" />
      <g transform="translate(30, 35)">
        <path d="M10 20 C-10 15 -15 0 -2 2 C-5 -10 -5 10 10 15" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
        <path d="M50 20 C70 15 75 0 62 2 C65 -10 65 10 50 15" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="0" y="5" width="60" height="38" rx="6" fill="#f87171" stroke="#b91c1c" strokeWidth="2" />
        <path d="M2 7 L30 25 L58 7" fill="none" stroke="#b91c1c" strokeWidth="2" />
        <circle cx="22" cy="30" r="2.5" fill="#fff" />
        <circle cx="38" cy="30" r="2.5" fill="#fff" />
        <path d="M27 34 Q30 36 33 34" stroke="#fff" strokeWidth="1" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

// Cute Smiling pH Test Tube
function PHProbeCartoon({ className = "w-24 h-24" }) {
  return (
    <svg viewBox="0 0 120 120" className={className}>
      <ellipse cx="60" cy="98" rx="25" ry="8" fill="#fbcfe8" opacity="0.6" />
      <g transform="translate(45, 15)">
        <rect x="5" y="0" width="22" height="70" rx="11" fill="none" stroke="#64748b" strokeWidth="3" />
        <path d="M6 35 L26 35 A 10 10 0 0 1 16 69 A 10 10 0 0 1 6 35" fill="#ec4899" />
        <circle cx="11" cy="20" r="2" fill="#000" />
        <circle cx="21" cy="20" r="2" fill="#000" />
        <path d="M13 25 Q16 28 19 25" stroke="#000" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

// Cute smiling blue Tilapia fish
function TilapiaFishCartoon({ className = "w-24 h-24" }) {
  return (
    <svg viewBox="0 0 120 120" className={className}>
      <ellipse cx="60" cy="85" rx="35" ry="8" fill="#e0f2fe" opacity="0.6" />
      <path d="M15 60 L5 45 L5 75 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
      <ellipse cx="55" cy="60" rx="35" ry="22" fill="#38bdf8" stroke="#0284c7" strokeWidth="2.5" />
      <path d="M50 65 Q45 80 58 72 Z" fill="#0ea5e9" stroke="#0284c7" strokeWidth="1.5" />
      <circle cx="75" cy="52" r="6" fill="#fff" />
      <circle cx="77" cy="52" r="3.2" fill="#000" />
      <circle cx="79" cy="50" r="1.2" fill="#fff" />
      <circle cx="74" cy="62" r="3" fill="#f43f5e" opacity="0.5" />
      <path d="M85 62 Q80 67 76 63" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="95" cy="50" r="3" fill="none" stroke="#0284c7" strokeWidth="1" opacity="0.8" />
      <circle cx="102" cy="40" r="4.5" fill="none" stroke="#0284c7" strokeWidth="1.2" opacity="0.6" />
    </svg>
  );
}

// Cute transparent bubble mascot
function BubbleCartoon({ className = "w-24 h-24" }) {
  return (
    <svg viewBox="0 0 120 120" className={className}>
      <circle cx="60" cy="60" r="35" fill="none" stroke="#0ea5e9" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="32" fill="#e0f2fe" opacity="0.4" />
      <path d="M38 38 A 28 28 0 0 1 82 38" fill="none" stroke="#fff" strokeWidth="3" opacity="0.7" strokeLinecap="round" />
      <circle cx="50" cy="58" r="2.5" fill="#0369a1" />
      <circle cx="70" cy="58" r="2.5" fill="#0369a1" />
      <path d="M55 68 Q60 72 65 68" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Smiling Water Drop
function WaterDropCartoon({ className = "w-24 h-24" }) {
  return (
    <svg viewBox="0 0 120 120" className={className}>
      <path d="M60 15 C75 40 85 55 85 70 A 25 25 0 0 1 35 70 C 35 55 45 40 60 15 Z" fill="#0ea5e9" stroke="#0284c7" strokeWidth="2" />
      <path d="M60 22 C70 43 78 55 78 68 A 18 18 0 0 1 42 68 C 42 55 50 43 60 22 Z" fill="#38bdf8" />
      <circle cx="52" cy="65" r="2.5" fill="#000" />
      <circle cx="68" cy="65" r="2.5" fill="#000" />
      <path d="M56 72 Q60 76 64 72" stroke="#000" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Glowing turbidity light bulb
function GlowSensorCartoon({ className = "w-24 h-24" }) {
  return (
    <svg viewBox="0 0 120 120" className={className}>
      <circle cx="60" cy="50" r="30" fill="#fef08a" opacity="0.55" className="animate-pulse" />
      <path d="M42 50 C42 32 78 32 78 50 C78 62 68 68 68 76 L52 76 C52 68 42 62 42 50 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="2.5" />
      <rect x="50" y="76" width="20" height="10" rx="2" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
      <ellipse cx="60" cy="86" rx="6" ry="3" fill="#475569" />
      <circle cx="53" cy="48" r="2.5" fill="#854d0e" />
      <circle cx="67" cy="48" r="2.5" fill="#854d0e" />
      <path d="M56 56 Q60 60 64 56" stroke="#854d0e" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ============================================================
// FLOATING CARTOON COMPONENTS DATABASE
// Represents the scattered absolute coordinates of the playground.
// ============================================================

const FLOATING_PLAYGROUND = [
  { id: 1, component: IoTNodeCartoon, label: "IoT Controller Node", left: "6%", top: "15%", speed: 120, scale: 1.1 },
  { id: 2, component: ExtraTreesCartoon, label: "Extra Trees AI", right: "8%", top: "20%", speed: 190, scale: 1.15 },
  { id: 3, component: RuleBasedActuatorCartoon, label: "Rule Actuation", left: "10%", top: "52%", speed: 140, scale: 1.1 },
  { id: 4, component: LlmExplainerCartoon, label: "LLM Explainer", right: "7%", top: "62%", speed: 170, scale: 1.25 },
  { id: 5, component: AlertSystemCartoon, label: "Emergency Alert", left: "42%", top: "78%", speed: 210, scale: 1.2 },
  { id: 6, component: PHProbeCartoon, label: "pH Sensor Node", right: "24%", top: "48%", speed: 100, scale: 0.95 },
  { id: 7, component: TilapiaFishCartoon, label: "Pond Tilapia", left: "28%", top: "24%", speed: 230, scale: 1.3 },
  { id: 8, component: TilapiaFishCartoon, label: "Tilapia Mascot", right: "38%", top: "58%", speed: 150, scale: 1.05 },
  { id: 9, component: BubbleCartoon, label: "DO Telemetry", left: "5%", top: "82%", speed: 250, scale: 0.8 },
  { id: 10, component: WaterDropCartoon, label: "Oxygen Stream", right: "3%", top: "38%", speed: 110, scale: 0.9 },
  { id: 11, component: GlowSensorCartoon, label: "Turbidity Light", left: "46%", top: "8%", speed: 90, scale: 0.95 },
  { id: 12, component: ExtraTreesCartoon, label: "Extra Trees Splits", left: "54%", top: "34%", speed: 160, scale: 0.85 },
  { id: 13, component: RuleBasedActuatorCartoon, label: "Relay Control", right: "18%", top: "82%", speed: 130, scale: 0.9 },
  { id: 14, component: IoTNodeCartoon, label: "ESP32 Board", left: "20%", top: "38%", speed: 180, scale: 0.8 },
  { id: 15, component: AlertSystemCartoon, label: "Alert Node", right: "28%", top: "10%", speed: 190, scale: 0.85 }
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function LandingPage() {
  const router = useRouter();
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const introRef = useRef(null);
  const archSectionRef = useRef(null);
  const flowSectionRef = useRef(null);
  const creditsSectionRef = useRef(null);
  const creditsTrackRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);

  // Auth & Toast States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Load Auth State on mount
  useEffect(() => {
    const logged = localStorage.getItem("neela_logged_in") === "true";
    setTimeout(() => {
      setIsLoggedIn(logged);
    }, 0);
  }, []);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    // Animate toast using GSAP
    setTimeout(() => {
      gsap.fromTo(".toast-notification",
        { y: -20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
      );
    }, 50);

    // Auto hide after 3.5s
    setTimeout(() => {
      gsap.to(".toast-notification", {
        y: -15,
        opacity: 0,
        scale: 0.95,
        duration: 0.2,
        onComplete: () => setToast(prev => ({ ...prev, show: false }))
      });
    }, 3500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);

    // Smooth GSAP button animation on submit
    gsap.to(".login-submit-btn", {
      scale: 0.95,
      duration: 0.2,
      yoyo: true,
      repeat: 1
    });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setTimeout(() => {
        showToast("Please enter a valid email address.", "error");
        setLoading(false);
      }, 500);
      return;
    }

    // Validation matching
    if (email === "operator@neela.ai" && password === "password123") {
      setTimeout(() => {
        localStorage.setItem("neela_logged_in", "true");
        localStorage.setItem("neela_operator_email", email);
        setIsLoggedIn(true);
        setLoading(false);
        showToast("Logged in successfully! Redirecting...", "success");
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      }, 1200);
    } else {
      setTimeout(() => {
        setLoading(false);
        showToast("Invalid credentials. Try checking the field hint.", "error");
      }, 1000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("neela_logged_in");
    localStorage.removeItem("neela_operator_email");
    setIsLoggedIn(false);
    showToast("Logged out successfully.", "success");
  };

  const handleNavClick = (e, targetHref) => {
    if (!isLoggedIn) {
      e.preventDefault();
      showToast("Access Denied: Please login with email & password first.", "error");
    }
  };

  // Interactive mousemove parallax for floating bubbles/decorations in Hero
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const { width, height, left, top } = heroRef.current.getBoundingClientRect();
      const x = (clientX - left - width / 2) / (width / 2); // [-1, 1]
      const y = (clientY - top - height / 2) / (height / 2); // [-1, 1]

      gsap.to(".floating-bubble-item", {
        x: (i) => x * (i + 1) * 18,
        y: (i) => y * (i + 1) * 18,
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto"
      });
    };

    const heroEl = heroRef.current;
    if (heroEl) {
      heroEl.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (heroEl) {
        heroEl.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  // GSAP scroll animations
  useEffect(() => {
    // Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1.1,
      lerp: 0.08
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Sync scroll
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // Header changes color past 80px scroll
      ScrollTrigger.create({
        start: "top -80px",
        onToggle: (self) => setScrolled(self.isActive)
      });

      // Character Highlight reveal on scroll (Intro Section)
      const textEl = document.querySelector(".reveal-text");
      if (textEl) {
        const text = textEl.textContent.trim();
        textEl.innerHTML = "";

        text.split(" ").forEach(word => {
          const wordSpan = document.createElement("span");
          wordSpan.className = "inline-block mr-3 whitespace-nowrap";

          word.split("").forEach(char => {
            const charSpan = document.createElement("span");
            charSpan.textContent = char;
            charSpan.className = "word-char text-slate-300 transition-colors duration-300";
            wordSpan.appendChild(charSpan);
          });
          textEl.appendChild(wordSpan);
        });

        gsap.to(".word-char", {
          color: "#1a6fc4",
          stagger: 0.015,
          scrollTrigger: {
            trigger: introRef.current,
            start: "top 80%",
            end: "bottom 50%",
            scrub: true
          }
        });
      }

      // 1. Continuous random drifting animation on cartoon-inner icons
      gsap.utils.toArray(".cartoon-inner").forEach((el) => {
        gsap.to(el, {
          x: () => gsap.utils.random(-50, 50),
          y: () => gsap.utils.random(-50, 50),
          rotation: () => gsap.utils.random(-25, 25),
          duration: () => gsap.utils.random(4, 7),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      });

      // 2. GSAP Scroll parallax translation (Y direction)
      gsap.utils.toArray(".playground-node").forEach((el) => {
        const speed = parseFloat(el.getAttribute("data-speed") || "150");

        gsap.to(el, {
          y: -speed,
          ease: "none",
          scrollTrigger: {
            trigger: "#architecture-floating-sec",
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        });
      });

      // Parallax scroll bubbles
      gsap.utils.toArray(".why-parallax-bubble").forEach((el, i) => {
        gsap.to(el, {
          yPercent: i % 2 === 0 ? -30 : 30,
          scale: i % 2 === 0 ? 1.1 : 0.9,
          ease: "none",
          scrollTrigger: {
            trigger: "#architecture-floating-sec",
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      });

      // Horizontal translation for Credits Track
      gsap.to(creditsTrackRef.current, {
        x: () => {
          const trackWidth = creditsTrackRef.current.scrollWidth;
          const viewportWidth = window.innerWidth;
          return -(trackWidth - viewportWidth + 80);
        },
        ease: "none",
        scrollTrigger: {
          trigger: creditsSectionRef.current,
          start: "top 80%",
          end: "bottom top",
          scrub: true
        }
      });

      // Flowchart blocks reveal sequence
      gsap.from(".flow-node", {
        opacity: 0,
        y: 20,
        stagger: 0.15,
        duration: 0.8,
        ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: flowSectionRef.current,
          start: "top 70%"
        }
      });

    }, rootRef);

    // 3. Interactive Cursor Parallax Shift
    const handleMouseMove = (e) => {
      if (!archSectionRef.current) return;
      const { clientX, clientY } = e;
      const { width, height, left, top } = archSectionRef.current.getBoundingClientRect();
      const x = (clientX - left - width / 2) / (width / 2); // [-1, 1]
      const y = (clientY - top - height / 2) / (height / 2); // [-1, 1]

      gsap.to(".playground-node", {
        x: (i) => x * (i + 1) * 12,
        y: (i) => y * (i + 1) * 12,
        overwrite: "auto",
        duration: 0.8,
        ease: "power2.out"
      });
    };

    const archEl = archSectionRef.current;
    if (archEl) {
      archEl.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      ctx.revert();
      lenis.destroy();
      if (archEl) {
        archEl.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <div ref={rootRef} className="relative bg-transparent text-[#0f172a] font-sans selection:bg-[#1e9bd4] selection:text-white">

      {/* Background ambient water glow */}
      <div className="fixed inset-0 pointer-events-none -z-30 overflow-hidden">
        <div className="absolute top-[10%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#1a6fc4]/5 blur-[150px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#1e9bd4]/5 blur-[130px]" />
      </div>

      {/* ============================================================
          HEADER (Aquacultural navigation themed in sidebar blues)
          ============================================================ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-6 md:px-12 flex items-center justify-between ${scrolled ? "py-4 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm" : "py-6 bg-transparent"
        }`}>
        <Link href="/" className="flex items-center gap-3 cursor-pointer select-none group">
          <div className="p-2.5 rounded-xl bg-white/70 border border-blue-200/50 shadow-sm group-hover:bg-white/90 transition-all">
            <Fish className="w-6 h-6 text-[#1a6fc4]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider text-[#0f172a] group-hover:text-[#1a6fc4] transition-colors">
              NEELA AI
            </h1>
            <p className="text-[9px] font-bold text-slate-500 tracking-widest uppercase -mt-1">Smart Aquaculture</p>
          </div>
        </Link>

        <nav className="hidden xl:flex items-center gap-8 font-semibold text-[11px] tracking-widest text-[#0f172a]/80">
          <Link href="/simulator" onClick={(e) => handleNavClick(e, "/simulator")} className={`hover:text-[#1a6fc4] transition-colors ${!isLoggedIn ? "opacity-40 cursor-not-allowed" : ""}`}>
            {!isLoggedIn && ""}IOT SIMULATOR
          </Link>
          <Link href="/actuator" onClick={(e) => handleNavClick(e, "/actuator")} className={`hover:text-[#1a6fc4] transition-colors ${!isLoggedIn ? "opacity-40 cursor-not-allowed" : ""}`}>
            {!isLoggedIn && ""}ACTUATOR
          </Link>
          <Link href="/ai-center" onClick={(e) => handleNavClick(e, "/ai-center")} className={`hover:text-[#1a6fc4] transition-colors ${!isLoggedIn ? "opacity-40 cursor-not-allowed" : ""}`}>
            {!isLoggedIn && ""}AI CENTER
          </Link>
          <Link href="/chat" onClick={(e) => handleNavClick(e, "/chat")} className={`hover:text-[#1a6fc4] transition-colors ${!isLoggedIn ? "opacity-40 cursor-not-allowed" : ""}`}>
            {!isLoggedIn && ""}NEELA AI CHAT
          </Link>
          <Link href="/alerts" onClick={(e) => handleNavClick(e, "/alerts")} className={`hover:text-[#1a6fc4] transition-colors ${!isLoggedIn ? "opacity-40 cursor-not-allowed" : ""}`}>
            {!isLoggedIn && ""}ALERTS
          </Link>
          <Link href="/analytics" onClick={(e) => handleNavClick(e, "/analytics")} className={`hover:text-[#1a6fc4] transition-colors ${!isLoggedIn ? "opacity-40 cursor-not-allowed" : ""}`}>
            {!isLoggedIn && ""}ANALYTICS
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/dashboard" onClick={(e) => handleNavClick(e, "/dashboard")}>
            <button className={`bg-gradient-to-r from-[#1a6fc4] to-[#1e9bd4] text-white font-black text-xs px-6 py-2.5 rounded-full hover:brightness-110 shadow-md shadow-blue-500/10 transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1.5 ${!isLoggedIn ? "opacity-60 cursor-not-allowed" : ""}`}>
              {!isLoggedIn && <Lock className="w-3.5 h-3.5" />}
              <span>System Dashboard</span>
            </button>
          </Link>
        </div>
      </header>

      {/* ============================================================
          HERO SECTION (WELCOMING LANDING + GLASSMORPHISM LOGIN CARD)
          ============================================================ */}
      <section ref={heroRef} className="min-h-screen pt-32 pb-16 flex items-center justify-center px-6 md:px-12 relative overflow-hidden">

        {/* Floating animated bubble circles (Cheerful sky blue fills) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="floating-bubble-item absolute top-[25%] left-[8%] w-12 h-12 rounded-full border border-blue-300/30 bg-blue-100/20 animate-float-slow" />
          <div className="floating-bubble-item absolute bottom-[20%] left-[25%] w-20 h-20 rounded-full border border-sky-300/20 bg-sky-100/15 animate-float-reverse" />
          <div className="floating-bubble-item absolute top-[35%] right-[22%] w-16 h-16 rounded-full border border-blue-200/20 bg-blue-50/20 animate-float-slow" />
          <div className="floating-bubble-item absolute bottom-[30%] right-[8%] w-24 h-24 rounded-full border border-cyan-300/30 bg-cyan-100/15 animate-float-reverse" />
        </div>

        {/* Diagonal light divider decoration */}
        <div className="absolute -top-[50%] left-[10%] w-[30%] h-[200%] bg-gradient-to-b from-white/30 via-transparent to-transparent blur-3xl rotate-45 pointer-events-none" />

        <div className="w-full max-w-7xl grid lg:grid-cols-12 gap-12 items-center relative z-10">

          {/* Left Column: Welcoming info */}
          <div className="lg:col-span-7 text-left">

            <h1 className="font-black text-4xl md:text-5xl lg:text-6xl leading-[1.08] tracking-tight uppercase text-[#0f172a] mb-6">
              AUTOMATED <br />
              DECISION FOR <br />
              <span className="text-[#1a6fc4] font-light lowercase italic tracking-wide text-5xl md:text-6xl">tilapia</span> AQUACULTURE
            </h1>

            <p className="text-slate-655 text-sm md:text-base max-w-xl leading-relaxed mb-8">
              NEELA AI is an intelligent agent architecture combining machine learning
              <strong> Extra Trees</strong> and <strong>Large Language Models (LLM)</strong>
              to monitor water parameters, predict risk status, and actuate pond control (aerator, water pump, pH correction) automatically.
            </p>

            {/* Quick Metrics Widgets */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mb-8">
              <div className="bg-white/70 border border-blue-100 rounded-2xl p-4 hover:border-[#1a6fc4]/30 transition-all cursor-default shadow-sm">
                <div className="text-2xl font-black text-[#1a6fc4]">96%</div>
                <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">Classifier Accuracy</div>
              </div>
              <div className="bg-white/70 border border-blue-100 rounded-2xl p-4 hover:border-[#1a6fc4]/30 transition-all cursor-default shadow-sm">
                <div className="text-2xl font-black text-[#1a6fc4]">4 Sensors</div>
                <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">IoT Telemetry</div>
              </div>
              <div className="bg-white/70 border border-blue-100 rounded-2xl p-4 hover:border-[#1a6fc4]/30 transition-all cursor-default shadow-sm">
                <div className="text-2xl font-black text-[#1a6fc4]">24/7</div>
                <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">Pond Security</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 tracking-wider">
              <span>ESP32 DEV NODE</span>
              <span>•</span>
              <span>FASTAPI BACKEND</span>
              <span>•</span>
              <span>EXPLAINABLE AI (XAI)</span>
            </div>
          </div>

          {/* Right Column: Glassmorphic Cheerful Login box or Welcome Back Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            {isLoggedIn ? (
              <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-blue-200 rounded-3xl p-8 shadow-xl relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-full blur-xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#1e9bd4]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="text-center mb-8">
                  <div className="inline-flex p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 mb-3 animate-pulse">
                    <Fish className="w-6 h-6 text-emerald-600 animate-bounce" />
                  </div>

                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] font-black text-emerald-600 tracking-widest uppercase">Pond Session Active</span>
                  </div>

                  <h2 className="text-2xl font-black text-[#0f172a] tracking-wide uppercase">Welcome Back</h2>
                  <p className="text-xs text-slate-550 font-semibold mt-1">
                    Logged in as <span className="text-[#1a6fc4] font-bold">{typeof window !== "undefined" ? (localStorage.getItem("neela_operator_email") || "operator@neela.ai") : "operator@neela.ai"}</span>
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/70 flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Active Node</span>
                      <span className="text-xs font-extrabold text-[#1a6fc4] uppercase">ESP32-POND-01</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Signal Strength</span>
                      <span className="text-xs font-extrabold text-emerald-600 uppercase">Excellent</span>
                    </div>
                  </div>

                </div>

                <div className="space-y-3">
                  <Link href="/dashboard" className="block">
                    <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1a6fc4] to-[#1e9bd4] hover:brightness-110 text-white font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer transition-all active:scale-[0.98]">
                      <span>Enter Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-800 font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <LogOut className="w-4 h-4 text-slate-400" />
                    <span>Sign Out</span>
                  </button>
                </div>

                <div className="mt-2 pt-2 border-t border-blue-50 text-center">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                    Telemetry Sync Running 24/7
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md bg-white/75 backdrop-blur-xl border border-blue-100 rounded-3xl p-8 shadow-xl relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-full blur-xl pointer-events-none" />

                <div className="text-center mb-8">
                  <div className="inline-flex p-3 rounded-2xl bg-blue-50 border border-blue-200 mb-3">
                    <BrainCircuit className="w-6 h-6 text-[#1a6fc4]" />
                  </div>
                  <h2 className="text-2xl font-black text-[#0f172a] tracking-wide uppercase">System Portal</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Sign in to access pond settings and AI logs</p>

                  <div className="mt-3 inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/25 rounded-xl text-[9px] font-bold text-amber-700 tracking-wider uppercase">
                    Hint: operator@neela.ai | password123
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold tracking-widest text-[#1a6fc4] uppercase block">Email Address</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        placeholder="operator@neela.ai"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-blue-200 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-semibold placeholder-slate-300 focus:outline-none focus:border-[#1a6fc4] focus:ring-2 focus:ring-blue-100 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold tracking-widest text-[#1a6fc4] uppercase block">Password</label>
                      <a href="#reset" className="text-[10px] font-bold text-slate-450 hover:text-[#1a6fc4] uppercase transition-colors">Forgot?</a>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white border border-blue-200 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-semibold placeholder-slate-300 focus:outline-none focus:border-[#1a6fc4] focus:ring-2 focus:ring-blue-100 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="login-submit-btn w-full py-4 rounded-2xl bg-gradient-to-r from-[#1a6fc4] to-[#1e9bd4] hover:brightness-110 text-white font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    {loading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <span>Enter Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-blue-50 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Secure Node Access Connection
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ============================================================
          SECTION 1: INTRO TEXT (GSAP TEXT SHIFT REVEAL)
          ============================================================ */}
      <section ref={introRef} className="py-28 px-6 flex flex-col items-center justify-center text-center relative border-y border-blue-100 bg-white/40">
        <div className="max-w-4xl mx-auto">
          <p className="reveal-text text-3xl md:text-[40px] leading-relaxed text-slate-300 select-none font-medium text-center">
            Our intelligent agent NEELA AI integrates Internet of Things (IoT) sensors, Extra Trees decision models, and Large Language Model (LLM) reasoning to protect Oreochromis niloticus (tilapia) ponds, optimize water quality, and automate actuator responses in real-time.
          </p>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: SYSTEM ARCHITECTURE (GSAP & LENIS FLOATING CANVAS)
          Scatters 15 cartoon IoT drawings absolutely across a scroll trigger
          parallax canvas to wow the user with zero text overlaps.
          ============================================================ */}
      <section
        id="architecture-floating-sec"
        ref={archSectionRef}
        className="py-36 min-h-[120vh] relative z-10 overflow-hidden bg-transparent flex items-center justify-center"
      >

        {/* Parallax background ambient water bubbles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="why-parallax-bubble absolute top-[15%] left-[8%] w-16 h-16 rounded-full border border-blue-200 bg-blue-100/10" />
          <div className="why-parallax-bubble absolute bottom-[15%] right-[8%] w-24 h-24 rounded-full border border-sky-200 bg-sky-100/10" />
        </div>

        {/* Dynamic Title perfectly centered inside the section */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-0 px-6">
          <span className="font-black text-xs tracking-widest text-[#1e9bd4] uppercase block mb-2">POND DECISION SYSTEM</span>
          <h2 className="font-black text-4xl md:text-5xl lg:text-6xl text-[#1a6fc4] uppercase tracking-wider mb-4">
            System Architecture
          </h2>
          <p className="font-bold text-xs tracking-widest text-slate-400 uppercase max-w-md leading-relaxed">
            Move your cursor and scroll to interact with the floating sensors and ML decision tree models
          </p>
        </div>

        {/* Scattered Vector Playground */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="relative w-full h-full">
            {FLOATING_PLAYGROUND.map((item) => {
              const Cartoon = item.component;

              // Calculate style options dynamically
              const positionStyle = {
                top: item.top,
                transform: `scale(${item.scale})`
              };
              if (item.left) positionStyle.left = item.left;
              if (item.right) positionStyle.right = item.right;

              return (
                <div
                  key={item.id}
                  className="playground-node absolute pointer-events-auto select-none flex flex-col items-center group cursor-pointer"
                  style={positionStyle}
                  data-speed={item.speed}
                >
                  {/* Inner element is animated with continuous random drifting */}
                  <div className="cartoon-inner transition-transform duration-300 group-hover:scale-110 filter drop-shadow-md">
                    <Cartoon className="w-20 h-20 md:w-24 md:h-24" />
                  </div>
                  {/* Floating minimal description badge tag */}
                  <span className="mt-2.5 px-3 py-1 bg-white/90 backdrop-blur-md border border-blue-200 text-[8px] md:text-[9px] font-black text-[#1a6fc4] uppercase tracking-widest rounded-full shadow-sm opacity-80 group-hover:opacity-100 transition-opacity">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* ============================================================
          SECTION 3: SYSTEM ARCHITECTURE FLOWCHART
          ============================================================ */}
      <section ref={flowSectionRef} className="py-28 px-6 bg-white/30 border-y border-blue-100 relative">
        <div className="max-w-6xl mx-auto text-center">

          <div className="mb-16">
            <span className="font-black text-xs tracking-widest text-[#1e9bd4] uppercase block mb-2">OPERATIONAL WORKFLOW</span>
            <h2 className="font-black text-4xl uppercase tracking-wider text-[#1a6fc4]">Hybrid Decision Flow</h2>
            <p className="font-medium text-lg text-slate-500 italic mt-1">Data pipeline from sensory acquisition to automated output</p>
          </div>

          {/* Block Diagram Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch relative">
            {/* Step 1 */}
            <div className="flow-node bg-white border border-blue-100 rounded-2xl p-6 flex flex-col items-center justify-between hover:border-blue-300 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#1a6fc4] mb-4">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#1a6fc4] uppercase tracking-wider">Step 01</span>
                <h4 className="font-black text-sm uppercase text-[#0f172a] mt-1 mb-2">IoT Sensors</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">DS18B20 Temp, pH probe, Optical DO, and Turbidity stream pond metrics.</p>
              </div>
              <div className="text-[10px] font-bold text-slate-400 mt-4 uppercase">ESP32 Module</div>
            </div>

            {/* Step 2 */}
            <div className="flow-node bg-white border border-blue-100 rounded-2xl p-6 flex flex-col items-center justify-between hover:border-blue-300 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-[#1a6fc4] mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#1a6fc4] uppercase tracking-wider">Step 02</span>
                <h4 className="font-black text-sm uppercase text-[#0f172a] mt-1 mb-2">FastAPI API</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">Backend routes incoming data packets, computes DO estimation, and triggers models.</p>
              </div>
              <div className="text-[10px] font-bold text-slate-400 mt-4 uppercase">REST Endpoints</div>
            </div>

            {/* Step 3 */}
            <div className="flow-node bg-white border border-blue-100 rounded-2xl p-6 flex flex-col items-center justify-between hover:border-blue-300 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-[#1a6fc4] mb-4">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#1a6fc4] uppercase tracking-wider">Step 03</span>
                <h4 className="font-black text-sm uppercase text-[#0f172a] mt-1 mb-2">Extra Trees</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">200 decision trees evaluate multi-sensor parameters to predict health classification.</p>
              </div>
              <div className="text-[10px] font-bold text-emerald-600 mt-4 uppercase">96% Accuracy</div>
            </div>

            {/* Step 4 */}
            <div className="flow-node bg-white border border-blue-100 rounded-2xl p-6 flex flex-col items-center justify-between hover:border-blue-300 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-[#1a6fc4] mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#1a6fc4] uppercase tracking-wider">Step 04</span>
                <h4 className="font-black text-sm uppercase text-[#0f172a] mt-1 mb-2">Decision Actuator</h4>
                <p className="text-[11px] text-slate-655 leading-relaxed">Rule-Based systems command relays for aerators and pumps based on safety limits.</p>
              </div>
              <div className="text-[10px] font-bold text-rose-600 mt-4 uppercase">Emergency Buzzer</div>
            </div>

            {/* Step 5 */}
            <div className="flow-node bg-white border border-blue-100 rounded-2xl p-6 flex flex-col items-center justify-between hover:border-blue-300 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-[#1a6fc4] mb-4">
                <MessageSquareCode className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#1a6fc4] uppercase tracking-wider">Step 05</span>
                <h4 className="font-black text-sm uppercase text-[#0f172a] mt-1 mb-2">LLM Explainer</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">Generates natural language explanations and advice for farm managers on actions.</p>
              </div>
              <div className="text-[10px] font-bold text-slate-400 mt-4 uppercase">Next.js Web UI</div>
            </div>
          </div>

          <div className="mt-12 inline-flex items-center gap-2 p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-[#1a6fc4] font-semibold max-w-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Hybrid Architecture successfully handles high-frequency sensor streams with sub-second decision output.</span>
          </div>

        </div>
      </section>

      {/* ============================================================
          SECTION 4: RESEARCH AUTHORS & CREDITS (HORIZONTAL SCROLL)
          ============================================================ */}
      <section ref={creditsSectionRef} className="py-24 overflow-hidden relative">
        <div className="text-center mb-16">
          <span className="font-black text-xs tracking-widest text-[#1e9bd4] uppercase block mb-2">PROJECT TEAM</span>
          <h2 className="font-black text-4xl uppercase tracking-wider text-[#1a6fc4]">Developed by Researchers</h2>
          <p className="font-medium text-lg text-slate-500 italic mt-1">Multi-disciplinary team from NEELA AI Research Lab</p>
        </div>

        {/* Horizontal scroll track */}
        <div ref={creditsTrackRef} className="flex gap-6 px-12 md:px-24 whitespace-nowrap cursor-grab active:cursor-grabbing w-max">
          {AUTHORS.map((author, i) => (
            <div
              key={i}
              className={`inline-block w-[300px] md:w-[360px] rounded-3xl border p-8 whitespace-normal transform transition-all duration-300 hover:scale-[1.02] ${author.bg}`}
            >
              <div className="border border-blue-150 rounded-2xl py-3 px-4 flex items-center justify-between mb-6 bg-white/70">
                <span className="w-2 h-2 rounded-full bg-[#1a6fc4]" />
                <span className="font-black text-[10px] tracking-widest text-[#1a6fc4]">AUTHOR CREDIT</span>
                <span className="w-2 h-2 rounded-full bg-[#1a6fc4]" />
              </div>

              <h4 className="font-black text-xl text-[#0f172a] leading-snug uppercase mb-2">
                {author.name}
              </h4>
              <p className="font-bold text-xs text-[#1a6fc4] mb-4">
                {author.role}
              </p>
              <p className="text-xs text-slate-500">
                {author.id}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer className="bg-[#f0f7ff] pt-24 pb-12 px-6 md:px-12 border-t border-blue-200/60 relative z-10">
        <div className="max-w-6xl mx-auto">

          <div className="grid md:grid-cols-4 gap-12 mb-16">

            {/* Col 1: Logo */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-3 select-none mb-4">
                <div className="p-2.5 rounded-xl bg-white border border-blue-100 shadow-sm">
                  <Fish className="w-6 h-6 text-[#1a6fc4]" />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-wider text-[#0f172a]">NEELA AI</h1>
                  <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase -mt-1 block">Smart Aquaculture</span>
                </div>
              </div>
              <p className="text-[11px] font-medium leading-relaxed text-slate-500 max-w-[200px]">
                Hybrid decision system merging Internet of Things, Extra Trees, and LLM explainability.
              </p>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="flex flex-col gap-3 items-center md:items-start">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">NAVIGATION</span>
              <Link href="/dashboard" onClick={(e) => handleNavClick(e, "/dashboard")} className={`font-bold text-xs text-slate-700 hover:text-[#1a6fc4] transition-colors uppercase flex items-center gap-1 ${!isLoggedIn ? "opacity-50 cursor-not-allowed" : ""}`}>
                {!isLoggedIn && "🔒 "}DASHBOARD
              </Link>
              <Link href="/simulator" onClick={(e) => handleNavClick(e, "/simulator")} className={`font-bold text-xs text-slate-700 hover:text-[#1a6fc4] transition-colors uppercase flex items-center gap-1 ${!isLoggedIn ? "opacity-50 cursor-not-allowed" : ""}`}>
                {!isLoggedIn && "🔒 "}IOT SIMULATOR
              </Link>
              <Link href="/actuator" onClick={(e) => handleNavClick(e, "/actuator")} className={`font-bold text-xs text-slate-700 hover:text-[#1a6fc4] transition-colors uppercase flex items-center gap-1 ${!isLoggedIn ? "opacity-50 cursor-not-allowed" : ""}`}>
                {!isLoggedIn && "🔒 "}ACTUATOR
              </Link>
              <Link href="/ai-center" onClick={(e) => handleNavClick(e, "/ai-center")} className={`font-bold text-xs text-slate-700 hover:text-[#1a6fc4] transition-colors uppercase flex items-center gap-1 ${!isLoggedIn ? "opacity-50 cursor-not-allowed" : ""}`}>
                {!isLoggedIn && "🔒 "}AI CENTER
              </Link>
              <Link href="/chat" onClick={(e) => handleNavClick(e, "/chat")} className={`font-bold text-xs text-slate-700 hover:text-[#1a6fc4] transition-colors uppercase flex items-center gap-1 ${!isLoggedIn ? "opacity-50 cursor-not-allowed" : ""}`}>
                {!isLoggedIn && "🔒 "}NEELA AI CHAT
              </Link>
            </div>

            {/* Col 3: Tech Links */}
            <div className="flex flex-col gap-3 items-center md:items-start">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">SYSTEM FILES</span>
              <Link href="/alerts" onClick={(e) => handleNavClick(e, "/alerts")} className={`font-bold text-xs text-slate-700 hover:text-[#1a6fc4] transition-colors uppercase flex items-center gap-1 ${!isLoggedIn ? "opacity-50 cursor-not-allowed" : ""}`}>
                {!isLoggedIn && "🔒 "}ALERTS ENGINE
              </Link>
              <Link href="/analytics" onClick={(e) => handleNavClick(e, "/analytics")} className={`font-bold text-xs text-slate-700 hover:text-[#1a6fc4] transition-colors uppercase flex items-center gap-1 ${!isLoggedIn ? "opacity-50 cursor-not-allowed" : ""}`}>
                {!isLoggedIn && "🔒 "}ANALYTICS CENTER
              </Link>
              <Link href="/help" onClick={(e) => handleNavClick(e, "/help")} className={`font-bold text-xs text-slate-700 hover:text-[#1a6fc4] transition-colors uppercase flex items-center gap-1 ${!isLoggedIn ? "opacity-50 cursor-not-allowed" : ""}`}>
                {!isLoggedIn && "🔒 "}HELP CENTER
              </Link>
              <Link href="/settings" onClick={(e) => handleNavClick(e, "/settings")} className={`font-bold text-xs text-slate-700 hover:text-[#1a6fc4] transition-colors uppercase flex items-center gap-1 ${!isLoggedIn ? "opacity-50 cursor-not-allowed" : ""}`}>
                {!isLoggedIn && "🔒 "}SETTINGS
              </Link>
            </div>

            {/* Col 4: Tech Stack Badge */}
            <div className="flex flex-col items-center md:items-start">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3">SYSTEM INTEGRITY</span>
              <div className="bg-white border border-blue-100 rounded-2xl p-5 w-full shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ONLINE CONNECTION</span>
                </div>
                <p className="text-[11px] text-slate-655 leading-relaxed">FastAPI host: localhost:8000. Data telemetry synced via sqlite3 database.</p>
              </div>
            </div>

          </div>

          {/* Bottom copyright details */}
          <div className="pt-8 border-t border-blue-100 flex flex-col sm:flex-row justify-between items-center text-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>© 2026 NEELA AI. All rights reserved.</span>
            <span>Developed by Eirene C. · Farhan F. · Kelly S. · Vin Cen</span>
          </div>

        </div>
      </footer>

      {/* Premium Toast Notification */}
      {toast.show && (
        <div className={`toast-notification fixed top-24 right-6 z-50 flex items-center gap-3.5 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${toast.type === "success"
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800"
          : "bg-rose-500/10 border-rose-500/30 text-rose-850"
          }`}>
          <div className={`p-1.5 rounded-xl ${toast.type === "success" ? "bg-emerald-100" : "bg-rose-100"}`}>
            {toast.type === "success" ? (
              <Fish className="w-4 h-4 text-emerald-600 animate-pulse" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <span className="text-xs font-black tracking-wide uppercase">{toast.message}</span>
        </div>
      )}

    </div>
  );
}