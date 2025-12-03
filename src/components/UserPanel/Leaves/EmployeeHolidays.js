import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import StatCard from "./EmplLeaveComponent/StatCard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getLaveBalance,
  getNationalHolidays,
  getLaveHistoryByUserId,
  ApplyLeave,
} from "../../../api/ApiCalls";
import LeaveSummaryBar from "./EmployeeHolidaysComp/LeaveSummaryBar";
import AbsentList from "./EmployeeHolidaysComp/AbsentList";
import HistorySection from "./EmployeeHolidaysComp/HistorySection";
import LeaveApplyForm from "./EmployeeHolidaysComp/LeaveApplyForm";
import SidePanel from "../../ui/SidePanel";

export default function EmployeeHolidays() {
  const storeUser = useSelector((s) => s.auth.user);
  const userId = storeUser?.id || 0;
  const employmentType = (storeUser?.employmentType || "CONFIRMED").toUpperCase();

  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const monthStart = useMemo(() => new Date(currentYear, currentMonth, 1), [currentYear, currentMonth]);
  const monthEnd = useMemo(() => new Date(currentYear, currentMonth + 1, 0), [currentYear, currentMonth]);
  const monthLabel = useMemo(
    () => monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    [monthStart]
  );

  const [usedThisMonth, setUsedThisMonth] = useState(0);
  const [viewFilter, setViewFilter] = useState("upcoming");
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedAbsent, setSelectedAbsent] = useState(null);
  const [form, setForm] = useState({ from: "", to: "", type: "", reason: "" });

  const [leaveBalance, setLeaveBalance] = useState(null);
  const [nationalHolidays, setNationalHolidays] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [absents, setAbsents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [balanceRes, holidaysRes, historyRes] = await Promise.all([
          getLaveBalance(userId),
          getNationalHolidays(),
          getLaveHistoryByUserId(userId),
        ]);

        if (balanceRes.data?.success) setLeaveBalance(balanceRes.data.data);
        if (holidaysRes.data?.success) setNationalHolidays(holidaysRes.data.data);
        if (historyRes.data?.success) setLeaveHistory(historyRes.data.data);

        const currentMonthAbsents = (historyRes.data?.data || []).filter((entry) => {
          const entryDate = new Date(entry.startDate || entry.date || entry.workDate);
          const inMonth = entryDate >= monthStart && entryDate <= monthEnd;
          const isLeaveRecord =
            !!entry.leaveType || entry.type === "Leave" || (entry.leaveType && ["APPROVED", "PENDING", "REJECTED"].includes(entry.status));
          return inMonth && !isLeaveRecord && entry.status === "PENDING";
        });

        setAbsents(currentMonthAbsents);

        const usedApproved = (historyRes.data?.data || []).filter((leave) => {
          const leaveDate = new Date(leave.startDate || leave.date || leave.workDate);
          return leaveDate >= monthStart && leaveDate <= monthEnd && leave.status === "APPROVED";
        }).length;

        setUsedThisMonth(usedApproved);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId, monthStart, monthEnd]);

  const availableLeaves = useMemo(() => {
    if (!leaveBalance) return 0;
    return leaveBalance.availableLeaves;
  }, [leaveBalance]);

  const upcomingItems = useMemo(() => {
    const upcomingHolidays = nationalHolidays.filter((h) => {
      const d = new Date(h.date);
      return d >= monthStart && d <= monthEnd;
    });

    const upcomingLeaves = leaveHistory.filter((l) => {
      const d = new Date(l.startDate || l.date || l.workDate);
      return d > today && d <= monthEnd && l.status === "APPROVED";
    });

    return [
      ...upcomingHolidays.map((h) => ({ ...h, type: "Holiday", date: h.date })),
      ...upcomingLeaves.map((l) => ({ ...l, type: "Leave", date: l.startDate || l.date })),
    ];
  }, [nationalHolidays, leaveHistory, monthStart, monthEnd, today]);

  const pastItems = useMemo(() => {
    const pastHolidays = nationalHolidays.filter((h) => {
      const d = new Date(h.date);
      return d >= monthStart && d < today;
    });

    const pastLeaves = leaveHistory.filter((l) => {
      const d = new Date(l.startDate || l.date || l.workDate);
      return d >= monthStart && d < today;
    });

    return [
      ...pastHolidays.map((h) => ({ ...h, type: "Holiday", date: h.date })),
      ...pastLeaves,
    ];
  }, [nationalHolidays, leaveHistory, monthStart, today]);

  const historyRows = viewFilter === "upcoming" ? upcomingItems : pastItems;

  const handleFormChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!form.from || !form.to || !form.reason || !form.type) return;
    try {
      await ApplyLeave({
        startDate: form.from,
        endDate: form.to,
        reason: form.reason,
        leaveType: form.type,
      });
      toast.success("Leave application submitted successfully");
      setUsedThisMonth((u) => u + 1);
      setForm({ from: "", to: "", type: "", reason: "" });
      setSelectedAbsent(null);
      setPanelOpen(false);
    } catch {
      toast.error("Failed to submit leave application");
    }
  };

  const openFormGeneral = () => {
    setSelectedAbsent(null);
    setForm({ from: "", to: "", type: "", reason: "" });
    setPanelOpen(true);
  };

  const openFormForAbsent = (row) => {
    setSelectedAbsent(row);
    setForm({
      from: row.startDate || row.date,
      to: row.startDate || row.date,
      type: "",
      reason: "",
    });
    setPanelOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary600"></div>
      </div>
    );
  }

  const totalAbsentDays = absents.reduce((s, r) => s + (r.days || 1), 0);

  const statCards = [
    { title: "Total Leaves", badge: null, available: leaveBalance?.totalLeaves || "0", booked: leaveBalance?.usedLeaves || "0" },
    { title: "Available", badge: "AL", available: availableLeaves, booked: leaveBalance?.pendingLeaves || "0" },
    { title: "Pending", badge: null, available: leaveBalance?.pendingLeaves || "0", booked: "0" },
    employmentType === "PROBATION"
      ? { title: "Used Leaves", badge: null, available: leaveBalance?.usedLeaves || "0", booked: usedThisMonth }
      : { title: employmentType === "PROBATION" ? "Probation Leaves" : "Earned Leaves", badge: null, available: employmentType === "PROBATION" ? "1" : availableLeaves, booked: usedThisMonth },
  ];

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="space-y-6">
        <LeaveSummaryBar
          used={usedThisMonth}
          absent={totalAbsentDays}
          monthLabel={monthLabel}
          onPrevMonth={() => {
            if (currentMonth === 0) {
              setCurrentMonth(11);
              setCurrentYear(currentYear - 1);
            } else setCurrentMonth(currentMonth - 1);
          }}
          onNextMonth={() => {
            if (currentMonth === 11) {
              setCurrentMonth(0);
              setCurrentYear(currentYear + 1);
            } else setCurrentMonth(currentMonth + 1);
          }}
          onApply={openFormGeneral}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        {absents.length > 0 && (
          <AbsentList
            data={absents.map((a) => ({
              id: a.id,
              label: new Date(a.startDate || a.date || a.workDate).toLocaleDateString(),
              days: a.days || 1,
            }))}
            onApply={openFormForAbsent}
          />
        )}

        <HistorySection
          filter={viewFilter}
          onFilterChange={setViewFilter}
          rows={historyRows}
          currentMonth={monthLabel}
        />
      </div>

      <SidePanel
        open={panelOpen}
        onClose={() => {
          setForm({ from: "", to: "", type: "", reason: "" });
          setSelectedAbsent(null);
          setPanelOpen(false);
        }}
        title="Apply Leave"
        subtitle={selectedAbsent ? `For: ${selectedAbsent.label}` : ""}
      >
        <div className="p-6">
          <LeaveApplyForm
            form={form}
            onChange={handleFormChange}
            onSubmit={handleApplySubmit}
            onCancel={() => {
              setForm({ from: "", to: "", type: "", reason: "" });
              setSelectedAbsent(null);
              setPanelOpen(false);
            }}
            selectedAbsent={selectedAbsent}
            employmentType={employmentType}
            availableLeaves={availableLeaves}
          />
        </div>
      </SidePanel>
    </>
  );
}
