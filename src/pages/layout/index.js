import Header from "./header";
import Sidebar from "./sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-grow overflow-hidden">
        <Sidebar />
        <main className="flex-grow overflow-y-auto w-full py-12 px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
