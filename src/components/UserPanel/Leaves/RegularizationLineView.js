import React from "react";

export default function RegularizationLineView({ events, title, subtitle }) {
  return (
    <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral700">{title}</h2>
          {subtitle && (
            <p className="text-11px text-neutral400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="px-5 py-4 text-xs text-neutral400">
        Line view content goes here (per-day horizontal bars and hours like the reference UI).
      </div>
    </div>
  );
}
