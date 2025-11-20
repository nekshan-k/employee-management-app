import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast, ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [data, setData] = useState({ username: "", password: "", role: "user" });
  const [togglePos, setTogglePos] = useState(0);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) navigate("/", { replace: true });
  }, [navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  }

  function switchRole(role) {
    setTogglePos(role === "user" ? 0 : 1);
    setTimeout(() => setData({ username: "", password: "", role }), 120);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!data.username || !data.password) {
      toast.error("Username and password are required");
      return;
    }
    const success = login(data);
    if (success) {
      toast.success("Login Successful");
      navigate("/", { replace: true });
    } else {
      toast.error("Invalid credentials for selected role");
    }
  }

  const inputClass = "w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const tabClass = "flex-1 relative py-2 z-10 transition font-medium text-center";
  const activeTab = "text-white";
  const inactiveTab = "text-indigo-700";
  const bgAnim = "absolute top-0 left-0 h-full w-1/2 bg-indigo-600 rounded-lg shadow transition-transform duration-400";
  const bgAnimStyle = {
    transform: togglePos === 0 ? "translateX(0%)" : "translateX(100%)",
    transition: "transform 0.4s cubic-bezier(0.68,-0.3,0.32,1.3)"
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-2">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        transition={Slide}
        toastClassName="bg-indigo-600 text-white rounded shadow-xl px-6 py-3 m-2 mx-auto"
        bodyClassName="text-sm font-semibold"
        style={{ width: "100%", maxWidth: 320, left: "50%", transform: "translateX(-50%)" }}
        toastStyle={{ fontWeight: 600, minHeight: 40 }}
      />
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg px-6 py-8 w-full max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-center mb-7 text-indigo-600">Sign In</h2>
        <div className="flex mb-8 rounded-lg overflow-hidden relative" style={{ background: "#e0e7ff" }}>
          <div className={bgAnim} style={bgAnimStyle}></div>
          <button
            type="button"
            className={`${tabClass} ${data.role === "user" ? activeTab : inactiveTab}`}
            onClick={() => switchRole("user")}
            aria-pressed={data.role === "user"}
            style={{ transition: "color 0.25s" }}
          >
            User Login
          </button>
          <button
            type="button"
            className={`${tabClass} ${data.role === "admin" ? activeTab : inactiveTab}`}
            onClick={() => switchRole("admin")}
            aria-pressed={data.role === "admin"}
            style={{ transition: "color 0.25s" }}
          >
            Admin Login
          </button>
        </div>
        <p className="mb-5 mt-3 font-semibold text-black text-center">
          {data.role === "user" ? "Please enter your user credentials" : "Please enter your admin credentials"}
        </p>
        <div className="mb-5">
          <label className="block text-sm font-medium mb-1" htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            className={inputClass}
            placeholder="Username"
            value={data.username}
            onChange={handleChange}
            required
            autoComplete="username"
          />
        </div>
        <div className="mb-7">
          <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className={inputClass}
            placeholder="Password"
            value={data.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-md font-medium text-base hover:bg-indigo-700 transition"
        >
          Sign In as {data.role.charAt(0).toUpperCase() + data.role.slice(1)}
        </button>
      </form>
    </div>
  );
}
