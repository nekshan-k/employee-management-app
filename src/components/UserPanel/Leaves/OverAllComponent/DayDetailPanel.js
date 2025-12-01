import React, { useMemo, useState, useEffect } from "react";
import SidePanel from "../../../ui/SidePanel";
import { CiDesktop } from "react-icons/ci";
import { PiUserFill } from "react-icons/pi";

async function fetchAddress(lat, lon) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const data = await res.json();
    return data?.display_name || "Address not available";
  } catch {
    return "Unable to fetch address";
  }
}

export default function DayDetailPanel({ open, onClose, date, events = [], loading = false }) {
  const [imgModal, setImgModal] = useState({ open: false, images: [] });
  const [addressMap, setAddressMap] = useState({});

  useEffect(() => {
    if (!open || !events.length) return;

    const tasks = [];
    events.forEach(ev =>
      ev.sessions?.forEach(s => {
        if (typeof s.checkInLat === "number" && typeof s.checkInLon === "number") {
          const key = `in-${s.id}`;
          if (!addressMap[key]) tasks.push({ key, lat: s.checkInLat, lon: s.checkInLon });
        }
        if (typeof s.checkOutLat === "number" && typeof s.checkOutLon === "number") {
          const key = `out-${s.id}`;
          if (!addressMap[key]) tasks.push({ key, lat: s.checkOutLat, lon: s.checkOutLon });
        }
        s.breaks?.forEach(b => {
          if (typeof b.breakEndLat === "number" && typeof b.breakEndLon === "number") {
            const key = `be-${b.id}`;
            if (!addressMap[key]) tasks.push({ key, lat: b.breakEndLat, lon: b.breakEndLon });
          }
        });
      })
    );

    if (!tasks.length) return;

    Promise.all(tasks.map(t => fetchAddress(t.lat, t.lon).then(addr => ({ key: t.key, addr }))))
      .then(results => {
        setAddressMap(prev => {
          const next = { ...prev };
          results.forEach(r => {
            next[r.key] = r.addr;
          });
          return next;
        });
      });
  }, [open, events, addressMap]);

  const header = useMemo(() => {
    const d = date || new Date();
    const label = d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return `${label}, General [12:30 - 20:30]`;
  }, [date]);

  const fmt = ts => {
    if (!ts) return "-";
    try {
      return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "-";
    }
  };

  const viewMapUrl = (lat, lon) =>
    typeof lat === "number" && typeof lon === "number"
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lon}`)}`
      : null;

  const Avatar = ({ onClick }) => (
    <div className="pt-1" onClick={onClick}>
      <div className="h-8 w-8 rounded-full bg-bg100 border border-border flex items-center justify-center cursor-pointer">
        <PiUserFill className="text-neutral400 text-sm" />
      </div>
    </div>
  );

  const WorkPairCard = ({ session }) => {
    const addrInKey = `in-${session.id}`;
    const addrOutKey = `out-${session.id}`;
    const addrIn = addressMap[addrInKey] || "Address not available";
    const addrOut = addressMap[addrOutKey] || "Address not available";
    const mapIn = viewMapUrl(session.checkInLat, session.checkInLon);
    const mapOut = viewMapUrl(session.checkOutLat, session.checkOutLon);

    return (
      <div className="rounded-2xl bg-white border border-border shadow-sm px-4 py-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-1 gap-3">
            <Avatar onClick={() => session.checkInPhotoUrl && setImgModal({ open: true, images: [session.checkInPhotoUrl] })} />
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-2">
                <CiDesktop className="text-primary500 text-lg" />
                <span className="text-secondary600 font-semibold">{fmt(session.checkIn)}</span>
                <span className="text-neutral400">Check-In</span>
              </div>
              <div className="text-[11px] text-neutral400 leading-snug">{addrIn}</div>
              {mapIn && (
                <a
                  href={mapIn}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[11px] text-primary500 font-semibold mt-1"
                >
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
              <div className="text-[11px] text-neutral400 sm:text-right leading-snug">{addrOut}</div>
              {mapOut && (
                <a
                  href={mapOut}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[11px] text-primary500 font-semibold mt-1 sm:text-right"
                >
                  View map
                </a>
              )}
            </div>
            <Avatar
              onClick={() =>
                session.checkOutPhotoUrl && setImgModal({ open: true, images: [session.checkOutPhotoUrl] })
              }
            />
          </div>
        </div>
      </div>
    );
  };

  const BreakPairCard = ({ b }) => {
    const addrEndKey = `be-${b.id}`;
    const addrEnd = addressMap[addrEndKey] || "Address not available";
    const mapEnd = viewMapUrl(b.breakEndLat, b.breakEndLon);

    return (
      <div className="rounded-2xl bg-white border border-border shadow-sm px-4 py-3">
        <div className="flex items-center justify-between gap-4 border-b border-dashed border-border pb-2 mb-3 text-xs">
          <div className="flex items-center gap-2 text-neutral500">
            <Avatar
              onClick={() =>
                b.breakStartPhotoUrl && setImgModal({ open: true, images: [b.breakStartPhotoUrl] })
              }
            />
            <span className="text-secondary600 font-semibold">{fmt(b.breakStartTime)}</span>
            <span className="text-neutral400">Break In</span>
          </div>
          <div className="flex-1 text-center text-neutral500 font-semibold text-[11px]">
            BREAK - {(b.durationMinutes || "-") + " Min(s)"}
          </div>
          <div className="flex items-center gap-2 text-neutral500">
            <span className="text-firebrick font-semibold">{fmt(b.breakEndTime)}</span>
            <span className="text-neutral400">Break Out</span>
            <Avatar
              onClick={() =>
                b.breakEndPhotoUrl && setImgModal({ open: true, images: [b.breakEndPhotoUrl] })
              }
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-1 gap-3">
            <div className="flex flex-col gap-1 text-xs">
              <div className="text-[11px] text-neutral400 leading-snug">{addrEnd}</div>
              {mapEnd && (
                <a
                  href={mapEnd}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[11px] text-primary500 font-semibold mt-1"
                >
                  View map
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 inline-flex px-3 py-2 rounded-md bg-bg100 border border-border text-[11px] text-neutral500">
          Manual Break
        </div>
      </div>
    );
  };

  const pairs = useMemo(() => {
    if (!events || !events.length) return [];
    const out = [];
    events.forEach(ev =>
      ev.sessions?.forEach(s => {
        out.push({ type: "work", session: s });
        s.breaks?.forEach(b => out.push({ type: "break", break: b }));
      })
    );
    if (!out.length) out.push({ type: "none" });
    return out;
  }, [events]);

  return (
    <SidePanel open={open} onClose={onClose} title={header} subtitle="" zIndex={50}>
      <div className="min-h-full flex flex-col bg-bg50">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 pb-24">
          {loading && <div className="text-sm text-neutral400">Loading...</div>}
          {!loading &&
            pairs.map((p, idx) =>
              p.type === "break" ? (
                <BreakPairCard key={`b-${idx}`} b={p.break} />
              ) : p.type === "work" ? (
                <WorkPairCard key={`w-${idx}`} session={p.session} />
              ) : null
            )}
        </div>
        <div className="sticky bottom-2 bg-white border border-border">
          <div className="rounded-t-2xl bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-4 text-[11px]">
              <div className="flex flex-col gap-1 px-4 py-3 border-r border-border">
                <span className="text-neutral300">First Check-In</span>
                <span className="flex items-center gap-2 text-neutral500 font-semibold">
                  <span className="h-1.5 w-6 rounded-full bg-secondary500" />
                  {events?.[0]?.sessions?.[0]?.checkIn
                    ? new Date(events[0].sessions[0].checkIn).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </span>
              </div>
              <div className="flex flex-col gap-1 px-4 py-3 border-r border-border">
                <span className="text-neutral300">Last Check-Out</span>
                <span className="flex items-center gap-2 text-neutral500 font-semibold">
                  <span className="h-1.5 w-6 rounded-full bg-firebrick" />
                  {(() => {
                    for (let i = events?.length - 1; i >= 0; i--) {
                      const s = events[i].sessions?.slice().reverse()?.find(x => x.checkOut);
                      if (s?.checkOut) {
                        return new Date(s.checkOut).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      }
                    }
                    return "-";
                  })()}
                </span>
              </div>
              <div className="flex flex-col gap-1 px-4 py-3 border-r border-border">
                <span className="text-neutral300">Total Hours</span>
                <span className="flex items-center gap-2 text-neutral500 font-semibold">
                  <span className="h-1.5 w-6 rounded-full bg-primary500" />
                  {(() => {
                    const total = events?.reduce((acc, ev) => acc + (ev.totalMinutes || 0), 0);
                    const hh = String(Math.floor((total || 0) / 60)).padStart(2, "0");
                    const mm = String((total || 0) % 60).padStart(2, "0");
                    return `${hh}:${mm} Hrs`;
                  })()}
                </span>
              </div>
              <div className="flex flex-col gap-1 px-4 py-3">
                <span className="text-neutral300">Paid break</span>
                <span className="flex items-center gap-2 text-neutral500 font-semibold">
                  <span className="h-1.5 w-6 rounded-full bg-selected" />
                  {(() => {
                    const totalBreak = events?.reduce((acc, ev) => {
                      const smins =
                        ev.sessions?.reduce((as, s) => {
                          const bms =
                            s.breaks?.reduce(
                              (ab, b) => ab + (typeof b.durationMinutes === "number" ? b.durationMinutes : 0),
                              0
                            ) || 0;
                          return as + bms;
                        }, 0) || 0;
                      return acc + smins;
                    }, 0);
                    const hh = String(Math.floor((totalBreak || 0) / 60)).padStart(2, "0");
                    const mm = String((totalBreak || 0) % 60).padStart(2, "0");
                    return `${hh}:${mm} Hrs`;
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {imgModal.open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 p-4"
          onClick={() => setImgModal({ open: false, images: [] })}
        >
          <div className="max-w-xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            {imgModal.images.map((img, idx) => (
              <img key={idx} src={img} alt="" className="w-full h-auto rounded-lg shadow-2xl mb-4" />
            ))}
          </div>
        </div>
      )}
    </SidePanel>
  );
}
