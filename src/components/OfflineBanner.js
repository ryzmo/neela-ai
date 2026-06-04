export default function OfflineBanner({
  lastSync
}) {

  return (

    <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-xl mb-6">

      <div className="font-semibold">

        ⚠ Server Offline

      </div>

      <div className="text-sm mt-1">

        Last Sync: {lastSync}

      </div>

      <div className="text-sm">

        Showing cached data

      </div>

      <div className="text-sm">

        Waiting for reconnection...

      </div>

    </div>

  );

}