import React, { useEffect, useState } from "react";
import AttendanceCalendar from "./AttendanceCalendar";
import AttendanceLineView from "./AttendanceLineView";
import { getNationalHolidays } from "../../../api/ApiCalls";
import { toast } from "react-toastify";

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
        const raw = Array.isArray(resp?.data?.data) ? resp.data.data : Array.isArray(resp?.data) ? resp.data : [];
        const mapped = raw.map(h => ({
          date: h.date,
          type: "holiday",
          label: h.title || h.name || h.description || "Holiday",
          meta: { description: h.description, recurring: h.recurring, organizationId: h.organizationId }
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

  if (view === "line") {
    return <AttendanceLineView nationalHolidays={nationalEvents} title="Attendance Summary" subtitle="General [ 12:30 - 20:30 ]" loading={loading} />;
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
        { label: "Today", dotClassName: "bg-selected" }
      ]}
      highlightWeekends
      loading={loading}
    />
  );
}
