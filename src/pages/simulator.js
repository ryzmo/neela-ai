import { useState } from "react";
import API from "../lib/api";
import Sidebar from "../components/Sidebar";

export default function Simulator() {

// ==========================================
// FIELD TESTING SCENARIOS
// ==========================================

function normalMorning() {

  setSensor({

    temperature: 27.18,
    do: 6.18,
    ph: 7.91,
    turbidity: 3.25,
    hour: 6

  });

}

function normalAfternoon() {

  setSensor({

    temperature: 27.85,
    do: 6.68,
    ph: 7.88,
    turbidity: 3.48,
    hour: 14

  });

}

function thermalStress() {

  setSensor({

    temperature: 28.35,
    do: 7.89,
    ph: 8.00,
    turbidity: 2.79,
    hour: 15

  });

}

function lowOxygen() {

  setSensor({

    temperature: 28.00,
    do: 4.50,
    ph: 7.90,
    turbidity: 3.20,
    hour: 5

  });

}

function combinedRisk() {

  setSensor({

    temperature: 30.50,
    do: 4.20,
    ph: 8.20,
    turbidity: 5.00,
    hour: 16

  });

}

function criticalCondition() {

  setSensor({

    temperature: 33.00,
    do: 2.00,
    ph: 5.80,
    turbidity: 30.00,
    hour: 14

  });

}

  const [sensor, setSensor] = useState({

    temperature: 28,
    do: 7,
    ph: 7.2,
    turbidity: 8,
    hour: 14

  });

  async function sendData() {

    try {

      const response =
        await API.post(
          "/analyze",
          sensor
        );

      alert(
        "Data sent successfully"
      );

      console.log(
        response.data
      );

    }

    catch {

      alert(
        "Server Offline"
      );

    }

  }

  function healthyPond() {

    setSensor({

      temperature: 28,
      do: 7,
      ph: 7.2,
      turbidity: 8,
      hour: 14

    });

  }

  function lowDO() {

    setSensor({

      temperature: 28,
      do: 3,
      ph: 7.2,
      turbidity: 8,
      hour: 14

    });

  }

  function highTemp() {

    setSensor({

      temperature: 33,
      do: 6,
      ph: 7.2,
      turbidity: 8,
      hour: 14

    });

  }

  function badPH() {

    setSensor({

      temperature: 28,
      do: 6,
      ph: 5.8,
      turbidity: 8,
      hour: 14

    });

  }

  function criticalPond() {

    setSensor({

      temperature: 33,
      do: 2,
      ph: 5.8,
      turbidity: 30,
      hour: 14

    });

  }

  function buzzerTest() {

  setSensor({

    temperature: 34,

    do: 2,

    ph: 5.5,

    turbidity: 40,

    hour: 14

  });

}

  return (
  <div className="min-h-screen bg-slate-50">
    <div className="md:flex">
      <Sidebar />

      <main className="flex-1 p-4 md:p-10 ">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1 text-sm font-semibold mb-4">
            🌊 Smart Aquaculture Platform
          </div>

          <h1 className="text-4xl font-black text-slate-800">
            IoT Device Simulator
          </h1>

          <p className="text-slate-500 mt-2">
            Simulate water quality scenarios for AI prediction and actuator
            testing
          </p>
        </div>

        {/* Sensor Configuration */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Sensor Configuration
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                label: "Temperature (°C)",
                value: sensor.temperature,
                key: "temperature",
              },
              {
                label: "Dissolved Oxygen (mg/L)",
                value: sensor.do,
                key: "do",
              },
              {
                label: "pH Level",
                value: sensor.ph,
                key: "ph",
              },
              {
                label: "Turbidity (NTU)",
                value: sensor.turbidity,
                key: "turbidity",
              },
              {
                label: "Hour",
                value: sensor.hour,
                key: "hour",
              },
            ].map((field) => (
              <div key={field.key}>
                <label className="block mb-2 font-semibold text-slate-700">
                  {field.label}
                </label>

                <input
                  type="number"
                  value={field.value}
                  onChange={(e) =>
                    setSensor({
                      ...sensor,
                      [field.key]: Number(e.target.value),
                    })
                  }
                  className="
                    w-full
                    border
                    border-slate-300
                    rounded-2xl
                    px-4
                    py-3
                    outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    focus:border-blue-500
                    transition
                  "
                />
              </div>
            ))}
          </div>

          <button
            onClick={sendData}
            className="
              mt-8
              bg-blue-600
              hover:bg-blue-700
              text-white
              font-semibold
              px-8
              py-3
              rounded-2xl
              shadow-md
              transition-all
              hover:-translate-y-1
            "
          >
            Send Data
          </button>
        </div>

        {/* Field Testing */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mt-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Field Data Testing
          </h2>

          <p className="text-slate-500 mb-6">
            Real samples from IoT Monitoring Dataset of Water Quality and
            Tilapia Health in Montería, Colombia (2024)
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={normalMorning}
              className="
                bg-green-500
                hover:bg-green-600
                text-white
                font-semibold
                p-4
                rounded-2xl
                transition-all
                hover:-translate-y-1
              "
            >
              Normal Morning
            </button>

            <button
              onClick={normalAfternoon}
              className="
                bg-green-500
                hover:bg-green-600
                text-white
                font-semibold
                p-4
                rounded-2xl
                transition-all
                hover:-translate-y-1
              "
            >
              Normal Afternoon
            </button>

            <button
              onClick={lowOxygen}
              className="
                bg-yellow-500
                hover:bg-yellow-600
                text-white
                font-semibold
                p-4
                rounded-2xl
                transition-all
                hover:-translate-y-1
              "
            >
              Low Oxygen
            </button>

            <button
              onClick={thermalStress}
              className="
                bg-orange-500
                hover:bg-orange-600
                text-white
                font-semibold
                p-4
                rounded-2xl
                transition-all
                hover:-translate-y-1
              "
            >
              Thermal Stress
            </button>

            <button
              onClick={combinedRisk}
              className="
                bg-red-500
                hover:bg-red-600
                text-white
                font-semibold
                p-4
                rounded-2xl
                transition-all
                hover:-translate-y-1
              "
            >
              Combined Risk
            </button>

            <button
              onClick={criticalCondition}
              className="
                bg-red-700
                hover:bg-red-800
                text-white
                font-semibold
                p-4
                rounded-2xl
                transition-all
                hover:-translate-y-1
              "
            >
              Critical Emergency
            </button>
          </div>
        </div>

        {/* Additional Testing */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mt-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Quick Testing Scenarios
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button
              onClick={healthyPond}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium p-3 rounded-xl transition"
            >
              Healthy Pond
            </button>

            <button
              onClick={lowDO}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium p-3 rounded-xl transition"
            >
              Low DO
            </button>

            <button
              onClick={highTemp}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium p-3 rounded-xl transition"
            >
              High Temp
            </button>

            <button
              onClick={badPH}
              className="bg-red-500 hover:bg-red-600 text-white font-medium p-3 rounded-xl transition"
            >
              Bad pH
            </button>

            <button
              onClick={buzzerTest}
              className="bg-red-700 hover:bg-red-800 text-white font-medium p-3 rounded-xl transition"
            >
              Buzzer Test
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
);

}