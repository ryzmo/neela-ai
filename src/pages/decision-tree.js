import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import API from "../lib/api";
import useAquaAgent from "../hooks/useAquaAgent";
import {
  GitFork,
  TreePine,
  Thermometer,
  Droplets,
  FlaskConical,
  Waves,
  Clock,
  Zap,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Play,
  RotateCcw,
  Info,
  Layers,
  Target,
  Maximize2,
  Minimize2,
  ArrowRight,
  X,
  Radio,
  Sliders,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

/* ─── colour helpers ─── */
const STATUS_CFG = {
  Stable: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-500",
    glow: "animate-glow-green",
    edgeColor: "#10b981",
    fill: "#ecfdf5",
    ringLight: "ring-emerald-200",
  },
  "At Risk": {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-500",
    glow: "animate-glow-red",
    edgeColor: "#ef4444",
    fill: "#fef2f2",
    ringLight: "ring-red-200",
  },
};

const FEATURE_LABELS = {
  TEMP: "Suhu Air",
  DO: "Dissolved O₂",
  PH: "pH",
  TURBIDITY: "Turbiditas",
  hour: "Jam",
  risk_flag: "Risk Flag",
  PH_dev: "pH Deviasi",
  TEMP_dev: "Suhu Deviasi",
  TURB_dev: "Turb. Deviasi",
  DO_dev: "DO Deviasi",
  PH_dist_7: "pH Dist. 7",
  TEMP_DO_ratio: "Suhu/DO",
  TURB_DO_ratio: "Turb./DO",
  TEMP_PH_ratio: "Suhu/pH",
  hour_sin: "Jam Sin",
  hour_cos: "Jam Cos",
};

