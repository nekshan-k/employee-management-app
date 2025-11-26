import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast, ToastContainer, Slide } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "react-toastify/dist/ReactToastify.css";

const Loader = () => (
  <span className="flex justify-center items-center h-5">
    <span className="w-4 h-4 rounded-full border-2 border-t-primary500 border-primary100 animate-spin" />
  </span>
);

const encrypt = s => btoa(unescape(encodeURIComponent(s)));
const decrypt = s => decodeURIComponent(escape(atob(s)));

const carousel = [
  {
    img: "/image1.jpeg",
    text: "Move away from risky passwords and experience one-tap access to Wealthmax. Download and install OneAuth."
  },
  {
    img: "/image2.png",
    text: "Protect your Wealthmax account with advanced authentication. Use OneAuth to stay secure and connected."
  }
];

export default function Login() {
  const intervalMs = 3500;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [slide, setSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState({ username: "", password: "", remember: false });
  const navigate = useNavigate();
  const { login } = useAuth();
  const timer = useRef();
  const progressTimer = useRef();

  useEffect(() => {
    timer.current = setInterval(() => {
      setSlide(s => (s + 1) % carousel.length);
      setProgress(0);
    }, intervalMs);
    return () => clearInterval(timer.current);
  }, []);

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    progressTimer.current = setInterval(
      () => setProgress(p => Math.min(100, ((Date.now() - start) / intervalMs) * 100)),
      18
    );
    return () => clearInterval(progressTimer.current);
  }, [slide]);

  useEffect(() => {
    const cred = document.cookie.split("; ").find(r => r.startsWith("wmax_login="));
    if (cred) {
      try {
        const { username, password } = JSON.parse(decrypt(cred.split("=")[1]));
        setData(d => ({ ...d, username, password, remember: true }));
        setStep(2);
      } catch {}
    }
    if (localStorage.getItem("auth_token")) navigate("/", { replace: true });
  }, [navigate]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setData(d => ({ ...d, [name]: type === "checkbox" ? checked : value }));
  };

  const handleNext = e => {
    e.preventDefault();
    if (!data.username) return toast.error("Email is required");
    setLoading(true);
    setTimeout(() => {
      setStep(2);
      setLoading(false);
    }, 400);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!data.password) return toast.error("Password is required");
    const success = login(data);
    if (!success) return toast.error("Invalid credentials");
    if (data.remember) {
      const cookieValue = encrypt(JSON.stringify({ username: data.username, password: data.password }));
      document.cookie = `wmax_login=${cookieValue};path=/;max-age=2592000;secure`;
    } else document.cookie = "wmax_login=; Max-Age=0; path=/; secure";
    toast.success("Login Successful");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative">
      <div className="absolute inset-0 w-full h-full pointer-events-none -z-10 flex justify-center items-center">
        <img src="/bg.svg" alt="" className="w-full h-full object-cover opacity-50" />
      </div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        transition={Slide}
        toastClassName="bg-primary500 text-white rounded shadow-xl px-6 py-3 m-2 mx-auto"
        bodyClassName="text-sm font-semibold"
        style={{ width: "100%", maxWidth: 320, left: "50%", transform: "translateX(-50%)" }}
        toastStyle={{ fontWeight: 600, minHeight: 40 }}
      />

      <div className="bg-white rounded-xl shadow-lg flex flex-col md:flex-row w-full max-w-3xl md:min-h-[520px] overflow-hidden border border-border">
        <div className="w-full md:w-[60%] flex flex-col justify-start px-5 py-6 sm:px-8 sm:py-8">
          <div className="w-full flex justify-start pb-6 sm:pb-8">
            <img src="/logo.svg" alt="Wealthmax Logo" className="h-10 sm:h-12 max-w-[160px]" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-primary500 mb-5 lg:mt-12 sm:mb-6">Sign in</h2>

          <form
            onSubmit={step === 1 ? handleNext : handleSubmit}
            className="space-y-6 sm:space-y-8 w-full"
          >
            {step === 1 ? (
              <>
                <div>
                  <label
                    htmlFor="username"
                    className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-foundation-neurtal-neurtal-400"
                  >
                    Email Address
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="email"
                    className="w-full px-3 sm:px-4 py-2 border rounded focus:outline-none text-sm sm:text-base border-border"
                    placeholder="Enter your email"
                    value={data.username}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary500 text-white py-2 rounded-md font-medium text-sm sm:text-base transition hover:bg-primary600 flex justify-center items-center"
                >
                  {loading ? <Loader /> : "Next"}
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between py-2 px-3 sm:px-4 border border-bg100 rounded">
                  <span className="text-sm sm:text-base text-neutral300 font-medium rounded max-w-[65%] truncate">
                    {data.username}
                  </span>
                  <button
                    type="button"
                    className="text-xs sm:text-sm text-primary500 font-semibold hover:underline"
                    onClick={() => setStep(1)}
                  >
                    Change
                  </button>
                </div>
                <div className="relative mt-3 sm:mt-4">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full px-3 sm:px-4 py-2 border rounded focus:outline-none text-sm sm:text-base border-border pr-9 sm:pr-10"
                    placeholder="Enter your password"
                    value={data.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                  <span
                    className="absolute top-1/2 right-3 sm:right-4 -translate-y-1/2 cursor-pointer text-neutral200"
                    onClick={() => setShowPassword(s => !s)}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-1 mb-2">
                  <label className="flex items-center select-none cursor-pointer">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={data.remember}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 accent-primary500"
                    />
                    <span className="text-xs sm:text-sm text-foundation-neurtal-neurtal-500 font-medium">
                      Remember me
                    </span>
                  </label>
                  {/* <button
                    type="button"
                    className="text-xs sm:text-sm text-primary500 font-semibold cursor-pointer select-none hover:underline self-start sm:self-auto"
                  >
                    Forgot Password?
                  </button> */}
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary500 text-white py-2 rounded-md font-medium text-sm sm:text-base transition hover:bg-primary600 flex justify-center items-center"
                >
                  Sign in
                </button>
              </>
            )}
          </form>
        </div>

        <div className="w-full md:w-[40%] flex flex-col justify-center items-center text-center p-5 sm:p-8 md:min-h-[520px] border-t md:border-t-0 md:border-l border-bg100">
          <div className="w-full overflow-hidden">
            <div
              className="flex w-full"
              style={{
                transform: `translateX(-${slide * 100}%)`,
                transition: "transform 700ms ease"
              }}
            >
              {carousel.map((c, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-full flex justify-center items-center min-h-[180px] sm:min-h-[210px]"
                >
                  <img
                    src={c.img}
                    alt="Illustration"
                    className="w-[240px] h-[240px] sm:w-[170px] sm:h-[170px] mx-auto object-contain rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
          <h3 className="mt-5 sm:mt-6 font-semibold text-primary500 mb-1 sm:mb-2 text-sm sm:text-base">
            Passwordless sign-in
          </h3>
          <p className="text-xs sm:text-sm text-foundation-neurtal-neurtal-400 mb-3 px-2 sm:px-3">
            {carousel[slide].text}
          </p>
          <button className="mb-4 mt-1 px-4 sm:px-5 py-1.5 sm:py-2 rounded-3xl bg-primary50 text-primary500 font-bold text-xs sm:text-sm">
            Learn more
          </button>
          <div className="mt-1 sm:mt-2 flex justify-center items-center gap-2 h-3">
            {carousel.map((_, idx) =>
              slide === idx ? (
                <span
                  key={idx}
                  className="relative w-5 h-1 bg-primary100 rounded-full overflow-hidden flex items-center"
                >
                  <span
                    className="absolute top-0 left-0 h-full rounded-full bg-primary500 transition-all"
                    style={{ width: `${progress}%`, transition: "width 150ms linear" }}
                  />
                </span>
              ) : (
                <span key={idx} className="w-1.5 h-1.5 rounded-full bg-primary100" />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
