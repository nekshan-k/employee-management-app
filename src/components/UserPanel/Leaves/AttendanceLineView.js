import React, { useMemo, useState, useEffect } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import DayDetailPanel from "./OverAllComponent/DayDetailPanel";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WINDOW_START = "12:30";
const WINDOW_END = "20:30";

const formatISO = d =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const getWeekRange = current => {
  const day = current.getDay();
  const start = new Date(current);
  start.setDate(current.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
};

const formatWeekLabel = (start, end) => {
  const opts = { day: "2-digit", month: "short", year: "numeric" };
  const s = start.toLocaleDateString("en-GB", opts);
  const e = end.toLocaleDateString("en-GB", opts);
  return `${s} - ${e}`;
};

const parseTimeToMinutes = t => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const isSameDate = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isSameWeek = (a, b) => {
  const wa = getWeekRange(a).start;
  const wb = getWeekRange(b).start;
  return wa.getFullYear() === wb.getFullYear() && wa.getMonth() === wb.getMonth() && wa.getDate() === wb.getDate();
};

const getBaseType = (dayEvents, isWeekendDay) => {
  if (dayEvents.some(e => e.type === "present")) return "present";
  if (dayEvents.some(e => e.type === "half-present")) return "half-present";
  if (dayEvents.some(e => e.type === "absent")) return "absent";
  if (dayEvents.some(e => e.type === "holiday") || isWeekendDay) return "holiday";
  return null;
};

const getBaseColor = type => {
  if (type === "present") return "#16A34A";
  if (type === "half-present") return "#F97316";
  if (type === "absent") return "#EF4444";
  if (type === "holiday") return "#FACC15";
  return "#D4D4D8";
};

export default function AttendanceLineView({ events, title, subtitle }) {
  const [current, setCurrent] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const { start, end } = useMemo(() => getWeekRange(current), [current]);
  const weekLabel = useMemo(() => formatWeekLabel(start, end), [start, end]);

  const days = useMemo(() => {
    const arr = [];
    const d = new Date(start);
    for (let i = 0; i < 7; i++) {
      arr.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return arr;
  }, [start]);

  const changeWeek = delta => {
    setCurrent(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + delta * 7);
      return next;
    });
  };

  const windowStartMin = parseTimeToMinutes(WINDOW_START);
  const windowEndMin = parseTimeToMinutes(WINDOW_END);
  const windowTotal = windowEndMin - windowStartMin;

  const openDayPanel = (date, dayEvents) => {
    if (!dayEvents.length) return;
    setSelectedDate(date);
    setSelectedEvents(dayEvents);
  };

  const footerStats = useMemo(() => {
    let payable = 0;
    let present = 0;
    let weekend = 0;
    let holidays = 0;
    days.forEach(date => {
      const key = formatISO(date);
      const dayEvents = eventsByDate[key] || [];
      const isWeekendDay = date.getDay() === 0 || date.getDay() === 6;
      const hasPresent = dayEvents.some(e => e.type === "present" || e.type === "half-present");
      const hasHoliday = dayEvents.some(e => e.type === "holiday");
      const counted = hasPresent || hasHoliday || isWeekendDay;
      if (counted) payable += 1;
      if (hasPresent) present += 1;
      if (hasHoliday) holidays += 1;
      if (isWeekendDay) weekend += 1;
    });
    return { payable, present, weekend, holidays };
  }, [days, eventsByDate]);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const currentWeekContainsNow = isSameWeek(current, now);
  const nowLeft = currentWeekContainsNow ? ((nowMinutes - windowStartMin) / windowTotal) * 100 : null;

  return (
    <>
      <style>{`
        .moving-dots {
          background-image: radial-gradient(circle, rgba(16,185,129,0.95) 4px, rgba(16,185,129,0) 4px);
          background-size: 10px 6px;
          background-repeat: repeat-x;
          height: 3px;
          
          transform: translateY(-50%);
          animation: moveDots 1.2s linear infinite;
        }
        @keyframes moveDots {
          from { background-position: 0 0; }
          to { background-position: 20px 0; }
        }
        .now-line {
          box-shadow: 0 0 6px rgba(59,130,246,0.45);
        }
      `}</style>

      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[640px]">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral800">{title}</h2>
            {subtitle && <p className="text-11px text-neutral400 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral400">
            <button type="button" onClick={() => changeWeek(-1)} className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-bg50 hover:bg-bg100">
              <HiOutlineChevronLeft className="h-4 w-4" />
            </button>
            <div className="px-4 py-1.5 rounded-full border border-border bg-white min-w-[230px] text-center shadow-sm">
              <span className="text-11px font-medium text-neutral600">{weekLabel}</span>
            </div>
            <button type="button" onClick={() => changeWeek(1)} className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-bg50 hover:bg-bg100">
              <HiOutlineChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-3 text-xs flex-1 overflow-auto">
          {days.map(date => {
            const key = formatISO(date);
            const dayEvents = eventsByDate[key] || [];
            const label = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
            const weekday = weekDays[date.getDay()];
            const isWeekendDay = date.getDay() === 0 || date.getDay() === 6;
            const isTodayRow = isSameDate(date, now);
            const hasEvents = dayEvents.length > 0;

            const baseType = getBaseType(dayEvents, isWeekendDay);
            const baseColor = getBaseColor(baseType);

            const mainEvent =
              dayEvents.find(e => e.summary) ||
              dayEvents.find(e => e.type === "present" || e.type === "half-present") ||
              dayEvents.find(e => e.type === "holiday") ||
              null;

            const startTime =
              mainEvent?.summary?.firstCheckIn ||
              (mainEvent?.summary?.totalHours ? WINDOW_START : null);
            const endTime =
              mainEvent?.summary?.lastCheckOut ||
              (mainEvent?.summary?.totalHours ? WINDOW_END : null);

            const startMin = startTime ? parseTimeToMinutes(startTime) : null;
            const endMin = endTime ? parseTimeToMinutes(endTime) : null;

            let segLeft = 0;
            let segWidth = 0;
            if (startMin !== null && endMin !== null) {
              const clampedStart = Math.max(startMin, windowStartMin);
              const clampedEnd = Math.min(endMin, windowEndMin);
              if (clampedEnd > clampedStart) {
                segLeft = ((clampedStart - windowStartMin) / windowTotal) * 100;
                segWidth = ((clampedEnd - clampedStart) / windowTotal) * 100;
              }
            } else if (baseType) {
              segLeft = 0;
              segWidth = 100;
            }

            const punches = mainEvent?.punches || [];
            const totalHoursLabel = mainEvent?.summary?.totalHours || mainEvent?.hours || "";
            const paidBreakLabel = mainEvent?.summary?.paidBreak || null;
            const baselineClass = mainEvent?.summary?.paidBreak ? "border-neutral-200" : "border-neutral-100";

            let breakLeft = null;
            let breakWidth = null;
            if (punches && punches.length >= 2) {
              const outIndex = punches.findIndex(p => p.tag && p.tag.toLowerCase().includes("out"));
              const inIndex = punches.findIndex((p, i) => i > outIndex && p.tag && p.tag.toLowerCase().includes("in"));
              const firstOut = outIndex >= 0 ? punches[outIndex] : null;
              const firstIn = inIndex >= 0 ? punches[inIndex] : null;
              if (firstOut && firstIn) {
                const m1 = parseTimeToMinutes(firstOut.time);
                const m2 = parseTimeToMinutes(firstIn.time);
                if (m1 >= windowStartMin && m2 >= windowStartMin && m1 <= windowEndMin && m2 <= windowEndMin && m2 > m1) {
                  breakLeft = ((m1 - windowStartMin) / windowTotal) * 100;
                  breakWidth = ((m2 - m1) / windowTotal) * 100;
                }
              }
            }

            const showNow = isTodayRow && currentWeekContainsNow && nowMinutes >= windowStartMin && nowMinutes <= windowEndMin;

            return (
              <button
                key={key}
                type="button"
                onClick={() => openDayPanel(date, dayEvents)}
                className={`group flex w-full items-center gap-4 rounded-xl px-2 py-1.5 transition ${hasEvents ? "hover:bg-primary50 cursor-pointer" : "hover:bg-bg50 cursor-default"}`}
              >
                <div className="w-28 text-left text-11px">
                  <div className="font-semibold text-neutral700">{weekday}</div>
                  <div className="text-neutral400">{label}</div>
                </div>

                <div className="flex-1 relative h-14">
                  <div className={`absolute inset-y-1 left-0 right-0 border-b ${baselineClass}`} />

                  {baseType && segWidth > 0 && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-[2px] rounded-full"
                      style={{
                        left: `${segLeft}%`,
                        width: `${segWidth}%`,
                        backgroundColor: baseColor
                      }}
                    />
                  )}

                  {startTime && segWidth > 0 && (
                    <span className="absolute -top-4 text-[10px] text-neutral400" style={{ left: `${segLeft}%` }}>
                      {startTime}
                    </span>
                  )}

                  {endTime && segWidth > 0 && (
                    <span className="absolute -top-4 text-[10px] text-neutral400" style={{ right: `${100 - (segLeft + segWidth)}%` }}>
                      {endTime}
                    </span>
                  )}

                  {breakLeft !== null && breakWidth !== null && (
                    <div className="absolute top-1/2 -translate-y-1/2 h-[2px] bg-neutral50 rounded" style={{ left: `${breakLeft}%`, width: `${breakWidth}%` }} />
                  )}

                  {punches.map((p, idx) => {
                    const m = parseTimeToMinutes(p.time);
                    if (m === null || m < windowStartMin || m > windowEndMin) return null;
                    const left = ((m - windowStartMin) / windowTotal) * 100;
                    const isIn = p.tag?.toLowerCase().includes("in");
                    const color = isIn ? "#16A34A" : "#EF4444";
                    return (
                      <div key={idx} className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${left}%` }}>
                        <span className="h-2.5 w-2.5 rounded-full border border-white shadow" style={{ backgroundColor: color }} />
                      </div>
                    );
                  })}

                  {isTodayRow && currentWeekContainsNow && nowLeft !== null && (
                    <div className="absolute inset-y-0 left-0 w-full pointer-events-none">
                      <div className="absolute left-0 top-0 bottom-0" style={{ width: `${nowLeft}%`, overflow: "hidden" }}>
                        <div className="moving-dots" style={{ width: "100%" }} />
                      </div>
                      <div className="absolute" style={{ left: `${nowLeft}%`, top: 0, bottom: 0, width: 2 }}>
                        <div className="now-line h-full w-full bg-sky-500" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-20 text-right text-11px text-neutral600">
                  {totalHoursLabel && <span>{totalHoursLabel} Hrs</span>}
                </div>
              </button>
            );
          })}
        </div>

        <div className="border-t border-border px-10 py-2 text-[11px] text-neutral400 flex justify-between">
          <span>12:30</span>
          <span>14:30</span>
          <span>16:30</span>
          <span>18:30</span>
          <span>20:30</span>
        </div>

        <div className="border-t border-border px-6 py-3 bg-bg50 text-[11px] flex gap-6">
          <div className="flex items-center gap-1">
            <span className="h-1 w-6 rounded-full bg-neutral300" />
            <span className="text-neutral500">Days</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1 w-6 rounded-full bg-primary500" />
            <span className="text-neutral500">Payable Days {footerStats.payable}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1 w-6 rounded-full bg-emerald-500" />
            <span className="text-neutral500">Present {footerStats.present}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1 w-6 rounded-full bg-amber-500" />
            <span className="text-neutral500">Weekend {footerStats.weekend}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1 w-6 rounded-full bg-sky-500" />
            <span className="text-neutral500">Holidays {footerStats.holidays}</span>
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
      />
    </>
  );
}
