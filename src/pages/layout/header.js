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

  const fullMenu =
    role === "admin"
      ? [...baseMenu, { label: "Admin Panel", path: "/admin", icon: <MdAdminPanelSettings /> }]
      : baseMenu;

  const current = fullMenu.find(m => location.pathname.startsWith(m.path)) || fullMenu[0];
  const title = current.label;

  return (
    <header className="relative w-full bg-white flex items-center justify-between py-4 px-6">
 <div className="absolute bottom-0 right-0 left-0 md:left-[92px] h-[1px] bg-neutral50 md:rounded-bl-xl" />

      <button onClick={() => setDrawerOpen(true)} className="md:hidden p-2">
        <HiOutlineMenu className="w-6 h-6 text-primary600" />
      </button>

      <div className="flex-1 flex justify-center md:justify-center relative">
        <img
          src="/logo.svg"
          alt="Wealthmax Logo"
          className="h-8 sm:h-10 max-w-[140px] md:absolute md:left-2 lg:mt-[-6px]"
        />
        <div className="hidden md:block text-primary600 font-bold text-[22px]">
          {title}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4">
        <div className="w-10 h-10 bg-primary500 rounded-full flex items-center justify-center text-white text-lg">
          {user?.username?.[0]?.toUpperCase() || "G"}
        </div>
        <div className="text-sm text-primary600">{user?.username || "Guest"}</div>
        <Button
          variant="red"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Logout
        </Button>
      </div>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        menu={fullMenu}
        onLogout={() => {
          logout();
          navigate("/login");
        }}
      />
    </header>
  );
}
