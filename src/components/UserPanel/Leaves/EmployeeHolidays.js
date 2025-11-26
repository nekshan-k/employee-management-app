import React, { useMemo, useState } from "react";
import { HiOutlineCalendar, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import Modal from "../../ui/modals/Modal";

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

const pastLeaves = [{ id: 1, date: "2025-11-10", label: "Casual Leave", type: "Leave" }];

const pastHolidays = [{ id: 1, date: "2025-08-15", label: "Independence Day", type: "Holiday" }];

const filterOptions = [
  { value: "upcoming", label: "Upcoming Leave & Holidays" },
  { value: "pastLeaveHolidays", label: "Past Leave & Holidays" },
  { value: "pastLeaves", label: "Past Leave" },
  { value: "pastHolidays", label: "Past Holidays" },
];

const formatFyRange = startYear => {
  const s = `01-Apr-${startYear}`;
  const e = `31-Mar-${startYear + 1}`;
  return `${s} - ${e}`;
};

const LeaveSummaryBar = ({ used, absent, fyLabel, onPrevYear, onNextYear, onApply }) => (
  <div className="bg-foundation-background-color-background-color-50 border border-foundation-background-color-background-color-300 rounded-2xl px-4 sm:px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="text-xs sm:text-sm text-foundation-neurtal-neurtal-400">
      <span className="font-semibold text-foundation-neurtal-neurtal-500">
        Leave booked this year:
      </span>{" "}
      {used.toFixed(1)} day(s)
      <span className="mx-2">|</span>
      <span className="font-semibold text-foundation-neurtal-neurtal-500">Absent:</span>{" "}
      {absent} day(s)
    </div>
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex items-center gap-2 text-xs text-foundation-neurtal-neurtal-400">
        <button
          onClick={onPrevYear}
          className="h-8 w-8 flex items-center justify-center rounded-md border border-foundation-background-color-background-color-300 bg-white hover:bg-foundation-background-color-background-color-100"
        >
          <HiOutlineChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-foundation-background-color-background-color-300 bg-white min-w-[190px] justify-center">
          <HiOutlineCalendar className="h-4 w-4 text-foundation-neurtal-neurtal-400" />
          <span className="text-[11px] font-medium text-foundation-neurtal-neurtal-500">
            {fyLabel}
          </span>
        </div>
        <button
          onClick={onNextYear}
          className="h-8 w-8 flex items-center justify-center rounded-md border border-foundation-background-color-background-color-300 bg-white hover:bg-foundation-background-color-background-color-100"
        >
          <HiOutlineChevronRight className="h-4 w-4" />
        </button>
      </div>
      <button
        onClick={onApply}
        className="inline-flex items-center justify-center rounded-md bg-selected text-white text-xs sm:text-sm px-4 sm:px-5 py-2 font-semibold shadow-sm hover:bg-blue-600 transition"
      >
        Apply Leave
      </button>
    </div>
  </div>
);

const StatCard = ({ title, badge, rows }) => (
  <div className="bg-white border border-borderGray200 rounded-2xl shadow-sm px-5 py-4 flex flex-col justify-between min-h-[132px]">
    <div className="flex items-center justify-between mb-4">
      <div className="text-xs text-foundation-neurtal-neurtal-400">{title}</div>
      {badge && (
        <div className="h-8 w-8 rounded-xl bg-foundation-green-green-50 flex items-center justify-center text-xs text-secondary600">
          {badge}
        </div>
      )}
    </div>
    <div className="space-y-1 text-[11px] text-foundation-neurtal-neurtal-400">
      {rows.map(r => (
        <div key={r.label} className="flex items-center justify-between">
          <span>{r.label}</span>
          <span className="text-foundation-neurtal-neurtal-500 font-semibold">
            {r.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const AbsentList = ({ data, onApply }) => {
  const total = data.reduce((s, r) => s + r.days, 0);
  return (
    <div className="bg-white border border-borderGray200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-foundation-background-color-background-color-300 flex items-center gap-2 text-sm text-foundation-neurtal-neurtal-500">
        <span className="font-semibold">Absent</span>
        <span className="text-xs text-foundation-neurtal-neurtal-300">{total} day</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-xs">
          <tbody>
            {data.map(row => (
              <tr
                key={row.id}
                className="border-t border-foundation-background-color-background-color-300 hover:bg-foundation-background-color-background-color-50"
              >
                <td className="px-5 py-3 w-1/2 text-foundation-neurtal-neurtal-500">
                  {row.label}
                </td>
                <td className="px-5 py-3 w-1/4 text-foundation-neurtal-neurtal-400">
                  {row.days} day
                </td>
                <td className="px-5 py-3 w-1/4 text-right">
                  <button
                    onClick={() => onApply(row)}
                    className="inline-flex items-center justify-center border border-selected text-selected text-xs px-4 py-1.5 rounded-md hover:bg-selected hover:text-white transition-colors"
                  >
                    Apply Leave
                  </button>
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
  <div className="bg-white border border-borderGray200 rounded-2xl shadow-sm overflow-hidden">
    <div className="px-5 py-3 border-b border-foundation-background-color-background-color-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <select
        value={filter}
        onChange={e => onFilterChange(e.target.value)}
        className="border border-foundation-background-color-background-color-300 rounded-md px-3 py-1.5 text-xs text-foundation-neurtal-neurtal-500 bg-white w-full sm:w-64"
      >
        {filterOptions.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
    {rows.length === 0 ? (
      <div className="px-5 py-12 flex flex-col items-center justify-center text-xs text-foundation-neurtal-neurtal-300">
        <div className="h-24 w-24 rounded-full bg-foundation-background-color-background-color-100 mb-4" >
          <img src="/empty.svg" alt="no data found" srcset="" />
         </div>
        <div className="font-medium text-neutral500">No Data Found</div>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-xs">
          <tbody>
            {rows.map(row => (
              <tr
                key={row.id}
                className="border-t border-foundation-background-color-background-color-300 hover:bg-foundation-background-color-background-color-50"
              >
                <td className="px-5 py-3 w-1/3 text-foundation-neurtal-neurtal-400">
                  {row.date}
                </td>
                <td className="px-5 py-3 w-1/2 text-foundation-neurtal-neurtal-500">
                  {row.label}
                </td>
                <td className="px-5 py-3 w-1/6 text-foundation-neurtal-neurtal-300 text-right">
                  {row.type}
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
        <div className="text-sm font-semibold text-foundation-neurtal-neurtal-500">
          Apply Leave
        </div>
        {selectedAbsent && (
          <div className="text-[11px] text-foundation-neurtal-neurtal-400 mt-1">
            For: {selectedAbsent.label}
          </div>
        )}
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-foundation-neurtal-neurtal-400">From date</label>
        <input
          type="date"
          name="from"
          value={form.from}
          onChange={onChange}
          className="border border-borderGray200 rounded-md px-2 py-1.5 text-xs outline-none bg-foundation-background-color-background-color-50"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-foundation-neurtal-neurtal-400">To date</label>
        <input
          type="date"
          name="to"
          value={form.to}
          onChange={onChange}
          className="border border-borderGray200 rounded-md px-2 py-1.5 text-xs outline-none bg-foundation-background-color-background-color-50"
        />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-foundation-neurtal-neurtal-400">Leave type</label>
        <select
          name="type"
          value={form.type}
          onChange={onChange}
          className="border border-borderGray200 rounded-md px-2 py-1.5 text-xs outline-none bg-foundation-background-color-background-color-50"
        >
          <option>Full day</option>
          <option>Half day</option>
          <option>Casual leave</option>
          <option>Sick leave</option>
          <option>Privilege leave</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-foundation-neurtal-neurtal-400">Reason</label>
        <input
          name="reason"
          value={form.reason}
          onChange={onChange}
          placeholder="Short reason"
          className="border border-borderGray200 rounded-md px-2 py-1.5 text-xs outline-none bg-foundation-background-color-background-color-50"
        />
      </div>
    </div>
    <div className="flex justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-1.5 rounded-md border border-foundation-background-color-background-color-300 text-xs text-foundation-neurtal-neurtal-400 bg-white"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-5 py-1.5 rounded-md bg-foundation-primary-blue-color-primary-color-600 text-xs text-white font-medium"
      >
        Submit request
      </button>
    </div>
  </form>
);

const EmployeeHolidays = () => {
  const today = new Date();
  const initialFy =
    today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;

  const [status, setStatus] = useState("confirmed");
  const [joinDate, setJoinDate] = useState("2025-01-01");
  const [usedThisYear, setUsedThisYear] = useState(0);
  const [fyYear, setFyYear] = useState(initialFy);
  const [viewFilter, setViewFilter] = useState("upcoming");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedAbsent, setSelectedAbsent] = useState(null);
  const [form, setForm] = useState({
    from: "",
    to: "",
    type: "Full day",
    reason: "",
  });

  const fyStart = new Date(fyYear, 3, 1);
  const fyEnd = new Date(fyYear + 1, 2, 31);

  const monthsSince = (start, end) =>
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1;

  const accrual = useMemo(() => {
    const jd = new Date(joinDate);
    const start = jd > fyStart ? jd : fyStart;
    const months = Math.max(0, monthsSince(start, fyEnd));
    let total = 0;
    for (let i = 0; i < months; i++) {
      const mDate = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const probationMonths = Math.min(
        6,
        monthsSince(jd, mDate) > 0 ? monthsSince(jd, mDate) : 0
      );
      const inProbation =
        status === "probation" && probationMonths > 0 && probationMonths <= 6;
      total += inProbation ? 1 : 2;
    }
    return total;
  }, [status, joinDate, fyStart, fyEnd]);

  const available = Math.max(0, accrual - usedThisYear);

  const inRange = d => {
    const date = new Date(d);
    return date >= fyStart && date <= fyEnd;
  };

  const absents = absentData.filter(a => inRange(a.date));
  const upcoming = upcomingLeaveHolidays.filter(a => inRange(a.date));
  const pastLH = pastLeaveHolidays.filter(a => inRange(a.date));
  const pastL = pastLeaves.filter(a => inRange(a.date));
  const pastH = pastHolidays.filter(a => inRange(a.date));

  const historyRows =
    viewFilter === "upcoming"
      ? upcoming
      : viewFilter === "pastLeaveHolidays"
      ? pastLH
      : viewFilter === "pastLeaves"
      ? pastL
      : pastH;

  const handleFormChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleApplySubmit = e => {
    e.preventDefault();
    if (!form.from || !form.to || !form.reason) return;
    const payload = {
      ...form,
      appliedOn: new Date().toISOString(),
      status: "Pending approval",
      forDate: selectedAbsent?.date || null,
    };
    console.log("LEAVE_APPLIED", payload);
    setUsedThisYear(u => u + (form.type === "Half day" ? 0.5 : 1));
    setForm({ from: "", to: "", type: "Full day", reason: "" });
    setSelectedAbsent(null);
    setFormOpen(false);
  };

  const openFormForAbsent = row => {
    setSelectedAbsent(row);
    setForm(prev => ({ ...prev, from: row.date, to: row.date }));
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
          onPrevYear={() => setFyYear(y => y - 1)}
          onNextYear={() => setFyYear(y => y + 1)}
          onApply={openFormGeneral}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Attendance InDiscipline"
            rows={[{ label: "Booked", value: "0" }]}
          />
          <StatCard
            title="Compensatory Off"
            badge="CO"
            rows={[
              { label: "Available", value: "0" },
              { label: "Booked", value: "0" },
            ]}
          />
          <StatCard
            title="Leave Without Pay"
            rows={[{ label: "Booked", value: "0" }]}
          />
          <StatCard
            title="Probation Period Leaves"
            rows={[
              { label: "Available", value: available.toFixed(1) },
              { label: "Booked", value: usedThisYear.toFixed(1) },
            ]}
          />
        </div>

        {absents.length > 0 && (
          <AbsentList data={absents} onApply={openFormForAbsent} />
        )}

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
