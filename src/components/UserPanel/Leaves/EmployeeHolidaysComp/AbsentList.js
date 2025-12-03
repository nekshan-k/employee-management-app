import React from "react";
import Button from "../../../ui/buttons/Button";
import FormattedDate from "../../../ui/FormattedDate";

const AbsentList = ({ data, onApply }) => {
  const total = data.reduce((s, r) => s + r.days, 0);
  return (
    <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between text-sm text-neutral500">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Absent</span>
          <span className="text-xs text-neutral300">{total} day(s)</span>
        </div>
        <span className="text-[11px] px-2 py-[3px] rounded-full bg-secondary50 text-secondary600">
          Needs regularization
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-xs">
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-t border-border hover:bg-bg50 transition">
                <td className="px-5 py-3 w-1/2 text-neutral500"><FormattedDate date={row.label} /></td>
                <td className="px-5 py-3 w-1/4 text-neutral400">{row.days} day</td>
                <td className="px-5 py-3 w-1/4 text-right">
                  <Button variant="outline" onClick={() => onApply(row)} className="text-[11px] py-1.5 px-4">Apply Leave</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AbsentList;
