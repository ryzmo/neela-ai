import Sidebar from "../components/Sidebar";

import DashboardHeader from "../components/DashboardHeader";
import OfflineBanner from "../components/OfflineBanner";
import SensorOverview from "../components/SensorOverview";
import SensorHistoryChart from "../components/SensorHistoryChart";
import AIDecisionSummary from "../components/AIDecisionSummary";

import useAquaAgent from "../hooks/useAquaAgent";

export default function Home() {

  const {

    data,
    history,
    serverConnected,
    lastSync

  } = useAquaAgent();

  return (

    <div className="md:flex">

      <Sidebar />

      <main className="flex-1 p-4 md:p-10">

        <DashboardHeader
          serverConnected={serverConnected}
          lastSync={lastSync}
        />

        {
          !serverConnected &&
          <OfflineBanner
            lastSync={lastSync}
          />
        }

        <SensorOverview
          sensor={data.sensor_data}
        />

        <SensorHistoryChart
          history={history}
        />

        <AIDecisionSummary
          data={data}
        />

      </main>

    </div>

  );

}