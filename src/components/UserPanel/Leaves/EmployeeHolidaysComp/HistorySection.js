import React from "react";
import FormattedDate from "../../../ui/FormattedDate";

const HistorySection = ({ filter, onFilterChange, rows, currentMonth }) => (
  <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
    <div className="px-5 py-3 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-neutral400">History</span>
        <span className="text-[11px] text-neutral300">View {currentMonth} leave / holidays</span>
      </div>
      <select value={filter} onChange={(e) => onFilterChange(e.target.value)} className="border border-border rounded-lg px-3 py-1.5 text-xs text-neutral500 bg-bg50 w-full sm:w-72 outline-none focus:ring-2 focus:ring-primary100">
        <option value="upcoming">Upcoming Leave & Holidays</option>
        <option value="past">Past Leave & Holidays</option>
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
          <thead className="bg-bg50">
            <tr>
              <th className="px-5 py-3 text-left text-neutral500">Date</th>
              <th className="px-5 py-3 text-left text-neutral500">Description</th>
              <th className="px-5 py-3 text-right text-neutral500">Type</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id || row.date} className="border-t border-border hover:bg-bg50 transition">
                <td className="px-5 py-3 w-1/3 text-neutral400"><FormattedDate date={row.date || row.startDate} /></td>
                <td className="px-5 py-3 w-1/2 text-neutral500">{row.title || row.leaveType || row.reason}</td>
                <td className="px-5 py-3 w-1/6 text-right">
                  <span className={`inline-flex items-center justify-end gap-1 text-[11px] ${row.status === "APPROVED" || row.type === "Holiday" ? "text-secondary600" : "text-primary600"}`}>
                    <span className={`h-2 w-2 rounded-full ${row.status === "APPROVED" || row.type === "Holiday" ? "bg-secondary400" : "bg-primary400"}`} />
                    {row.status || row.type || "Leave"}
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

export default HistorySection;
