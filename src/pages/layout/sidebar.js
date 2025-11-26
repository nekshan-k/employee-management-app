import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  AdminEmptyIcon,
  AdminFilledIcon,
  AttendenceEmptyIcon,
  AttendenceFilledIcon,
  LandHEmptyIcon,
  LAndHFilledIcon,
  ProfileEmptyIcon,
  ProfileFilledIcon,
} from "../../components/ui/icons";

const menu = [
  // {
  //   label: "Dashboard",
  //   path: "/dashboard",
  //   filledIcon: ProfileFilledIcon,
  //   outlineIcon: ProfileEmptyIcon,
  // },
  {
    label: "Profile",
    path: "/userProfile",
    filledIcon: ProfileFilledIcon,
    outlineIcon: ProfileEmptyIcon,
  },
  {
    label: "Leaves & Holidays",
    path: "/leaves",
    filledIcon: LAndHFilledIcon,
    outlineIcon: LandHEmptyIcon,
  },
];

export default function Sidebar() {
  const { role } = useAuth();
  const location = useLocation();

  const fullMenu =
    role === "admin"
      ? [
          ...menu,
          {
            label: "Admin Panel",
            path: "/admin",
            filledIcon: AdminFilledIcon,
            outlineIcon: AdminEmptyIcon,
          },
        ]
      : menu;

  const isActiveSidebar = path =>
    location.pathname === path ||
    (path === "/dashboard" &&
      (location.pathname === "/" || location.pathname === "/dashboard"));

  return (
    <aside className="h-screen w-24 border-r border-r-neutral100 shadow-sidebar py-6 px-2 hidden md:flex md:flex-col items-center bg-white">
    
      <nav className="flex-1 flex flex-col items-center gap-3 mt-12">
        {fullMenu.map(m => {
          const IconComponent = isActiveSidebar(m.path)
            ? m.filledIcon
            : m.outlineIcon;
          const active = isActiveSidebar(m.path);
          return (
            <NavLink
              key={m.path}
              to={m.path}
              className={
                "w-full flex flex-col items-center gap-1 justify-center rounded-lg px-1 py-3 text-xs font-medium transition-colors " +
                (active
                  ? "bg-primary500 font-bold text-white"
                  : "text-primary500 font-bold hover:bg-primary50")
              }
              end={m.path === "/dashboard"}
            >
              <span className="flex items-center justify-center h-6 w-6 mb-1">
                <IconComponent />
              </span>
              <span className="text-[11px] text-center leading-snug">
                {m.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-4 text-[10px] text-gray-400">v1.0.0</div>
    </aside>
  );
}
