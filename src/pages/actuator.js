import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function ActuatorPage() {

  const [mode, setMode] =
    useState("AUTONOMOUS");

  const [actuator, setActuator] =
    useState({

      aerator: false,

      feeder: true,

      pump: false,

      stabilizer: false,

      buzzer:false

    });

  const [history, setHistory] =
    useState([]);

  const [feedingSchedule, setFeedingSchedule] =
  useState({
    interval: 6,
    feedingTime: "08:00"
  });

  function toggleActuator(name) {

    if(mode !== "MANUAL") {

      alert(
        "Switch to Manual Mode first."
      );

      return;

    }

    const newValue =
      !actuator[name];

    setActuator({

      ...actuator,

      [name]: newValue

    });

    setHistory(prev => [

      {
        actuator: name,
        action:
          newValue
          ? "ON"
          : "OFF",
        timestamp:
          new Date()
          .toLocaleString()
      },

      ...prev

    ]);

  }

  return (

    <div className="md:flex">

      <Sidebar />

      <main className="flex-1 p-4 md:p-10">

        <h1 className="text-4xl font-bold mb-8">

          Actuator Control Center

        </h1>

        {/* MODE */}

        <div className="bg-white rounded-2xl shadow p-6 mb-8">

          <h2 className="text-2xl font-bold mb-4">

            Operating Mode

          </h2>

          <div className="flex gap-4">

            <button
              onClick={() =>
                setMode(
                  "AUTONOMOUS"
                )
              }
              className={`
                px-6 py-3 rounded-xl
                ${
                  mode === "AUTONOMOUS"
                  ? "bg-green-600 text-white"
                  : "bg-slate-100"
                }
              `}
            >

              Autonomous Mode

            </button>

            <button
              onClick={() =>
                setMode(
                  "MANUAL"
                )
              }
              className={`
                px-6 py-3 rounded-xl
                ${
                  mode === "MANUAL"
                  ? "bg-orange-600 text-white"
                  : "bg-slate-100"
                }
              `}
            >

              Manual Mode

            </button>

          </div>

        </div>

        {/* FEEDING SCHEDULE */}

<div className="bg-white rounded-2xl shadow p-6 mb-8">

  <h2 className="text-2xl font-bold mb-4">
Feeding Schedule

  </h2>

  <div className="grid md:grid-cols-2 gap-6">

<div>

  <label className="block mb-2 font-medium">

    Feed Every (Hours)

  </label>

  <input
    type="number"
    min="1"
    value={feedingSchedule.interval}
    onChange={(e) =>
      setFeedingSchedule({
        ...feedingSchedule,
        interval: e.target.value
      })
    }
    className="
      w-full
      border
      rounded-xl
      px-4
      py-2
    "
  />

</div>

<div>

  <label className="block mb-2 font-medium">

    Feeding Time

  </label>

  <input
    type="time"
    value={feedingSchedule.feedingTime}
    onChange={(e) =>
      setFeedingSchedule({
        ...feedingSchedule,
        feedingTime: e.target.value
      })
    }
    className="
      w-full
      border
      rounded-xl
      px-4
      py-2
    "
  />

</div>

  </div>

<button
className="
mt-4
bg-green-600
text-white
px-4
py-2
rounded-xl
"

>
Save Schedule

  </button>

</div>


        {/* ACTUATOR STATUS */}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">

          <ActuatorCard
            title="Aerator"
            status={
              actuator.aerator
            }
            onToggle={() =>
              toggleActuator(
                "aerator"
              )
            }
          />

          <ActuatorCard
            title="Feed Now"
            status={
              actuator.feeder
            }
            onToggle={() =>
              toggleActuator(
                "feeder"
              )
            }
          />

          <ActuatorCard
            title="Pump"
            status={
              actuator.pump
            }
            onToggle={() =>
              toggleActuator(
                "pump"
              )
            }
          />

          <ActuatorCard
            title="Stabilizer"
            status={
              actuator.stabilizer
            }
            onToggle={() =>
              toggleActuator(
                "stabilizer"
              )
            }
          />

          <ActuatorCard
            title="Buzzer"
            status={
                actuator.buzzer
            }
            onToggle={() =>
                toggleActuator(
                "buzzer"
                )
            }
            />

        </div>

        {/* MANUAL CONTROL */}

        <div className="bg-white rounded-2xl shadow p-8 mt-8">

          <h2 className="text-2xl font-bold mb-4">

            Manual Override Control

          </h2>

          <p className="text-gray-600">

            Current Mode:

            <span className="font-bold ml-2">

              {mode}

            </span>

          </p>

          {
            mode === "AUTONOMOUS"
            &&
            <div className="mt-4 text-green-700">

              AI controls all actuators automatically.

            </div>
          }

          {
            mode === "MANUAL"
            &&
            <div className="mt-4 text-orange-700">

              Manual override active.

            </div>
          }

        </div>

      </main>

    </div>

  );

}

function ActuatorCard({

  title,

  status,

  onToggle

}) {

  return (

    <div className="bg-white rounded-2xl shadow p-6">

      <h3 className="font-bold text-lg mb-4">

        {title}

      </h3>

      <div
        className={`
          text-2xl font-bold mb-4
          ${
            status
            ? "text-green-600"
            : "text-red-600"
          }
        `}
      >

        {
          status
          ? "ON"
          : "OFF"
        }

      </div>

      <button
        onClick={onToggle}
        className="
          px-4
          py-2
          bg-blue-600
          text-white
          rounded-xl
        "
      >

        Toggle

      </button>

    </div>

  );

}