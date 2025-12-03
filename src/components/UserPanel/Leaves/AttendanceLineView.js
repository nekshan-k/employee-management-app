import React, { useMemo, useState, useEffect } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import DayDetailPanel from "./OverAllComponent/DayDetailPanel";
import { useSelector } from "react-redux";
import { getAttendanceHistory } from "../../../api/ApiCalls";
import { toast } from "react-toastify";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WINDOW_START = "12:30";
const WINDOW_END = "20:30";
const START_HALF_DAY_HOUR = 12;
const START_HALF_DAY_MIN = 30;

const formatISO = d =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const parseTimeToMinutes = t => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const formatMinutesToHHMM = mins => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const isSameDate = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getWeekRange = current => {
  const day = current.getDay();
  const start = new Date(current);
  start.setDate(current.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
};

const isSameWeek = (a, b) => {
  const wa = getWeekRange(a).start;
  const wb = getWeekRange(b).start;
  return (
    wa.getFullYear() === wb.getFullYear() &&
    wa.getMonth() === wb.getMonth() &&
    wa.getDate() === wb.getDate()
  );
};

const formatWeekLabel = (start, end) => {
  const opts = { day: "2-digit", month: "short", year: "numeric" };
  return `${start.toLocaleDateString("en-GB", opts)} - ${end.toLocaleDateString(
    "en-GB",
    opts
  )}`;
};

const formatTime = d =>
  `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;

const getMinutes = d => d.getHours() * 60 + d.getMinutes();

const buildClampedWorkAndBreakSegments = (session, isToday, now) => {
  if (!session.checkIn) return [];
  const windowStartMin = parseTimeToMinutes(WINDOW_START);
  const windowEndMin = parseTimeToMinutes(WINDOW_END);
  const checkIn = new Date(session.checkIn);
  const checkOut = session.checkOut ? new Date(session.checkOut) : null;
  let sessionEnd = checkOut || (isToday ? now : new Date(checkIn));
  if (!checkOut && !isToday) sessionEnd.setHours(23, 59, 59, 999);
  const sessionStartMin = getMinutes(checkIn);
  const sessionEndMin = getMinutes(sessionEnd);
  if (sessionEndMin <= windowStartMin || sessionStartMin >= windowEndMin)
    return [];
  const breaks = (session.breaks || [])
    .filter(b => b.breakStartTime)
    .map(b => ({
      start: new Date(b.breakStartTime),
      end: b.breakEndTime ? new Date(b.breakEndTime) : null,
      breakStartLat: b.breakStartLat ?? b.breakStartLat,
      breakStartLon: b.breakStartLon ?? b.breakStartLon,
      breakEndLat: b.breakEndLat ?? b.breakEndLat,
      breakEndLon: b.breakEndLon ?? b.breakEndLon
    }))
    .sort((a, b) => a.start - b.start);
  const raw = [];
  let cursor = checkIn;
  breaks.forEach(br => {
    const brStart = br.start;
    const brEnd = br.end || (isToday ? now : sessionEnd);
    if (brStart > cursor)
      raw.push({
        start: new Date(cursor),
        end: new Date(brStart),
        type: "work"
      });
    raw.push({
      start: new Date(brStart),
      end: new Date(brEnd),
      type: "break",
      breakStartLat: br.breakStartLat,
      breakStartLon: br.breakStartLon,
      breakEndLat: br.breakEndLat,
      breakEndLon: br.breakEndLon
    });
    if (brEnd > cursor) cursor = new Date(brEnd);
  });
  if (cursor < sessionEnd)
    raw.push({
      start: new Date(cursor),
      end: new Date(sessionEnd),
      type: "work"
    });
  const clamped = raw
    .map(seg => {
      const s = getMinutes(seg.start);
      const e = getMinutes(seg.end);
      const cs = Math.max(s, windowStartMin);
      const ce = Math.min(e, windowEndMin);
      if (ce <= cs) return null;
      if (seg.type === "break") {
        return {
          start: cs,
          end: ce,
          type: seg.type,
          breakStartLat: seg.breakStartLat,
          breakStartLon: seg.breakStartLon,
          breakEndLat: seg.breakEndLat,
          breakEndLon: seg.breakEndLon
        };
      }
      return { start: cs, end: ce, type: seg.type };
    })
    .filter(Boolean);
  return clamped;
};

const calcSessionDuration = (session, isToday, now) => {
  const segs = buildClampedWorkAndBreakSegments(session, isToday, now);
  return segs
    .filter(s => s.type === "work")
    .reduce((sum, s) => sum + (s.end - s.start), 0);
};

export default function AttendanceLineView({ title, subtitle }) {
  const [current, setCurrent] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [now, setNow] = useState(new Date());
  const [employeeEvents, setEmployeeEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = useSelector(s => s.auth.user?.id || 0);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!userId) {
      setEmployeeEvents([]);
      return;
    }
    let m = true;
    (async () => {
      setLoading(true);
      try {
        const { start } = getWeekRange(current);
        const weekStart = new Date(start);
        const weekEnd = new Date(start);
        weekEnd.setDate(weekStart.getDate() + 6);
        const resp = await getAttendanceHistory(
          userId,
          formatISO(weekStart),
          formatISO(weekEnd)
        );
        const days = Array.isArray(resp?.data?.data) ? resp.data.data : [];
        const today = new Date();
        const todayStr = formatISO(today);
        const mapped = days.map(d => {
          const sessions = d.sessions || [];
          const isToday = d.date === todayStr;
          let totalMins = 0;
          let firstCheckIn = null;
          let lastCheckOut = null;
          const punches = [];
          const segments = [];
          sessions.forEach(s => {
            const segs = buildClampedWorkAndBreakSegments(s, isToday, now);
            segs.forEach(seg => segments.push(seg));
            const dur = calcSessionDuration(s, isToday, now);
            totalMins += dur;
            if (s.checkIn) {
              const dt = new Date(s.checkIn);
              if (!firstCheckIn || dt < firstCheckIn) firstCheckIn = dt;
              punches.push({
                time: formatTime(dt),
                tag: "Check-in",
                minutes: getMinutes(dt),
                lat: s.checkInLat ?? null,
                lon: s.checkInLon ?? null
              });
            }
            if (s.checkOut) {
              const dt = new Date(s.checkOut);
              if (!lastCheckOut || dt > lastCheckOut) lastCheckOut = dt;
              punches.push({
                time: formatTime(dt),
                tag: "Check-out",
                minutes: getMinutes(dt),
                lat: s.checkOutLat ?? null,
                lon: s.checkOutLon ?? null
              });
            }
            (s.breaks || []).forEach(br => {
              if (br.breakStartTime) {
                const dt = new Date(br.breakStartTime);
                punches.push({
                  time: formatTime(dt),
                  tag: "Break start",
                  minutes: getMinutes(dt),
                  lat: br.breakStartLat ?? null,
                  lon: br.breakStartLon ?? null,
                  breakId: br.id
                });
              }
              if (br.breakEndTime) {
                const dt = new Date(br.breakEndTime);
                punches.push({
                  time: formatTime(dt),
                  tag: "Break end",
                  minutes: getMinutes(dt),
                  lat: br.breakEndLat ?? null,
                  lon: br.breakEndLon ?? null,
                  breakId: br.id
                });
              }
            });
          });
          punches.sort((a, b) => a.minutes - b.minutes);
          const hasRunningSession = sessions.some(s => s.checkIn && !s.checkOut);
          const firstIn = sessions[0]?.checkIn ? new Date(sessions[0].checkIn) : null;
          let type = "half-day";
          if (firstIn) {
            const hr = firstIn.getHours();
            const mn = firstIn.getMinutes();
            if (!(hr > START_HALF_DAY_HOUR || (hr === START_HALF_DAY_HOUR && mn > START_HALF_DAY_MIN)))
              type = "present";
          }
          const sessionsWithDur = sessions.map(s => {
            const mDur = calcSessionDuration(s, isToday, now);
            return {
              ...s,
              durationText: formatMinutesToHHMM(mDur)
            };
          });
          return {
            date: d.date,
            type,
            totalMinutes: totalMins,
            hours: formatMinutesToHHMM(totalMins),
            sessions: sessionsWithDur,
            isRunning: hasRunningSession,
            isToday,
            summary: {
              firstCheckIn: firstCheckIn ? formatTime(firstCheckIn) : null,
              lastCheckOut: lastCheckOut ? formatTime(lastCheckOut) : null,
              totalHours: formatMinutesToHHMM(totalMins)
            },
            punches,
            segments,
            firstCheckInTime: firstCheckIn ? formatTime(firstCheckIn) : null,
            lastCheckOutTime: lastCheckOut ? formatTime(lastCheckOut) : null,
            hasRunningSession
          };
        });
        if (m) setEmployeeEvents(mapped);
      } catch {
        toast.error("Failed to load attendance history");
        if (m) setEmployeeEvents([]);
      } finally {
        if (m) setLoading(false);
      }
    })();
    return () => {
      m = false;
    };
  }, [current, userId, now]);

  const eventsByDate = useMemo(() => {
    const map = {};
    employeeEvents.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [employeeEvents]);

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

  const changeWeek = delta =>
    setCurrent(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + delta * 7);
      return next;
    });

  const openDayPanel = (date, dayEvents) => {
    if (!dayEvents.length) return;
    setSelectedDate(date);
    setSelectedEvents(dayEvents);
  };

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const windowStartMin = parseTimeToMinutes(WINDOW_START);
  const windowEndMin = parseTimeToMinutes(WINDOW_END);
  const windowTotal = windowEndMin - windowStartMin;
  const currentWeekContainsNow = isSameWeek(current, now);
  const nowLeft = currentWeekContainsNow
    ? ((nowMinutes - windowStartMin) / windowTotal) * 100
    : null;

  const footerStats = useMemo(() => {
    let payable = 0,
      present = 0,
      weekend = 0,
      holidays = 0;
    days.forEach(date => {
      const key = formatISO(date);
      const dayEvents = eventsByDate[key] || [];
      const isWeekendDay = date.getDay() === 0 || date.getDay() === 6;
      const hasPresent = dayEvents.some(
        e => e.type === "present" || e.type === "half-day"
      );
      const hasHoliday = dayEvents.some(e => e.type === "holiday");
      if (hasPresent || hasHoliday || isWeekendDay) payable += 1;
      if (hasPresent) present += 1;
      if (hasHoliday) holidays += 1;
      if (isWeekendDay) weekend += 1;
    });
    return { payable, present, weekend, holidays };
  }, [days, eventsByDate]);

  return (
    <>
     <style>{`.moving-dots{background-image:radial-gradient(circle,rgba(16,185,129,0.95) 4px,rgba(16,185,129,0) 4px);background-size:10px 6px;background-repeat:repeat-x;height:3px;transform:translateY(-50%);animation:moveDots 1.2s linear infinite}@keyframes moveDots{from{background-position:0 0}to{background-position:20px 0}}.now-line{box-shadow:0 0 6px rgba(59,130,246,0.45)}.punch-tooltip{position:absolute;top:-40px;left:50%;transform:translateX(-50%);background:white;border:1px solid #e5e7eb;border-radius:6px;padding:4px 12px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.1);z-index:10}.punch-tooltip::after{content:'';position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid white}.punch-tooltip::before{content:'';position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:7px solid #e5e7eb;z-index:-1}`}</style>
      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[640px]">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral800">{title}</h2>
            {subtitle && (
              <p className="text-11px text-neutral400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral400">
            <button
              type="button"
              onClick={() => changeWeek(-1)}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-bg50 hover:bg-bg100"
            >
              <HiOutlineChevronLeft className="h-4 w-4" />
            </button>
            <div className="px-4 py-1.5 rounded-full border border-border bg-white min-w-[230px] text-center shadow-sm">
              <span className="text-11px font-medium text-neutral600">
                {weekLabel}
              </span>
            </div>
            <button
              type="button"
              onClick={() => changeWeek(1)}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-bg50 hover:bg-bg100"
            >
              <HiOutlineChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-3 text-xs flex-1 overflow-auto">
          {days.map(date => {
            const key = formatISO(date);
            const dayEvents = eventsByDate[key] || [];
            const label = date.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short"
            });
            const weekday = weekDays[date.getDay()];
            const mainEvent = dayEvents[0] || null;
            const punches = mainEvent?.punches || [];
            const segments = mainEvent?.segments || [];
            const totalHoursLabel = mainEvent?.hours || "";
            const isTodayRow = isSameDate(date, now);
            const isWeekendDay = date.getDay() === 0 || date.getDay() === 6;
            const hasEvents = dayEvents.length > 0;
            const dayType = mainEvent?.type;
            const firstCheckInTime = mainEvent?.firstCheckInTime;
            const lastCheckOutTime = mainEvent?.lastCheckOutTime;
            const hasRunningSession = mainEvent?.hasRunningSession;
            const showNow =
              isTodayRow &&
              currentWeekContainsNow &&
              nowMinutes >= windowStartMin &&
              nowMinutes <= windowEndMin;

            return (
              <button
                key={key}
                type="button"
                onClick={() => openDayPanel(date, dayEvents)}
                className={`group flex w-full items-center gap-4 rounded-xl px-2 py-1.5 transition ${
                  hasEvents
                    ? "hover:bg-primary50 cursor-pointer"
                    : "hover:bg-bg50 cursor-default"
                }`}
              >
                <div className="w-28 text-left text-11px">
                  <div className="font-semibold text-neutral700">{weekday}</div>
                  <div className="text-neutral400">{label}</div>
                </div>

                <div className="flex-1 relative h-14">
                  <div className="absolute inset-y-1 left-0 right-0 border-b border-neutral-200" />

                  {isWeekendDay && !hasEvents && (
                    <>
                      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[2px] bg-amber-400" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-100 text-amber-700 text-[10px] font-medium px-3 py-1 rounded-full border border-amber-300">
                        Weekend
                      </div>
                    </>
                  )}

                  {segments.map((seg, idx) => {
                    if (
                      seg.start < windowStartMin ||
                      seg.end > windowEndMin ||
                      seg.end <= seg.start
                    )
                      return null;

                    const segLeft =
                      ((seg.start - windowStartMin) / windowTotal) * 100;
                    const segWidth =
                      ((seg.end - seg.start) / windowTotal) * 100;

                    let segColor = "#f5f5f5";
                    if (seg.type === "work") {
                      segColor = isTodayRow
                        ? "#16A34A"
                        : dayType === "half-day"
                        ? "#EF4444"
                        : "#16A34A";
                    }

                    return (
                      <div
                        key={idx}
                        className="absolute top-1/2 -translate-y-1/2 h-[2px] rounded-full"
                        style={{
                          left: `${segLeft}%`,
                          width: `${segWidth}%`,
                          backgroundColor: segColor
                        }}
                      />
                    );
                  })}

                  {punches.map((p, idx) => {
                    const m = parseTimeToMinutes(p.time);
                    if (m === null || m < windowStartMin || m > windowEndMin)
                      return null;

                    const left = ((m - windowStartMin) / windowTotal) * 100;
                    const isIn = p.tag.includes("in") || p.tag.includes("end");
                    const color = isIn ? "#16A34A" : "#EF4444";
                    const isFirstCheckIn =
                      p.tag === "Check-in" && p.time === firstCheckInTime;
                    const isLastCheckOut =
                      p.tag === "Check-out" &&
                      p.time === lastCheckOutTime &&
                      !hasRunningSession;
                    const showTimeByDefault = isFirstCheckIn || isLastCheckOut;

                    return (
                      <div
                        key={idx}
                        className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center group/dot"
                        style={{ left: `${left}%` }}
                      >
                        {showTimeByDefault && (
                          <span
                            className={`text-[9px] text-neutral400 absolute whitespace-nowrap ${
                              isLastCheckOut ? "-top-5" : "-bottom-5"
                            }`}
                          >
                            {p.time}
                          </span>
                        )}

                        <div className="punch-tooltip opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none">
                          <div className="text-[11px] font-medium" style={{ color }}>
                            {p.tag}, {p.time}
                          </div>
                          {(p.lat || p.lon) && (
                            <div className="text-[10px] text-neutral400">
                              {p.lat !== undefined && p.lon !== undefined
                                ? `${p.lat}, ${p.lon}`
                                : ""}
                            </div>
                          )}
                        </div>

                        <span
                          className="h-2.5 w-2.5 rounded-full border border-white shadow"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                    );
                  })}

                  {showNow && nowLeft !== null && (
                    <div className="absolute inset-y-0 left-0 w-full pointer-events-none">
                      <div
                        className="absolute left-0 top-0 bottom-0"
                        style={{ width: `${nowLeft}%`, overflow: "hidden" }}
                      >
                        <div className="moving-dots" style={{ width: "100%" }} />
                      </div>

                      <div
                        className="absolute"
                        style={{
                          left: `${nowLeft}%`,
                          top: 0,
                          bottom: 0,
                          width: 2
                        }}
                      >
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
            <span className="text-neutral500">
              Payable Days {footerStats.payable}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1 w-6 rounded-full bg-emerald-500" />
            <span className="text-neutral500">
              Present {footerStats.present}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1 w-6 rounded-full bg-amber-500" />
            <span className="text-neutral500">
              Weekend {footerStats.weekend}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1 w-6 rounded-full bg-sky-500" />
            <span className="text-neutral500">
              Holidays {footerStats.holidays}
            </span>
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
