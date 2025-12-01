import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import NationalHolidays from "../../../components/UserPanel/Leaves/NationalHoildays";
import EmployeeHolidays from "../../../components/UserPanel/Leaves/EmployeeHolidays";
import RegularizationPanel from "../../../components/UserPanel/Leaves/RegularizationPanel";
import { HiOutlineCalendar } from "react-icons/hi";
import { IoReorderThreeOutline } from "react-icons/io5";

const LeavesHomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get("tab") || "national";
  const initialView = searchParams.get("view") || "calendar";

  const [tab, setTab] = useState(initialTab);
  const [view, setView] = useState(initialView);
  const [regularizeOpen, setRegularizeOpen] = useState(false);

  useEffect(() => {
    const params = {};
    params.tab = tab;
    if (tab === "national") params.view = view;
    setSearchParams(params, { replace: true });
  }, [tab, view, setSearchParams]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg border border-border bg-bg50 p-1 text-xs">
          <button
            type="button"
            onClick={() => setTab("national")}
            className={`px-3 py-1.5 rounded-md ${
              tab === "national"
                ? "bg-white text-primary600 shadow-sm"
                : "text-neutral400"
            }`}
          >
            Attendance Summary
          </button>
          <button
            type="button"
            onClick={() => setTab("leave")}
            className={`px-3 py-1.5 rounded-md ${
              tab === "leave"
                ? "bg-white text-primary600 shadow-sm"
                : "text-neutral400"
            }`}
          >
            Leave Process
          </button>
        </div>

        {tab === "national" && (
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border bg-white">
              <button
                type="button"
                onClick={() => setView("calendar")}
                className={`px-3 py-2 border-r border-border text-sm ${
                  view === "calendar" ? "bg-primary50 text-primary600" : "text-neutral400"
                }`}
              >
                <span className="sr-only">Calendar view</span>
                <HiOutlineCalendar className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setView("line")}
                className={`px-3 py-2 text-sm ${
                  view === "line" ? "bg-primary50 text-primary600" : "text-neutral400"
                }`}
              >
                <span className="sr-only">Line view</span>
                <IoReorderThreeOutline className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setRegularizeOpen(true)}
              className="px-4 py-2 rounded-lg bg-primary600 text-xs font-medium text-white hover:bg-primary700"
            >
              Request Regularization
            </button>
          </div>
        )}
      </div>

      {tab === "national" ? <NationalHolidays view={view} /> : <EmployeeHolidays />}

      <RegularizationPanel open={regularizeOpen} onClose={() => setRegularizeOpen(false)} />
    </div>
  );
};

export default LeavesHomePage;
