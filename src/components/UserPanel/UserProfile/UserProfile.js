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
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
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
    navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true, maximumAge: 60000 });
    const watcherId = navigator.geolocation.watchPosition(success, error, { enableHighAccuracy: true, maximumAge: 60000 });
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

  const onVerified = ({ type }) => {
    const now = Date.now();
    if (type === "checkin")
      setStatus(p => ({ ...p, checkedIn: true, checkedInAt: now, checkedOutAt: null, checkInLatLng: userLatLng, checkOutLatLng: null }));
    else if (type === "checkout") setStatus(p => ({ ...p, checkedOutAt: now, checkOutLatLng: userLatLng }));
    else if (type === "startBreak") setStatus(p => ({ ...p, breakSessionStart: now }));
    else if (type === "endBreak") {
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
  const checkInDiffText = status.checkedInAt ? (checkInDiffMs > 0 ? `Late by ${formatDuration(checkInDiffMs)}` : `Early by ${formatDuration(-checkInDiffMs)}`) : "-";

  const STANDARD_END_TIME_MS = (() => {
    const d = new Date();
    d.setHours(STANDARD_START_HOUR + WORK_HOURS, 30, 0, 0);
    return d.getTime();
  })();

  const checkOutTime = status.checkedOutAt || 0;
  const checkOutDiffMs = checkOutTime ? checkOutTime - STANDARD_END_TIME_MS : 0;
  const checkOutDiffText = status.checkedOutAt ? (checkOutDiffMs > 0 ? `Late by ${formatDuration(checkOutDiffMs)}` : `Early by ${formatDuration(-checkOutDiffMs)}`) : "-";

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50 to-white flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 border-2 border-indigo-400 overflow-hidden flex items-center justify-center">
              {profileImg ? <img src={profileImg} alt="profile" className="w-full h-full object-cover rounded-full" /> : null}
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <div className="space-y-0.5">
                <div className="font-bold text-lg text-gray-900">{demoUser.name}</div>
                <div className="text-sm sm:text-base text-gray-600">{demoUser.designation}</div>
                <div className="text-xs text-gray-400">ID: {demoUser.employeeId}</div>
                {userLatLng && <div className="text-xs text-gray-500">Location: {userLatLng.lat.toFixed(5)}, {userLatLng.lon.toFixed(5)}</div>}
              </div>
            <div className="flex flex-col items-start gap-2">
  <Button
    size="sm"
    className="bg-indigo-500 text-white w-28 justify-center"
    onClick={() => document.getElementById("imgUpload").click()}
  >
    {profileImg ? "Change" : "Upload"}
  </Button>

  <input
    id="imgUpload"
    className="hidden"
    type="file"
    accept="image/*"
    onChange={handleUpload}
  />

  {profileImg && (
    <Button
      size="sm"
      className="bg-red-500 text-white w-28 justify-center"
      onClick={clearProfile}
    >
      Remove
    </Button>
  )}
</div>

            </div>
          </div>
        </div>

        <div className="font-semibold text-base text-gray-800">Checked In</div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm">
          <div className="flex items-center gap-2">
            <FaRegClock className="text-indigo-500" />
            <span className="font-mono">{status.checkedInAt ? new Date(status.checkedInAt).toLocaleTimeString() : "-"}</span>
            <span className="text-xs ml-2">{checkInDiffText}</span>
          </div>
          <div className="hidden sm:block">–</div>
          <div className="flex items-center gap-2">
            <FaRegClock className="text-indigo-500" />
            <span className="font-mono">{status.checkedOutAt ? new Date(status.checkedOutAt).toLocaleTimeString() : "-"}</span>
            <span className="text-xs ml-2">{checkOutDiffText}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 mt-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><IoTimeOutline className="text-indigo-400" />Break used:</div>
            <div className="text-lg font-bold text-indigo-700">{Math.ceil(breakUsedMs / 60000)} min / {BREAK_MINUTES} min</div>
            <div className="flex items-center gap-2 text-sm mt-1"><FaRegClock className="text-gray-400" />Remaining: <span className="text-indigo-600 font-mono">{formatDuration(breakRemainingMs)}</span></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><FaRegClock className="text-indigo-400" />Hours Worked</div>
            <div className="text-lg font-bold text-indigo-700">{workingTimeText}</div>
            <div className="text-xs text-gray-500 mt-2">
              Expect: {WORK_HOURS}h incl. {BREAK_MINUTES}min break. Actual: {(workingTimeMs / 1000 / 3600).toFixed(2)}h
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mt-4">
          {!status.checkedIn && (
            <Button
              className="w-full sm:w-auto bg-green-500 text-white px-5 py-2 rounded flex items-center gap-2 shadow"
              onClick={() => openModal("checkin")}
              disabled={!profileImg || !geoAllowed}
            >
              <FaRegPlayCircle className="text-xl" /> Check In
            </Button>
          )}
          {status.checkedIn && !status.checkedOutAt && (
            <Button
              className="w-full sm:w-auto bg-yellow-500 text-white px-5 py-2 rounded flex items-center gap-2 shadow"
              onClick={() => openModal("checkout")}
              disabled={!profileImg || !geoAllowed}
            >
              <FaRegPlayCircle className="text-xl" /> Check Out
            </Button>
          )}
          {!status.breakSessionStart && (
            <Button
              className="w-full sm:w-auto flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded shadow"
              onClick={() => openModal("startBreak")}
              disabled={!status.checkedIn || breakUsedMs >= BREAK_MINUTES * 60000}
            >
              <IoTimeOutline />Start Break
            </Button>
          )}
          {status.breakSessionStart && (
            <Button
              className="w-full sm:w-auto flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded shadow"
              onClick={() => openModal("endBreak")}
              disabled={!status.checkedIn}
            >
              <FaRegClock />End Break
            </Button>
          )}
        </div>

        <div className="mt-4">
          <Timer start={status.checkedInAt} end={status.checkedOutAt} breakSessionStart={status.breakSessionStart} breakUsedMs={status.breakUsedMs} />
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg sm:max-w-xl p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-base">
                {modalMode === "checkin" ? "Check In" : modalMode === "checkout" ? "Check Out" : modalMode === "startBreak" ? "Start Break" : "End Break"}
              </div>
              <Button onClick={closeModal} className="bg-gray-200 text-gray-800 px-2 py-1 rounded">Close</Button>
            </div>
            <FaceCheckModal profileImg={profileImg} mode={modalMode} onSuccess={onVerified} onCancel={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
}
