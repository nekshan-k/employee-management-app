import React, { useEffect, useMemo, useState } from "react";
import {
  HiOutlineCalendar,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";
import DayDetailPanel from "./OverAllComponent/DayDetailPanel";
import { useSelector } from "react-redux";
import { getAttendanceHistory } from "../../../api/ApiCalls";
import { toast } from "react-toastify";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getMonthMatrix = current => {
  const y = current.getFullYear();
  const m = current.getMonth();
  const first = new Date(y, m, 1);
  const startDay = first.getDay();
  const rows = [];
  let d = 1 - startDay;
  for (let r = 0; r < 6; r++) {
    const row = [];
    for (let c = 0; c < 7; c++) {
      const date = new Date(y, m, d++);
      row.push({ date, inCurrentMonth: date.getMonth() === m });
    }
    rows.push(row);
  }
  return rows;
};

const formatISO = d =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const toISODateString = d => {
  const dt = new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const startOfMonth = d => {
  const dd = new Date(d);
  dd.setDate(1);
  dd.setHours(0, 0, 0, 0);
  return dd;
};

const endOfMonth = d => {
  const dd = new Date(d);
  dd.setMonth(dd.getMonth() + 1);
  dd.setDate(0);
  dd.setHours(23, 59, 59, 999);
  return dd;
};

const isToday = d => {
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
};

export default function AttendanceCalendar({
  events = [],
  title,
  subtitle,
  legend,
  highlightWeekends = false,
}) {
  const [current, setCurrent] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [employeeEvents, setEmployeeEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const storeUser = useSelector(state => state.auth.user);
  const userId = storeUser?.id || 0;
  const matrix = useMemo(() => getMonthMatrix(current), [current]);

  useEffect(() => {
    if (!userId) {
      setEmployeeEvents([]);
      return;
    }
    let mounted = true;
    async function fetch() {
      setLoading(true);
      try {
        const from = toISODateString(startOfMonth(current));
        const to = toISODateString(endOfMonth(current));
        const resp = await getAttendanceHistory(userId, from, to);
        const days = Array.isArray(resp?.data?.data) ? resp.data.data : [];
        const mapped = days.map(d => ({
          date: d.date,
          type: d.totalMinutes && d.totalMinutes > 0 ? "present" : "absent",
          label: d.totalMinutes && d.totalMinutes > 0 ? `${(d.totalHours || 0).toFixed(2)}h` : "Absent",
          totalMinutes: d.totalMinutes,
          totalHours: d.totalHours,
          sessions: Array.isArray(d.sessions)
            ? d.sessions.map(s => ({
                id: s.id,
                workDate: s.workDate || d.date,
                checkIn: s.checkIn,
                checkOut: s.checkOut,
                durationMinutes: s.durationMinutes,
                durationText: (() => {
                  const mins = s.durationMinutes || 0;
                  const hh = Math.floor(mins / 60);
                  const mm = mins % 60;
                  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
                })(),
                checkInPhotoUrl: s.checkInPhotoUrl,
                checkOutPhotoUrl: s.checkOutPhotoUrl,
                breaks: Array.isArray(s.breaks)
                  ? s.breaks.map(b => ({
                      id: b.id,
                      breakStartTime: b.breakStartTime,
                      breakEndTime: b.breakEndTime,
                      durationMinutes: b.durationMinutes,
                      breakStartPhotoUrl: b.breakStartPhotoUrl,
                      breakEndPhotoUrl: b.breakEndPhotoUrl,
                    }))
                  : [],
              }))
            : [],
        }));
        if (mounted) setEmployeeEvents(mapped);
      } catch (err) {
        toast.error("Failed to load attendance history");
        if (mounted) setEmployeeEvents([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetch();
    return () => {
      mounted = false;
    };
  }, [current, userId]);

  const combinedEvents = useMemo(() => {
    const m = {};
    events.forEach(e => {
      if (!m[e.date]) m[e.date] = [];
      m[e.date].push(e);
    });
    employeeEvents.forEach(e => {
      if (!m[e.date]) m[e.date] = [];
      m[e.date].push(e);
    });
    const all = Object.keys(m)
      .map(k => ({ date: k, events: m[k] }))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const flat = [];
    all.forEach(day => {
      day.events.forEach(ev => flat.push(ev));
    });
    return flat;
  }, [events, employeeEvents]);

  const eventsByDate = useMemo(() => {
    const m = {};
    combinedEvents.forEach(e => {
      if (!m[e.date]) m[e.date] = [];
      m[e.date].push(e);
    });
    return m;
  }, [combinedEvents]);

  const monthLabel = current.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const openDayPanel = (date, dayEvents) => {
    if (!dayEvents.length) return;
    setSelectedDate(date);
    setSelectedEvents(dayEvents);
  };

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
          {legend?.length > 0 && (
            <div className="flex flex-wrap gap-2 text-[11px] text-neutral400">
              {legend.map(l => (
                <div key={l.label} className="inline-flex items-center gap-2 rounded-full bg-bg50 px-3 py-1">
                  <span className={`h-2.5 w-2.5 rounded ${l.dotClassName || ""}`} />
                  <span>{l.label}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1))}
              className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-bg50 hover:bg-bg50"
            >
              <HiOutlineChevronLeft className="h-4 w-4 text-neutral400" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-white min-w-[180px] justify-center shadow-sm">
              <HiOutlineCalendar className="h-4 w-4 text-neutral300" />
              <span className="text-[11px] font-medium text-neutral500">{monthLabel}</span>
            </div>
            <button
              onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1))}
              className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-bg50 hover:bg-bg50"
            >
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
                      const dayEvents = eventsByDate[key] || [];
                      const today = isToday(date);
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      const isWeekendHighlighted = highlightWeekends && isWeekend && inCurrentMonth;
                      const baseBg = inCurrentMonth ? (isWeekendHighlighted ? "" : "bg-white") : "bg-bg50";
                      const dayCls = today ? "bg-selected text-white font-semibold" : "text-neutral400";
                      const hasEvents = dayEvents.length > 0;
                      return (
                        <td
                          key={key}
                          onClick={() => hasEvents && openDayPanel(date, dayEvents)}
                          className={`align-top border-r last:border-r-0 border-border px-2 sm:px-3 py-2 sm:py-3 ${baseBg} ${hasEvents ? "cursor-pointer hover:bg-bg50" : ""}`}
                          style={isWeekendHighlighted ? { backgroundColor: "#FEEDCC" } : undefined}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className={`h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-full text-xs ${dayCls}`}>{date.getDate()}</div>
                            {isWeekend && inCurrentMonth && <span className="text-[10px] text-neutral300">Weekend</span>}
                          </div>
                          <div className="space-y-1 min-h-[48px] sm:min-h-[56px]">
                            {dayEvents.map((e, idx) => {
                              const style =
                                e.type === "holiday"
                                  ? "bg-secondary100 border-secondary500 text-secondary900"
                                  : e.type === "present"
                                  ? "bg-bgGreen border-borderGreen text-tagColor"
                                  : e.type === "half-present"
                                  ? "bg-secondary50 border-secondary400 text-secondary800"
                                  : e.type === "absent"
                                  ? "bg-pink border-firebrick text-firebrick"
                                  : "bg-bg50 border-border text-neutral400";
                              return (
                                <div key={idx} className={`px-1.5 py-1 rounded border text-[10px] sm:text-[11px] leading-tight truncate ${style}`}>
                                  <div className="font-semibold">{e.label}</div>
                                  {e.totalHours !== undefined && <div className="text-[9px] mt-0.5">{(e.totalHours || 0).toFixed(2)} h</div>}
                                  {e.sessions && e.sessions.length > 0 && (
                                    <div className="text-[9px] mt-0.5">
                                      {e.sessions.map(s => (
                                        <div key={s.id} className="flex items-center gap-2">
                                          {s.checkInPhotoUrl && <img src={s.checkInPhotoUrl} alt="" className="w-6 h-6 rounded-full object-cover" />}
                                          <div>{new Date(s.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(s.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
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
        onClose={() => {
          setSelectedDate(null);
          setSelectedEvents([]);
        }}
        date={selectedDate}
        events={selectedEvents}
        loading={loading}
      />
    </>
  );
}
