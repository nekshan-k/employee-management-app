import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FaceCheckModal from "./FaceCheckModal";
import Timer from "./Timer";
import ProfileHeader from "./userProfileComps/ProfileHeader";
import StatsGrid from "./userProfileComps/StatsGrid";
import Controls from "./userProfileComps/Controls";
import { toast } from "react-toastify";
import { getUserProfile, uploadUserProfilePhoto, getUserTodayAttendance } from "../../../api/ApiCalls";
import CustomToast from "../../ui/Toast/CustomToast";

const GEO_FENCE = { lat: 32.69780167134704, lon: 74.86921071534209, radiusMeters: 500 };
const BREAK_MINUTES = 30;

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = x => (x * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDuration = ms => {
  const s = Math.floor((ms || 0) / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
};

export default function UserProfile() {
  const storeUser = useSelector(s => s.auth.user);
  const userId = storeUser?.id || 0;

  const [profile, setProfile] = useState(null);
  const [profileImg, setProfileImg] = useState("");
  const [modalMode, setModalMode] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [status, setStatus] = useState({
    checkedIn: false,
    checkedInAt: null,
    checkedOutAt: null,
    breakUsedMs: 0,
    breakSessionStart: null,
    checkInLatLng: null,
    checkOutLatLng: null,
    totalWorkedMs: 0,
    halfDay: false
  });

  const [userLatLng, setUserLatLng] = useState(null);
  const [geoAllowed, setGeoAllowed] = useState(false);
  const [geoPermission, setGeoPermission] = useState("prompt");
  const [checkingGeo, setCheckingGeo] = useState(false);
  const [profileLocationMatch, setProfileLocationMatch] = useState(null);
  const [profileLocationDistance, setProfileLocationDistance] = useState(null);

  const parseTs = t => (t ? Date.parse(t) : null);

  const computeTodayStatusFromData = data => {
    if (!data || !Array.isArray(data.sessions) || data.sessions.length === 0) {
      return {
        checkedIn: false,
        checkedInAt: null,
        checkedOutAt: null,
        breakUsedMs: 0,
        breakSessionStart: null,
        totalWorkedMs: 0,
        halfDay: false
      };
    }

    let totalWorkedMs = 0;
    let totalBreakMs = 0;
    let runningBreakStart = null;
    let runningSessionCheckIn = null;
    let runningSessionBreakUsedMs = 0;
    let runningSessionFound = false;

    data.sessions.forEach(s => {
      const inTs = parseTs(s.checkIn);
      const outTs = parseTs(s.checkOut);
      let sessionBreakMs = 0;
      let sessionRunningBreakStart = null;

      if (Array.isArray(s.breaks) && s.breaks.length) {
        s.breaks.forEach(b => {
          const bs = parseTs(b.breakStartTime);
          const be = parseTs(b.breakEndTime);
          if (bs && be) {
            sessionBreakMs += Math.max(0, be - bs);
          } else if (bs && !be) {
            sessionRunningBreakStart = bs;
          } else if (typeof b.durationMinutes === "number") {
            sessionBreakMs += b.durationMinutes * 60000;
          }
        });
      }

      if (inTs && outTs) {
        const worked = Math.max(0, outTs - inTs - sessionBreakMs);
        totalWorkedMs += worked;
        totalBreakMs += sessionBreakMs;
      } else if (inTs && !outTs) {
        runningSessionFound = true;
        runningSessionCheckIn = inTs;
        runningSessionBreakUsedMs = sessionBreakMs;
        if (sessionRunningBreakStart) runningBreakStart = sessionRunningBreakStart;
      }
    });

  const halfDay = totalBreakMs > BREAK_MINUTES * 60000;

    if (runningSessionFound) {
      return {
        checkedIn: true,
        checkedInAt: runningSessionCheckIn,
        checkedOutAt: null,
        breakUsedMs: totalBreakMs + runningSessionBreakUsedMs,
        breakSessionStart: runningBreakStart,
        totalWorkedMs,
        halfDay
      };
    }

    return {
      checkedIn: false,
      checkedInAt: null,
      checkedOutAt: null,
      breakUsedMs: totalBreakMs,
      breakSessionStart: null,
      totalWorkedMs,
      halfDay
    };
  };

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        const resp = await getUserProfile(userId);
        if (!mounted) return;
        const p = resp?.data?.data || resp?.data || null;
        setProfile(p);
        setProfileImg(p?.profileImageUrl || "");
      } catch {
        toast.error("Failed to load profile");
      }
    }
    if (userId) loadProfile();
    return () => {
      mounted = false;
    };
  }, [userId]);

  useEffect(() => {
    let mounted = true;
    async function loadToday() {
      try {
        const resp = await getUserTodayAttendance();
        if (!mounted) return;
        const d = resp?.data?.data || resp?.data || null;
        const st = computeTodayStatusFromData(d);
        setStatus(prev => ({ ...prev, ...st }));
      } catch {}
    }
    if (userId) loadToday();
    return () => {
      mounted = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!navigator.permissions) {
      navigator.geolocation.getCurrentPosition(
        p => {
          const lat = p.coords.latitude,
            lon = p.coords.longitude;
          setUserLatLng({ lat, lon });
          setGeoAllowed(haversineDistance(lat, lon, GEO_FENCE.lat, GEO_FENCE.lon) <= GEO_FENCE.radiusMeters);
          setGeoPermission("granted");
        },
        () => {
          setGeoPermission("denied");
          setGeoAllowed(false);
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
      return;
    }
    let m = true;
    (async () => {
      try {
        const perm = await navigator.permissions.query({ name: "geolocation" });
        if (!m) return;
        setGeoPermission(perm.state);
        const updatePos = () => {
          navigator.geolocation.getCurrentPosition(
            p => {
              if (!m) return;
              const lat = p.coords.latitude,
                lon = p.coords.longitude;
              setUserLatLng({ lat, lon });
              setGeoAllowed(haversineDistance(lat, lon, GEO_FENCE.lat, GEO_FENCE.lon) <= GEO_FENCE.radiusMeters);
            },
            () => {
              if (!m) return;
              setGeoAllowed(false);
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }
          );
        };
        if (perm.state === "granted") updatePos();
        perm.onchange = () => {
          if (!m) return;
          setGeoPermission(perm.state);
          if (perm.state === "granted") updatePos();
        };
      } catch {
        setGeoPermission("prompt");
      }
    })();
    return () => {
      m = false;
    };
  }, []);

  useEffect(() => {
    const prof = profile;
    const user = userLatLng;
    if (!prof || !user) return;
    const plat = Number(prof.latitude || prof.lat || 0);
    const plon = Number(prof.longitude || prof.lon || prof.lng || 0);
    const dist = haversineDistance(user.lat, user.lon, plat, plon);
    setProfileLocationDistance(dist);
    setProfileLocationMatch(dist <= (prof.locationRadiusMeters || 500));
    console.log("PROFILE LOCATION FROM API ->", { profileLatitude: plat, profileLongitude: plon });
    console.log("BROWSER LOCATION ->", user);
    console.log("DISTANCE METERS ->", dist);
    console.log("MATCH ->", dist <= (prof.locationRadiusMeters || 500));
  }, [profile, userLatLng]);

  const refreshProfileAndToday = async () => {
    try {
      const [pResp, tResp] = await Promise.allSettled([getUserProfile(userId), getUserTodayAttendance()]);
      if (pResp.status === "fulfilled") {
        const p = pResp.value?.data?.data || pResp.value?.data || null;
        setProfile(p);
        setProfileImg(p?.profileImageUrl || "");
      }
      if (tResp.status === "fulfilled") {
        const d = tResp.value?.data?.data || tResp.value?.data || null;
        const st = computeTodayStatusFromData(d);
        setStatus(prev => ({ ...prev, ...st }));
      }
    } catch {}
  };

  const handleUpload = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sendObj = { userId, fileName: file.name, fileType: file.type, fileSize: file.size };
    console.log("SEND OBJECT ->", sendObj);
    const form = new FormData();
    form.append("file", file);
    for (const entry of form.entries()) console.log("FORM ENTRY ->", entry[0], entry[1]);
    try {
      const resp = await uploadUserProfilePhoto(userId, form);
      console.log("UPLOAD RESPONSE ->", resp);
      const url = resp?.data?.data?.profileImageUrl || resp?.data?.profileImageUrl || "";
      setProfileImg(url);
      setProfile(prev => (prev ? { ...prev, profileImageUrl: url } : { profileImageUrl: url }));
      toast.success("Profile photo updated");
      await refreshProfileAndToday();
    } catch (err) {
      console.log("UPLOAD ERROR ->", err?.response || err);
      toast.error("Upload failed");
    }
  };

  const clearProfile = () => {
    setProfileImg("");
    setProfile(prev => (prev ? { ...prev, profileImageUrl: "" } : prev));
  };

  const getFastPosition = () =>
    new Promise((res, rej) => {
      if (!navigator.geolocation) return rej(new Error("no-geo"));
      navigator.geolocation.getCurrentPosition(
        pos => res(pos.coords),
        err => rej(err),
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
      const lat = coords.latitude,
        lon = coords.longitude;
      setUserLatLng({ lat, lon });
      const withinFence = haversineDistance(lat, lon, GEO_FENCE.lat, GEO_FENCE.lon) <= GEO_FENCE.radiusMeters;
      if (!withinFence) {
        toast.error("You are outside the allowed location");
        return;
      }
      const map = { checkin: "CHECK_IN", checkout: "CHECK_OUT", startBreak: "BREAK_IN", endBreak: "BREAK_OUT" };
      const normalized = map[requestedMode] || String(requestedMode).toUpperCase();
      setModalMode({ mode: normalized, coordinates: { lat, lon } });
      setModalOpen(true);
    } catch {
      toast.error("Unable to determine location quickly. Ensure location is enabled.");
    } finally {
      setCheckingGeo(false);
    }
  };

  const closeModal = async () => {
    setModalOpen(false);
    setModalMode(null);
    try {
      await refreshProfileAndToday();
    } catch {}
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
      const start = status.checkedInAt || now;
      const worked = Math.max(0, now - start - (status.breakUsedMs || 0));
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
    status.checkedInAt && !status.checkedOutAt ? Date.now() - status.checkedInAt - breakUsedMs : 0;

  const attendanceState = (() => {
    if (status.halfDay) return "Half day";
    if (status.breakSessionStart && status.checkedIn && !status.checkedOutAt) return "On break";
    if (!status.checkedIn) return "Not checked in";
    if (status.checkedIn && !status.checkedOutAt) return "Working";
    return "Checked out";
  })();

  return (
    <div className="min-h-screen flex justify-center bg-primary50 px-4 py-6">
      <CustomToast />
      <div className="w-full max-w-5xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-primary500">Attendance Desk</h1>
            <p className="text-xs text-foundation-neurtal-neurtal-500">
              Face and location-based check-in for {profile?.fullName || storeUser?.fullName || "N/A"}
            </p>
            {profile && profile.latitude != null && profile.longitude != null && (
              <div className="text-[11px] text-neutral400 mt-1">
                Profile location: {Number(profile.latitude || profile.lat || 0).toFixed(5)},{" "}
                {Number(profile.longitude || profile.lon || profile.lng || 0).toFixed(5)} • Distance:{" "}
                {profileLocationDistance != null ? Math.round(profileLocationDistance) + "m" : "-"} • Match:{" "}
                {profileLocationMatch ? "Yes" : "No"}
              </div>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs rounded-full px-3 py-1 border border-primary200 bg-white">
            <span
              className={`h-2 w-2 rounded-full ${
                attendanceState === "Working"
                  ? "bg-emerald-500"
                  : attendanceState === "On break"
                  ? "bg-amber-500"
                  : attendanceState === "Checked out"
                  ? "bg-foundation-neurtal-neurtal-400"
                  : "bg-amber-500"
              }`}
            />
            <span>{attendanceState}</span>
          </div>
        </div>

        {geoPermission === "denied" && (
          <div className="rounded p-3 bg-rose-50 border border-rose-200 text-rose-700">
            Enable location for this site in your browser to use check-in features.
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-5 space-y-5">
          <ProfileHeader
            demoUser={{
              name: profile?.fullName || storeUser?.fullName || "N/A",
              employeeId: profile?.employeeCode || "EMP-000",
              designation: profile?.designation || "N/A",
              email: profile?.email || ""
            }}
            profileImg={profileImg || profile?.profileImageUrl || ""}
            attendanceState={attendanceState}
            userLatLng={userLatLng}
            geoAllowed={geoAllowed}
            onUploadClick={() => document.getElementById("imgUpload").click()}
            onClear={clearProfile}
            onUploadChange={handleUpload}
          />

          <StatsGrid
            status={{
              ...status,
              workingTimeText: formatDuration(workingTimeMs),
              totalWorkedText,
              breakUsedText: formatDuration(breakUsedMs),
              breakSessionStart: status.breakSessionStart
                ? new Date(status.breakSessionStart).toISOString()
                : null
            }}
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
            profileImg={profileImg || profile?.profileImageUrl || ""}
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
          profileImg={profileImg || profile?.profileImageUrl || ""}
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
