import React from "react";
import { HiOutlineX } from "react-icons/hi";

export default function SidePanel({
  open,
  onClose,
  title,
  subtitle,
  rightSlot,
  children,
  zIndex = 50,
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 flex top-[-16px] justify-end bg-black/30"
      style={{ zIndex }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl h-full bg-white shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-bg50">
          <div className="flex flex-col">
            {title && <div className="text-sm font-semibold text-neutral500">{title}</div>}
            {subtitle && <div className="text-xs text-neutral300">{subtitle}</div>}
          </div>
          <div className="flex items-center gap-3">
            {rightSlot}
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-bg100 text-neutral400"
            >
              <HiOutlineX className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-white">{children}</div>
      </div>
    </div>
  );
}
