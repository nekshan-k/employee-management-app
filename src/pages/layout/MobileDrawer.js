import { Fragment, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { HiX } from "react-icons/hi";
import Button from "../../components/ui/buttons/Button";
import { useAuth } from "../../context/AuthContext";

export default function MobileDrawer({ open, onClose, user, onLogout }) {
  const { role } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || (path === "/dashboard" && location.pathname === "/");

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <Fragment>
      <div className={`fixed inset-0 z-40 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div onClick={onClose} className={`absolute inset-0 bg-black/40`}></div>
      </div>
      <aside className={`fixed top-0 left-0 z-50 h-full w-full max-w-[320px] bg-white shadow-2xl transform transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary500 rounded-full flex items-center justify-center text-white font-semibold">{user?.username?.[0]?.toUpperCase() || "G"}</div>
            <div>
              <div className="text-sm font-semibold">{user?.username || "Guest"}</div>
              <div className="text-xs text-gray-500">View profile</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <HiX className="w-6 h-6 text-gray-700" />
          </button>
        </div>
        <nav className="p-4 flex flex-col gap-2 h-[calc(100%-160px)] overflow-auto">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className={() =>
              `px-4 py-3 rounded-lg text-sm font-medium ${
                isActive("/dashboard") ? "bg-primary100 text-primary600" : "hover:bg-primary50 text-gray-700"
              }`
            }
            end
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/userProfile"
            onClick={onClose}
            className={() =>
              `px-4 py-3 rounded-lg text-sm font-medium ${
                isActive("/userProfile") ? "bg-primary100 text-primary600" : "hover:bg-primary50 text-gray-700"
              }`
            }
          >
            User Profile
          </NavLink>
          {role === "admin" && (
            <NavLink
              to="/admin"
              onClick={onClose}
              className={() =>
                `px-4 py-3 rounded-lg text-sm font-medium ${
                  isActive("/admin") ? "bg-primary100 text-primary600" : "hover:bg-primary50 text-gray-700"
                }`
              }
            >
              Admin Panel
            </NavLink>
          )}
          <div className="mt-4 px-4 py-3 rounded-lg bg-gradient-to-r from-primary50 to-primary100 text-sm text-primary600">Quick actions</div>
          <Button onClick={() => { onClose(); onLogout(); }} className="w-full text-left px-4 py-3 rounded-lg bg-red-600 text-white mt-auto">Logout</Button>
        </nav>
        <div className="p-4 border-t">
          <div className="text-xs text-gray-500">v1.0.0</div>
        </div>
      </aside>
    </Fragment>
  );
}
