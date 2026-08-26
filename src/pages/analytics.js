import { useState } from "react";
import SensorChart from "../components/SensorChart";
import Sidebar from "../components/Sidebar";
import useAquaAgent from "../hooks/useAquaAgent";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Thermometer,
  Droplets,
  FlaskConical,
  Waves,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function AnalyticsPage() {
  const { history } = useAquaAgent();

  const [filterLevel, setFilterLevel] = useState("ALL");
  const [showAll, setShowAll] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  function showToast(message, type = "success") {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4000);
  }

  const filteredData =
    filterLevel === "ALL"
      ? history
      : history.filter((item) => item.health_status === filterLevel);

  const avgTemperature = history.length
    ? (
        history.reduce((a, b) => a + Number(b.temperature), 0) /
        history.length
      ).toFixed(1)
    : "-";

  const avgDO = history.length
    ? (
        history.reduce((a, b) => a + Number(b.do), 0) /
        history.length
      ).toFixed(2)
    : "-";

  const avgPH = history.length
    ? (
        history.reduce((a, b) => a + Number(b.ph), 0) /
        history.length
      ).toFixed(2)
    : "-";

  const avgTurbidity = history.length
    ? (
        history.reduce((a, b) => a + Number(b.turbidity), 0) /
        history.length
      ).toFixed(2)
    : "-";

  const avgWaterLevel = history.length
    ? (
        history.reduce((a, b) => a + Number(b.water_level ?? 0), 0) /
        history.length
      ).toFixed(1)
    : "-";

  const sortedData = [...filteredData].sort((a, b) => b.id - a.id);
  const displayedData = showAll ? sortedData : sortedData.slice(0, 5);

  function exportCSV() {
    try {
      const headers = [
        "Timestamp",
        "Temperature",
        "DO",
        "pH",
        "Turbidity",
        "Water Level",
        "Health Status"
      ];

      const rows = history.map((item) => [
        item.timestamp,
        item.temperature,
        item.do,
        item.ph,
        item.turbidity,
        item.water_level,
        item.health_status
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `water_quality_report_${Date.now()}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      showToast("Laporan kualitas air berhasil diexport ke file CSV!", "success");
    } catch (err) {
      showToast("Gagal mengunduh file CSV.", "error");
      console.error(err);
    }
  }

  function exportPDF() {
    try {
      const doc = new jsPDF();

      // Report Header Block
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("NEELA AQUACULTURE SYSTEM", 14, 15);

      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42);
      doc.text("Water Quality Analytics Report", 14, 21);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 25, 196, 25);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`GENERATED: ${new Date().toLocaleString()}`, 14, 31);

      // Averages Summary Card
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 36, 182, 30, "F");
      
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, 36, 182, 30, "D");

      // Column 1: Temp
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("AVG TEMPERATURE", 20, 43);
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(`${avgTemperature} °C`, 20, 51);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("Optimal Limit: < 30°C", 20, 58);

      // Column 2: DO
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("AVG DISSOLVED O2", 80, 43);
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(`${avgDO} mg/L`, 80, 51);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("Optimal Limit: > 5.0 mg/L", 80, 58);

      // Column 3: pH
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("AVG PH BALANCE", 140, 43);
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(String(avgPH), 140, 51);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("Optimal Limit: 6.5 - 8.0", 140, 58);

      // Render Historical Log Table
      autoTable(doc, {
        startY: 74,
        head: [
          [
            "Timestamp",
            "Temp (°C)",
            "DO (mg/L)",
            "pH",
            "Turbidity (NTU)",
            "Water Level (cm)",
            "Diagnosis Status"
          ]
        ],
        body: history.map((item) => [
          item.timestamp,
          item.temperature,
          item.do,
          item.ph,
          item.turbidity,
          item.water_level,
          item.health_status
        ]),
        styles: {
          fontSize: 8,
          font: "helvetica",
          textColor: [51, 65, 85]
        },
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontStyle: "bold"
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        margin: { left: 14, right: 14 }
      });

      doc.save(`water_quality_report_${Date.now()}.pdf`);
      showToast("Dokumen analisis kolam berhasil diexport ke file PDF!", "success");
    } catch (err) {
      showToast("Gagal mengunduh file PDF.", "error");
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 relative">
      
      {/* Toast Notifications */}
      {toast.visible && (
        <div className={`fixed top-6 right-6 z-50 rounded-2xl border p-4 shadow-2xl flex items-center gap-3 transition-all duration-300 ${
          toast.type === "success" 
            ? "bg-emerald-50 border-emerald-250 text-emerald-800" 
            : "bg-rose-50 border-rose-250 text-rose-800"
        }`}>
          {toast.type === "success" 
            ? <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-pulse" /> 
            : <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
          }
          <span className="text-xs font-black tracking-wide uppercase">{toast.message}</span>
        </div>
      )}

      <div className="md:flex">
        <Sidebar />

        <main className="flex-1 min-w-0 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-wide uppercase">
                    Analytics & Reports
                  </h1>
                  <p className="text-xs font-bold text-slate-450 uppercase tracking-widest mt-0.5">
                    Historical telemetry statistics & decision logs
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Analytics Online</span>
            </div>
          </div>

          {/* TELEMETRY AVERAGES CARD GRID */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide mb-6">
              Water Quality Statistics (Averages)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4.5">
              <AnalyticsCard
                title="Temperature"
                value={avgTemperature}
                unit="°C"
                theme="amber"
              />
              <AnalyticsCard
                title="Oxygen (DO)"
                value={avgDO}
                unit="mg/L"
                theme="cyan"
              />
              <AnalyticsCard
                title="pH Balance"
                value={avgPH}
                unit=""
                theme="teal"
              />
              <AnalyticsCard
                title="Turbidity"
                value={avgTurbidity}
                unit="NTU"
                theme="blue"
              />
              <AnalyticsCard
                title="Water Level"
                value={avgWaterLevel}
                unit="%"
                theme="indigo"
              />
            </div>
          </div>

          {/* SENSOR HISTORICAL CHART */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
            <SensorChart history={history} />
          </div>



          {/* AUDIT LOG TABLE LIST */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                  AI Decision Audit Logs
                </h2>
                <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest mt-0.5">
                  Historical telemetry inputs & automated evaluations
                </p>
              </div>

              {/* Filtering segmented controls */}
              <div className="flex flex-wrap gap-2">
                {["ALL", "Stable", "At Risk"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setFilterLevel(level)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                      filterLevel === level
                        ? "bg-[#1a6fc4] border-[#1a6fc4] text-white shadow-lg shadow-blue-500/10"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-150 shadow-inner">
              <table className="w-full min-w-[800px] border-collapse bg-white">
                <thead>
                  <tr className="border-b bg-[#f8fafc] text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="p-4 text-left">Timestamp</th>
                    <th className="p-4 text-left">Sensor Readings snapshot</th>
                    <th className="p-4 text-left">HGB Status Output</th>
                    <th className="p-4 text-left">Final System Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredData.length > 0 ? (
                    displayedData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-600">{item.timestamp}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-3 font-semibold text-[10.5px]">
                            <span className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700">
                              Temp: <strong className="font-bold text-slate-800">{item.temperature}°C</strong>
                            </span>
                            <span className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700">
                              DO: <strong className="font-bold text-slate-800">{item.do} mg/L</strong>
                            </span>
                            <span className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700">
                              pH: <strong className="font-bold text-slate-800">{item.ph}</strong>
                            </span>
                            <span className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700">
                              Turb: <strong className="font-bold text-slate-800">{item.turbidity} NTU</strong>
                            </span>
                            {item.water_level && (
                              <span className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700">
                                Water: <strong className="font-bold text-slate-800">{item.water_level}%</strong>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            item.health_status?.toLowerCase().includes("risk")
                              ? "bg-rose-100 text-rose-800 border-rose-200"
                              : "bg-emerald-100 text-emerald-800 border-emerald-200"
                          }`}>
                            {item.health_status}
                          </span>
                        </td>
                        <td className="p-4 font-black">
                          <span className={`text-[10px] uppercase tracking-wide ${
                            item.health_status?.toLowerCase().includes("risk")
                              ? "text-rose-700"
                              : "text-slate-500"
                          }`}>
                            {item.health_status?.toLowerCase().includes("risk")
                              ? "Corrective Action Triggered"
                              : "Normal Idle Status"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-400 font-bold uppercase tracking-wide">
                        No decision history logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {sortedData.length > 5 && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  {showAll ? (
                    <>
                      <span>Show Less</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>View Full Audit Trail</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* REPORT EXPORT MANAGEMENT */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide mb-2">
              Export Analysis Reports
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Download historical records in spreadsheet formats for external analysis, regulatory audits, or offline records.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={exportPDF}
                className="p-5 rounded-2xl bg-white border border-rose-200 hover:border-rose-450 hover:bg-rose-50/20 text-rose-700 font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <span className="block font-black">Export PDF Document</span>
                    <span className="block text-[9.5px] text-rose-500/70 font-semibold tracking-normal mt-0.5">Includes metadata, stats & audit trail</span>
                  </div>
                </div>
                <Download className="w-5 h-5 text-rose-500" />
              </button>

              <button
                onClick={exportCSV}
                className="p-5 rounded-2xl bg-white border border-emerald-250 hover:border-emerald-450 hover:bg-emerald-50/20 text-emerald-700 font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <span className="block font-black">Export CSV Spreadsheet</span>
                    <span className="block text-[9.5px] text-emerald-600/70 font-semibold tracking-normal mt-0.5">Compatible with Excel & Google Sheets</span>
                  </div>
                </div>
                <Download className="w-5 h-5 text-emerald-600" />
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

function AnalyticsCard({ title, value, unit, theme }) {
  const themeStyles = {
    amber: {
      bar: "bg-amber-500"
    },
    cyan: {
      bar: "bg-cyan-500"
    },
    teal: {
      bar: "bg-teal-500"
    },
    blue: {
      bar: "bg-blue-500"
    },
    indigo: {
      bar: "bg-indigo-500"
    }
  };

  const currentTheme = themeStyles[theme] || themeStyles.blue;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
      {/* Top Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${currentTheme.bar}`} />

      <div>
        {/* Header: Title */}
        <div className="mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">
            {title}
          </span>
        </div>

        {/* Value + Unit Row */}
        <div className="flex items-baseline flex-wrap gap-1.5 my-1">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}