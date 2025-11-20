import { NavLink, useLocation } from "react-router-dom";
import { MdDashboard, MdSpaceDashboard, MdPerson, MdPersonOutline, MdAdminPanelSettings } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";

const menu = [
  { label: "Dashboard", path: "/dashboard", filledIcon: MdDashboard, outlineIcon: MdSpaceDashboard },
  { label: "User Profile", path: "/userProfile", filledIcon: MdPerson, outlineIcon: MdPersonOutline }
];

export default function Sidebar() {
  const { role } = useAuth();
  const location = useLocation();
  const fullMenu = role === "admin"
    ? [...menu, { label: "Admin Panel", path: "/admin", filledIcon: MdAdminPanelSettings, outlineIcon: MdAdminPanelSettings }]
    : menu;

  const isActiveSidebar = (path) =>
    location.pathname === path ||
    (path === "/dashboard" && (location.pathname === "/" || location.pathname === "/dashboard"));

  return (
    <aside className="h-screen shadow-sidebar py-6 px-2 hidden md:flex md:flex-col ">
      <div className="flex font-bold justify-center text-lg text-primary600 mb-4">MyApp</div>
      <span className="my-4 border border-neutral50 "></span>
      <nav className="flex-1 mt-[64px]">
        {fullMenu.map(m => {
          const IconComponent = isActiveSidebar(m.path) ? m.filledIcon : m.outlineIcon;
          return (
            <NavLink
              key={m.path}
              to={m.path}
              className={
                `block w-full text-left px-4 py-2 my-2 rounded-lg transition-colors flex mt-4 items-center text-lg font-medium ` +
                (isActiveSidebar(m.path)
                  ? "bg-primary50 font-semibold text-primary600"
                  : "hover:bg-primary200 text-neutral500 group-hover:text-primary500")
              }
              end={m.path === "/dashboard"}
            >
              <span className="mr-2">
                <IconComponent />
              </span>
              {m.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-4 text-xs text-gray-500">v1.0.0</div>
    </aside>
  );
}
