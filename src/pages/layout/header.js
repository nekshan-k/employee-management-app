import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { HiOutlineMenu } from "react-icons/hi";
import MobileDrawer from "./MobileDrawer";
import Button from "../../components/ui/buttons/Button";
import { MdDashboard, MdPerson, MdAdminPanelSettings } from "react-icons/md";

const baseMenu = [
  { label: "Dashboard", path: "/dashboard", icon: <MdDashboard /> },
  { label: "User Profile", path: "/userProfile", icon: <MdPerson /> }
];

export default function Header() {
  const { user, role, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      logout();
      navigate("/login");
    }
  }, [isAuthenticated, logout, navigate]);

  const fullMenu = role === "admin"
    ? [...baseMenu, { label: "Admin Panel", path: "/admin", icon: <MdAdminPanelSettings /> }]
    : baseMenu;

  const current = fullMenu.find(m => location.pathname.startsWith(m.path)) || fullMenu[0];
  const title = current.label;

  return (
    <header className="shadow-header py-[16px] px-[48px] flex justify-between items-center">
      <button onClick={() => setDrawerOpen(true)} className="md:hidden absolute left-4 p-2 rounded-lg">
        <HiOutlineMenu className="w-6 h-6 text-primary600" />
      </button>
      <div className="flex-1 flex justify-center md:justify-start">
        <div className="font-bold text-[24px] px-4 text-primary600">{title}</div>
      </div>
      <div className="hidden md:flex items-center gap-4 absolute right-6">
        <div className="w-10 h-10 bg-primary500 rounded-full flex items-center justify-center text-white text-lg">
          {user?.username?.[0]?.toUpperCase() || "G"}
        </div>
        <div className="text-sm font-nunito text-primary600">{user?.username || "Guest"}</div>
        <Button variant="red" onClick={() => { logout(); navigate("/login"); }}>Logout</Button>
      </div>
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        menu={fullMenu}
        onLogout={() => { logout(); navigate("/login"); }}
      />
    </header>
  );
}
