import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { HiOutlineMenu } from "react-icons/hi";
import MobileDrawer from "./MobileDrawer";
import Button from "../../components/ui/buttons/Button";
import { MdDashboard, MdPerson, MdAdminPanelSettings } from "react-icons/md";
import { logout as logoutAction } from "../../features/auth/authSlice";

const baseMenu = [
  { label: "Dashboard", path: "/dashboard", icon: <MdDashboard /> },
  { label: "User Profile", path: "/userProfile", icon: <MdPerson /> },
  { label: "Leaves & Holidays", path: "/leaves", icon: <MdPerson /> }
];

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);
  const role = useSelector(state => state.auth.user?.role || state.auth.role);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(logoutAction());
      navigate("/login");
    }
  }, [isAuthenticated, dispatch, navigate]);

  const fullMenu =
    role === "ADMIN" || role === "admin"
      ? [...baseMenu, { label: "Admin Panel", path: "/admin", icon: <MdAdminPanelSettings /> }]
      : baseMenu;

  const current = fullMenu.find(m => location.pathname.startsWith(m.path)) || fullMenu[0];
  const title = current.label;

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate("/login");
  };

  const avatarLetter =
    (user?.fullName && user.fullName[0]) ||
    (user?.email && user.email[0]) ||
    (user?.username && user.username[0]) ||
    "G";

  const displayName = user?.fullName || user?.email || user?.username || "Guest";

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
          {avatarLetter.toUpperCase()}
        </div>
        <div className="text-sm text-primary600">{displayName}</div>
        <Button
          variant="red"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        menu={fullMenu}
        onLogout={handleLogout}
      />
    </header>
  );
}
