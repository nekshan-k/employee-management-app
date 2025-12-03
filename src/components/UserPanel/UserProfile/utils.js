export const BREAK_MINUTES = 30;
export const DEFAULT_RADIUS = 500;
const toRad = x => (x * Math.PI) / 180;
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
export const fmt = ms => {
  const s = Math.floor((ms || 0) / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
};
const parseTs = t => (t ? Date.parse(t) : null);
export function computeTodayStatusFromData(data) {
  if (!data || !Array.isArray(data.sessions) || data.sessions.length === 0) {
    return { checkedIn: false, checkedInAt: null, checkedOutAt: null, breakTakenMs: 0, breakSessionStart: null, totalWorkedMs: 0, halfDay: false, totalIncludingBreaksMs: 0, workedWithoutBreakMs: 0 };
  }
  const now = Date.now();
  const sessions = [...data.sessions].sort((a, b) => (parseTs(a.checkIn) || 0) - (parseTs(b.checkIn) || 0));
  let earliest = null;
  let lastOut = null;
  let totalWork = 0;
  let totalBreak = 0;
  let runningSession = false;
  let runningBreakStart = null;
  sessions.forEach(s => {
    const inTs = parseTs(s.checkIn);
    if (!inTs) return;
    const outTs = parseTs(s.checkOut);
    const end = outTs || now;
    if (earliest === null || inTs < earliest) earliest = inTs;
    if (outTs && (!lastOut || outTs > lastOut)) lastOut = outTs;
    if (!outTs) runningSession = true;
    let sessionBreak = 0;
    let openBreak = null;
    if (Array.isArray(s.breaks)) {
      s.breaks.forEach(b => {
        const bs = parseTs(b.breakStartTime);
        const be = parseTs(b.breakEndTime);
        if (bs && be) sessionBreak += Math.max(0, be - bs);
        else if (bs && !be) openBreak = bs;
      });
    }
    if (openBreak) {
      const openMs = Math.max(0, end - openBreak);
      sessionBreak += openMs;
      if (!outTs && (!runningBreakStart || openBreak > runningBreakStart)) runningBreakStart = openBreak;
    }
    const raw = Math.max(0, end - inTs);
    const effective = Math.max(0, raw - sessionBreak);
    totalWork += effective;
    totalBreak += sessionBreak;
  });
  const breakCreditMs = BREAK_MINUTES * 60000;
  const workedWithoutBreakMs = totalWork;
  const breakTakenMs = totalBreak;
  const totalIncludingBreaksMs = breakTakenMs <= breakCreditMs ? workedWithoutBreakMs + breakCreditMs : workedWithoutBreakMs + breakTakenMs;
  const halfDay = breakTakenMs > breakCreditMs;
  return {
    checkedIn: runningSession,
    checkedInAt: earliest,
    checkedOutAt: runningSession ? null : lastOut,
    breakTakenMs,
    breakSessionStart: runningBreakStart,
    totalWorkedMs: workedWithoutBreakMs,
    halfDay,
    workedWithoutBreakMs,
    totalIncludingBreaksMs
  };
}
