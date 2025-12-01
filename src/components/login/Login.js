import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import InputField from "../../components/ui/InputFields/InputField";
import Button from "../../components/ui/buttons/Button";
import CustomToast from "../../components/ui/Toast/CustomToast";
import { loginUser } from "../../features/auth/authSlice";

const encrypt = s => btoa(unescape(encodeURIComponent(s)));
const decrypt = s => decodeURIComponent(escape(atob(s)));

export default function Login() {
  const intervalMs = 3500;
  const [step, setStep] = useState(1);
  const [slide, setSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [cookieLoaded, setCookieLoaded] = useState(false);
  const [data, setData] = useState({ username: "", password: "", remember: false });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const timer = useRef();
  const progressTimer = useRef();
  const auth = useSelector(s => s.auth);
  const carousel = [
    { img: "/image1.jpeg", text: "Move away from risky passwords and experience one-tap access to Wealthmax. Download and install OneAuth." },
    { img: "/image2.png", text: "Protect your Wealthmax account with advanced authentication. Use OneAuth to stay secure and connected." }
  ];

  useEffect(() => {
    if (!cookieLoaded) {
      const c = document.cookie.split("; ").find(r => r.startsWith("wmax_login="));
      if (c) {
        try {
          const { username, password } = JSON.parse(decrypt(c.split("=")[1]));
          setData({ username, password, remember: true });
          setStep(2);
        } catch {}
      }
      setCookieLoaded(true);
    }
  }, [cookieLoaded]);

  useEffect(() => {
    if (auth.isAuthenticated) navigate("/", { replace: true });
  }, [auth.isAuthenticated, navigate]);

  useEffect(() => {
    timer.current = setInterval(() => {
      setSlide(s => (s + 1) % carousel.length);
      setProgress(0);
    }, intervalMs);
    return () => clearInterval(timer.current);
  }, [carousel.length]);

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    progressTimer.current = setInterval(
      () => setProgress(p => Math.min(100, ((Date.now() - start) / intervalMs) * 100)),
      18
    );
    return () => clearInterval(progressTimer.current);
  }, [slide]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setData(d => ({ ...d, [name]: type === "checkbox" ? checked : value }));
  };

  const handleNext = e => {
    e.preventDefault();
    if (!data.username) {
      toast.error("Email is required");
      return;
    }
    setStep(2);
  };

 const handleSubmit = async e => {
  e.preventDefault();
  if (!data.password) {
    toast.error("Password is required");
    return;
  }

  const result = await dispatch(loginUser({ username: data.username, password: data.password }));
  if (loginUser.rejected.match(result)) {
    toast.error(result.payload?.message || "Invalid credentials");
    return;
  }

  if (data.remember) {
    document.cookie = `wmax_login=${encrypt(JSON.stringify({ username: data.username, password: data.password }))};path=/;max-age=2592000;secure`;
  } else {
    document.cookie = "wmax_login=; Max-Age=0; path=/; secure";
  }
  navigate("/", { replace: true });
};


  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative">
      <CustomToast />

      <div className="absolute inset-0 w-full h-full pointer-events-none -z-10 flex justify-center items-center">
        <img src="/bg.svg" alt="" className="w-full h-full object-cover opacity-50" />
      </div>

      <div className="bg-white rounded-xl shadow-lg flex flex-col md:flex-row w-full max-w-3xl md:min-h-[520px] overflow-hidden border border-border">
        <div className="w-full md:w-[60%] flex flex-col justify-start px-5 py-6 sm:px-8 sm:py-8">
          <div className="w-full flex justify-start pb-6 sm:pb-8">
            <img src="/logo.svg" alt="Wealthmax Logo" className="h-10 sm:h-12 max-w-[160px]" />
          </div>

          <h2 className="text-lg sm:text-xl font-semibold text-primary500 mb-5 lg:mt-12 sm:mb-6">Sign in</h2>

          <form onSubmit={step === 1 ? handleNext : handleSubmit} className="space-y-6 sm:space-y-8 w-full">
            {step === 1 ? (
              <>
                <InputField
                  label="Email Address"
                  name="username"
                  type="email"
                  value={data.username}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  autoComplete="username"
                />
                <Button type="submit" className="w-full flex justify-center items-center">
                  {auth.loading ? (
                    <span className="w-4 h-4 rounded-full border-2 border-t-primary500 border-primary100 animate-spin" />
                  ) : (
                    "Next"
                  )}
                </Button>
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

                <InputField
                  label=""
                  name="password"
                  type="password"
                  value={data.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-1 mb-2">
                  <label className="flex items-center select-none cursor-pointer">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={data.remember}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 accent-primary500"
                    />
                    <span className="text-xs sm:text-sm text-foundation-neurtal-neurtal-500 font-medium">Remember me</span>
                  </label>
                </div>

                <Button type="submit" className="w-full flex justify-center items-center">
                  {auth.loading ? (
                    <span className="w-4 h-4 rounded-full border-2 border-t-primary500 border-primary100 animate-spin" />
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </>
            )}
          </form>
        </div>

        <div className="w-full md:w-[40%] flex flex-col justify-center items-center text-center p-5 sm:p-8 md:min-h-[520px] border-t md:border-t-0 md:border-l border-bg100">
          <div className="w-full overflow-hidden">
            <div
              className="flex w-full"
              style={{ transform: `translateX(-${slide * 100}%)`, transition: "transform 700ms ease" }}
            >
              {carousel.map((c, i) => (
                <div key={i} className="flex-shrink-0 w-full flex justify-center items-center min-h-[180px] sm:min-h-[210px]">
                  <img
                    src={c.img}
                    alt=""
                    className="w-[240px] h-[240px] sm:w-[170px] sm:h-[170px] mx-auto object-contain rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          <h3 className="mt-5 sm:mt-6 font-semibold text-primary500 mb-1 sm:mb-2 text-sm sm:text-base">Passwordless sign-in</h3>

          <p className="text-xs sm:text-sm text-foundation-neurtal-neurtal-400 mb-3 px-2 sm:px-3">
            {carousel[slide].text}
          </p>

          <button
            type="button"
            className="mb-4 mt-1 px-4 sm:px-5 py-1.5 sm:py-2 rounded-3xl bg-primary50 text-primary500 font-bold text-xs sm:text-sm"
          >
            Learn more
          </button>

          <div className="mt-1 sm:mt-2 flex justify-center items-center gap-1 h-3">
            {carousel.map((_, idx) =>
              slide === idx ? (
                <span key={idx} className="relative w-5 h-1 bg-primary100 rounded-full overflow-hidden flex items-center">
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
