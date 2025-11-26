import { useEffect, useState } from "react";
import { IoTimeOutline } from "react-icons/io5";
import { FaRegPlayCircle, FaRegClock } from "react-icons/fa";
import FaceCheckModal from "./FaceCheckModal";
import Timer from "./Timer";
import Button from "../../ui/buttons/Button";

const GEO_FENCE = { lat: 32.69780167134704, lon: 74.86921071534209, radiusMeters: 500 };
const STANDARD_START_HOUR = 12;
const WORK_HOURS = 8;
const BREAK_MINUTES = 30;

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = x => (x * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function UserProfile() {
  const demoUser = { name: "Niks", employeeId: "EMP-1024", designation: "Front end developer" };
  const [profileImg, setProfileImg] = useState(sessionStorage.getItem("profileImg") || "");
  const [modalMode, setModalMode] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState(
    JSON.parse(sessionStorage.getItem("attendanceStatus")) || {
      checkedIn: false,
      checkedInAt: null,
      checkedOutAt: null,
      breakUsedMs: 0,
      breakSessionStart: null,
      checkInLatLng: null,
      checkOutLatLng: null,
    }
  );
  const [userLatLng, setUserLatLng] = useState(null);
  const [geoAllowed, setGeoAllowed] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("attendanceStatus", JSON.stringify(status));
  }, [status]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoAllowed(false);
      return;
    }
    let mounted = true;
    const success = pos => {
      if (!mounted) return;
      const { latitude: lat, longitude: lon } = pos.coords;
      setUserLatLng({ lat, lon });
      setGeoAllowed(haversineDistance(lat, lon, GEO_FENCE.lat, GEO_FENCE.lon) <= GEO_FENCE.radiusMeters);
    };
    const error = () => {
      if (!mounted) return;
      setGeoAllowed(false);
    };
    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      maximumAge: 60000,
    });
    const watcherId = navigator.geolocation.watchPosition(success, error, {
      enableHighAccuracy: true,
      maximumAge: 60000,
    });
    return () => {
      mounted = false;
      navigator.geolocation.clearWatch(watcherId);
    };
  }, []);

  const handleUpload = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      sessionStorage.setItem("profileImg", ev.target.result);
      setProfileImg(ev.target.result);
    };
    r.readAsDataURL(f);
  };

  const clearProfile = () => {
    sessionStorage.removeItem("profileImg");
    setProfileImg("");
  };

  const openModal = mode => {
    if (!geoAllowed) return;
    setModalMode(mode);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMode(null);
  };

  const logEvent = ({ type, coordinates, captured, distance }) => {
    const payload = {
      type,
      employeeId: demoUser.employeeId,
      employeeName: demoUser.name,
      designation: demoUser.designation,
      timestamp: new Date().toISOString(),
      coords: coordinates || userLatLng || null,
      liveLocation: userLatLng,
      faceImage: captured || null,
      faceMatchScore: distance || null,
      statusSnapshot: status,
    };
    console.log("ATTENDANCE_LOG", payload);
  };

  const onVerified = payload => {
    const { type } = payload;
    logEvent(payload);
    const now = Date.now();
    if (type === "checkin") {
      setStatus(p => ({
        ...p,
        checkedIn: true,
        checkedInAt: now,
        checkedOutAt: null,
        checkInLatLng: userLatLng,
        checkOutLatLng: null,
        breakSessionStart: null,
        breakUsedMs: 0,
      }));
    } else if (type === "checkout") {
      setStatus(p => ({ ...p, checkedOutAt: now, checkOutLatLng: userLatLng, breakSessionStart: null }));
    } else if (type === "startBreak") {
      setStatus(p => ({ ...p, breakSessionStart: now }));
    } else if (type === "endBreak") {
      setStatus(p => {
        const start = p.breakSessionStart || now;
        const segment = Math.max(0, now - start);
        const used = Math.min(BREAK_MINUTES * 60 * 1000, (p.breakUsedMs || 0) + segment);
        return { ...p, breakUsedMs: used, breakSessionStart: null };
      });
    }
    closeModal();
  };

  const breakRemainingMs = Math.max(0, BREAK_MINUTES * 60 * 1000 - (status.breakUsedMs || 0));
  const breakUsedMs = status.breakUsedMs || 0;

  const workingTimeMs = (() => {
    if (!status.checkedInAt) return 0;
    const endTime = status.checkedOutAt || Date.now();
    const total = endTime - status.checkedInAt - breakUsedMs;
    return Math.max(0, total);
  })();

  const workingTimeText = formatDuration(workingTimeMs);

  const STANDARD_START_TIME_MS = (() => {
    const d = new Date();
    d.setHours(STANDARD_START_HOUR, 30, 0, 0);
    return d.getTime();
  })();

  const checkInDiffMs = status.checkedInAt ? status.checkedInAt - STANDARD_START_TIME_MS : 0;
  const checkInDiffText = status.checkedInAt
    ? checkInDiffMs > 0
      ? `Late by ${formatDuration(checkInDiffMs)}`
      : `Early by ${formatDuration(-checkInDiffMs)}`
    : "-";

  const STANDARD_END_TIME_MS = (() => {
    const d = new Date();
    d.setHours(STANDARD_START_HOUR + WORK_HOURS, 30, 0, 0);
    return d.getTime();
  })();

  const checkOutTime = status.checkedOutAt || 0;
  const checkOutDiffMs = checkOutTime ? checkOutTime - STANDARD_END_TIME_MS : 0;
  const checkOutDiffText = status.checkedOutAt
    ? checkOutDiffMs > 0
      ? `Late by ${formatDuration(checkOutDiffMs)}`
      : `Early by ${formatDuration(-checkOutDiffMs)}`
    : "-";

  const attendanceState = !status.checkedIn
    ? "Not checked in"
    : status.checkedIn && !status.checkedOutAt
    ? "Working"
    : "Checked out";

  return (
    <div className="min-h-screen flex justify-center bg-slate-50 px-4 py-6 sm:px-6 lg:px-10">
      <div className="w-full max-w-5xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Attendance Desk</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Face and location-based check-in for {demoUser.name}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs rounded-full px-3 py-1 border bg-white shadow-sm">
            <span
              className={`h-2 w-2 rounded-full ${
                attendanceState === "Working"
                  ? "bg-emerald-500"
                  : attendanceState === "Checked out"
                  ? "bg-slate-400"
                  : "bg-amber-500"
              }`}
            />
            <span className="text-slate-700">{attendanceState}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-indigo-100 bg-slate-100 overflow-hidden flex items-center justify-center">
                  {profileImg ? (
                    <img src={profileImg} alt="profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-slate-400 px-2 text-center">Upload photo</span>
                  )}
                </div>
                {attendanceState === "Working" && (
                  <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="text-sm sm:text-base font-semibold text-slate-900">
                  {demoUser.name}
                </div>
                <div className="text-xs sm:text-sm text-slate-600">{demoUser.designation}</div>
                <div className="text-[11px] text-slate-400">ID: {demoUser.employeeId}</div>
                {userLatLng && (
                  <div className="text-[11px] text-slate-500">
                    Location: {userLatLng.lat.toFixed(5)}, {userLatLng.lon.toFixed(5)}
                  </div>
                )}
                {!geoAllowed && (
                  <div className="text-[11px] text-amber-600 mt-1">
                    Outside office geo-fence. Check-in disabled.
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-44">
              <Button
                size="sm"
                className="w-full justify-center"
                variant="primary"
                onClick={() => document.getElementById("imgUpload").click()}
              >
                {profileImg ? "Change photo" : "Upload photo"}
              </Button>
              <input
                id="imgUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
              {profileImg && (
                <Button
                  size="sm"
                  variant="red"
                  onClick={clearProfile}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Check in / out</div>
              <div className="flex items-center gap-2">
                <FaRegClock className="text-indigo-500" />
                <span className="font-mono text-sm">
                  {status.checkedInAt
                    ? new Date(status.checkedInAt).toLocaleTimeString()
                    : "--:--:--"}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 pl-6">{checkInDiffText}</div>
              <div className="flex items-center gap-2 mt-1">
                <FaRegClock className="text-slate-400" />
                <span className="font-mono text-sm">
                  {status.checkedOutAt
                    ? new Date(status.checkedOutAt).toLocaleTimeString()
                    : "--:--:--"}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 pl-6">{checkOutDiffText}</div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 uppercase">
                <IoTimeOutline className="text-indigo-500" />
                <span>Break</span>
              </div>
              <div className="text-lg font-semibold text-slate-900">
                {Math.ceil(breakUsedMs / 60000)} min / {BREAK_MINUTES} min
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                <FaRegClock className="text-slate-400" />
                <span>
                  Remaining:{" "}
                  <span className="font-mono text-indigo-700">
                    {formatDuration(breakRemainingMs)}
                  </span>
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 uppercase">
                <FaRegClock className="text-indigo-500" />
                <span>Worked</span>
              </div>
              <div className="text-lg font-semibold text-slate-900">{workingTimeText}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Standard: {WORK_HOURS}h incl. {BREAK_MINUTES}m
              </div>
              <div className="text-[11px] text-slate-500">
                Actual: {(workingTimeMs / 1000 / 3600).toFixed(2)} h
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            {!status.checkedIn && (
              <Button
                className="w-full sm:w-auto flex items-center gap-2"
                variant="primary"
                onClick={() => openModal("checkin")}
                disabled={!profileImg || !geoAllowed}
              >
                <FaRegPlayCircle className="text-lg" />
                Check in
              </Button>
            )}
            {status.checkedIn && !status.checkedOutAt && (
              <Button
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 shadow-sm"
                onClick={() => openModal("checkout")}
                disabled={!profileImg || !geoAllowed}
              >
                <FaRegPlayCircle className="text-lg" />
                Check out
              </Button>
            )}

            {status.checkedIn && !status.checkedOutAt && !status.breakSessionStart && (
              <Button
                className="w-full sm:w-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm"
                onClick={() => openModal("startBreak")}
                disabled={breakUsedMs >= BREAK_MINUTES * 60000}
              >
                <IoTimeOutline />
                Start break
              </Button>
            )}

            {status.checkedIn && !status.checkedOutAt && status.breakSessionStart && (
              <Button
                className="w-full sm:w-auto flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg shadow-sm"
                onClick={() => openModal("endBreak")}
              >
                <FaRegClock />
                End break
              </Button>
            )}
          </div>

          <div className="border-t border-slate-100 pt-3">
            <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1.5">
              Live timer
            </div>
            <Timer
              start={status.checkedInAt}
              end={status.checkedOutAt}
              breakSessionStart={status.breakSessionStart}
              breakUsedMs={status.breakUsedMs}
            />
          </div>
        </div>
      </div>

      {modalOpen && (
        <FaceCheckModal
          profileImg={profileImg}
          mode={modalMode}
          onSuccess={onVerified}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}