/* ─── Card wrapper (reusable) ─── */
function Panel({ children, title, subtitle, icon: Icon, extra, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                <Icon size={16} className="text-blue-600" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-slate-800">{title}</h3>
              {subtitle && (
                <p className="text-[10px] font-semibold text-slate-400 tracking-wide uppercase">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {extra}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ─── Sensor Slider ─── */
function SensorSlider({ label, unit, icon: Icon, iconClass, value, min, max, step, onChange, disabled }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-md border ${iconClass}`}>
            <Icon size={13} />
          </div>
          <span className="text-xs font-bold text-slate-600">{label}</span>
        </div>
        <span className="text-xs font-black text-slate-800 tabular-nums">
          {typeof value === "number" ? value : 0} <span className="text-slate-400 font-semibold">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={typeof value === "number" ? value : min}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-1.5 rounded-full appearance-none accent-blue-500
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-blue-500
                   [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                   [&::-webkit-slider-thumb]:shadow-md
                   [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125
                   ${disabled ? "bg-slate-100 cursor-not-allowed opacity-60" : "bg-slate-200 cursor-pointer"}`}
      />
      <div className="flex justify-between text-[9px] font-semibold text-slate-300">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

/* ─── Feature Importance bar ─── */
function FeatureBar({ name, importance, maxImportance, rank }) {
  const pct = maxImportance > 0 ? (importance / maxImportance) * 100 : 0;
  const label = FEATURE_LABELS[name] || name;
  return (
    <div className="flex items-center gap-3">
      <span className="w-5 text-right text-[10px] font-black text-slate-300">#{rank}</span>
      <span className="w-24 text-[11px] font-bold text-slate-600 truncate" title={name}>
        {label}
      </span>
      <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-14 text-right text-[11px] font-black text-slate-700 tabular-nums">
        {importance.toFixed(1)}%
      </span>
    </div>
  );
}

/* ━━━ SVG TREE RENDERER ━━━ */

function layoutTree(node, depth = 0, xOffset = { val: 0 }, positions = {}, spacing = { x: 160, y: 100 }) {
  if (!node) return positions;
  if (node.left) layoutTree(node.left, depth + 1, xOffset, positions, spacing);
  positions[node.id] = { x: xOffset.val * spacing.x, y: depth * spacing.y };
  xOffset.val += 1;
  if (node.right) layoutTree(node.right, depth + 1, xOffset, positions, spacing);
  return positions;
}

function TreeCanvas({ tree, pathNodeIds, onNodeClick, terminalPrediction }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);

  const pathSet = useMemo(() => new Set(pathNodeIds || []), [pathNodeIds]);
  const cfg = STATUS_CFG[terminalPrediction] || STATUS_CFG.Stable;

  const positions = useMemo(() => {
    if (!tree) return {};
    return layoutTree(tree, 0, { val: 0 }, {}, { x: 160, y: 110 });
  }, [tree]);

  useEffect(() => {
    if (!tree || !containerRef.current || Object.keys(positions).length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xs = Object.values(positions).map((p) => p.x);
    const ys = Object.values(positions).map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const treeW = maxX - minX + 180;
    const treeH = maxY - minY + 120;
    const scaleX = rect.width / treeW;
    const scaleY = rect.height / treeH;
    const scale = Math.min(scaleX, scaleY, 1) * 0.85;
    const cx = rect.width / 2 - ((maxX + minX) / 2) * scale;
    const cy = 40;
    setTransform({ x: cx, y: cy, scale });
    setReady(true);
  }, [tree, positions]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setTransform((prev) => {
      const zoom = e.deltaY > 0 ? 0.92 : 1.08;
      const newScale = Math.min(Math.max(prev.scale * zoom, 0.15), 2.5);
      return { ...prev, scale: newScale };
    });
  }, []);

  const handleMouseDown = useCallback((e) => {
    dragging.current = true;
    dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  }, [transform]);

  const handleMouseMove = useCallback((e) => {
    if (!dragging.current) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    }));
  }, []);

  const handleMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  function resetView() {
    if (!containerRef.current || Object.keys(positions).length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xs = Object.values(positions).map((p) => p.x);
    const ys = Object.values(positions).map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const treeW = maxX - minX + 180;
    const treeH = maxY - minY + 120;
    const scaleX = rect.width / treeW;
    const scaleY = rect.height / treeH;
    const scale = Math.min(scaleX, scaleY, 1) * 0.85;
    const cx = rect.width / 2 - ((maxX + minX) / 2) * scale;
    setTransform({ x: cx, y: 40, scale });
  }

  function collectEdges(node, arr = []) {
    if (!node) return arr;
    if (node.left) {
      arr.push({ from: node.id, to: node.left.id, direction: "left" });
      collectEdges(node.left, arr);
    }
    if (node.right) {
      arr.push({ from: node.id, to: node.right.id, direction: "right" });
      collectEdges(node.right, arr);
    }
    return arr;
  }

  function collectNodes(node, arr = []) {
    if (!node) return arr;
    arr.push(node);
    if (node.left) collectNodes(node.left, arr);
    if (node.right) collectNodes(node.right, arr);
    return arr;
  }

  const edges = useMemo(() => (tree ? collectEdges(tree) : []), [tree]);
  const nodes = useMemo(() => (tree ? collectNodes(tree) : []), [tree]);

  if (!tree) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[500px] md:h-[550px] rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute top-3 right-3 z-20 flex gap-1.5">
        <button
          onClick={() => setTransform((p) => ({ ...p, scale: Math.min(p.scale * 1.25, 2.5) }))}
          className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm text-xs font-bold"
        >
          +
        </button>
        <button
          onClick={() => setTransform((p) => ({ ...p, scale: Math.max(p.scale * 0.8, 0.15) }))}
          className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm text-xs font-bold"
        >
          −
        </button>
        <button
          onClick={resetView}
          className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
        >
          <Maximize2 size={12} />
        </button>
      </div>

      <div className="absolute bottom-3 left-3 z-20 flex gap-3 text-[9px] font-bold text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Active Path (Stable)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400" /> Active Path (At Risk)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-300" /> Inactive
        </span>
      </div>

      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ opacity: ready ? 1 : 0, transition: "opacity 0.3s" }}
      >
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
          {edges.map((e) => {
            const fromPos = positions[e.from];
            const toPos = positions[e.to];
            if (!fromPos || !toPos) return null;
            const isActive = pathSet.has(e.from) && pathSet.has(e.to);
            const color = isActive ? cfg.edgeColor : "#cbd5e1";
            const width = isActive ? 2.5 : 1.2;
            return (
              <line
                key={`${e.from}-${e.to}`}
                x1={fromPos.x + 60}
                y1={fromPos.y + 36}
                x2={toPos.x + 60}
                y2={toPos.y}
                stroke={color}
                strokeWidth={width}
                strokeLinecap="round"
                strokeDasharray={isActive ? "6 4" : "none"}
                style={
                  isActive
                    ? { animation: terminalPrediction === "At Risk" ? "edgeFlowRed 0.6s linear infinite" : "edgeFlowGreen 0.6s linear infinite" }
                    : {}
                }
                opacity={isActive ? 1 : 0.45}
              />
            );
          })}

          {nodes.map((n) => {
            const pos = positions[n.id];
            if (!pos) return null;
            const isActive = pathSet.has(n.id);
            const isLeaf = n.isLeaf;
            const pred = isLeaf ? n.prediction : terminalPrediction;

            const fillColor = isActive
              ? terminalPrediction === "Stable"
                ? "#ecfdf5"
                : "#fef2f2"
              : "#f8fafc";
            const strokeColor = isActive
              ? terminalPrediction === "Stable"
                ? "#10b981"
                : "#ef4444"
              : "#e2e8f0";
            const textColor = isActive
              ? terminalPrediction === "Stable"
                ? "#065f46"
                : "#991b1b"
              : "#64748b";

            return (
              <g
                key={n.id}
                className="animate-node-enter cursor-pointer"
                style={{ animationDelay: `${n.depth * 60}ms` }}
                onClick={() => onNodeClick && onNodeClick(n)}
              >
                {isActive && (
                  <rect
                    x={pos.x - 4}
                    y={pos.y - 4}
                    width={128}
                    height={44}
                    rx={14}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={1.5}
                    opacity={0.35}
                  >
                    <animate
                      attributeName="opacity"
                      values="0.2;0.5;0.2"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </rect>
                )}

                <rect
                  x={pos.x}
                  y={pos.y}
                  width={120}
                  height={36}
                  rx={10}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isActive ? 2 : 1}
                />

                <text
                  x={pos.x + 60}
                  y={pos.y + 14}
                  textAnchor="middle"
                  fill={textColor}
                  fontSize={isLeaf ? 9 : 8.5}
                  fontWeight={700}
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  {isLeaf ? pred : `${FEATURE_LABELS[n.feature] || n.feature}`}
                </text>

                {!isLeaf && (
                  <text
                    x={pos.x + 60}
                    y={pos.y + 27}
                    textAnchor="middle"
                    fill={isActive ? textColor : "#94a3b8"}
                    fontSize={7.5}
                    fontWeight={600}
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    ≤ {n.threshold}
                  </text>
                )}

                {isLeaf && (
                  <text
                    x={pos.x + 60}
                    y={pos.y + 27}
                    textAnchor="middle"
                    fill={isActive ? textColor : "#94a3b8"}
                    fontSize={7}
                    fontWeight={600}
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    {(n.confidence * 100).toFixed(0)}% conf
                  </text>
                )}

                <circle
                  cx={pos.x + 10}
                  cy={pos.y}
                  r={7}
                  fill={isActive ? strokeColor : "#e2e8f0"}
                />
                <text
                  x={pos.x + 10}
                  y={pos.y + 3}
                  textAnchor="middle"
                  fill="white"
                  fontSize={7}
                  fontWeight={800}
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  {n.id}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

/* ━━━ MAIN PAGE ━━━ */

export default function DecisionTreePage() {
  // Live IoT telemetry from backend
  const { data: liveData, serverConnected } = useAquaAgent();

  // Mode: "live" (follows current pond decision in real time) vs "simulator" (custom slider testing)
  const [inputMode, setInputMode] = useState("live");

  // Sensor state for simulation / manual testing
  const [sensor, setSensor] = useState({
    temperature: 27.5,
    do: 6.2,
    ph: 7.6,
    turbidity: 8.5,
    water_level: 75,
    hour: 14,
    source: "simulator",
  });

  // Tree state
  const [treeData, setTreeData] = useState(null);
  const [traceData, setTraceData] = useState(null);
  const [treeIdx, setTreeIdx] = useState(0);
  const [maxDepth, setMaxDepth] = useState(4);
  const [totalTrees, setTotalTrees] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [autoTrace, setAutoTrace] = useState(true);
  const debounceRef = useRef(null);

  // Sync sensor with Live Telemetry when liveData changes and inputMode is "live"
  useEffect(() => {
    if (inputMode === "live" && liveData?.sensor_data?.temperature !== "-" && liveData?.sensor_data?.temperature !== undefined) {
      const s = liveData.sensor_data;
      setSensor({
        temperature: parseFloat(s.temperature) || 27.5,
        do: parseFloat(s.do) || 6.2,
        ph: parseFloat(s.ph) || 7.5,
        turbidity: parseFloat(s.turbidity) || 8.0,
        water_level: parseFloat(s.water_level) || 75.0,
        hour: parseInt(s.hour) || new Date().getHours(),
        source: "live_telemetry"
      });
    }
  }, [liveData, inputMode]);

  // Function to pull latest live data once
  const syncWithLiveTelemetry = () => {
    if (liveData?.sensor_data?.temperature !== "-" && liveData?.sensor_data?.temperature !== undefined) {
      const s = liveData.sensor_data;
      setSensor({
        temperature: parseFloat(s.temperature) || 27.5,
        do: parseFloat(s.do) || 6.2,
        ph: parseFloat(s.ph) || 7.5,
        turbidity: parseFloat(s.turbidity) || 8.0,
        water_level: parseFloat(s.water_level) || 75.0,
        hour: parseInt(s.hour) || new Date().getHours(),
        source: "live_telemetry"
      });
      setInputMode("live");
    }
  };

  // Fetch tree + trace
  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const [structRes, traceRes] = await Promise.all([
        API.get("/tree-structure", { params: { tree_idx: treeIdx, depth: maxDepth } }),
        API.post(`/tree-trace?tree_idx=${treeIdx}&depth=${maxDepth}`, {
          ...sensor,
        }),
      ]);
      setTreeData(structRes.data);
      setTraceData(traceRes.data);
      setTotalTrees(structRes.data.totalTrees || 0);
    } catch (err) {
      console.error("Tree fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [treeIdx, maxDepth, sensor]);

  // Initial load
  useEffect(() => {
    fetchTree();
  }, [treeIdx, maxDepth]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-trace on sensor change (debounced)
  useEffect(() => {
    if (!autoTrace) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTree();
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [sensor, autoTrace]); // eslint-disable-line react-hooks/exhaustive-deps

  const ensemble = traceData?.ensemble;
  const steps = traceData?.selectedTree?.steps || [];
  const pathNodeIds = traceData?.selectedTree?.pathNodeIds || [];
  const featureImportances = traceData?.featureImportances || treeData?.featureImportances || [];
  const tree = traceData?.selectedTree?.tree || treeData?.tree;
  const terminalPred = traceData?.selectedTree?.terminalPrediction || (liveData?.health_status ? liveData.health_status : "Stable");
  const ensemblePred = ensemble?.prediction || liveData?.health_status || "Stable";
  const cfg = STATUS_CFG[ensemblePred] || STATUS_CFG.Stable;
  const maxFI = featureImportances.length > 0 ? featureImportances[0].importance : 1;

  const isLiveRisk = liveData?.health_status?.toLowerCase().includes("risk") || ensemblePred === "At Risk";

  function updateSensor(key, val) {
    if (inputMode === "live") {
      setInputMode("simulator");
    }
    setSensor((p) => ({ ...p, [key]: val }));
  }

  return (
    <div className="md:flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 min-w-0 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {/* ─── HEADER ─── */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-wide uppercase">
                  ExtraTrees Tree Visualizer
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Visualisasi percabangan pohon keputusan dari model ExtraTrees AI v4_v3
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-center">
            {/* Live pond status badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isLiveRisk ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLiveRisk ? "bg-red-400" : "bg-emerald-400"} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveRisk ? "bg-red-500" : "bg-emerald-500"}`} />
              </span>
              <span className="text-xs font-black uppercase tracking-wider">
                Live Pond: {liveData?.health_status || "Online"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600">
              <TreePine size={14} className="text-blue-600" />
              <span className="text-[11px] font-black">{totalTrees} Trees</span>
            </div>
          </div>
        </div>

        {/* ─── LIVE DECISION CONTEXT BANNER ─── */}
        <div className={`mb-6 rounded-2xl border p-4.5 transition-all ${isLiveRisk ? "bg-red-500/5 border-red-200" : "bg-emerald-500/5 border-emerald-200"}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isLiveRisk ? "bg-red-500 text-white" : "bg-emerald-500 text-white"} shadow-sm`}>
                {isLiveRisk ? <ShieldAlert size={22} /> : <ShieldCheck size={22} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Keputusan Model Terkini di Dashboard</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isLiveRisk ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {liveData?.rf_confidence ? `${(liveData.rf_confidence * 100).toFixed(1)}% Conf` : "100% Conf"}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  Status: <span className={isLiveRisk ? "text-red-600" : "text-emerald-600"}>{liveData?.health_status || "Stable"}</span> · Suhu: <span className="font-semibold">{sensor.temperature}°C</span>, DO: <span className="font-semibold">{sensor.do} mg/L</span>, pH: <span className="font-semibold">{sensor.ph}</span>, Turbiditas: <span className="font-semibold">{sensor.turbidity} NTU</span>
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2">
              <button
                onClick={syncWithLiveTelemetry}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  inputMode === "live"
                    ? "bg-blue-600 text-white shadow-blue-500/20"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Radio size={14} className={inputMode === "live" ? "animate-pulse" : ""} />
                <span>Sync Live Keputusan Terkini</span>
              </button>
              <button
                onClick={() => setInputMode("simulator")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  inputMode === "simulator"
                    ? "bg-blue-600 text-white shadow-blue-500/20"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Sliders size={14} />
                <span>Simulasi Manual</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── TOP: Ensemble Status + Voting + Tree Selector ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Ensemble Prediction */}
          <Panel
            title="Prediksi Ensemble ExtraTrees"
            subtitle="Hasil voting mayoritas 100 pohon"
            icon={ShieldCheck}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cfg.badge} shadow-lg`}
              >
                {ensemblePred === "Stable" ? (
                  <ShieldCheck size={26} className="text-white" />
                ) : (
                  <ShieldAlert size={26} className="text-white" />
                )}
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{ensemblePred}</p>
                <p className="text-xs font-semibold text-slate-400">
                  Tingkat Kepercayaan: {((ensemble?.confidence || 0) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </Panel>

          {/* Ensemble Voting */}
          <Panel
            title="Distribusi Voting Pohon"
            subtitle={`${totalTrees} Decision Trees Total`}
            icon={Layers}
          >
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Stable · {ensemble?.stableVotes ?? 0} Trees
                  </span>
                  <span className="text-emerald-600">
                    {(ensemble?.stablePercentage ?? 0).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                    style={{ width: `${ensemble?.stablePercentage ?? 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-red-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> At Risk · {ensemble?.riskVotes ?? 0} Trees
                  </span>
                  <span className="text-red-600">
                    {(ensemble?.riskPercentage ?? 0).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
                    style={{ width: `${ensemble?.riskPercentage ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
          </Panel>

          {/* Tree Selector */}
          <Panel
            title="Pemilihan Pohon Keputusan"
            subtitle={`Estimator #${treeIdx} · Hasil: ${terminalPred}`}
            icon={TreePine}
            extra={
              ensemble?.consensusTreeIndex !== undefined && (
                <button
                  onClick={() => setTreeIdx(ensemble.consensusTreeIndex)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black transition-all shadow-sm ${
                    treeIdx === ensemble.consensusTreeIndex
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                  }`}
                  title="Pilih pohon representatif yang mewakili keputusan mayoritas ensemble"
                >
                  <Sparkles size={11} />
                  <span>Pohon Konsensus (#{ensemble.consensusTreeIndex})</span>
                </button>
              )
            }
          >
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Pohon Terpilih (#{treeIdx})
                  </label>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((idx) => {
                      const vote = ensemble?.allTreeVotes?.[idx] || (idx === 0 ? "Stable" : "At Risk");
                      const isRisk = vote === "At Risk";
                      return (
                        <button
                          key={idx}
                          onClick={() => setTreeIdx(idx)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-black border transition flex items-center gap-1 ${
                            treeIdx === idx
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : isRisk
                              ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                              : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isRisk ? "bg-red-500" : "bg-emerald-500"}`} />
                          <span>#{idx}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min={0}
                    max={Math.max(totalTrees - 1, 0)}
                    value={treeIdx}
                    onChange={(e) => setTreeIdx(parseInt(e.target.value))}
                    className="flex-1 h-1.5 rounded-full bg-slate-200 appearance-none cursor-pointer accent-blue-500
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                             [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500
                             [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
                  />
                  <span className={`text-xs font-black px-2 py-0.5 rounded-md tabular-nums ${
                    terminalPred === "At Risk" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    #{treeIdx} ({terminalPred})
                  </span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Kedalaman Visualisasi (Depth)
                </label>
                <div className="flex gap-1.5 mt-1">
                  {[3, 4, 5, 6, 7, 8].map((d) => (
                    <button
                      key={d}
                      onClick={() => setMaxDepth(d)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all
                        ${
                          maxDepth === d
                            ? "bg-blue-500 text-white shadow-md"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* ─── SIMULATOR + TREE CANVAS ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-6">
          {/* Left: Sensor Controls */}
          <div className="lg:col-span-1 space-y-4">
            <Panel
              title={inputMode === "live" ? "Telemetri Air (Live Sync)" : "Simulator Parameter Air"}
              subtitle={inputMode === "live" ? "Mengikuti pembacaan sensor nyata" : "Geser untuk uji coba What-If"}
              icon={inputMode === "live" ? Radio : Activity}
              extra={
                <div className="flex items-center gap-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Auto</label>
                  <button
                    onClick={() => setAutoTrace(!autoTrace)}
                    className={`w-8 h-4 rounded-full relative transition-colors ${
                      autoTrace ? "bg-blue-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${
                        autoTrace ? "left-4" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              }
            >
              <div className="space-y-4">
                <SensorSlider
                  label="Suhu Air"
                  unit="°C"
                  icon={Thermometer}
                  iconClass="text-amber-600 bg-amber-50 border-amber-100"
                  value={sensor.temperature}
                  min={20}
                  max={40}
                  step={0.1}
                  onChange={(v) => updateSensor("temperature", v)}
                />
                <SensorSlider
                  label="DO (Oksigen Terlarut)"
                  unit="mg/L"
                  icon={Droplets}
                  iconClass="text-cyan-600 bg-cyan-50 border-cyan-100"
                  value={sensor.do}
                  min={0}
                  max={14}
                  step={0.1}
                  onChange={(v) => updateSensor("do", v)}
                />
                <SensorSlider
                  label="pH Air"
                  unit=""
                  icon={FlaskConical}
                  iconClass="text-teal-600 bg-teal-50 border-teal-100"
                  value={sensor.ph}
                  min={0}
                  max={14}
                  step={0.1}
                  onChange={(v) => updateSensor("ph", v)}
                />
                <SensorSlider
                  label="Turbiditas"
                  unit="NTU"
                  icon={Waves}
                  iconClass="text-blue-600 bg-blue-50 border-blue-100"
                  value={sensor.turbidity}
                  min={0}
                  max={50}
                  step={0.5}
                  onChange={(v) => updateSensor("turbidity", v)}
                />
                <SensorSlider
                  label="Jam Pengamatan"
                  unit=":00"
                  icon={Clock}
                  iconClass="text-indigo-600 bg-indigo-50 border-indigo-100"
                  value={sensor.hour}
                  min={0}
                  max={23}
                  step={1}
                  onChange={(v) => updateSensor("hour", v)}
                />
              </div>

              {/* Reset / Live Sync Button */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                <button
                  onClick={syncWithLiveTelemetry}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  <RefreshCw size={13} />
                  Ambil Data Terkini
                </button>
              </div>
            </Panel>
          </div>

          {/* Right: Tree Canvas */}
          <div className="lg:col-span-3">
            <Panel
              title={`Visualisasi Jalur Pohon #${treeIdx}`}
              subtitle={`Kedalaman ${maxDepth} · ${pathNodeIds.length} node dilewati (${terminalPred})`}
              icon={GitFork}
              extra={
                loading ? (
                  <span className="text-[10px] font-bold text-blue-500 flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    Menelusuri Jalur...
                  </span>
                ) : (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${terminalPred === "Stable" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    Hasil Leaf: {terminalPred}
                  </span>
                )
              }
            >
              <TreeCanvas
                tree={tree}
                pathNodeIds={pathNodeIds}
                terminalPrediction={terminalPred}
                onNodeClick={setSelectedNode}
              />
            </Panel>
          </div>
        </div>

        {/* ─── BOTTOM: Decision Trace + Feature Importance + Node Detail ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Decision Path Trace */}
          <div className="lg:col-span-2">
            <Panel
              title="Penelusuran Jalur Keputusan (Step-by-Step Trace)"
              subtitle={`Tree #${treeIdx} · ${steps.length} langkah evaluasi logika IF-THEN`}
              icon={ArrowRight}
            >
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
                {steps.length === 0 && (
                  <p className="text-xs text-slate-400 italic">
                    Sesuaikan parameter sensor untuk menelusuri jalur pohon...
                  </p>
                )}
                {steps.map((step, i) => {
                  const isLast = step.isLeaf;
                  const stepCfg =
                    STATUS_CFG[step.prediction || terminalPred] || STATUS_CFG.Stable;
                  return (
                    <div
                      key={i}
                      className={`flex gap-3 animate-node-enter`}
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      {/* Step connector */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white ${
                            isLast ? stepCfg.badge : "bg-blue-500"
                          }`}
                        >
                          {step.step}
                        </div>
                        {!isLast && (
                          <div className="w-0.5 flex-1 bg-slate-200 mt-1" />
                        )}
                      </div>

                      {/* Step content */}
                      <div
                        className={`flex-1 rounded-xl border p-3.5 mb-1 ${
                          isLast
                            ? `${stepCfg.bg} ${stepCfg.border}`
                            : "bg-white border-slate-200"
                        }`}
                      >
                        {isLast ? (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Target size={13} className={stepCfg.text} />
                              <span className={`text-xs font-black uppercase ${stepCfg.text}`}>
                                Terminal Leaf Node #{step.nodeId}
                              </span>
                            </div>
                            <p className="text-[11px] font-semibold text-slate-600">
                              Klasifikasi Akhir:{" "}
                              <span className={`font-black ${stepCfg.text}`}>
                                {step.prediction}
                              </span>
                              <span className="text-slate-400 ml-1">
                                ({step.value?.[0]} Sampel Stable / {step.value?.[1]} Sampel At Risk)
                              </span>
                            </p>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-bold text-slate-700">
                                Node #{step.nodeId}
                              </span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {FEATURE_LABELS[step.feature] || step.feature}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500">
                                = {step.actualValue}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500">
                                {step.conditionMet ? "≤" : ">"} {step.threshold}
                              </span>
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                  step.direction === "LEFT"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-amber-50 text-amber-600"
                                }`}
                              >
                                → Cabang {step.direction}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                              {step.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>

          {/* Right column: Feature Importance + Node Detail */}
          <div className="space-y-5">
            {/* Feature Importance */}
            <Panel
              title="Bobot Pengaruh Fitur"
              subtitle="Feature Importance ExtraTrees"
              icon={BarChart3}
            >
              <div className="space-y-2">
                {featureImportances.slice(0, 10).map((fi, i) => (
                  <FeatureBar
                    key={fi.feature}
                    name={fi.feature}
                    importance={fi.importance}
                    maxImportance={maxFI}
                    rank={i + 1}
                  />
                ))}
                {featureImportances.length === 0 && (
                  <p className="text-xs text-slate-400 italic">Memuat data fitur...</p>
                )}
              </div>
            </Panel>

            {/* Node Detail Inspector */}
            <Panel
              title="Detail Inspeksi Node"
              subtitle={selectedNode ? `Node #${selectedNode.id}` : "Klik node pada diagram pohon"}
              icon={Info}
              extra={
                selectedNode && (
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                  >
                    <X size={14} />
                  </button>
                )
              }
            >
              {selectedNode ? (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-slate-50 p-2.5 text-center">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Node ID</p>
                      <p className="text-lg font-black text-slate-800">{selectedNode.id}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2.5 text-center">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Depth</p>
                      <p className="text-lg font-black text-slate-800">{selectedNode.depth}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-slate-50 p-2.5 text-center">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Gini Impurity</p>
                      <p className="text-sm font-black text-slate-700">{selectedNode.impurity}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2.5 text-center">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Total Sampel</p>
                      <p className="text-sm font-black text-slate-700">{selectedNode.samples}</p>
                    </div>
                  </div>
                  {!selectedNode.isLeaf && (
                    <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                      <p className="text-[10px] font-black text-blue-700 uppercase mb-1">
                        Kondisi Percabangan (Split)
                      </p>
                      <p className="text-xs font-semibold text-blue-800">
                        JIKA{" "}
                        <span className="font-black">
                          {FEATURE_LABELS[selectedNode.feature] || selectedNode.feature}
                        </span>{" "}
                        ≤ <span className="font-black">{selectedNode.threshold}</span> → CABANG KIRI
                      </p>
                      <p className="text-xs font-semibold text-blue-800">
                        LAINNYA → CABANG KANAN
                      </p>
                    </div>
                  )}
                  <div
                    className={`rounded-lg border p-3 ${
                      selectedNode.prediction === "Stable"
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <p className="text-[10px] font-black uppercase mb-0.5 text-slate-500">
                      Prediksi pada Node Ini
                    </p>
                    <p
                      className={`text-sm font-black ${
                        selectedNode.prediction === "Stable"
                          ? "text-emerald-700"
                          : "text-red-700"
                      }`}
                    >
                      {selectedNode.prediction}{" "}
                      <span className="text-slate-400 text-xs font-semibold">
                        ({(selectedNode.confidence * 100).toFixed(1)}% keyakinan)
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Distribusi Sampel: [{selectedNode.value?.join(", ")}]
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-6">
                  Klik node mana pun pada diagram pohon untuk melihat detail perhitungannya.
                </p>
              )}
            </Panel>
          </div>
        </div>
      </main>
    </div>
  );
}
