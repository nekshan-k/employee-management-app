import SalesBarChart from "./SalesBarChart";
import DepartmentPieChart from "./DepartmentPieChart";
import ProjectLineChart from "./ProjectLineChart";
import GoalRadialChart from "./GoalRadialChart";
import GrowthAreaChart from "./GrowthAreaChart";
import EmployeeStack from "./EmployeeStack";

export default function Dashboard() {
  return (
    <div className="min-h-screen w-full pb-14 px-3 sm:px-5 md:px-8 bg-gray-100">
      <div className="text-3xl sm:text-3xl font-semibold mb-6 text-primary600">
        Dashboard Overview
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 w-full">

        <div className="flex flex-col gap-6 sm:gap-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex flex-col h-[260px] sm:h-[300px] md:h-[340px]">
            <div className="text-base sm:text-lg font-bold mb-2">Sales Performance</div>
            <SalesBarChart />
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex flex-col h-[260px] sm:h-[300px] md:h-[340px]">
            <div className="text-base sm:text-lg font-bold mb-2">Employee Summary</div>
            <EmployeeStack />
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex flex-col h-[260px] sm:h-[300px] md:h-[340px]">
            <div className="text-base sm:text-lg font-bold mb-2">Company Growth</div>
            <GrowthAreaChart />
          </div>
        </div>

        <div className="flex flex-col gap-6 sm:gap-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex flex-col h-[260px] sm:h-[300px] md:h-[340px]">
            <div className="text-base sm:text-lg font-bold mb-2">Department Breakdown</div>
            <DepartmentPieChart />
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex flex-col h-[260px] sm:h-[300px] md:h-[340px]">
            <div className="text-base sm:text-lg font-bold mb-2">Project Trends</div>
            <ProjectLineChart />
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex flex-col h-[260px] sm:h-[400px] md:h-[340px] justify-center items-center">
            <div className="text-base sm:text-lg font-bold mb-2">Goal Completion</div>
            <GoalRadialChart />
          </div>
        </div>

      </div>
    </div>
  );
}
