import React from "react";

export function formatDateToDDMMYYYY(value) {
  if (!value) return "";
  const d = typeof value === "string" || typeof value === "number" ? new Date(value) : value;
  if (!(d instanceof Date) || isNaN(d)) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function FormattedDate({ date, fallback = "-" }) {
  const formatted = formatDateToDDMMYYYY(date);
  return <span>{formatted || fallback}</span>;
}
