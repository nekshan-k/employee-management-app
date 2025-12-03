import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import FaceCheckModal from "./FaceCheckModal";
import ProfileHeader from "./userProfileComps/ProfileHeader";
import StatsGrid from "./userProfileComps/StatsGrid";
import Controls from "./userProfileComps/Controls";
import { toast } from "react-toastify";
import { getUserProfile, uploadUserProfilePhoto, getUserTodayAttendance } from "../../../api/ApiCalls";
import CustomToast from "../../ui/Toast/CustomToast";
import { haversineDistance, fmt, computeTodayStatusFromData, DEFAULT_RADIUS, BREAK_MINUTES } from "./utils";

export default function UserProfile() {
  const storeUser = useSelector(s => s.auth.user);
  const userId = storeUser?.id || 0;
  const [profile, setProfile] = useState(null);
  const [profileImg, setProfileImg] = useState("");
  const [modalMode, setModalMode] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState({});
  const [userLatLng, setUserLatLng] = useState(null);
  const [geoPermission, setGeoPermission] = useState("prompt");
  const [profileLocationMatch, setProfileLocationMatch] = useState(null);
  const [profileLocationDistance, setProfileLocationDistance] = useState(null);
  const [checkingGeo, setCheckingGeo] = useState(false);
  const tickRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await getUserProfile(userId);
        if (!mounted) return;
        const p = resp?.data?.data || resp?.data || null;
        setProfile(p);
        setProfileImg(p?.profileImageUrl || "");
      } catch {
        toast.error("Failed to load profile");
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await getUserTodayAttendance();
        if (!mounted) return;
        const d = resp?.data?.data || resp?.data || null;
        setStatus(prev => ({ ...prev, ...computeTodayStatusFromData(d) }));
      } catch {}
    })();
    return () => { mounted = false; };
  }, [userId]);

  useEffect(() => {
    if (!navigator.permissions) {
      navigator.geolocation.getCurrentPosition(p => setUserLatLng({ lat: p.coords.latitude, lon: p.coords.longitude }), () => {}, { timeout: 5000 });
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const perm = await navigator.permissions.query({ name: "geolocation" });
        if (!mounted) return;
        setGeoPermission(perm.state);
        const updatePos = () => navigator.geolocation.getCurrentPosition(p => { if (!mounted) return; setUserLatLng({ lat: p.coords.latitude, lon: p.coords.longitude }); }, () => {}, { timeout: 5000, maximumAge: 30000 });
        if (perm.state === "granted") updatePos();
        perm.onchange = () => { if (!mounted) return; setGeoPermission(perm.state); if (perm.state === "granted") updatePos(); };
      } catch { setGeoPermission("prompt"); }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!profile || !userLatLng) return;
    const plat = Number(profile.latitude || profile.lat || 0);
    const plon = Number(profile.longitude || profile.lon || profile.lng || 0);
    const radius = Number(profile.locationRadiusMeters || DEFAULT_RADIUS);
    const dist = haversineDistance(userLatLng.lat, userLatLng.lon || userLatLng.longitude || 0, plat, plon);
    setProfileLocationDistance(dist);
    const match = dist <= radius;
    setProfileLocationMatch(match);
  }, [profile, userLatLng]);

  const refreshProfileAndToday = async () => {
    const [pResp, tResp] = await Promise.allSettled([getUserProfile(userId), getUserTodayAttendance()]);
    if (pResp.status === "fulfilled") {
      const p = pResp.value?.data?.data || pResp.value?.data || null;
      setProfile(p);
      setProfileImg(p?.profileImageUrl || "");
    }
    if (tResp.status === "fulfilled") {
      const d = tResp.value?.data?.data || tResp.value?.data || null;
      setStatus(prev => ({ ...prev, ...computeTodayStatusFromData(d) }));
    }
  };

  const handleUpload = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const resp = await uploadUserProfilePhoto(userId, fd);
      const url = resp?.data?.data?.profileImageUrl || resp?.data?.profileImageUrl || "";
      setProfileImg(url);
      setProfile(prev => prev ? { ...prev, profileImageUrl: url } : { profileImageUrl: url });
      toast.success("Profile photo updated");
      await refreshProfileAndToday();
    } catch {
      toast.error("Upload failed");
    }
  };

  const clearProfile = () => {
    setProfileImg("");
    setProfile(prev => prev ? { ...prev, profileImageUrl: "" } : prev);
  };

  const getFastPosition = () => new Promise((res, rej) => {
    if (!navigator.geolocation) return rej(new Error("no-geo"));
    navigator.geolocation.getCurrentPosition(pos => res(pos.coords), err => rej(err), { enableHighAccuracy: false, timeout: 5000, maximumAge: 5000 });
  });

  const openModal = async requestedMode => {
    if (geoPermission === "denied") { toast.error("Location permission denied. Enable location in browser settings."); return; }
    setCheckingGeo(true);
    try {
      const coords = await getFastPosition();
      const lat = coords.latitude;
      const lon = coords.longitude;
      setUserLatLng({ lat, lon });
      const centerLat = Number(profile?.latitude || profile?.lat || 0);
      const centerLon = Number(profile?.longitude || profile?.lon || profile?.lng || 0);
      if (!centerLat || !centerLon) { toast.error("Profile location not configured. Cannot perform geo-check."); return; }
      const radius = Number(profile?.locationRadiusMeters || DEFAULT_RADIUS);
      const withinFence = haversineDistance(lat, lon, centerLat, centerLon) <= radius;
      if (!withinFence) { toast.error("You are outside the allowed location"); return; }
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
    await refreshProfileAndToday();
  };

  const onVerified = payload => {
    const now = Date.now();
    if (payload.type === "CHECK_IN") setStatus(p => ({ ...p, checkedIn: true, checkedInAt: p.checkedInAt || now, checkedOutAt: null }));
    else if (payload.type === "CHECK_OUT") setStatus(p => ({ ...p, checkedIn: false, checkedOutAt: now }));
    else if (payload.type === "BREAK_IN") setStatus(p => ({ ...p, breakSessionStart: now }));
    else if (payload.type === "BREAK_OUT") setStatus(p => ({ ...p, breakSessionStart: null }));
    closeModal();
  };

  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(async () => {
      try {
        const resp = await getUserTodayAttendance();
        const d = resp?.data?.data || resp?.data || null;
        setStatus(prev => ({ ...prev, ...computeTodayStatusFromData(d) }));
      } catch {}
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [userId]);

  const now = Date.now();
  const currentSessionWorkedMs = (() => {
    if (!status.checkedInAt || status.checkedOutAt) return 0;
    const sessionStart = status.checkedInAt;
    let sessionBreakMs = 0;
    if (status.breakSessionStart) sessionBreakMs = Math.max(0, now - status.breakSessionStart);
    return Math.max(0, now - sessionStart - sessionBreakMs);
  })();
  const totalWorkedWithoutBreaksMs = status.workedWithoutBreakMs || 0;
  const totalWorkedText = fmt(totalWorkedWithoutBreaksMs);
  const breakUsedMs = status.breakTakenMs || status.breakUsedMs || 0;
  const totalIncludingBreaksMs = status.totalIncludingBreaksMs || totalWorkedWithoutBreaksMs + (breakUsedMs <= BREAK_MINUTES * 60000 ? BREAK_MINUTES * 60000 : breakUsedMs);
  const breakRemainingMs = Math.max(0, BREAK_MINUTES * 60000 - breakUsedMs);
  const workingTimeMs = currentSessionWorkedMs;
  const attendanceState = status.halfDay ? "Half day" : status.breakSessionStart && status.checkedIn && !status.checkedOutAt ? "On break" : !status.checkedIn ? "Not checked in" : status.checkedIn && !status.checkedOutAt ? "Working" : "Checked out";

  return (
    <div className="min-h-screen flex justify-center bg-primary50 px-4 py-6">
      <CustomToast />
      <div className="w-full max-w-5xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-primary500">Attendance Desk</h1>
            <p className="text-xs text-neutral-500">Face and location-based check-in for {profile?.fullName || storeUser?.fullName || "N/A"}</p>
            {profile && profile.latitude != null && profile.longitude != null && (
              <div className="text-[11px] text-neutral400 mt-1">
                Profile location: {Number(profile.latitude || profile.lat || 0).toFixed(5)}, {Number(profile.longitude || profile.lon || profile.lng || 0).toFixed(5)} • Distance: {profileLocationDistance != null ? Math.round(profileLocationDistance) + "m" : "-"} • Match: {profileLocationMatch ? "Yes" : "No"}
              </div>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs rounded-full px-3 py-1 border border-primary200 bg-white">
            <span className={`h-2 w-2 rounded-full ${attendanceState === "Working" ? "bg-emerald-500" : attendanceState === "On break" ? "bg-amber-500" : attendanceState === "Checked out" ? "bg-gray-400" : "bg-amber-500"}`} />
            <span>{attendanceState}</span>
          </div>
        </div>

        {geoPermission === "denied" && <div className="rounded p-3 bg-rose-50 border border-rose-200 text-rose-700">Enable location for this site in your browser to use check-in features.</div>}

        <div className="bg-white rounded-2xl shadow-lg p-5 space-y-5">
          <ProfileHeader
            demoUser={{ name: profile?.fullName || storeUser?.fullName || "N/A", employeeId: profile?.employeeCode || "EMP-000", designation: profile?.designation || "N/A", email: profile?.email || "" }}
            profileImg={profileImg || profile?.profileImageUrl || ""}
            attendanceState={attendanceState}
            userLatLng={userLatLng}
            geoAllowed={profileLocationMatch}
            onUploadClick={() => document.getElementById("imgUpload").click()}
            onClear={clearProfile}
            onUploadChange={handleUpload}
          />

          <StatsGrid
            status={{ ...status, workingTimeText: fmt(workingTimeMs), totalWorkedText, breakUsedText: fmt(breakUsedMs), breakSessionStart: status.breakSessionStart ? new Date(status.breakSessionStart).toISOString() : null }}
            workingTimeMs={workingTimeMs}
            workingTimeText={fmt(workingTimeMs)}
            breakUsedMs={breakUsedMs}
            breakRemainingMs={breakRemainingMs}
            totalWorkedText={fmt(totalIncludingBreaksMs)}
          />

          <Controls status={status} profileImg={profileImg || profile?.profileImageUrl || ""} geoAllowed={profileLocationMatch} breakUsedMs={breakUsedMs} openModal={openModal} checkingGeo={checkingGeo} />

          <div className="border-t pt-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Session {fmt(totalWorkedWithoutBreaksMs)}</span>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && modalMode && <FaceCheckModal profileImg={profileImg || profile?.profileImageUrl || ""} userId={userId} mode={modalMode.mode} coordinatesLatLon={modalMode.coordinates} onSuccess={onVerified} onCancel={closeModal} />}

      <input id="imgUpload" type="file" className="hidden" accept="image/*" onChange={handleUpload} />
    </div>
  );
}
