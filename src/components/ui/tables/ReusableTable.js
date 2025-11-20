import { useState, useMemo } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

export default function ReusableTable({ columnsDef, data, actions }) {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const sortedData = useMemo(() => {
    let filtered = data.filter(item =>
      Object.values(item).some(v =>
        String(v).toLowerCase().includes(search.toLowerCase())
      )
    );
    if (!sortConfig.key) return filtered;
    return [...filtered].sort((a, b) => {
      const x = a[sortConfig.key];
      const y = b[sortConfig.key];
      if (x < y) return sortConfig.direction === "asc" ? -1 : 1;
      if (x > y) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [search, sortConfig, data]);

  const requestSort = key => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  return (
    <div className="overflow-x-auto rounded shadow bg-white">
      <div className="flex items-center justify-end px-3 mt-2 mb-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search…"
          className="px-3 py-1 border rounded focus:ring"
        />
      </div>

      <table className="w-full text-left border-separate border-spacing-y-1">
        <thead>
          <tr>
            {columnsDef.map(col => (
              <th
                key={col.accessor}
                onClick={() => requestSort(col.accessor)}
                className="px-4 py-2 bg-gray-50 font-bold cursor-pointer select-none"
              >
                <span>{col.Header}</span>
                <span className="ml-1 inline-block align-middle">
                  {sortConfig.key !== col.accessor && <FaSort className="text-gray-400" />}
                  {sortConfig.key === col.accessor &&
                    (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                </span>
              </th>
            ))}
            {actions && (
              <th className="px-4 py-2 bg-gray-50 font-bold">Action</th>
            )}
          </tr>
        </thead>

        <tbody>
          {sortedData.map((row, idx) => (
            <tr key={idx} className="hover:bg-primary50 rounded-lg">
              {columnsDef.map(col => (
                <td key={col.accessor} className="px-4 py-2">
                  {row[col.accessor]}
                </td>
              ))}

              {actions && (
                <td className="flex gap-2 px-4 py-2 items-center">
                  {actions.map(({ icon: Icon, label, onClick, color }) => (
                    <button
                      key={label}
                      onClick={() => onClick(row)}
                      className={`rounded p-[6px] ${color ? `text-${color}` : ""}`}
                    >
                      <Icon />
                    </button>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
