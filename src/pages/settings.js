import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function SettingsPage() {

  const [settings, setSettings] = useState({

    autoMode: true,

    doThreshold: 5,

    phMin: 6.5,

    phMax: 8.0,

    tempMax: 30,

    turbidityMax: 15,

    aiEnabled: true,

    refreshInterval: 5

  });

  function updateSetting(
    key,
    value
  ) {

    setSettings({

      ...settings,

      [key]: value

    });

  }

  function saveSettings() {

    localStorage.setItem(

      "aquaagent_settings",

      JSON.stringify(
        settings
      )

    );

    alert(
      "Settings saved successfully"
    );

  }

  return (

    <div className="md:flex">

      <Sidebar />

      <main className="flex-1 p-4 md:p-10">

        <h1 className="text-4xl font-bold mb-8">

          System Settings

        </h1>

        {/* SYSTEM MODE */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold mb-6">

            System Configuration

          </h2>

          <div className="flex items-center justify-between">

            <div>

              <h3 className="font-semibold">

                Autonomous Mode

              </h3>

              <p className="text-gray-500">

                Allow AI to control actuators automatically

              </p>

            </div>

            <input
              type="checkbox"
              checked={settings.autoMode}
              onChange={(e)=>
                updateSetting(
                  "autoMode",
                  e.target.checked
                )
              }
            />

          </div>

        </div>

        {/* SENSOR THRESHOLD */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold mb-6">

            Sensor Threshold Configuration

          </h2>

          <div className="grid grid-cols-2 gap-5">

            <InputField
              label="Minimum DO"
              value={settings.doThreshold}
              onChange={(v)=>
                updateSetting(
                  "doThreshold",
                  v
                )
              }
            />

            <InputField
              label="Maximum Temperature"
              value={settings.tempMax}
              onChange={(v)=>
                updateSetting(
                  "tempMax",
                  v
                )
              }
            />

            <InputField
              label="Minimum pH"
              value={settings.phMin}
              onChange={(v)=>
                updateSetting(
                  "phMin",
                  v
                )
              }
            />

            <InputField
              label="Maximum pH"
              value={settings.phMax}
              onChange={(v)=>
                updateSetting(
                  "phMax",
                  v
                )
              }
            />

            <InputField
              label="Maximum Turbidity"
              value={settings.turbidityMax}
              onChange={(v)=>
                updateSetting(
                  "turbidityMax",
                  v
                )
              }
            />

          </div>

        </div>

        {/* AI SETTINGS */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold mb-6">

            AI Configuration

          </h2>

          <div className="flex items-center justify-between mb-5">

            <div>

              <h3 className="font-semibold">

                AI Decision Engine

              </h3>

              <p className="text-gray-500">

                Enable Random Forest + LLM

              </p>

            </div>

            <input
              type="checkbox"
              checked={settings.aiEnabled}
              onChange={(e)=>
                updateSetting(
                  "aiEnabled",
                  e.target.checked
                )
              }
            />

          </div>

          <div>

            <label className="block mb-2">

              Refresh Interval (seconds)

            </label>

            <input
              type="number"
              value={
                settings.refreshInterval
              }
              onChange={(e)=>
                updateSetting(
                  "refreshInterval",
                  Number(
                    e.target.value
                  )
                )
              }
              className="
                border
                rounded-xl
                p-3
                w-full
              "
            />

          </div>

        </div>

        {/* DEVICE SETTINGS */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold mb-6">

            IoT Device Configuration

          </h2>

          <div className="space-y-4">

            <div>

              <label className="block mb-2">

                Device ID

              </label>

              <input
                defaultValue="AQA-001"
                className="
                  border
                  rounded-xl
                  p-3
                  w-full
                "
              />

            </div>

            <div>

              <label className="block mb-2">

                MQTT Broker

              </label>

              <input
                defaultValue="mqtt://localhost"
                className="
                  border
                  rounded-xl
                  p-3
                  w-full
                "
              />

            </div>

          </div>

        </div>

        {/* SAVE */}

        <button
          onClick={saveSettings}
          className="
            px-8
            py-4
            bg-blue-600
            text-white
            rounded-xl
            font-semibold
          "
        >

          Save Settings

        </button>

      </main>

    </div>

  );

}

function InputField({

  label,

  value,

  onChange

}) {

  return (

    <div>

      <label className="block mb-2">

        {label}

      </label>

      <input
        type="number"
        value={value}
        onChange={(e)=>
          onChange(
            Number(
              e.target.value
            )
          )
        }
        className="
          border
          rounded-xl
          p-3
          w-full
        "
      />

    </div>

  );

}