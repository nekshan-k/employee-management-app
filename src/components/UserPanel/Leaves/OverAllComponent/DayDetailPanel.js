import React, { useMemo, useState, useEffect, useCallback } from "react";
import SidePanel from "../../../ui/SidePanel";
import { CiDesktop } from "react-icons/ci";
import { PiUserFill } from "react-icons/pi";

async function fetchAddress(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );
    const data = await res.json();
    return data?.display_name || "Address not found";
  } catch {
    return "Address not found";
  }
}

export default function DayDetailPanel({ open, onClose, date, events = [], loading = false }) {
  const [imgModal, setImgModal] = useState({ open: false, images: [] });
  const [addressMap, setAddressMap] = useState({});
  const [addressLoading, setAddressLoading] = useState({});
console.log("events",  events);
  const collectCoords = useCallback(() => {
    const out = [];
    events.forEach(ev =>
      ev.sessions?.forEach(s => {
        const inKey = `in-${s.id}`;
        if (typeof s.checkInLat === "number" && typeof s.checkInLon === "number")
          out.push({ key: inKey, lat: s.checkInLat, lon: s.checkInLon });

        let outLat = s.checkOutLat;
        let outLon = s.checkOutLon;

        if (!outLat || !outLon) {
          const lastBreak = s.breaks?.length ? s.breaks[s.breaks.length - 1] : null;
          if (lastBreak?.breakEndLat && lastBreak?.breakEndLon) {
            outLat = lastBreak.breakEndLat;
            outLon = lastBreak.breakEndLon;
          }
        }

        if (s.checkOut) {
          const outKey = `out-${s.id}`;
          out.push({ key: outKey, lat: outLat, lon: outLon });
        }

        s.breaks?.forEach(b => {
          const beKey = `be-${b.id}`;
          if (typeof b.breakEndLat === "number" && typeof b.breakEndLon === "number")
            out.push({ key: beKey, lat: b.breakEndLat, lon: b.breakEndLon });
        });
      })
    );
    return out;
  }, [events]);

  useEffect(() => {
    if (!open || !events.length) return;
    const coords = collectCoords();
    const tasks = coords.filter(c => !addressMap[c.key]);
    if (!tasks.length) return;
    tasks.forEach(t => {
      setAddressLoading(prev => ({ ...prev, [t.key]: true }));
      fetchAddress(t.lat, t.lon).then(addr => {
        setAddressMap(prev => ({ ...prev, [t.key]: addr }));
        setAddressLoading(prev => ({ ...prev, [t.key]: false }));
      });
    });
  }, [open, events, collectCoords, addressMap]);

  const header = useMemo(() => {
    const d = date || new Date();
    const label = d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
    return `${label}, General [12:30 - 20:30]`;
  }, [date]);

  const fmt = ts =>
    ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";

  const viewMapUrl = (lat, lon) =>
    typeof lat === "number" && typeof lon === "number"
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
      : null;

  const Avatar = ({ onClick }) => (
    <div className="pt-1" onClick={onClick}>
      <div className="h-8 w-8 rounded-full bg-bg100 border border-border flex items-center justify-center cursor-pointer">
        <PiUserFill className="text-neutral400 text-sm" />
      </div>
    </div>
  );

  const AddressBlock = ({ keyName }) => {
    const isLoading = addressLoading[keyName];
    const addr = addressMap[keyName];
    return (
      <div className="text-[11px] text-neutral400 leading-snug">
        {isLoading ? (
          <span className="text-primary500">Fetching address...</span>
        ) : addr ? (
          addr
        ) : (
          "Address not found"
        )}
      </div>
    );
  };

  const WorkPairCard = ({ session }) => {
    const inKey = `in-${session.id}`;
    const outKey = `out-${session.id}`;
    const mapIn = viewMapUrl(session.checkInLat, session.checkInLon);

    let outLat = session.checkOutLat;
    let outLon = session.checkOutLon;

    if (!outLat || !outLon) {
      const lastBreak = session.breaks?.length ? session.breaks[session.breaks.length - 1] : null;
      if (lastBreak?.breakEndLat) {
        outLat = lastBreak.breakEndLat;
        outLon = lastBreak.breakEndLon;
      }
    }

    const mapOut = viewMapUrl(outLat, outLon);

    return (
      <div className="rounded-2xl bg-white border border-border shadow-sm px-4 py-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-1 gap-3">
            <Avatar
              onClick={() =>
                session.checkInPhotoUrl && setImgModal({ open: true, images: [session.checkInPhotoUrl] })
              }
            />
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-2">
                <CiDesktop className="text-primary500 text-lg" />
                <span className="text-secondary600 font-semibold">{fmt(session.checkIn)}</span>
                <span className="text-neutral400">Check-In</span>
              </div>
              <AddressBlock keyName={inKey} />
              {mapIn && (
                <a href={mapIn} target="_blank" rel="noreferrer"
                   className="text-[11px] text-primary500 font-semibold mt-1">
                  View map
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-1 gap-3 sm:justify-end">
            <div className="flex flex-col gap-1 text-xs sm:items-end">
              <div className="flex items-center gap-2 sm:justify-end">
                <CiDesktop className="text-primary500 text-lg" />
                <span className="text-firebrick font-semibold">
                  {session.checkOut ? fmt(session.checkOut) : "Running"}
                </span>
                <span className="text-neutral400">Check-Out</span>
              </div>
              <AddressBlock keyName={outKey} />
              {mapOut && (
                <a
                  href={mapOut}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-primary500 font-semibold mt-1 sm:text-right"
                >
                  View map
                </a>
              )}
            </div>
            <Avatar
              onClick={() =>
                session.checkOutPhotoUrl &&
                setImgModal({ open: true, images: [session.checkOutPhotoUrl] })
              }
            />
          </div>
        </div>
      </div>
    );
  };

  const BreakPairCard = ({ b }) => {
    const endKey = `be-${b.id}`;
    const mapEnd = viewMapUrl(b.breakEndLat, b.breakEndLon);

    return (
      <div className="rounded-2xl bg-white border border-border shadow-sm px-4 py-3">
        <div className="flex items-center justify-between gap-4 border-b border-dashed border-border pb-2 mb-3 text-xs">
          <div className="flex items-center gap-2 text-neutral500">
            <Avatar onClick={() => setImgModal({ open: true, images: [b.breakStartPhotoUrl] })} />
            <span className="text-secondary600 font-semibold">{fmt(b.breakStartTime)}</span>
            <span className="text-neutral400">Break In</span>
          </div>
          <div className="flex-1 text-center text-neutral500 font-semibold text-[11px]">
            BREAK - {b.durationMinutes} Min(s)
          </div>
          <div className="flex items-center gap-2 text-neutral500">
            <span className="text-firebrick font-semibold">{fmt(b.breakEndTime)}</span>
            <span className="text-neutral400">Break Out</span>
            <Avatar onClick={() => setImgModal({ open: true, images: [b.breakEndPhotoUrl] })} />
          </div>
        </div>
        <AddressBlock keyName={endKey} />
        {mapEnd && (
          <a href={mapEnd} target="_blank" rel="noreferrer"
             className="text-[11px] text-primary500 font-semibold mt-1">
            View map
          </a>
        )}
      </div>
    );
  };

  const pairs = useMemo(() => {
    const out = [];
    events.forEach(ev =>
      ev.sessions?.forEach(s => {
        out.push({ type: "work", session: s });
        s.breaks?.forEach(b => out.push({ type: "break", break: b }));
      })
    );
    return out;
  }, [events]);

  return (
    <SidePanel open={open} onClose={onClose} title={header} subtitle="" zIndex={50}>
      <div className="min-h-full flex flex-col bg-bg50">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 pb-24">
          {!loading &&
            pairs.map((p, i) =>
              p.type === "work" ? (
                <WorkPairCard key={i} session={p.session} />
              ) : (
                <BreakPairCard key={i} b={p.break} />
              )
            )}
        </div>
      </div>
      {imgModal.open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 p-4"
          onClick={() => setImgModal({ open: false, images: [] })}
        >
          <div className="max-w-xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            {imgModal.images.map((img, i) => (
              <img key={i} src={img} className="w-full h-auto rounded-lg shadow-2xl mb-4" alt="" />
            ))}
          </div>
        </div>
      )}
    </SidePanel>
  );
}
