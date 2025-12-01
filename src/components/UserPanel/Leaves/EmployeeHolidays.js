import React, { useMemo, useState } from "react";
import {
  HiOutlineCalendar,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";
import Modal from "../../ui/modals/Modal";
import StatCard from "./EmplLeaveComponent/StatCard";
import Button from "../../ui/buttons/Button";


const absentData = [
  { id: 1, date: "2025-11-25", label: "25-Nov-2025 , Tuesday", days: 0.5 },
  { id: 2, date: "2025-11-10", label: "10-Nov-2025 , Monday", days: 0.5 },
];

const upcomingLeaveHolidays = [
  { id: 1, date: "2025-12-25", label: "Christmas Day", type: "Holiday" },
];

const pastLeaveHolidays = [
  { id: 1, date: "2025-10-20", label: "Diwali", type: "Holiday" },
  { id: 2, date: "2025-11-10", label: "0.5 day Leave", type: "Leave" },
];

const pastLeaves = [
  { id: 1, date: "2025-11-10", label: "Casual Leave", type: "Leave" },
];

const pastHolidays = [
  { id: 1, date: "2025-08-15", label: "Independence Day", type: "Holiday" },
];

const filterOptions = [
  { value: "upcoming", label: "Upcoming Leave & Holidays" },
  { value: "pastLeaveHolidays", label: "Past Leave & Holidays" },
  { value: "pastLeaves", label: "Past Leave" },
  { value: "pastHolidays", label: "Past Holidays" },
];

const statCards = [
  { title: "Attendance InDiscipline", badge: null, available: "0", booked: "0" },
  { title: "Compensatory Off", badge: "CO", available: "0", booked: "0" },
  { title: "Leave Without Pay", badge: null, available: "", booked: "0" },
  { title: "Probation Period Leaves", badge: null, available: "1", booked: "0" },
];

const monthsSince = (start, end) =>
  (end.getFullYear() - start.getFullYear()) * 12 +
  (end.getMonth() - start.getMonth()) +
  1;

const formatFyRange = (startYear) =>
  `01-Apr-${startYear} - 31-Mar-${startYear + 1}`;

const LeaveSummaryBar = ({ used, absent, fyLabel, onPrevYear, onNextYear, onApply }) => (
  <div className="bg-white border border-border rounded-2xl px-4 sm:px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-sm">
    <div className="text-xs sm:text-sm text-neutral400 flex flex-wrap items-center gap-2">
      <span className="font-semibold text-neutral500">Leave booked this year:</span>
      <span className="px-2 py-[3px] rounded-full bg-primary50 text-primary600 text-[11px]">
        {used.toFixed(1)} day(s)
      </span>
      <span className="h-3 w-px bg-border mx-1 hidden sm:inline-block" />
      <span className="font-semibold text-neutral500">Absent:</span>
      <span className="px-2 py-[3px] rounded-full bg-secondary50 text-secondary600 text-[11px]">
        {absent} day(s)
      </span>
    </div>
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex items-center gap-2 text-xs text-neutral400">
        <button
          onClick={onPrevYear}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-bg50 hover:bg-bg100"
        >
          <HiOutlineChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-white min-w-[190px] justify-center shadow-sm">
          <HiOutlineCalendar className="h-4 w-4 text-neutral300" />
          <span className="text-[11px] font-medium text-neutral500">
            {fyLabel}
          </span>
        </div>
        <button
          onClick={onNextYear}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-bg50 hover:bg-bg100"
        >
          <HiOutlineChevronRight className="h-4 w-4" />
        </button>
      </div>
      <Button onClick={onApply} className="text-xs sm:text-sm px-4 sm:px-5 py-2">
        Apply Leave
      </Button>
    </div>
  </div>
);

const AbsentList = ({ data, onApply }) => {
  const total = data.reduce((s, r) => s + r.days, 0);
  return (
    <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between text-sm text-neutral500">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Absent</span>
          <span className="text-xs text-neutral300">{total} day(s)</span>
        </div>
        <span className="text-[11px] px-2 py-[3px] rounded-full bg-secondary50 text-secondary600">
          Needs regularization
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-xs">
          <tbody>
            {data.map((row) => (
              <tr
                key={row.id}
                className="border-t border-border hover:bg-bg50 transition"
              >
                <td className="px-5 py-3 w-1/2 text-neutral500">{row.label}</td>
                <td className="px-5 py-3 w-1/4 text-neutral400">
                  {row.days} day
                </td>
                <td className="px-5 py-3 w-1/4 text-right">
                  <Button
                    variant="outline"
                    onClick={() => onApply(row)}
                    className="text-[11px] py-1.5 px-4"
                  >
                    Apply Leave
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const HistorySection = ({ filter, onFilterChange, rows }) => (
  <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
    <div className="px-5 py-3 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-neutral400">History</span>
        <span className="text-[11px] text-neutral300">
          View past and upcoming leave / holidays
        </span>
      </div>
      <select
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="border border-border rounded-lg px-3 py-1.5 text-xs text-neutral500 bg-bg50 w-full sm:w-72 outline-none focus:ring-2 focus:ring-primary100"
      >
        {filterOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
    {rows.length === 0 ? (
      <div className="px-5 py-10 flex flex-col items-center justify-center text-xs text-neutral300">
        <div className="h-20 w-20 rounded-full bg-bg100 mb-4 flex items-center justify-center">
          <img src="/empty.svg" alt="no data found" className="h-14 w-14" />
        </div>
        <div className="font-medium text-neutral400">No Data Found</div>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-xs">
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-border hover:bg-bg50 transition"
              >
                <td className="px-5 py-3 w-1/3 text-neutral400">{row.date}</td>
                <td className="px-5 py-3 w-1/2 text-neutral500">{row.label}</td>
                <td className="px-5 py-3 w-1/6 text-right">
                  <span
                    className={`inline-flex items-center justify-end gap-1 text-[11px] ${
                      row.type === "Holiday"
                        ? "text-secondary600"
                        : "text-primary600"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        row.type === "Holiday" ? "bg-secondary400" : "bg-primary400"
                      }`}
                    />
                    {row.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const LeaveApplyForm = ({ form, onChange, onSubmit, onCancel, selectedAbsent }) => (
  <form className="space-y-4 text-xs" onSubmit={onSubmit}>
    <div className="flex items-start justify-between mb-2">
      <div>
        <div className="text-sm font-semibold text-neutral500">Apply Leave</div>
        {selectedAbsent && (
          <div className="text-[11px] text-neutral400 mt-1">
            For: {selectedAbsent.label}
          </div>
        )}
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-neutral400">From date</label>
        <input
          type="date"
          name="from"
          value={form.from}
          onChange={onChange}
          className="border border-border rounded-lg px-2 py-1.5 text-xs outline-none bg-bg50 focus:ring-2 focus:ring-primary100"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-neutral400">To date</label>
        <input
          type="date"
          name="to"
          value={form.to}
          onChange={onChange}
          className="border border-border rounded-lg px-2 py-1.5 text-xs outline-none bg-bg50 focus:ring-2 focus:ring-primary100"
        />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-neutral400">Leave type</label>
        <select
          name="type"
          value={form.type}
          onChange={onChange}
          className="border border-border rounded-lg px-2 py-1.5 text-xs outline-none bg-bg50 focus:ring-2 focus:ring-primary100"
        >
          <option>Full day</option>
          <option>Half day</option>
          <option>Casual leave</option>
          <option>Sick leave</option>
          <option>Privilege leave</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-neutral400">Reason</label>
        <input
          name="reason"
          value={form.reason}
          onChange={onChange}
          placeholder="Short reason"
          className="border border-border rounded-lg px-2 py-1.5 text-xs outline-none bg-bg50 focus:ring-2 focus:ring-primary100"
        />
      </div>
    </div>
    <div className="flex justify-end gap-3 pt-2">
      <Button
        variant="outline"
        type="button"
        onClick={onCancel}
        className="text-xs px-4 py-1.5"
      >
        Cancel
      </Button>
      <Button type="submit" className="text-xs px-5 py-1.5">
        Submit request
      </Button>
    </div>
  </form>
);

const EmployeeHolidays = () => {
  const today = new Date();
  const initialFy = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;

  const [status] = useState("confirmed");
  const [joinDate] = useState("2025-01-01");
  const [usedThisYear, setUsedThisYear] = useState(0);
  const [fyYear, setFyYear] = useState(initialFy);
  const [viewFilter, setViewFilter] = useState("upcoming");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedAbsent, setSelectedAbsent] = useState(null);
  const [form, setForm] = useState({ from: "", to: "", type: "Full day", reason: "" });

  const fyStart = new Date(fyYear, 3, 1);
  const fyEnd = new Date(fyYear + 1, 2, 31);

  const accrual = useMemo(() => {
    const jd = new Date(joinDate);
    const start = jd > fyStart ? jd : fyStart;
    const months = Math.max(0, monthsSince(start, fyEnd));
    let total = 0;
    for (let i = 0; i < months; i++) {
      const mDate = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const probationMonths = Math.min(6, Math.max(0, monthsSince(jd, mDate)));
      const inProbation = status === "probation" && probationMonths > 0 && probationMonths <= 6;
      total += inProbation ? 1 : 2;
    }
    return total;
  }, [status, joinDate, fyStart, fyEnd]);

  const available = Math.max(0, accrual - usedThisYear);

  const inRange = (d) => {
    const date = new Date(d);
    return date >= fyStart && date <= fyEnd;
  };

  const absents = absentData.filter((a) => inRange(a.date));
  const upcoming = upcomingLeaveHolidays.filter((a) => inRange(a.date));
  const pastLH = pastLeaveHolidays.filter((a) => inRange(a.date));
  const pastL = pastLeaves.filter((a) => inRange(a.date));
  const pastH = pastHolidays.filter((a) => inRange(a.date));

  const historyRows =
    viewFilter === "upcoming"
      ? upcoming
      : viewFilter === "pastLeaveHolidays"
      ? pastLH
      : viewFilter === "pastLeaves"
      ? pastL
      : pastH;

  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!form.from || !form.to || !form.reason) return;
    const payload = {
      ...form,
      appliedOn: new Date().toISOString(),
      status: "Pending approval",
      forDate: selectedAbsent?.date || null,
    };
    console.log("LEAVE_APPLIED", payload);
    setUsedThisYear((u) => u + (form.type === "Half day" ? 0.5 : 1));
    setForm({ from: "", to: "", type: "Full day", reason: "" });
    setSelectedAbsent(null);
    setFormOpen(false);
  };

  const openFormForAbsent = (row) => {
    setSelectedAbsent(row);
    setForm((prev) => ({ ...prev, from: row.date, to: row.date }));
    setFormOpen(true);
  };

  const openFormGeneral = () => {
    setSelectedAbsent(null);
    setForm({ from: "", to: "", type: "Full day", reason: "" });
    setFormOpen(true);
  };

  const totalAbsentDays = absents.reduce((s, r) => s + r.days, 0);

  return (
    <>
      <div className="space-y-6">
        <LeaveSummaryBar
          used={usedThisYear}
          absent={totalAbsentDays}
          fyLabel={formatFyRange(fyYear)}
          onPrevYear={() => setFyYear((y) => y - 1)}
          onNextYear={() => setFyYear((y) => y + 1)}
          onApply={openFormGeneral}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <StatCard
              key={card.title}
              {...card}
              available={card.title === "Probation Period Leaves" ? available.toString() : card.available}
            />
          ))}
        </div>

        {absents.length > 0 && <AbsentList data={absents} onApply={openFormForAbsent} />}

        <HistorySection
          filter={viewFilter}
          onFilterChange={setViewFilter}
          rows={historyRows}
        />
      </div>

      <Modal
        open={formOpen}
        onClose={() => {
          setForm({ from: "", to: "", type: "Full day", reason: "" });
          setSelectedAbsent(null);
          setFormOpen(false);
        }}
      >
        <LeaveApplyForm
          form={form}
          onChange={handleFormChange}
          onSubmit={handleApplySubmit}
          onCancel={() => {
            setForm({ from: "", to: "", type: "Full day", reason: "" });
            setSelectedAbsent(null);
            setFormOpen(false);
          }}
          selectedAbsent={selectedAbsent}
        />
      </Modal>
    </>
  );
};

export default EmployeeHolidays;
