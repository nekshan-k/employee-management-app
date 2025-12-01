import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FaceCheckModal from "./FaceCheckModal";
import Timer from "./Timer";
import ProfileHeader from "./userProfileComps/ProfileHeader";
import StatsGrid from "./userProfileComps/StatsGrid";
import Controls from "./userProfileComps/Controls";
import { toast } from "react-toastify";

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

async function readFileAsDataURL(file) {
  return await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function UserProfile() {
  const storeUser = useSelector(state => state.auth.user);
  const userId = storeUser?.id || 0;

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
      totalWorkedMs: 0
    }
  );

  const [userLatLng, setUserLatLng] = useState(null);
  const [geoAllowed, setGeoAllowed] = useState(false);
  const [geoPermission, setGeoPermission] = useState("prompt");
  const [checkingGeo, setCheckingGeo] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("attendanceStatus", JSON.stringify(status));
  }, [status]);

  useEffect(() => {
    if (!navigator.permissions) {
      navigator.geolocation.getCurrentPosition(
        p => {
          const lat = p.coords.latitude;
          const lon = p.coords.longitude;
          setUserLatLng({ lat, lon });
          setGeoAllowed(haversineDistance(lat, lon, GEO_FENCE.lat, GEO_FENCE.lon) <= GEO_FENCE.radiusMeters);
          setGeoPermission("granted");
        },
        e => {
          setGeoPermission("denied");
          setGeoAllowed(false);
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
      return;
    }

    let mounted = true;
    const check = async () => {
      try {
        const status = await navigator.permissions.query({ name: "geolocation" });
        if (!mounted) return;
        setGeoPermission(status.state);
        if (status.state === "granted") {
          navigator.geolocation.getCurrentPosition(
            p => {
              if (!mounted) return;
              const lat = p.coords.latitude;
              const lon = p.coords.longitude;
              setUserLatLng({ lat, lon });
              setGeoAllowed(haversineDistance(lat, lon, GEO_FENCE.lat, GEO_FENCE.lon) <= GEO_FENCE.radiusMeters);
            },
            () => {
              if (!mounted) return;
              setGeoAllowed(false);
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }
          );
        }
        status.onchange = () => {
          if (!mounted) return;
          setGeoPermission(status.state);
          if (status.state === "granted") {
            navigator.geolocation.getCurrentPosition(
              p => {
                if (!mounted) return;
                const lat = p.coords.latitude;
                const lon = p.coords.longitude;
                setUserLatLng({ lat, lon });
                setGeoAllowed(haversineDistance(lat, lon, GEO_FENCE.lat, GEO_FENCE.lon) <= GEO_FENCE.radiusMeters);
              },
              () => {
                if (!mounted) return;
                setGeoAllowed(false);
              },
              { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }
            );
          }
        };
      } catch {
        setGeoPermission("prompt");
      }
    };
    check();
    return () => {
      mounted = false;
    };
  }, []);

  const demoUser = {
    name: sessionStorage.getItem("fullName") || storeUser?.fullName || "N/A",
    employeeId: sessionStorage.getItem("employeeCode") || "EMP-000",
    designation: sessionStorage.getItem("designation") || "N/A",
    email: sessionStorage.getItem("email") || "",
    roleName: sessionStorage.getItem("roleName") || "",
    organizationName: sessionStorage.getItem("organizationName") || "",
    dateOfJoining: sessionStorage.getItem("dateOfJoining") || ""
  };

  const handleUpload = async e => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const dataUrl = await readFileAsDataURL(f);
      setProfileImg(dataUrl);
      sessionStorage.setItem("profileImg", dataUrl);
      toast.success("Image saved");
    } catch (err) {
      toast.error(err?.message || "Failed to read file");
    }
  };

  const clearProfile = () => {
    sessionStorage.removeItem("profileImg");
    setProfileImg("");
  };

  const getFastPosition = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("no-geo"));
      navigator.geolocation.getCurrentPosition(
        pos => resolve(pos.coords),
        err => reject(err),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 5000 }
      );
    });

  const openModal = async requestedMode => {
    if (geoPermission === "denied") {
      toast.error("Location permission denied. Enable location in browser settings.");
      return;
    }
    setCheckingGeo(true);
    try {
      const coords = await getFastPosition();
      const lat = coords.latitude;
      const lon = coords.longitude;
      setUserLatLng({ lat, lon });
      const withinFence = haversineDistance(lat, lon, GEO_FENCE.lat, GEO_FENCE.lon) <= GEO_FENCE.radiusMeters;
      if (!withinFence) {
        toast.error("You are outside the allowed location");
        return;
      }
      const modeMap = {
        checkin: "CHECK_IN",
        checkout: "CHECK_OUT",
        startBreak: "BREAK_IN",
        endBreak: "BREAK_OUT",
        CHECK_IN: "CHECK_IN",
        CHECK_OUT: "CHECK_OUT",
        BREAK_IN: "BREAK_IN",
        BREAK_OUT: "BREAK_OUT"
      };
      const normalizedMode = modeMap[requestedMode] || String(requestedMode).toUpperCase();
      setModalMode({ mode: normalizedMode, coordinates: { lat, lon } });
      setModalOpen(true);
    } catch (err) {
      toast.error("Unable to determine location quickly. Ensure location is enabled.");
    } finally {
      setCheckingGeo(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMode(null);
  };

  const onVerified = payload => {
    const now = Date.now();
    if (payload.type === "CHECK_IN") {
      setStatus(p => ({
        ...p,
        checkedIn: true,
        checkedInAt: now,
        checkedOutAt: null,
        totalWorkedMs: p.totalWorkedMs || 0,
        breakSessionStart: null,
        breakUsedMs: 0
      }));
      toast.success("Checked in");
    } else if (payload.type === "CHECK_OUT") {
      const worked = status.checkedInAt ? now - status.checkedInAt - status.breakUsedMs : 0;
      setStatus(p => ({
        ...p,
        checkedIn: false,
        checkedOutAt: now,
        checkedInAt: null,
        totalWorkedMs: (p.totalWorkedMs || 0) + worked
      }));
      toast.success("Checked out");
    } else if (payload.type === "BREAK_IN") {
      setStatus(p => ({ ...p, breakSessionStart: now }));
      toast.success("Break started");
    } else if (payload.type === "BREAK_OUT") {
      setStatus(p => {
        const start = p.breakSessionStart;
        const used = start ? p.breakUsedMs + (now - start) : p.breakUsedMs;
        return { ...p, breakUsedMs: used, breakSessionStart: null };
      });
      toast.success("Break ended");
    }
    closeModal();
  };

  const totalWorkedText = formatDuration(status.totalWorkedMs || 0);
  const breakUsedMs = status.breakUsedMs || 0;
  const breakRemainingMs = Math.max(0, BREAK_MINUTES * 60000 - breakUsedMs);
  const workingTimeMs =
    status.checkedInAt && !status.checkedOutAt
      ? Date.now() - status.checkedInAt - breakUsedMs
      : 0;

  const attendanceState = (() => {
    if (status.breakSessionStart && status.checkedIn && !status.checkedOutAt) return "On break";
    if (!status.checkedIn) return "Not checked in";
    if (status.checkedIn && !status.checkedOutAt) return "Working";
    return "Checked out";
  })();

  return (
    <div className="min-h-screen flex justify-center bg-primary50 px-4 py-6">
      <div className="w-full max-w-5xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-primary500">Attendance Desk</h1>
            <p className="text-xs text-foundation-neurtal-neurtal-500">Face and location-based check-in for {demoUser.name}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs rounded-full px-3 py-1 border bg-white">
            <span className={`h-2 w-2 rounded-full ${attendanceState === "Working" ? "bg-emerald-500" : attendanceState === "On break" ? "bg-amber-500" : attendanceState === "Checked out" ? "bg-foundation-neurtal-neurtal-400" : "bg-amber-500"}`} />
            <span>{attendanceState}</span>
          </div>
        </div>

        {geoPermission === "denied" && (
          <div className="rounded p-3 bg-rose-50 border border-rose-200 text-rose-700">
            Enable location for this site in your browser to use check-in features.
          </div>
        )}

        <div className="bg-white rounded-2xl border p-5 space-y-5">
          <ProfileHeader
            demoUser={demoUser}
            profileImg={profileImg}
            attendanceState={attendanceState}
            userLatLng={userLatLng}
            geoAllowed={geoAllowed}
            onUploadClick={() => document.getElementById("imgUpload").click()}
            onClear={clearProfile}
            onUploadChange={handleUpload}
          />

          <StatsGrid
            status={status}
            workingTimeMs={workingTimeMs}
            workingTimeText={formatDuration(workingTimeMs)}
            breakUsedMs={breakUsedMs}
            breakRemainingMs={breakRemainingMs}
            checkInDiffText={"-"}
            checkOutDiffText={"-"}
            totalWorkedText={totalWorkedText}
          />

          <Controls
            status={status}
            profileImg={profileImg}
            geoAllowed={geoAllowed}
            breakUsedMs={breakUsedMs}
            openModal={openModal}
            checkingGeo={checkingGeo}
          />

          <div className="border-t pt-3">
            <Timer
              start={status.checkedInAt}
              end={status.checkedOutAt}
              breakSessionStart={status.breakSessionStart}
              breakUsedMs={status.breakUsedMs}
            />
          </div>
        </div>
      </div>

      {modalOpen && modalMode && (
        <FaceCheckModal
          profileImg={profileImg}
          userId={userId}
          mode={modalMode.mode}
          coordinatesLatLon={modalMode.coordinates}
          onSuccess={onVerified}
          onCancel={closeModal}
        />
      )}

      <input id="imgUpload" type="file" className="hidden" accept="image/*" onChange={handleUpload} />
    </div>
  );
}
