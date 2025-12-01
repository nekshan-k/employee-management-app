import React, { useMemo, useState, useRef, useLayoutEffect } from "react";
import SidePanel from "../../ui/SidePanel";
import DayDetailPanel from "../../UserPanel/Leaves/OverAllComponent/DayDetailPanel";
import ReusableDataTable from "../../ui/tables/ReusableDataTable";

const nationalEvents = [
  { date: "2025-01-01", type: "holiday", label: "New Year's Day" },
  { date: "2025-01-26", type: "holiday", label: "Republic Day" },
  { date: "2025-03-14", type: "holiday", label: "Holi" },
  { date: "2025-04-18", type: "holiday", label: "Good Friday" },
  { date: "2025-05-01", type: "holiday", label: "Labour Day" },
  { date: "2025-08-15", type: "holiday", label: "Independence Day" },
  { date: "2025-10-02", type: "holiday", label: "Gandhi Jayanti" },
  { date: "2025-10-20", type: "holiday", label: "Diwali" },
  { date: "2025-11-05", type: "holiday", label: "Guru Nanak Jayanti" },
  { date: "2025-12-25", type: "holiday", label: "Christmas" }
];

const employeeDayEvents = [
  { date: "2025-11-10", type: "half-present", label: "0.5 day Present (Desktop)", hours: "05:39" },
  { date: "2025-11-10", type: "absent", label: "0.5 day Absent" },
  { date: "2025-11-11", type: "present", label: "Present (Desktop)", hours: "07:37" },
  { date: "2025-11-12", type: "present", label: "Present (Desktop)", hours: "07:52" },
  { date: "2025-11-13", type: "present", label: "Present (Desktop)", hours: "07:41" },
  { date: "2025-11-14", type: "present", label: "Present (Desktop)", hours: "07:47" },
  { date: "2025-11-15", type: "present", label: "Present (Desktop)", hours: "05:44" },
  { date: "2025-11-17", type: "present", label: "Present (Desktop)", hours: "07:39" },
  { date: "2025-11-18", type: "present", label: "Present (Desktop)", hours: "08:00" },
  { date: "2025-11-19", type: "present", label: "Present (Desktop)", hours: "07:44" },
  { date: "2025-11-20", type: "present", label: "Present (Desktop)", hours: "07:46" },
  { date: "2025-11-21", type: "present", label: "Present (Desktop)", hours: "07:50" },
  {
    date: "2025-11-24",
    type: "present",
    label: "Present (Desktop)",
    hours: "07:58",
    shift: "General",
    shiftTime: "12:30 - 20:30",
    summary: { firstCheckIn: "12:26", lastCheckOut: "20:42", totalHours: "07:58", paidBreak: "00:18" },
    punches: [
      { time: "12:26", device: "Desktop", location: "Trikuta Nagar, Jammu, Jammu district, Jammu and Kashmir, 180012, India", tag: "Check-In" },
      { time: "15:06", device: "Desktop", location: "Trikuta Nagar, Jammu, Jammu district, Jammu and Kashmir, 180012, India", tag: "Check-Out" },
      { time: "15:24", device: "Desktop", location: "Trikuta Nagar, Jammu, Jammu district, Jammu and Kashmir, 180012, India", tag: "Check-In" }
    ]
  },
  { date: "2025-11-25", type: "half-present", label: "0.5 day Present (Desktop)", hours: "06:47" },
  { date: "2025-11-25", type: "absent", label: "0.5 day Absent" }
];

const events = [...nationalEvents, ...employeeDayEvents];

function getMonthDays(year, month) {
  const d = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: d }).map((_, i) => new Date(year, month, i + 1));
}

function formatDayHeader(d) {
  const day = String(d.getDate()).padStart(2, "0");
  const wk = d.toLocaleDateString("en-IN", { weekday: "short" });
  return `${day} ${wk}`;
}

function formatISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function findEventsForDate(dateIso) {
  return events.filter((e) => e.date === dateIso);
}

function deriveCheckTimes(ev) {
  if (!ev) return { checkIn: "-", checkOut: "-" };
  if (ev.summary) return { checkIn: ev.summary.firstCheckIn || "-", checkOut: ev.summary.lastCheckOut || "-" };
  if (ev.punches && ev.punches.length) {
    const first = ev.punches[0]?.time || "-";
    const last = ev.punches[ev.punches.length - 1]?.time || "-";
    return { checkIn: first, checkOut: last };
  }
  if (ev.hours) return { checkIn: ev.hours, checkOut: "-" };
  return { checkIn: "-", checkOut: "-" };
}

