import { useEffect, useState } from "react";
import API from "../lib/api";

export default function useAquaAgent() {

  const [data, setData] = useState({
    sensor_data: {
      temperature: "-",
      do: "-",
      ph: "-",
      turbidity: "-"
    },
    health_status: "-",
    risk_level: "-",
    aerator: "-",
    feeder: "-",
    water_circulation: "-",
    ph_neutralizer: "-",
    reason: "Waiting for IoT device..."
  });

  const [history, setHistory] = useState([]);
  const [serverConnected, setServerConnected] = useState(false);
  const [lastSync, setLastSync] = useState("-");



  function loadCache() {

    const cachedData =
      localStorage.getItem(
        "last_aquaagent_data"
      );

    const cachedHistory =
      localStorage.getItem(
        "history"
      );

    const cachedSync =
      localStorage.getItem(
        "last_sync"
      );

    if (cachedData) {

      setData(
        JSON.parse(cachedData)
      );

    }

    if (cachedHistory) {

      setHistory(
        JSON.parse(cachedHistory)
      );

    }

    if (cachedSync) {

      setLastSync(
        cachedSync
      );

    }

  }

  async function runCycle() {

    try {

      const online =
        await checkServer();

      if (!online) return;

      await fetchLatest();

      await fetchHistory();

    }

    catch (err) {

      console.log(
        "RunCycle Error:",
        err
      );

    }

  }

  async function checkServer() {

    try {

      await API.get("/");

      setServerConnected(true);

      return true;

    }

    catch {

      setServerConnected(false);

      return false;

    }

  }

  async function fetchLatest() {

    try {

      const response =
        await API.get(
          "/latest"
        );

      if (
        response.data.message
      ) return;

      setData(
        response.data
      );

      localStorage.setItem(
        "last_aquaagent_data",
        JSON.stringify(
          response.data
        )
      );

      const syncTime =
        new Date()
          .toLocaleString();

      setLastSync(
        syncTime
      );

      localStorage.setItem(
        "last_sync",
        syncTime
      );

    }

    catch (err) {

      console.log(
        "Latest Error:",
        err
      );

    }

  }

  async function fetchHistory() {

    try {

      const response =
        await API.get(
          "/history"
        );

      const historyData =
        response.data.reverse();

      setHistory(
        historyData
      );

      localStorage.setItem(
        "history",
        JSON.stringify(
          historyData
        )
      );

    }

    catch (err) {

      console.log(
        "History Error:",
        err
      );

    }

  }

  useEffect(() => {

    setTimeout(() => {
      loadCache();
      runCycle();
    }, 0);

    const interval =
      setInterval(
        runCycle,
        5000
      );

    return () =>
      clearInterval(interval);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {

    data,
    history,
    serverConnected,
    lastSync

  };

}