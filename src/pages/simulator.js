import { useState } from "react";
import API from "../lib/api";
import Sidebar from "../components/Sidebar";

export default function Simulator() {

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

  return (

    <div className="md:flex">

      <Sidebar />

      <main className="flex-1 p-4 md:p-10">

        <h1 className="text-4xl font-bold mb-8">

          IoT Device Simulator

        </h1>

        <div className="bg-white rounded-2xl shadow p-8">

          <div className="grid grid-cols-2 gap-6">

  <div>

    <label className="block mb-2 font-semibold">

      Temperature (°C)

    </label>

    <input
      type="number"
      value={sensor.temperature}
      onChange={(e)=>
        setSensor({
          ...sensor,
          temperature:Number(e.target.value)
        })
      }
      className="w-full border p-3 rounded-xl"
    />

  </div>

  <div>

    <label className="block mb-2 font-semibold">

      Dissolved Oxygen (mg/L)

    </label>

    <input
      type="number"
      value={sensor.do}
      onChange={(e)=>
        setSensor({
          ...sensor,
          do:Number(e.target.value)
        })
      }
      className="w-full border p-3 rounded-xl"
    />

  </div>

  <div>

    <label className="block mb-2 font-semibold">

      pH

    </label>

    <input
      type="number"
      value={sensor.ph}
      onChange={(e)=>
        setSensor({
          ...sensor,
          ph:Number(e.target.value)
        })
      }
      className="w-full border p-3 rounded-xl"
    />

  </div>

  <div>

    <label className="block mb-2 font-semibold">

      Turbidity (NTU)

    </label>

    <input
      type="number"
      value={sensor.turbidity}
      onChange={(e)=>
        setSensor({
          ...sensor,
          turbidity:Number(e.target.value)
        })
      }
      className="w-full border p-3 rounded-xl"
    />

  </div>

</div>

          <button
            onClick={sendData}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl"
          >

            Send Data

          </button>

        </div>

        <div className="bg-white rounded-2xl shadow p-8 mt-8">

          <h2 className="text-2xl font-bold mb-4">

            Quick Test

          </h2>

          <div className="flex flex-wrap gap-4">

            <button
              onClick={healthyPond}
              className="px-4 py-2 bg-green-600 text-white rounded-xl"
            >
              Healthy Pond
            </button>

            <button
              onClick={lowDO}
              className="px-4 py-2 bg-yellow-500 text-white rounded-xl"
            >
              Low DO
            </button>

            <button
              onClick={highTemp}
              className="px-4 py-2 bg-orange-500 text-white rounded-xl"
            >
              High Temp
            </button>

            <button
              onClick={badPH}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl"
            >
              Bad pH
            </button>

            <button
              onClick={criticalPond}
              className="px-4 py-2 bg-red-600 text-white rounded-xl"
            >
              Critical Pond
            </button>

          </div>

        </div>

      </main>

    </div>

  );

}