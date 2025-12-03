import React from "react";

const styles = {
  ACTIVE: {
    dot: "bg-green-500",
    text: "text-green-700 bg-green-50 border-green-200"
  },
  INACTIVE: {
    dot: "bg-yellow-400",
    text: "text-yellow-700 bg-yellow-50 border-yellow-200"
  },
  DELETED: {
    dot: "bg-red500",
    text: "text-red700 bg-red100 border-red200"
  }
};

export default function StatusBadge({ type, label }) {
  const variant = styles[type] || styles.ACTIVE;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${variant.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${variant.dot}`} />
      <span>{label}</span>
    </span>
  );
}
