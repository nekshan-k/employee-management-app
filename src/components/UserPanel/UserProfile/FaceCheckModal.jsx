import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import Button from "../../ui/buttons/Button";

export default function FaceCheckModal({ profileImg, mode, onSuccess, onCancel }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const tempCanvasRef = useRef();
  const [modelsReady, setModelsReady] = useState(false);
  const [status, setStatus] = useState("ready");
  const [captured, setCaptured] = useState("");
  const [distance, setDistance] = useState(null);
  const [submitSeconds, setSubmitSeconds] = useState(0);
  const [coordinates, setCoordinates] = useState(null);
  const [animateMatch, setAnimateMatch] = useState(false);
  const intervals = useRef([]);
console.log(animateMatch);
  useEffect(() => {
    let mounted = true;
    async function load() {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      if (mounted) setModelsReady(true);
    }
    load();
    startCamera();
    return () => {
      mounted = false;
      stopCamera();
      intervals.current.forEach(i => clearInterval(i));
      intervals.current = [];
    };
  }, []);

  async function startCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = s;
      setStatus("ready");
      setCoordinates(null);
    } catch {
      setStatus("cam-error");
    }
  }

  function stopCamera() {
    try {
      const s = videoRef.current?.srcObject;
      s?.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch {}
  }

  function captureFrameToCanvas(ref) {
    const v = videoRef.current;
    const c = ref.current;
    const w = v.videoWidth;
    const h = v.videoHeight;
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0, w, h);
  }

  async function capture() {
    setStatus("capturing");
    captureFrameToCanvas(canvasRef);
    const data = canvasRef.current.toDataURL("image/png");
    setCaptured(data);
    setCoordinates(await getCoordinates());
    stopCamera();
    setAnimateMatch(true);
    setTimeout(() => compare(), 200);
  }

  async function getCoordinates() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 5000 }
      );
    });
  }

  async function compare() {
    setAnimateMatch(false);
    try {
      setStatus("verifying");
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224 });
      const ref = await faceapi.fetchImage(profileImg);
      const refDet = await faceapi.detectSingleFace(ref, options).withFaceLandmarks().withFaceDescriptor();
      const capDet = await faceapi.detectSingleFace(canvasRef.current, options).withFaceLandmarks().withFaceDescriptor();
      if (!refDet || !capDet) {
        setStatus("not-matched");
        return;
      }
      const dist = faceapi.euclideanDistance(refDet.descriptor, capDet.descriptor);
      setDistance(dist.toFixed(4));
      if (dist <= 0.55) {
        setStatus("matched");
        startTimer();
      } else {
        setStatus("not-matched");
      }
    } catch {
      setStatus("process-error");
    }
  }

  function startTimer() {
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
  }

  function handleSubmit() {
    intervals.current.forEach(i => clearInterval(i));
    stopCamera();
    onSuccess({ type: mode, coordinates });
    window.location.reload();
  }

  function handleClose() {
    intervals.current.forEach(i => clearInterval(i));
    stopCamera();
    onCancel();
    window.location.reload();
  }

  function retry() {
    setCaptured("");
    setStatus("ready");
    setDistance(null);
    startCamera();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center sm:overflow-auto">
      <div className="w-full max-w-lg md:max-w-4xl mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-6 bg-white rounded-xl shadow-md p-4 relative">
          <Button className="absolute right-3 top-3 bg-gray-200" onClick={handleClose}>Close</Button>
          <div className="flex-1 flex flex-col mt-10 items-center">
            {(!captured && (status === "ready" || status === "capturing")) && (
              <div className="relative w-full flex flex-col items-center">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-[424px] rounded object-cover bg-black border-4 border-indigo-200 shadow-md" />
                <div className="mt-3 flex justify-start gap-3">
                  <Button variant="primary" onClick={capture} disabled={!modelsReady}>Capture</Button>
                  <Button variant="outline" onClick={handleClose}>Cancel</Button>
                </div>
              </div>
            )}
            {captured && (
              <div className="w-full h-64 flex items-center justify-center gap-8">
                <img src={captured} alt="Captured" className="rounded-full w-32 h-32 object-cover border-4 border-green-300 shadow" />
                <img src={profileImg} alt="Profile" className="rounded-full w-32 h-32 object-cover border-4 border-gray-300 shadow" />
              </div>
            )}
            {(status === "matched" || status === "not-matched" || status === "process-error") && (
              <div className="mt-4 w-full text-center text-sm font-semibold text-gray-700">
                {status === "matched" && (
                  <>
                    <span className="text-green-800 text-lg">Identity verified. You may proceed.</span>
                    <div className="text-gray-600 mt-1">Verification score: {distance}</div>
                  </>
                )}
                {status === "not-matched" && (
                  <>
                    <span className="text-red-700 text-lg">Verification failed.</span>
                    <div className="text-gray-600 mt-1">Please ensure your face is visible and matches the registered profile photo.</div>
                  </>
                )}
                {status === "process-error" && (
                  <>
                    <span className="text-red-700 text-lg">A technical error occurred.</span>
                    <div className="text-gray-600 mt-1">Please retry or contact the administrator if problem continues.</div>
                  </>
                )}
              </div>
            )}
            {status === "matched" && (
              <div className="mt-2">
                <Button variant="primary" onClick={handleSubmit}>Submit ({submitSeconds})</Button>
              </div>
            )}
            {status === "not-matched" && (
              <div className="mt-2">
                <Button variant="outline" onClick={retry} className="w-full">Try Again</Button>
              </div>
            )}
            {coordinates && (
              <div className="mt-2 text-xs text-gray-600">
                Coordinates: {coordinates.lat.toFixed(5)}, {coordinates.lon.toFixed(5)}
              </div>
            )}
            {distance !== null && status === "matched" && (
              <div className="mt-1 text-xs text-green-700">
                Verification score: {distance}
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <canvas ref={tempCanvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}
