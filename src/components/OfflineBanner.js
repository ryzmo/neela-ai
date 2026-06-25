import { WifiOff } from "lucide-react";

export default function OfflineBanner({ lastSync }) {
  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl mb-6">
      <WifiOff size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />

      <div>
        <p className="font-semibold">Server offline</p>
        <p className="text-sm text-amber-700 mt-0.5">
          Last sync: {lastSync} · showing cached data · waiting for reconnection…
        </p>
      </div>
    </div>
  );
}