"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import {
  LayoutDashboard,
  Settings,
  Radio,
  Activity,
  Cpu,
  BrainCircuit,
  History,
  TriangleAlert,
  BarChart3,
  Menu,
  X,
  Fish,
  CircleHelp,
  LogOut,
  MessageSquare
} from "lucide-react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("neela_logged_in");
    localStorage.removeItem("neela_operator_email");
    router.push("/");
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: Radio,
      label: "IoT Simulator",
      href: "/simulator",
    },
    {
      icon: Cpu,
      label: "Actuator Control",
      href: "/actuator",
    },
    {
      icon: BrainCircuit,
      label: "AI Center",
      href: "/ai-center",
    },
    {
      icon: MessageSquare,
      label: "Neela AI Chat",
      href: "/chat",
    },
    {
      icon: TriangleAlert,
      label: "Alerts",
      href: "/alerts",
    },
    {
      icon: BarChart3,
      label: "Analytics",
      href: "/analytics",
    },
    {
  icon: CircleHelp,
  label: "Help Center",
  href: "/help",
},
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
    },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div
        className="
          md:hidden
          flex
          items-center
          justify-between
          px-5
          py-4
          bg-white/10
          backdrop-blur-xl
          border-b
          border-white/20
          text-white
          relative
          z-50
        "
      >
        <div className="flex items-center gap-2">
          <Fish className="text-cyan-300" size={28} />

          <div>
            <h1 className="font-black text-xl">
              NEELA AI
            </h1>

            <p className="text-xs text-white/70">
              Smart Aquaculture
            </p>
          </div>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="
            p-2
            rounded-xl
            bg-white/10
            hover:bg-white/20
            transition-all
          "
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="
            fixed
            inset-0
            bg-black/40
            backdrop-blur-sm
            z-40
            md:hidden
          "
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static
          top-0 left-0
          min-h-screen
          w-72
          z-50

          backdrop-blur-2xl
          border-r border-white/20

          transform transition-transform duration-300

          ${
            open
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
        style={{
          background:
            "linear-gradient(180deg, rgba(26,111,196,0.95) 0%, rgba(30,155,212,0.92) 50%, rgba(93,211,240,0.9) 100%)",
        }}
      >
        {/* Bubble Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-6 w-16 h-16 rounded-full bg-white/10" />

          <div className="absolute top-60 left-8 w-8 h-8 rounded-full bg-white/10" />

          <div className="absolute bottom-32 right-10 w-12 h-12 rounded-full bg-white/10" />
        </div>

        <div className="relative z-10 flex flex-col h-full p-8">

          {/* Logo */}
          <Link
  href="/"
  onClick={() => setOpen(false)}
  className="
    flex
    items-center
    gap-3
    cursor-pointer
    group
    mb-10
  "
>
  <div
    className="
      p-3
      rounded-2xl
      bg-white/20
      backdrop-blur-md
      transition-all
      group-hover:bg-white/30
    "
  >
    <Fish
      size={30}
      className="
        text-cyan-200
        group-hover:text-white
        transition-colors
      "
    />
  </div>

  <div>
    <h1
      className="
        text-3xl
        font-black
        text-white
        group-hover:text-cyan-200
        transition-colors
      "
    >
      NEELA AI
    </h1>

    <p className="text-sm text-white/70">
      Smart Aquaculture
    </p>
  </div>
</Link>

          {/* Navigation */}
          <nav className="flex-1">
            <ul className="space-y-3">
              {menuItems.map((item) => {
                const Icon = item.icon;

                const active =
                  router.pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() =>
                        setOpen(false)
                      }
                      className={`
                        flex
                        items-center
                        gap-4
                        px-4
                        py-3
                        rounded-2xl
                        transition-all
                        duration-200

                        ${
                          active
                            ? `
                              bg-white/25
                              backdrop-blur-md
                              text-white
                              shadow-lg
                              scale-[1.02]
                            `
                            : `
                              text-white/80
                              hover:bg-white/15
                              hover:text-white
                              hover:translate-x-1
                            `
                        }
                      `}
                    >
                      <Icon size={22} />

                      <span className="font-semibold">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Status Card */}
          <div
            className="
              mt-6
              p-4
              rounded-2xl
              bg-white/15
              backdrop-blur-md
              border border-white/20
            "
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="
                  w-3
                  h-3
                  rounded-full
                  bg-green-400
                  animate-pulse
                "
              />

              <span className="font-bold text-white">
                System Online
              </span>
            </div>

            <p className="text-sm text-white/70">
              AI Engine Active
            </p>

            <p className="text-sm text-white/70">
              Pond Monitoring Running
            </p>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="
              mt-4
              w-full
              flex
              items-center
              justify-center
              gap-3
              px-4
              py-3.5
              rounded-2xl
              bg-red-500/10
              hover:bg-red-500/20
              text-red-100
              border border-red-500/20
              hover:border-red-500/40
              transition-all
              duration-200
              font-bold
              text-xs
              tracking-wider
              uppercase
              cursor-pointer
            "
          >
            <LogOut size={16} className="text-red-300 animate-pulse" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}