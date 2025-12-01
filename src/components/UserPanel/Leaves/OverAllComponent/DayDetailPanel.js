import React, { useMemo } from "react";
import SidePanel from "../../../ui/SidePanel";
import { CiDesktop } from "react-icons/ci";
import { PiUserFill } from "react-icons/pi";

export default function DayDetailPanel({ open, onClose, date }) {
  const header = useMemo(() => {
    const d = date || new Date(2025, 10, 24);
    const label = d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return `${label}, General [12:30 - 20:30]`;
  }, [date]);

  const location =
    "Trikuta Nagar, Jammu, Jammu district, Jammu and Kashmir, 180012, India";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    location
  )}`;

  const pairs = [
    {
      id: 1,
      type: "work",
      left: { time: "12:26", label: "Check-In", color: "text-secondary600" },
      right: { time: "15:06", label: "Check-Out", color: "text-firebrick" },
    },
    {
      id: 2,
      type: "break",
      left: { time: "15:06", label: "Break In", color: "text-secondary600" },
      right: { time: "15:24", label: "Break Out", color: "text-firebrick" },
    },
    {
      id: 3,
      type: "work",
      left: { time: "15:24", label: "Check-In", color: "text-secondary600" },
      right: { time: "20:42", label: "Check-Out", color: "text-firebrick" },
    },
  ];

  const ViewMap = ({ align }) => (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-[11px] text-primary500 font-semibold mt-1 ${
        align === "right" ? "sm:text-right" : ""
      }`}
    >
      View map
    </a>
  );

  const Avatar = () => (
    <div className="pt-1">
      <div className="h-8 w-8 rounded-full bg-bg100 border border-border flex items-center justify-center">
        <PiUserFill className="text-neutral400 text-sm" />
      </div>
    </div>
  );

  const WorkPairCard = ({ left, right }) => (
    <div className="rounded-2xl bg-white border border-border shadow-sm px-4 py-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-1 gap-3">
          <Avatar />
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2">
              <CiDesktop className="text-primary500 text-lg" />
              <span className={`${left.color} font-semibold`}>{left.time}</span>
              <span className="text-neutral400">{left.label}</span>
            </div>
            <div className="text-[11px] text-neutral400 leading-snug">
              {location}
            </div>
            <ViewMap />
          </div>
        </div>
        <div className="flex flex-1 gap-3 sm:justify-end">
          <div className="flex flex-col gap-1 text-xs sm:items-end">
            <div className="flex items-center gap-2 sm:justify-end">
              <CiDesktop className="text-primary500 text-lg" />
              <span className={`${right.color} font-semibold`}>
                {right.time}
              </span>
              <span className="text-neutral400">{right.label}</span>
            </div>
            <div className="text-[11px] text-neutral400 sm:text-right leading-snug">
              {location}
            </div>
            <ViewMap align="right" />
          </div>
          <Avatar />
        </div>
      </div>
    </div>
  );

  const BreakPairCard = ({ left, right }) => (
    <div className="rounded-2xl bg-white border border-border shadow-sm px-4 py-3">
      <div className="flex items-center justify-between gap-4 border-b border-dashed border-border pb-2 mb-3 text-xs">
        <div className="flex items-center gap-2 text-neutral500">
          <CiDesktop className="text-primary500 text-lg" />
          <span className={`${left.color} font-semibold`}>{left.time}</span>
          <span className="text-neutral400">{left.label}</span>
        </div>
        <div className="flex-1 text-center text-neutral500 font-semibold text-[11px]">
          BREAK - 18 Min(s)
        </div>
        <div className="flex items-center gap-2 text-neutral500">
          <span className={`${right.color} font-semibold`}>{right.time}</span>
          <span className="text-neutral400">{right.label}</span>
          <CiDesktop className="text-primary500 text-lg" />
        </div>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-1 gap-3">
          <Avatar />
          <div className="flex flex-col gap-1 text-xs">
            <div className="text-[11px] text-neutral400 leading-snug">
              {location}
            </div>
            <ViewMap />
          </div>
        </div>
        <div className="flex flex-1 gap-3 sm:justify-end">
          <div className="flex flex-col gap-1 text-xs sm:items-end">
            <div className="text-[11px] text-neutral400 sm:text-right leading-snug">
              {location}
            </div>
            <ViewMap align="right" />
          </div>
          <Avatar />
        </div>
      </div>
      <div className="mt-3 inline-flex px-3 py-2 rounded-md bg-bg100 border border-border text-[11px] text-neutral500">
        Manual Break
      </div>
    </div>
  );

  const PairCard = ({ type, left, right }) =>
    type === "break" ? (
      <BreakPairCard left={left} right={right} />
    ) : (
      <WorkPairCard left={left} right={right} />
    );

  return (
    <SidePanel open={open} onClose={onClose} title={header} subtitle="" zIndex={50}>
      <div className="min-h-full flex flex-col bg-bg50">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 pb-24">
          {pairs.map((p) => (
            <PairCard key={p.id} type={p.type} left={p.left} right={p.right} />
          ))}
        </div>
        <div className="sticky bottom-2 bg-white border border-border">
          <div className="rounded-t-2xl bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-4 text-[11px]">
              <div className="flex flex-col gap-1 px-4 py-3 border-r border-border">
                <span className="text-neutral300">First Check-In</span>
                <span className="flex items-center gap-2 text-neutral500 font-semibold">
                  <span className="h-1.5 w-6 rounded-full bg-secondary500" />
                  12 : 26
                </span>
              </div>
              <div className="flex flex-col gap-1 px-4 py-3 border-r border-border">
                <span className="text-neutral300">Last Check-Out</span>
                <span className="flex items-center gap-2 text-neutral500 font-semibold">
                  <span className="h-1.5 w-6 rounded-full bg-firebrick" />
                  20 : 42
                </span>
              </div>
              <div className="flex flex-col gap-1 px-4 py-3 border-r border-border">
                <span className="text-neutral300">Total Hours</span>
                <span className="flex items-center gap-2 text-neutral500 font-semibold">
                  <span className="h-1.5 w-6 rounded-full bg-primary500" />
                  07:58 Hrs
                </span>
              </div>
              <div className="flex flex-col gap-1 px-4 py-3">
                <span className="text-neutral300">Paid break</span>
                <span className="flex items-center gap-2 text-neutral500 font-semibold">
                  <span className="h-1.5 w-6 rounded-full bg-selected" />
                  00:18 Hrs
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidePanel>
  );
}
