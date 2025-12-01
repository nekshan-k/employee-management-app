import React, { useState } from "react";
import EmployeeAttendance from "../EmployeeAttendance";
import RegulationRequests from "../RegulationRequests";
import LeaveRequests from "../LeaveRequests";
import AdminPanel from "../AdminPanel";

export default function AdminPanelPageLayout() {
  const [active, setActive] = useState("attendance");
  return (
    <div className="bg-bg50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg border border-border bg-bg50 p-1 text-xs">
          <button type="button" onClick={() => setActive("attendance")} className={`px-4 py-1.5 rounded-md ${active === "attendance" ? "bg-white text-primary600 shadow-sm" : "text-neutral400"}`}>
            Employee Attendance
          </button>
          <button type="button" onClick={() => setActive("add")} className={`px-4 py-1.5 rounded-md ${active === "add" ? "bg-white text-primary600 shadow-sm" : "text-neutral400"}`}>
            Add Employee
          </button>
          <button type="button" onClick={() => setActive("regulation")} className={`px-4 py-1.5 rounded-md ${active === "regulation" ? "bg-white text-primary600 shadow-sm" : "text-neutral400"}`}>
            Regulation Requests
          </button>
          <button type="button" onClick={() => setActive("leave")} className={`px-4 py-1.5 rounded-md ${active === "leave" ? "bg-white text-primary600 shadow-sm" : "text-neutral400"}`}>
            Leave Requests
          </button>
        </div>
      </div>

      <div>
        {active === "attendance" && <EmployeeAttendance />}
        {active === "add" && (
          <div className="bg-white p-4 rounded-lg">
            <AdminPanel />
          </div>
        )}
        {active === "regulation" && <RegulationRequests />}
        {active === "leave" && <LeaveRequests />}
      </div>
    </div>
  );
}
