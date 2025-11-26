import React, { useState } from "react";
import NationalHolidays from "../../../components/UserPanel/Leaves/NationalHoildays";
import EmployeeHolidays from "../../../components/UserPanel/Leaves/EmployeeHolidays";

const LeavesHomePage = () => {
  const [view, setView] = useState("calendar");

  return (
    <div className="min-h-screen bg-foundation-background-color-background-color-50 flex flex-col">
      <header className="border-b border-borderGray200 bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foundation-neurtal-neurtal-500 font-nunito">
            Leaves & Holidays
          </h1>
          <p className="text-xs text-foundation-neurtal-neurtal-300 mt-1">
            Calendar and leave application.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full bg-foundation-background-color-background-color-100 p-1 text-xs font-medium">
          <button
            onClick={() => setView("calendar")}
            className={`px-4 py-1.5 rounded-full transition ${
              view === "calendar"
                ? "bg-white shadow-sm text-foundation-primary-blue-color-primary-color-600"
                : "text-foundation-neurtal-neurtal-300"
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setView("leaves")}
            className={`px-4 py-1.5 rounded-full transition ${
              view === "leaves"
                ? "bg-white shadow-sm text-foundation-primary-blue-color-primary-color-600"
                : "text-foundation-neurtal-neurtal-300"
            }`}
          >
            Leave process
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto px-4 sm:px-6 lg:px-10 py-4">
        {view === "calendar" ? <NationalHolidays /> : <EmployeeHolidays />}
      </main>
    </div>
  );
};

export default LeavesHomePage;
