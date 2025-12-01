import React, { useEffect, useRef, useState } from "react";

export default function ReusableDataTable({ columns = [], data = [], className = "" }) {
  const containerRef = useRef(null);
  const headerCellRefs = useRef([]);
  const [leftOffsets, setLeftOffsets] = useState([]);

  useEffect(() => {
    headerCellRefs.current = headerCellRefs.current.slice(0, columns.length);

    const measure = () => {
      const offsets = [];
      let acc = 0;
      for (let i = 0; i < columns.length; i++) {
        offsets.push(acc);
        const el = headerCellRefs.current[i];
        const w = el ? Math.ceil(el.getBoundingClientRect().width) : 0;
        acc += w;
      }
      setLeftOffsets(offsets);
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [columns]);

  const stickyCount = Math.min(2, columns.length);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto scrollbar-hide bg-white rounded-lg border border-border ${className}`}
      style={{ WebkitOverflowScrolling: "touch", scrollBehavior: "smooth" }}
    >
      <table className="w-full table-auto text-xs">
        <thead className="bg-bg50">
          <tr>
            {columns.map((col, idx) => {
              const isDateCol = col.accessor && col.accessor.startsWith("d_");
              const isSticky = idx < stickyCount;

              const left = isSticky ? leftOffsets[idx] ?? 0 : undefined;
              const minW = isDateCol ? 56 : col.minWidth || undefined;

              const thStyle = isSticky
                ? { position: "sticky", left, zIndex: 40, background: "white", minWidth: minW }
                : { minWidth: minW };

              const thClass = `${isSticky ? "px-3 py-2 text-left" : isDateCol ? "px-1 py-1 text-center" : "px-2 py-2 text-left"} font-medium text-neutral500`;

              return (
                <th
                  key={col.accessor ?? col.header ?? idx}
                  ref={(el) => (headerCellRefs.current[idx] = el)}
                  className={thClass}
                  style={thStyle}
                >
                  {typeof col.header === "function" ? col.header() : col.header}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-6 text-center text-neutral400">
                No data available
              </td>
            </tr>
          )}

          {data.map((row, rIdx) => (
            <tr
              key={rIdx}
              className={rIdx % 2 === 0 ? "bg-white" : "bg-foundation-neurtal-neurtal-50"}
            >
              {columns.map((col, cIdx) => {
                const isDateCol = col.accessor && col.accessor.startsWith("d_");
                const isSticky = cIdx < stickyCount;

                const left = isSticky ? leftOffsets[cIdx] ?? 0 : undefined;
                const minW = isDateCol ? 56 : col.minWidth || undefined;

                const tdStyle = isSticky
                  ? { position: "sticky", left, zIndex: 30, background: "white", minWidth: minW }
                  : { minWidth: minW };

                const cellContent = col.cell ? col.cell(row) : row[col.accessor];

                const tdClass = `${isSticky ? "px-3 py-2" : isDateCol ? "px-1 py-1 text-center" : "px-2 py-2"} align-top`;

                return (
                  <td
                    key={col.accessor ?? col.header ?? cIdx}
                    className={tdClass}
                    style={tdStyle}
                  >
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
