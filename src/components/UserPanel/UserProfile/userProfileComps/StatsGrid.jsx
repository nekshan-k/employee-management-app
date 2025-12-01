import { FaRegClock } from "react-icons/fa";
import { IoTimeOutline } from "react-icons/io5";

function StatCard({ title, children, icon }) {
  return (
    <div className="rounded-xl border border-border bg-primary50 px-4 py-3 text-sm space-y-1.5">
      <div className="flex items-center gap-2 text-[11px] font-semibold text-foundation-neurtal-neurtal-500 uppercase">
        {icon}
        <span>{title}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function StatsGrid({ status, checkInDiffText, checkOutDiffText, breakUsedMs, breakRemainingMs, workingTimeText, workingTimeMs }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard title="Check in / out" icon={<FaRegClock className="text-primary500" />}>
        <div className="flex items-center gap-2">
          <FaRegClock className="text-primary100" />
          <span className="font-mono text-sm">{status.checkedInAt ? new Date(status.checkedInAt).toLocaleTimeString() : "--:--:--"}</span>
        </div>
        <div className="text-[11px] text-foundation-neurtal-neurtal-500 pl-6">{checkInDiffText}</div>
        <div className="flex items-center gap-2 mt-1">
          <FaRegClock className="text-foundation-neurtal-neurtal-400" />
          <span className="font-mono text-sm">{status.checkedOutAt ? new Date(status.checkedOutAt).toLocaleTimeString() : "--:--:--"}</span>
        </div>
        <div className="text-[11px] text-foundation-neurtal-neurtal-500 pl-6">{checkOutDiffText}</div>
      </StatCard>

      <StatCard title="Break" icon={<IoTimeOutline className="text-primary500" />}>
        <div className="text-lg font-semibold text-primary500">{Math.ceil(breakUsedMs / 60000)} min / 30 min</div>
        <div className="flex items-center gap-2 text-[11px] text-foundation-neurtal-neurtal-500 mt-1">
          <FaRegClock className="text-foundation-neurtal-neurtal-400" />
          <span>Remaining: <span className="font-mono text-primary500">{formatDuration(breakRemainingMs)}</span></span>
        </div>
      </StatCard>

      <StatCard title="Worked" icon={<FaRegClock className="text-primary500" />}>
        <div className="text-lg font-semibold text-primary500">{workingTimeText}</div>
        <div className="text-[11px] text-foundation-neurtal-neurtal-500 mt-1">Standard: 8h incl. 30m</div>
        <div className="text-[11px] text-foundation-neurtal-neurtal-500">Actual: {(workingTimeMs / 1000 / 3600).toFixed(2)} h</div>
      </StatCard>
    </div>
  );
}

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}
