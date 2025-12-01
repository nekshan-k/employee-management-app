import React, { useEffect, useMemo, useState } from "react";
import { HiOutlineCalendar, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import DayDetailPanel from "./OverAllComponent/DayDetailPanel";
import { useSelector } from "react-redux";
import { getAttendanceHistory } from "../../../api/ApiCalls";
import { toast } from "react-toastify";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const START_HALF_DAY_HOUR = 12;
const START_HALF_DAY_MIN = 30;

const getMonthMatrix = current => {
  const y = current.getFullYear();
  const m = current.getMonth();
  const first = new Date(y, m, 1);
  const startDay = first.getDay();
  const rows = [];
  let d = 1 - startDay;
  for (let r = 0; r < 6; r++) {
    const row = [];
    for (let c = 0; c < 7; c++) row.push({ date: new Date(y, m, d++), inCurrentMonth: new Date(y, m, d - 1).getMonth() === m });
    rows.push(row);
  }
  return rows;
};

const formatISO = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const toISODate = d => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};

const sOM = d => { const x = new Date(d); x.setDate(1); x.setHours(0, 0, 0, 0); return x; };
const eOM = d => { const x = new Date(d); x.setMonth(x.getMonth() + 1); x.setDate(0); x.setHours(23, 59, 59, 999); return x; };
const isToday = d => { const t = new Date(); return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate(); };
const minsToHHMM = m => { const mins = Math.floor(m || 0); const hh = Math.floor(mins / 60); const mm = mins % 60; return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`; };

export default function AttendanceCalendar({ events = [], title, subtitle, legend, highlightWeekends = false }) {
  const [current, setCurrent] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [employeeEvents, setEmployeeEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const storeUser = useSelector(s => s.auth.user);
  const userId = storeUser?.id || 0;
  const matrix = useMemo(() => getMonthMatrix(current), [current]);

  useEffect(() => {
    if (!userId) return setEmployeeEvents([]);
    let m = true;
    async function load() {
      setLoading(true);
      try {
        const resp = await getAttendanceHistory(userId, toISODate(sOM(current)), toISODate(eOM(current)));
        const days = Array.isArray(resp?.data?.data) ? resp.data.data : [];
        const mapped = days.map(d => {
          const sessions = d.sessions || [];
          const firstSession = sessions[0];
          const firstIn = firstSession?.checkIn ? new Date(firstSession.checkIn) : null;
          let type = "absent";
          if (firstIn) {
            const hr = firstIn.getHours();
            const mn = firstIn.getMinutes();
            if (hr > START_HALF_DAY_HOUR || (hr === START_HALF_DAY_HOUR && mn > START_HALF_DAY_MIN)) type = "half-present";
            else type = "present";
          }
          const totalMins = d.totalMinutes || 0;
          const eight = 8 * 60;
          const pct = Math.min(100, Math.round((totalMins / eight) * 100));
          const computedLabel = firstIn && !firstSession?.checkOut ? "Present (Running)" : totalMins > 0 ? `${(d.totalHours || 0).toFixed(2)}h` : "Absent";
          return {
            date: d.date,
            type,
            label: computedLabel,
            totalMinutes: totalMins,
            pct,
            sessions: sessions.map(s => ({ ...s, durationText: minsToHHMM(s.durationMinutes || 0) })),
          };
        });
        if (m) setEmployeeEvents(mapped);
      } catch {
        toast.error("Failed to load attendance history");
        if (m) setEmployeeEvents([]);
      } finally {
        if (m) setLoading(false);
      }
    }
    load();
    return () => { m = false; };
  }, [current, userId]);

  const combined = useMemo(() => {
    const map = {};
    events.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    employeeEvents.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    const res = {};
    Object.keys(map).forEach(k => { res[k] = map[k]; });
    return res;
  }, [events, employeeEvents]);

  const openDay = (date, evs) => {
    if (!evs.length) return;
    setSelectedDate(date);
    setSelectedEvents(evs);
  };

  const monthLabel = current.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <>
      <div className="flex flex-col gap-4 w-full h-full">
        {(title || subtitle) && (
          <div>
            {title && <h2 className="text-lg font-semibold text-neutral500">{title}</h2>}
            {subtitle && <p className="text-xs text-neutral300 mt-1">{subtitle}</p>}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {legend?.length ? (
            <div className="flex flex-wrap gap-2 text-[11px] text-neutral400">
              {legend.map(l => (
                <div key={l.label} className="inline-flex items-center gap-2 rounded-full bg-bg50 px-3 py-1">
                  <span className={`h-2.5 w-2.5 rounded ${l.dotClassName}`} />
                  <span>{l.label}</span>
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex items-center gap-2 text-xs">
            <button onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-bg50">
              <HiOutlineChevronLeft className="h-4 w-4 text-neutral400" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-white shadow-sm min-w-[180px] justify-center">
              <HiOutlineCalendar className="h-4 w-4 text-neutral300" />
              <span className="text-[11px] font-medium text-neutral500">{monthLabel}</span>
            </div>
            <button onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-bg50">
              <HiOutlineChevronRight className="h-4 w-4 text-neutral400" />
            </button>
          </div>
        </div>

        <div className="flex-1 rounded-[18px] border border-border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-bg100 text-[11px] font-medium text-neutral400">
                  {weekDays.map(d => (
                    <th key={d} className="h-10 text-center border-b border-border">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[11px] sm:text-[12px]">
                {matrix.map((week, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0">
                    {week.map(({ date, inCurrentMonth }) => {
                      const key = formatISO(date);
                      const dayEvents = combined[key] || [];
                      const todayFlag = isToday(date);
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      const baseBg = inCurrentMonth ? "bg-white" : "bg-bg50";
                      const hasEvents = dayEvents.length > 0;
                      const primaryEvent = dayEvents.find(ev => ev.type === "present" || ev.type === "half-present" || ev.type === "holiday") || dayEvents[0] || null;
                      const pct = primaryEvent?.pct || 0;
                      const totalMinutes = primaryEvent?.totalMinutes || 0;
                      const showSmallBar = primaryEvent && (primaryEvent.type === "present" || primaryEvent.type === "half-present");

                      return (
                        <td key={key} onClick={() => hasEvents && openDay(date, dayEvents)} className={`align-top border-r last:border-r-0 border-border px-2 sm:px-3 py-2 ${baseBg} ${hasEvents ? "cursor-pointer hover:bg-bg50" : ""}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className={`h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-full text-xs ${todayFlag ? "bg-selected text-white" : "text-neutral400"}`}>{date.getDate()}</div>
                            {isWeekend && inCurrentMonth && <span className="text-[10px] text-neutral300">Weekend</span>}
                          </div>

                          <div className="min-h-[48px]">
                            {primaryEvent ? (
                              <>
                                {primaryEvent.type === "holiday" ? (
                                  <div className="inline-flex items-start gap-2 flex-col">
                                    <div className="rounded-md px-3 py-2 text-sm font-semibold bg-secondary100 w-full">{primaryEvent.label || "Holiday"}</div>
                                  
                                  </div>
                                ) : todayFlag ? (
                                  <div className="relative w-full">
                                    <div className="w-full h-8 rounded-md bg-slate-200 overflow-hidden flex items-center">
                                      <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#0ea5a4,#059669)" }} />
                                      <div className="absolute left-3 top-0 bottom-0 flex items-center text-sm font-semibold text-white/95 pl-1">
                                        {minsToHHMM(totalMinutes)}
                                      </div>
                                      <div className="absolute right-3 top-0 bottom-0 flex items-center text-[11px] text-white/80 pr-1">
                                        {primaryEvent.type === "half-present" ? "Half day" : "Working"}
                                      </div>
                                    </div>
                                  </div>
                                ) : primaryEvent.type === "present" ? (
                                  <div className="relative w-full">
                                    <div className="w-full h-8 rounded-md bg-slate-100 overflow-hidden flex items-center">
                                      <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#10b981,#059669)" }} />
                                      <div className="absolute left-3 top-0 bottom-0 flex items-center text-sm font-semibold text-neutral900 pl-1">{minsToHHMM(totalMinutes)}</div>
                                    </div>
                                    <div className="text-[10px] text-neutral400 mt-1">{primaryEvent.label}</div>
                                  </div>
                                ) : primaryEvent.type === "half-present" ? (
                                  <div className="relative w-full">
                                    <div className="w-full h-8 rounded-md bg-slate-100 overflow-hidden flex items-center">
                                      <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#f59e0b,#f97316)" }} />
                                      <div className="absolute left-3 top-0 bottom-0 flex items-center text-sm font-semibold text-neutral900 pl-1">{minsToHHMM(totalMinutes)}</div>
                                      <div className="absolute right-3 top-0 bottom-0 flex items-center text-[11px] text-neutral800 pr-1">Half day</div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="rounded-md px-3 py-2 text-sm font-semibold bg-pink/10 w-full">Absent</div>
                                )}
                              </>
                            ) : null}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DayDetailPanel
        open={!!selectedDate}
        onClose={() => { setSelectedDate(null); setSelectedEvents([]); }}
        date={selectedDate}
        events={selectedEvents}
        loading={loading}
      />
    </>
  );
}
