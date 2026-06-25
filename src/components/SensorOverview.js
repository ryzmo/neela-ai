import SensorCard from "./SensorCard";

export default function SensorOverview({ sensor }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <SensorCard title="Temperature" value={sensor.temperature} unit="°C" />
      <SensorCard title="DO" value={sensor.do} unit="mg/L" />
      <SensorCard title="pH" value={sensor.ph} unit="pH" />
      <SensorCard title="Turbidity" value={sensor.turbidity} unit="NTU" />
    </div>
  );
}