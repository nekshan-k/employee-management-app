import { useCallback, useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import Button from "../../ui/buttons/Button";
import { submitAttendanceAction } from "../../../api/ApiCalls";
import { toast } from "react-toastify";

let modelsLoadedPromise = null;

function loadModels() {
  if (!modelsLoadedPromise) {
    modelsLoadedPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]);
  }
  return modelsLoadedPromise;
}

function dataUrlToFile(dataUrl, filename = "capture.png") {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8 = new Uint8Array(n);
  while (n--) u8[n] = bstr.charCodeAt(n);
  return new File([u8], filename, { type: mime });
}

export default function FaceCheckModal({ profileImg, mode, userId, onSuccess, onCancel, coordinatesLatLon }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervals = useRef([]);
  const [modelsReady, setModelsReady] = useState(false);
  const [status, setStatus] = useState("ready");
  const [captured, setCaptured] = useState("");
  const [distance, setDistance] = useState(null);
  const [submitSeconds, setSubmitSeconds] = useState(0);
  const [coordinates, setCoordinates] = useState(null);
  const [refDescriptor, setRefDescriptor] = useState(null);
  const [loadingText, setLoadingText] = useState("Loading...");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stopCamera = useCallback(() => {
    try {
      const v = videoRef.current;
      const s = streamRef.current || (v && v.srcObject) || null;
      if (s && typeof s.getTracks === "function") {
        s.getTracks().forEach(t => { try { t.stop(); } catch {} });
      }
      if (v) {
        try { v.pause(); } catch {}
        try { v.srcObject = null; } catch {}
        try { v.removeAttribute("src"); } catch {}
        try { v.load(); } catch {}
      }
      streamRef.current = null;
    } catch {}
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      setStatus("ready");
      setCoordinates(null);
      await new Promise(resolve => {
        const v = videoRef.current;
        if (!v) return resolve();
        if (v.readyState >= 2 && v.videoWidth && v.videoHeight) return resolve();
        const onPlay = () => { v.removeEventListener("playing", onPlay); resolve(); };
        v.addEventListener("playing", onPlay);
        setTimeout(resolve, 2500);
      });
    } catch {
      setStatus("cam-error");
      throw new Error("camera-start-failed");
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        setLoadingText("Preparing verification...");
        await loadModels();
        if (!mounted) return;
        setModelsReady(true);
        setLoadingText("");
        await startCamera();
      } catch {
        if (!mounted) return;
        setStatus("process-error");
      }
    }
    init();
    return () => {
      mounted = false;
      stopCamera();
      intervals.current.forEach(i => clearInterval(i));
      intervals.current = [];
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    async function computeRef() {
      if (!modelsReady || !profileImg) return;
      try {
        const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 160 });
        const refImg = await faceapi.fetchImage(profileImg);
        const det = await faceapi.detectSingleFace(refImg, options).withFaceLandmarks().withFaceDescriptor();
        if (det && det.descriptor) setRefDescriptor(det.descriptor);
        else setRefDescriptor(null);
      } catch {
        setRefDescriptor(null);
      }
    }
    computeRef();
  }, [modelsReady, profileImg]);

  const captureFrameToCanvas = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return false;
    const vw = v.videoWidth || v.clientWidth || 640;
    const vh = v.videoHeight || v.clientHeight || 480;
    if (!vw || !vh) return false;
    c.width = vw;
    c.height = vh;
    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0, vw, vh);
    return true;
  };

  const getCoordinates = () =>
    new Promise(resolve => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 5000 }
      );
    });

  const capture = async () => {
    if (!modelsReady || !refDescriptor || isSubmitting) return;
    setStatus("capturing");
    const drawn = captureFrameToCanvas();
    if (!drawn) {
      setStatus("process-error");
      return;
    }
    const data = canvasRef.current.toDataURL("image/png");
    setCaptured(data);
    const coords = await getCoordinates();
    setCoordinates(coords);
    stopCamera();
    setTimeout(() => compare(), 150);
  };

  const compare = async () => {
    try {
      if (!refDescriptor) {
        setStatus("process-error");
        return;
      }
      setStatus("verifying");
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 160 });
      const det = await faceapi.detectSingleFace(canvasRef.current, options).withFaceLandmarks().withFaceDescriptor();
      if (!det || !det.descriptor) {
        setStatus("not-matched");
        return;
      }
      const dist = faceapi.euclideanDistance(refDescriptor, det.descriptor);
      const d = Number(dist);
      setDistance(Number(d.toFixed(4)).toFixed(4));
      if (d <= 0.55) {
        setStatus("matched");
        startTimer();
      } else {
        setStatus("not-matched");
      }
    } catch {
      setStatus("process-error");
    }
  };

  const startTimer = () => {
    setSubmitSeconds(30);
    const iv = setInterval(() => {
      setSubmitSeconds(s => {
        if (s <= 1) {
          clearInterval(iv);
          handleClose();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    intervals.current.push(iv);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (!captured) {
        toast.error("No image captured");
        setIsSubmitting(false);
        return;
      }
      const file = dataUrlToFile(captured, "attendance.png");
      const lat = (coordinatesLatLon && coordinatesLatLon.lat) || (coordinates && coordinates.lat) || 0;
      const lon = (coordinatesLatLon && coordinatesLatLon.lon) || (coordinates && coordinates.lon) || 0;
      const payload = { attendanceType: mode || "CHECK_IN", latitude: lat, longitude: lon, file };
      console.log("payload", payload);
      const resp = await submitAttendanceAction(payload);
      if (resp?.data?.success) {
        intervals.current.forEach(i => clearInterval(i));
        stopCamera();
        // toast.success(resp.data.message || "Attendance submitted");
        onSuccess({ type: mode, coordinates: coordinatesLatLon || coordinates || null, captured, distance });
        return;
      } else {
        toast.error(resp?.data?.message || "Submission failed");
        setStatus("process-error");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Submission error");
      setStatus("process-error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    intervals.current.forEach(i => clearInterval(i));
    stopCamera();
    onCancel();
  };

  const retry = async () => {
    if (isSubmitting) return;
    setCaptured("");
    setStatus("ready");
    setDistance(null);
    try {
      await startCamera();
    } catch {}
  };

  const titleMap = {
    CHECK_IN: "Check-in verification",
    CHECK_OUT: "Checkout verification",
    BREAK_IN: "Start break verification",
    BREAK_OUT: "End break verification",
  };

  const displayTitle = titleMap[mode] || "Face verification";
  const showLive = !captured && (status === "ready" || status === "capturing");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60">
      <div className="w-full max-w-4xl mx-3 sm:mx-6">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
          {isSubmitting && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/70">
              <div className="flex flex-col items-center gap-3">
                <div className="loader h-10 w-10 border-4 rounded-full border-t-transparent animate-spin" />
                <div className="text-sm text-slate-700">Submitting...</div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-100">
            <div>
              <div className="text-sm sm:text-base font-semibold text-slate-900">{displayTitle}</div>
              <div className="text-[11px] text-slate-500">Keep your face centered. This takes about 2–3 seconds.</div>
            </div>
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>Close</Button>
          </div>

          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/3 border-b md:border-b-0 md:border-r border-slate-100 p-4 sm:p-5 flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                {showLive && (
                  <div className="w-full max-w-md">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-black shadow-sm">
                      <video ref={videoRef} autoPlay muted playsInline className="w-full h-[260px] sm:h-[320px] object-cover" />
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="h-40 w-40 sm:h-44 sm:w-44 rounded-full border-2 border-emerald-400/80" />
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                      <Button variant="primary" onClick={capture} disabled={!modelsReady || !refDescriptor || isSubmitting} className="flex-1 justify-center rounded-lg">
                        {modelsReady && refDescriptor ? "Capture & verify" : "Preparing..."}
                      </Button>
                      <Button variant="outline" onClick={handleClose} className="flex-1 justify-center rounded-lg" disabled={isSubmitting}>Cancel</Button>
                    </div>
                    {!!loadingText && (
                      <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        {loadingText}
                      </div>
                    )}
                  </div>
                )}

                {captured && (
                  <div className="flex flex-col items-center gap-4 w-full">
                    <div className="flex items-center justify-center gap-6">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase">Captured</div>
                        <img src={captured} alt="Captured" className="rounded-full w-24 h-24 sm:w-28 sm:h-28 object-cover border-4 border-emerald-300 shadow-sm" />
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase">Registered</div>
                        <img src={profileImg} alt="Profile" className="rounded-full w-24 h-24 sm:w-28 sm:h-28 object-cover border-4 border-slate-200 shadow-sm" />
                      </div>
                    </div>

                    {status === "matched" && (
                      <Button variant="primary" onClick={handleSubmit} className="mt-2 px-6 py-2 rounded-lg" disabled={isSubmitting}>Confirm & continue ({submitSeconds})</Button>
                    )}
                    {status === "not-matched" && (
                      <Button variant="outline" onClick={retry} className="mt-2 px-6 py-2 rounded-lg w-full sm:w-48" disabled={isSubmitting}>Try again</Button>
                    )}
                    {status === "process-error" && (
                      <Button variant="outline" onClick={retry} className="mt-2 px-6 py-2 rounded-lg w-full sm:w-48" disabled={isSubmitting}>Retry</Button>
                    )}
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>

            <div className="md:w-1/3 p-4 sm:p-5 flex flex-col gap-4 bg-slate-50">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-600 uppercase">Status</div>
                {status === "ready" && <div className="text-sm text-slate-700">Align your face inside the circle and tap <span className="font-semibold">Capture & verify</span>.</div>}
                {status === "capturing" && <div className="text-sm text-slate-700">Capturing image, hold still…</div>}
                {status === "verifying" && <div className="text-sm text-slate-700">Matching with your registered photo. This will be quick.</div>}
                {status === "matched" && <div className="text-sm text-emerald-700">Face verified. Complete within {submitSeconds}s.</div>}
                {status === "not-matched" && <div className="text-sm text-rose-700">Match failed. Ensure good lighting and your full face is visible.</div>}
                {status === "process-error" && <div className="text-sm text-rose-700">Could not verify. Retry or contact your administrator.</div>}
                {status === "cam-error" && <div className="text-sm text-rose-700">Camera access blocked. Enable it in browser settings.</div>}
              </div>

              {distance !== null && (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1">Match score</div>
                  <div className="flex items-baseline gap-2"><span className="text-lg font-semibold text-slate-900">{distance}</span><span className="text-[11px] text-slate-500">Threshold ≤ 0.55</span></div>
                </div>
              )}

              {(coordinates || coordinatesLatLon) && (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-[11px] text-slate-600">
                  <div className="font-semibold text-slate-500 mb-1 uppercase">Capture location</div>
                  <div>Lat: {(((coordinatesLatLon && coordinatesLatLon.lat) || (coordinates && coordinates.lat) || 0)).toFixed(5)}, Lon: {(((coordinatesLatLon && coordinatesLatLon.lon) || (coordinates && coordinates.lon) || 0)).toFixed(5)}</div>
                </div>
              )}

              <div className="mt-auto text-[11px] text-slate-500 leading-relaxed">Your face snapshot and location are used only to create a secure attendance log.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}