import React from "react";
import { HiOutlineCalendar, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import Button from "../../../ui/buttons/Button";

const LeaveSummaryBar = ({ used, absent, monthLabel, onPrevMonth, onNextMonth, onApply }) => (
  <div className="bg-white border border-border rounded-2xl px-4 sm:px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-sm">
    <div className="text-xs sm:text-sm text-neutral400 flex flex-wrap items-center gap-2">
      <span className="font-semibold text-neutral500">Leave booked this month:</span>
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
          onClick={onPrevMonth}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-bg50 hover:bg-bg100"
        >
          <HiOutlineChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-white min-w-[190px] justify-center shadow-sm">
          <HiOutlineCalendar className="h-4 w-4 text-neutral300" />
          <span className="text-[11px] font-medium text-neutral500">
            {monthLabel}
          </span>
        </div>
        <button
          onClick={onNextMonth}
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

export default LeaveSummaryBar;
