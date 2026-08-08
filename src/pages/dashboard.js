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

      <main className="flex-1 min-w-0 p-4 md:p-10">

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

        <AIDecisionSummary
          data={data}
        />

        <div className="mt-8">
          <SensorOverview
            sensor={data.sensor_data}
          />
        </div>

        <SensorHistoryChart
          history={history}
        />

      </main>

    </div>

  );

}