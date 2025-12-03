import React from "react";

export default function ReusableLeaveTable({ columns, data }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-neutral200 bg-neutral50">
            {columns.map(col => (
              <th
                key={col.accessor || col.header}
                className="text-left px-4 py-2 text-xs font-medium text-neutral500 uppercase tracking-wide"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-sm text-neutral400"
              >
                No records found
              </td>
            </tr>
          ) : (
            data.map(row => (
              <tr key={row.id} className="border-b border-neutral100">
                {columns.map(col => (
                  <td
                    key={col.accessor || col.header}
                    className="px-4 py-2 align-middle text-neutral800"
                  >
                    {col.cell ? col.cell(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
