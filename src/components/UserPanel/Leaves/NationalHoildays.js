import React, { useEffect, useState } from "react";
import AttendanceCalendar from "./AttendanceCalendar";
import AttendanceLineView from "./AttendanceLineView";
import { getNationalHolidays } from "../../../api/ApiCalls";
import { toast } from "react-toastify";

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
      { time: "15:24", device: "Desktop", location: "Trikuta Nagar, Jammu, Jammu district, Jammu and Kashmir, 180012, India", tag: "Check-In" },
    ],
  },
  { date: "2025-11-25", type: "half-present", label: "0.5 day Present (Desktop)", hours: "06:47" },
  { date: "2025-11-25", type: "absent", label: "0.5 day Absent" },
];

export default function NationalHolidays({ view = "calendar" }) {
  const [nationalEvents, setNationalEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchHolidays() {
      setLoading(true);
      try {
        const resp = await getNationalHolidays();
        if (!mounted) return;
        const data = Array.isArray(resp?.data) ? resp.data : resp || [];
        const mapped = data.map(h => ({
          date: h.date,
          type: "holiday",
          label: h.name || h.description || "Holiday",
          meta: { location: h.location, description: h.description },
        }));
        setNationalEvents(mapped);
      } catch (err) {
        toast.error("Failed to load national holidays");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchHolidays();
    return () => { mounted = false; };
  }, []);

  const calendarEvents = [...nationalEvents].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const lineEvents = [...nationalEvents, ...employeeDayEvents].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  if (view === "line") {
    return <AttendanceLineView events={lineEvents} title="Attendance Summary" subtitle="General [ 12:30 - 20:30 ]" loading={loading} />;
  }

  return (
    <AttendanceCalendar
      events={calendarEvents}
      title="Attendance Summary"
      subtitle="General [ 12:30 - 20:30 ]"
      legend={[
        { label: "National holiday", dotClassName: "bg-secondary500" },
        { label: "Weekend", dotClassName: "bg-neutral200" },
        { label: "Present", dotClassName: "bg-bgGreen" },
        { label: "0.5 day partial", dotClassName: "bg-secondary300" },
        { label: "Absent", dotClassName: "bg-firebrick" },
        { label: "Today", dotClassName: "bg-selected" },
      ]}
      highlightWeekends
      loading={loading}
    />
  );
}