export default function EmployeeAttendanceTable() {
  const today = new Date();
  const [monthIndex, setMonthIndex] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [mode, setMode] = useState("month");
  const [weekIndex, setWeekIndex] = useState(0);
  const containerRef = useRef(null);
  const leftRef = useRef(0);

  const users = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({ id: `EMP${String(i + 1).padStart(3, "0")}`, name: `User ${i + 1}` })), []);

  const monthDays = useMemo(() => getMonthDays(year, monthIndex), [year, monthIndex]);

  const weeks = useMemo(() => {
    const arr = [];
    let temp = [];
    monthDays.forEach((d) => {
      temp.push(d);
      if (temp.length === 7) { arr.push(temp); temp = []; }
    });
    if (temp.length) arr.push(temp);
    return arr;
  }, [monthDays]);

  const visibleDays = useMemo(() => (mode === "month" ? monthDays : weeks[weekIndex] || []), [mode, monthDays, weeks, weekIndex]);

  useLayoutEffect(() => {
    const calc = () => {
      if (!containerRef.current) return;
      const firstTh = containerRef.current.querySelector("thead th");
      leftRef.current = firstTh ? firstTh.offsetWidth : 0;
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [visibleDays]);

  const columns = useMemo(() => {
    const cols = [
      {
        header: <div style={{ position: "sticky", left: 0, zIndex: 40, background: "var(--tw-bg-opacity, white)", padding: "8px 10px", textAlign: "left" }}>Emp ID</div>,
        accessor: "id",
        cell: (row) => <div style={{ position: "sticky", left: 0, zIndex: 30, background: "white", padding: "8px 10px", textAlign: "left", whiteSpace: "nowrap" }}>{row.id}</div>
      },
      {
        header: <div style={{ position: "sticky", left: leftRef.current, zIndex: 35, background: "var(--tw-bg-opacity, white)", padding: "8px 10px", textAlign: "left" }}>Name</div>,
        accessor: "name",
        cell: (row) => <div style={{ position: "sticky", left: leftRef.current, zIndex: 25, background: "white", padding: "8px 10px", textAlign: "left", whiteSpace: "normal" }}>{row.name}</div>
      }
    ];
    visibleDays.forEach((d) => {
      const iso = formatISO(d);
      cols.push({
        header: <div style={{ minWidth: 64, padding: "6px 4px", textAlign: "center" }}>{formatDayHeader(d)}</div>,
        accessor: `d_${iso}`,
        cell: (row) => {
          const dayEvents = findEventsForDate(iso);
          const empEvent = dayEvents.find((e) => e.type === "present" || e.type === "half-present" || e.type === "absent") || dayEvents[0] || null;
          const { checkIn, checkOut } = deriveCheckTimes(empEvent);
          const hasData = !!empEvent;
          return (
            <div style={{ width: 72, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => {
                  if (!hasData) return;
                  setSelectedDayEvents(dayEvents);
                  setSelectedUser(row);
                  setPanelOpen(true);
                }}
                style={{ width: "100%", textAlign: "center", background: "transparent", border: "none", cursor: hasData ? "pointer" : "default", opacity: hasData ? 1 : 0.4 }}
              >
                <div style={{ fontSize: 11, lineHeight: "12px", color: "var(--tw-text-opacity, #6b7280)" }}>{checkIn}</div>
                <div style={{ fontSize: 11, lineHeight: "12px", marginTop: 4, color: "var(--tw-text-opacity, #6b7280)" }}>{checkOut}</div>
              </button>
            </div>
          );
        }
      });
    });
    return cols;
  }, [visibleDays]);

  const data = useMemo(() => users.map((u) => ({ id: u.id, name: u.name })), [users]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border bg-white text-xs">
            <button type="button" onClick={() => { const prev = new Date(year, monthIndex - 1, 1); setMonthIndex(prev.getMonth()); setYear(prev.getFullYear()); setWeekIndex(0); }} className="px-2 py-1">{"<"}</button>
            <div className="px-3 py-1 font-medium text-xs">{new Date(year, monthIndex).toLocaleString("default", { month: "long", year: "numeric" })}</div>
            <button type="button" onClick={() => { const next = new Date(year, monthIndex + 1, 1); setMonthIndex(next.getMonth()); setYear(next.getFullYear()); setWeekIndex(0); }} className="px-2 py-1">{">"}</button>
          </div>
          <div className="inline-flex rounded-lg border border-border bg-bg50 p-1 text-xs">
            <button type="button" onClick={() => { setMode("month"); setWeekIndex(0); }} className={`px-2 py-1 rounded-md ${mode === "month" ? "bg-white text-primary600 shadow-sm" : "text-neutral400"}`}>Monthly</button>
            <button type="button" onClick={() => setMode("week")} className={`px-2 py-1 rounded-md ${mode === "week" ? "bg-white text-primary600 shadow-sm" : "text-neutral400"}`}>Weekly</button>
          </div>
          {mode === "week" && (
            <select value={weekIndex} onChange={(e) => setWeekIndex(Number(e.target.value))} className="ml-2 text-xs border border-border rounded px-2 py-1 bg-white">
              {weeks.map((w, idx) => {
                const start = w[0];
                const end = w[w.length - 1];
                return <option key={idx} value={idx}>{`${formatISO(start)} → ${formatISO(end)}`}</option>;
              })}
            </select>
          )}
        </div>
      </div>

      <div ref={containerRef} className="overflow-auto scrollbar-hide bg-white rounded-lg border border-border" style={{ WebkitOverflowScrolling: "touch", scrollBehavior: "smooth" }}>
        <ReusableDataTable columns={columns} data={data} />
      </div>

      <SidePanel open={panelOpen} onClose={() => setPanelOpen(false)}>
        <div className="p-4">
          <div className="mb-3">
            <div className="text-sm text-neutral400">Employee</div>
            <div className="font-medium">{selectedUser?.name || "-"}</div>
            <div className="text-xs text-neutral400">{selectedUser?.id || ""}</div>
          </div>
          <div>
            <DayDetailPanel open={!!selectedDayEvents.length} onClose={() => setPanelOpen(false)} date={selectedDayEvents[0] ? new Date(selectedDayEvents[0].date) : null} events={selectedDayEvents} />
          </div>
        </div>
      </SidePanel>
    </div>
  );
}
