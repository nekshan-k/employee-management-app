import React, { useMemo, useState, useEffect, useRef, useLayoutEffect } from "react";
import SidePanel from "../../ui/SidePanel";
import DayDetailPanel from "../../UserPanel/Leaves/OverAllComponent/DayDetailPanel";
import ReusableDataTable from "../../ui/tables/ReusableDataTable";
import { getAllUser, getNationalHolidays, getAttendanceHistoryForAll } from "../../../api/ApiCalls";

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

function hhmmFromTs(ts) {
  if (!ts) return "-";
  const dt = new Date(ts);
  if (isNaN(dt.getTime())) return "-";
  return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

function calcSessionDuration(session, isToday) {
  if (!session?.checkIn) return 0;
  const checkInTime = new Date(session.checkIn);
  let checkOutTime;
  if (session.checkOut) checkOutTime = new Date(session.checkOut);
  else if (isToday) checkOutTime = new Date();
  else { checkOutTime = new Date(checkInTime); checkOutTime.setHours(23,59,59,999); }
  const breaks = session.breaks || [];
  const breakDuration = breaks.reduce((sum, br) => {
    if (br.breakStartTime && br.breakEndTime) {
      const bStart = new Date(br.breakStartTime);
      const bEnd = new Date(br.breakEndTime);
      return sum + (bEnd - bStart);
    }
    return sum;
  }, 0);
  const totalDuration = (checkOutTime - checkInTime) - breakDuration;
  return Math.max(0, totalDuration / (1000 * 60));
}

const START_HALF_DAY_HOUR = 12, START_HALF_DAY_MIN = 30;

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
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [nationalEvents, setNationalEvents] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingUsers(true);
        const resp = await getAllUser();
        if (!mounted) return;
        const list = resp?.data?.data || resp?.data || [];
        setUsers(list.map(u => ({ id: u.id, name: u.fullName || u.email || `User ${u.id}`, employeeCode: u.employeeCode || `EMP-${u.id}` })));
      } catch {
      } finally {
        if (mounted) setLoadingUsers(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingHolidays(true);
        const resp = await getNationalHolidays();
        if (!mounted) return;
        const raw = Array.isArray(resp?.data?.data) ? resp.data.data : Array.isArray(resp?.data) ? resp.data : [];
        const mapped = raw.map(h => ({ date: h.date, type: "holiday", label: h.title || h.name || h.description || "Holiday", meta: { description: h.description, recurring: h.recurring, organizationId: h.organizationId } }));
        setNationalEvents(mapped);
      } catch {
      } finally {
        if (mounted) setLoadingHolidays(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const from = formatISO(new Date(year, monthIndex, 1));
      const to = formatISO(new Date(year, monthIndex + 1, 0));
      try {
        const resp = await getAttendanceHistoryForAll(from, to);
        if (!mounted) return;
        const days = Array.isArray(resp?.data?.data) ? resp.data.data : [];
        const map = {};
        const todayStr = formatISO(new Date());
        days.forEach(day => {
          const date = day.date;
          const sessions = Array.isArray(day.sessions) ? day.sessions : [];
          const groupedByUser = {};
          sessions.forEach(s => {
            const uid = s.userId;
            groupedByUser[uid] = groupedByUser[uid] || [];
            groupedByUser[uid].push(s);
          });
          Object.keys(groupedByUser).forEach(uidStr => {
            const uid = Number(uidStr);
            const userSessions = groupedByUser[uid];
            const key = `${date}_${uid}`;
            let totalMinutes = 0;
            userSessions.forEach(s => {
              const dur = typeof s.durationMinutes === "number" && !isNaN(s.durationMinutes) ? s.durationMinutes : calcSessionDuration(s, date === todayStr);
              totalMinutes += dur || 0;
            });
            const checkIns = userSessions.map(s => s.checkIn).filter(Boolean).map(t => new Date(t).getTime());
            const checkOuts = userSessions.map(s => s.checkOut).filter(Boolean).map(t => new Date(t).getTime());
            const firstCheckIn = checkIns.length ? new Date(Math.min(...checkIns)).toISOString() : null;
            const anyMissingCheckout = userSessions.some(s => !s.checkOut);
            const lastCheckOut = (!anyMissingCheckout && checkOuts.length) ? new Date(Math.max(...checkOuts)).toISOString() : null;
            const firstSession = userSessions[0];
            const firstInDate = firstSession?.checkIn ? new Date(firstSession.checkIn) : null;
            let type = "half-day";
            if (firstInDate) {
              const hr = firstInDate.getHours(), mn = firstInDate.getMinutes();
              if (hr > START_HALF_DAY_HOUR || (hr === START_HALF_DAY_HOUR && mn > START_HALF_DAY_MIN)) type = "half-day";
              else type = "present";
            }
            const pct = Math.min(100, Math.round((totalMinutes / (8 * 60)) * 100));
            const label = totalMinutes > 0 ? `${(totalMinutes / 60).toFixed(2)}h` : "Half Day";
            const isRunning = userSessions.some(s => s.checkIn && !s.checkOut);
            const isToday = date === todayStr;
            const sessionsWithDurationText = userSessions.map(s => ({ ...s, durationText: minsToHHMM(calcSessionDuration(s, isToday)) }));
            map[key] = {
              date,
              userId: uid,
              type,
              label,
              totalMinutes,
              pct,
              sessions: sessionsWithDurationText,
              isRunning,
              isToday,
              firstCheckIn,
              lastCheckOut
            };
          });
        });
        setAttendanceMap(map);
      } catch {
        setAttendanceMap({});
      }
    })();
    return () => { mounted = false; };
  }, [year, monthIndex]);

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

  function getCellAttendance(dateIso, userId) {
    const key = `${dateIso}_${userId}`;
    if (attendanceMap[key]) return { ...attendanceMap[key], isHoliday: false };
    const holiday = nationalEvents.find(h => h.date === dateIso);
    if (holiday) return { isHoliday: true, holidayLabel: holiday.label, holidayMeta: holiday.meta, date: dateIso, type: "holiday" };
    return null;
  }

  function deriveCellTimesForCell(att) {
    if (!att) return { checkIn: "-", checkOut: "-" };
    if (att.isHoliday) return { checkIn: att.holidayLabel || "Holiday", checkOut: "" };
    const first = att.firstCheckIn ? hhmmFromTs(att.firstCheckIn) : "-";
    const last = att.lastCheckOut ? hhmmFromTs(att.lastCheckOut) : "-";
    return { checkIn: first, checkOut: last };
  }

  const columns = useMemo(() => {
    const cols = [
      {
        header: <div style={{ position: "sticky", left: 0, zIndex: 40, background: "white", padding: "8px 10px", textAlign: "left" }}>Emp ID</div>,
        accessor: "employeeCode",
        cell: (row) => <div style={{ position: "sticky", left: 0, zIndex: 30, background: "white", padding: "8px 10px", textAlign: "left", whiteSpace: "nowrap" }}>{row.employeeCode}</div>
      },
      {
        header: <div style={{ position: "sticky", left: leftRef.current, zIndex: 35, background: "white", padding: "8px 10px", textAlign: "left" }}>Name</div>,
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
          const att = getCellAttendance(iso, row.id);
          const { checkIn, checkOut } = deriveCellTimesForCell(att);
          const hasData = !!att;
          return (
            <div style={{ width: 72, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => {
                  if (!hasData) return;
                  const eventsToShow = [];
                  if (att?.isHoliday) eventsToShow.push({ type: "holiday", date: iso, label: att.holidayLabel, meta: att.holidayMeta });
                  else if (att) eventsToShow.push({
                    date: att.date,
                    type: att.type,
                    label: att.label,
                    totalMinutes: att.totalMinutes,
                    pct: att.pct,
                    sessions: att.sessions,
                    isRunning: att.isRunning,
                    isToday: att.isToday
                  });
                  setSelectedDayEvents(eventsToShow);
                  setSelectedUser(row);
                  setPanelOpen(true);
                }}
                style={{ width: "100%", textAlign: "center", background: "transparent", border: "none", cursor: hasData ? "pointer" : "default", opacity: hasData ? 1 : 0.4 }}
              >
                <div style={{ fontSize: 11, lineHeight: "12px", color: "#6b7280" }}>{checkIn}</div>
                <div style={{ fontSize: 11, lineHeight: "12px", marginTop: 4, color: "#6b7280" }}>{checkOut === "-" ? "" : checkOut}</div>
              </button>
            </div>
          );
        }
      });
    });
    return cols;
  }, [visibleDays, attendanceMap, nationalEvents]);

  const data = useMemo(() => users.map((u) => ({ id: u.id, name: u.name, employeeCode: u.employeeCode })), [users]);

  function minsToHHMM(m) {
    const mins = Math.floor(m || 0);
    return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
  }

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
        <ReusableDataTable columns={columns} data={data} loading={loadingUsers || loadingHolidays} />
      </div>

      <SidePanel open={panelOpen} onClose={() => setPanelOpen(false)}>
        <div className="p-4">
          <div className="mb-3">
            <div className="text-sm text-neutral400">Employee</div>
            <div className="font-medium">{selectedUser?.name || "-"}</div>
            <div className="text-xs text-neutral400">{selectedUser?.employeeCode || ""} • ID: {selectedUser?.id || ""}</div>
          </div>
          <div>
            <DayDetailPanel open={!!selectedDayEvents.length} onClose={() => setPanelOpen(false)} date={selectedDayEvents[0] ? new Date(selectedDayEvents[0].date) : null} events={selectedDayEvents} />
          </div>
        </div>
      </SidePanel>
    </div>
  );
}
