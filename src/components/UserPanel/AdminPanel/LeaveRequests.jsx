import React from "react";
import ReusableDataTable from "../../ui/tables/ReusableDataTable";

const demo = Array.from({ length: 6 }).map((_, i) => ({
  id: `L00${i + 1}`,
  employee: `User ${i + 1}`,
  from: `2025-0${(i % 9) + 1}-0${(i % 9) + 1}`,
  to: `2025-0${(i % 9) + 1}-1${(i % 9) + 1}`,
  type: i % 2 === 0 ? "Sick" : "Casual",
  status: i % 3 === 0 ? "Approved" : "Pending",
}));

export default function LeaveRequests() {
  const columns = [
    { header: "Leave ID", accessor: "id" },
    { header: "Employee", accessor: "employee" },
    { header: "From", accessor: "from" },
    { header: "To", accessor: "to" },
    { header: "Type", accessor: "type" },
    { header: "Status", accessor: "status", cell: (r) => <div className={`${r.status === "Approved" ? "text-primary600" : "text-neutral500"}`}>{r.status}</div> },
  ];
  return (
    <div className="p-4 bg-white rounded-lg">
      <ReusableDataTable columns={columns} data={demo} />
    </div>
  );
}
