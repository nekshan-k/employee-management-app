import React from "react";
import AttendanceCalendar from "./AttendanceCalendar";

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
  { date: "2025-12-25", type: "holiday", label: "Christmas" },
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
  { date: "2025-11-24", type: "present", label: "Present (Desktop)", hours: "07:58" },
  { date: "2025-11-25", type: "half-present", label: "0.5 day Present (Desktop)", hours: "06:47" },
  { date: "2025-11-25", type: "absent", label: "0.5 day Absent" },
];

const events = [...nationalEvents, ...employeeDayEvents];

const NationalHolidays = () => {
  return (
    <AttendanceCalendar
      events={events}
      title=""
      subtitle=""
      legend={[
        { label: "National holiday", dotClassName: "bg-secondary500" },
        {
          label: "Weekend",
          dotClassName: "bg-foundation-background-color-background-color-300",
        },
        { label: "Present", dotClassName: "bg-bgGreen" },
        { label: "0.5 day / partial", dotClassName: "bg-secondary300" },
        { label: "Absent", dotClassName: "bg-firebrick" },
        { label: "Today", dotClassName: "bg-selected" },
      ]}
      highlightWeekends
    />
  );
};

export default NationalHolidays;
