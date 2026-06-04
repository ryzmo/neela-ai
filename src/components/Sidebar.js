"use client";

import { useState } from "react";
import Link from "next/link";

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
  X

} from "lucide-react";

export default function Sidebar() {

  const [open, setOpen] =
    useState(false);

  const menuItems = [

    {
      icon: <LayoutDashboard />,
      label: "Dashboard",
      href: "/"
    },

    {
      icon: <Radio />,
      label: "IoT Simulator",
      href: "/simulator"
    },

    {
      icon: <Activity />,
      label: "Monitoring",
      href: "/monitoring"
    },

    {
      icon: <Cpu />,
      label: "Actuator Control",
      href: "/actuator"
    },

    {
      icon: <BrainCircuit />,
      label: "AI Center",
      href: "/ai-center"
    },

    {
      icon: <History />,
      label: "Decision Logs",
      href: "/decision-history"
    },

    {
      icon: <TriangleAlert />,
      label: "Alerts",
      href: "/alerts"
    },

    {
      icon: <BarChart3 />,
      label: "Analytics",
      href: "/analytics"
    },

    {
      icon: <Settings />,
      label: "Settings",
      href: "/settings"
    }

  ];

  return (

    <>

      {/* MOBILE HEADER */}

      <div
        className="
          md:hidden
          flex
          items-center
          justify-between
          bg-blue-700
          text-white
          p-4
        "
      >

        <h1 className="font-bold text-xl">

          AQUAAGENT

        </h1>

        <button
          onClick={() =>
            setOpen(!open)
          }
        >

          {
            open
            ? <X />
            : <Menu />
          }

        </button>

      </div>

      {/* OVERLAY */}

      {
        open && (

          <div
            className="
              fixed
              inset-0
              bg-black/40
              z-40
              md:hidden
            "
            onClick={() =>
              setOpen(false)
            }
          />

        )
      }

      {/* SIDEBAR */}

      <div

        className={`

          fixed
          md:static

          top-0
          left-0

          h-screen

          w-72

          bg-blue-700
          text-white

          p-8

          z-50

          transform
          transition-transform
          duration-300

          ${
            open
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
          }

        `}
      >

        <h1 className="text-3xl font-bold">

          AQUAAGENT

        </h1>

        <ul className="mt-10 space-y-6">

          {

            menuItems.map(

              (item,index) => (

                <li
                  key={index}
                >

                  <Link

                    href={item.href}

                    onClick={() =>
                      setOpen(false)
                    }

                    className="
                      flex
                      gap-3
                      hover:text-blue-200
                    "

                  >

                    {item.icon}

                    {item.label}

                  </Link>

                </li>

              )

            )

          }

        </ul>

      </div>

    </>

  );

}