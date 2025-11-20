import { useEffect, useState } from "react";
export default function Timer({ start, end, breakSessionStart, breakUsedMs }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);
  if (!start) return <div className="text-lg font-mono text-gray-600">00:00:00</div>;
  if (breakSessionStart) {
    const breakElapsed = Math.max(0, now - breakSessionStart);
    const breakTotalMs = Math.max(0, 30 * 60 * 1000 - (breakUsedMs || 0) - breakElapsed);
    const mm = String(Math.floor(breakTotalMs / 60000)).padStart(2, "0");
    const ss = String(Math.floor((breakTotalMs % 60000) / 1000)).padStart(2, "0");
    return (
      <div className="text-lg font-semibold text-orange-600">
        Break Remaining — {mm}:{ss}
      </div>
    );
  }
  const endTs = end || now;
  const elapsedMs = Math.max(0, endTs - start - (breakUsedMs || 0));
  const s = Math.floor(elapsedMs / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return <div className="text-lg font-mono text-gray-800">{hh}:{mm}:{ss}</div>;
}
