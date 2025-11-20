import Header from "./header";
import Sidebar from "./sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-grow">
        <Header />
        <div className="content-wrapper bg-mainbg flex-grow p-4 overflow-y-auto">
          <main className="w-full py-12 px-6 bg-primary50">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
