import React from "react";
import ReusableDataTable from "../../ui/tables/ReusableDataTable";

const demo = Array.from({ length: 6 }).map((_, i) => ({
  id: `R00${i + 1}`,
  employee: `User ${i + 1}`,
  date: `2025-0${(i % 9) + 1}-0${(i % 9) + 1}`,
  reason: i % 2 === 0 ? "Missed checkin" : "Early checkout",
  status: i % 3 === 0 ? "Approved" : "Pending",
}));

export default function RegulationRequests() {
  const columns = [
    { header: "Request ID", accessor: "id" },
    { header: "Employee", accessor: "employee" },
    { header: "Date", accessor: "date" },
    { header: "Reason", accessor: "reason" },
    { header: "Status", accessor: "status", cell: (r) => <div className={`${r.status === "Approved" ? "text-primary600" : "text-neutral500"}`}>{r.status}</div> },
    { header: "Action", accessor: "action", cell: (r) => <button className="px-3 py-1 rounded bg-primary600 text-white text-xs">View</button> },
  ];
  return (
    <div className="p-4 bg-white rounded-lg">
      <ReusableDataTable columns={columns} data={demo} />
    </div>
  );
}
