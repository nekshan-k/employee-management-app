import React from "react";
import SidePanel from "../../../ui/SidePanel";
import { MdDesktopMac } from "react-icons/md";

const auditItems = [
  { time: "20:42", text: "checked out", type: "checkout" },
  { time: "15:24", text: "ended break : BREAK", type: "endBreak", detail: "To 15:24" },
  { time: "15:24", text: "checked in", type: "checkin" },
  { time: "15:06", text: "started break : BREAK", type: "startBreak", detail: "From 15:06" },
  { time: "15:06", text: "checked out", type: "checkout" },
  { time: "12:26", text: "checked in", type: "checkin" },
];

export default function AuditHistoryPanel({ open, onClose }) {
  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title="Audit History"
      subtitle=""
      zIndex={60}
    >
      <div className="px-4 sm:px-6 py-4">
        <div className="rounded-xl bg-bg50 border border-border overflow-hidden">
          <div className="px-4 py-3 text-xs font-semibold text-neutral500 border-b border-border">
            24-Nov-2025
          </div>
          <div className="px-4 py-4">
            <div className="text-xs font-semibold text-neutral500 mb-3">
              24-Nov-2025
            </div>
            <div className="relative pl-6">
              <div className="absolute left-1 top-1 bottom-4 border-l border-border z-0" />
              <div className="space-y-6">
                {auditItems.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="w-14 text-xs text-neutral400">{item.time}</div>
                    <div className="relative">
                      <div className="h-3 w-3 rounded-full border-2 border-primary500 bg-white absolute -left-2 top-1 z-10" />
                    </div>
                    <div className="flex-1 text-xs text-neutral500">
                      <span className="inline-flex items-center gap-1">
                        <span className="text-primary500 font-semibold">NEKSHAN KUMAR</span>
                        <MdDesktopMac className="text-primary500 text-sm mb-0.5" />
                      </span>
                      <span className="text-neutral500 ml-1">{item.text}</span>
                      {["startBreak", "endBreak"].includes(item.type) && (
                        <span className="bg-bg100 border border-border rounded px-2 py-1 text-[11px] ml-3 inline-flex gap-2 items-center">
                          <MdDesktopMac className="text-neutral400 text-xs" />
                          Manual Break
                        </span>
                      )}
                      {item.detail && (
                        <div className="mt-2 inline-flex items-center rounded-md bg-bg100 border border-border px-3 py-2 text-[11px]">
                          <div className="flex flex-col gap-1">
                            <div className="text-neutral300">
                              {item.detail.startsWith("From") ? "From" : "To"}
                            </div>
                            <div className="text-neutral500 font-semibold">
                              {item.detail.replace(/From |To /, "")}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="px-4 py-3 text-[11px] text-neutral300 border-t border-border">
            22-Nov-2025
          </div>
        </div>
      </div>
    </SidePanel>
  );
}
