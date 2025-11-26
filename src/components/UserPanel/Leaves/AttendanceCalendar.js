import React, { useMemo, useState } from "react";

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

const AttendanceCalendar = ({
  events,
  title,
  subtitle,
  legend,
  highlightWeekends = false,
}) => {
  const [current, setCurrent] = useState(new Date());
  const matrix = useMemo(() => getMonthMatrix(current), [current]);

  const eventsByDate = useMemo(() => {
    const m = {};
    events.forEach(e => {
      if (!m[e.date]) m[e.date] = [];
      m[e.date].push(e);
    });
    return m;
  }, [events]);

  const monthLabel = current.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const isToday = d => {
    const t = new Date();
    return (
      d.getFullYear() === t.getFullYear() &&
      d.getMonth() === t.getMonth() &&
      d.getDate() === t.getDate()
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {(title || subtitle) && (
        <div>
          {title && (
            <h2 className="text-lg font-semibold text-foundation-neurtal-neurtal-500 font-nunito">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs text-foundation-neurtal-neurtal-300 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {legend?.length > 0 && (
          <div className="flex flex-wrap gap-3 text-[11px] text-foundation-neurtal-neurtal-400">
            {legend.map(l => (
              <div
                key={l.label}
                className="inline-flex items-center gap-2 rounded-full bg-foundation-background-color-background-color-100 px-3 py-1"
              >
                <span className={`h-2.5 w-2.5 rounded ${l.dotClassName}`} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() =>
              setCurrent(
                new Date(current.getFullYear(), current.getMonth() - 1, 1)
              )
            }
            className="px-2 py-1 rounded border border-borderGray200 bg-white hover:bg-foundation-background-color-background-color-100"
          >
            ‹
          </button>
          <div className="min-w-[170px] text-center text-foundation-neurtal-neurtal-500 font-medium rounded-full bg-white border border-foundation-background-color-background-color-300 px-4 py-1 flex items-center justify-center gap-2">
            <span className="h-4 w-4 rounded-full border border-foundation-background-color-background-color-300 flex items-center justify-center text-[10px]">
              📅
            </span>
            <span>{monthLabel}</span>
          </div>
          <button
            onClick={() =>
              setCurrent(
                new Date(current.getFullYear(), current.getMonth() + 1, 1)
              )
            }
            className="px-2 py-1 rounded border border-borderGray200 bg-white hover:bg-foundation-background-color-background-color-100"
          >
            ›
          </button>
        </div>
      </div>

      <div className="flex-1 rounded-[18px] border border-foundation-background-color-background-color-300 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-foundation-background-color-background-color-100 text-[11px] font-medium text-foundation-neurtal-neurtal-400">
                {weekDays.map(d => (
                  <th key={d} className="h-10 text-center border-b border-foundation-background-color-background-color-300">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[11px] sm:text-[12px]">
              {matrix.map((week, i) => (
                <tr key={i} className="border-b border-foundation-background-color-background-color-300 last:border-b-0">
                  {week.map(({ date, inCurrentMonth }) => {
                    const key = formatISO(date);
                    const dayEvents = eventsByDate[key] || [];
                    const today = isToday(date);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    const baseBg = inCurrentMonth
                      ? highlightWeekends && isWeekend
                        ? "bg-[#FFF7E1]"
                        : "bg-white"
                      : "bg-foundation-background-color-background-color-100";
                    const dayCls = today
                      ? "bg-selected text-white font-semibold"
                      : "text-foundation-neurtal-neurtal-400";
                    return (
                      <td
                        key={key}
                        className={`align-top border-r last:border-r-0 border-foundation-background-color-background-color-300 px-2 sm:px-3 py-2 sm:py-3 ${baseBg}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div
                            className={`h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-full text-xs ${dayCls}`}
                          >
                            {date.getDate()}
                          </div>
                          {isWeekend && inCurrentMonth && (
                            <span className="text-[10px] text-foundation-neurtal-neurtal-300">
                              Weekend
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 min-h-[48px] sm:min-h-[56px]">
                          {dayEvents.map((e, idx) => {
                            const style =
                              e.type === "holiday"
                                ? "bg-foundation-green-green-50 border-secondary500 text-foundation-green-green-800"
                                : e.type === "present"
                                ? "bg-bgGreen border-borderGreen text-tagColor"
                                : e.type === "half-present"
                                ? "bg-secondary100 border-secondary500 text-foundation-green-green-800"
                                : e.type === "absent"
                                ? "bg-pink border-firebrick text-firebrick"
                                : "bg-foundation-background-color-background-color-100 border-borderGray200 text-foundation-neurtal-neurtal-400";
                            return (
                              <div
                                key={idx}
                                className={`px-1.5 py-1 rounded border text-[10px] sm:text-[11px] leading-tight truncate ${style}`}
                              >
                                <div className="font-semibold">{e.label}</div>
                                {e.hours && (
                                  <div className="text-[9px] mt-0.5">
                                    {e.hours} Hrs
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
  );
};

export default AttendanceCalendar;
