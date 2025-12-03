import React from "react";
import Button from "../../../ui/buttons/Button";
import InputField from "../../../ui/InputFields/InputField";

const leaveOptionsProbation = [
  { value: "ATTENDANCE_INDISCIPLINE", label: "Attendance Indiscipline" },
  { value: "COMPENSATORY_LEAVE", label: "Compensatory Leave" },
  { value: "LEAVE_WITHOUT_PAY", label: "Leave Without Pay" },
  { value: "PROBATION_PERIOD_LEAVE", label: "Probation Period Leave" }
];

const leaveOptionsConfirmed = [
  { value: "ATTENDANCE_INDISCIPLINE", label: "Attendance Indiscipline" },
  { value: "COMPENSATORY_LEAVE", label: "Compensatory Leave" },
  { value: "LEAVE_WITHOUT_PAY", label: "Leave Without Pay" },
  { value: "BEREAVEMENT_LEAVE", label: "Bereavement Leave" },
  { value: "MATERNITY_LEAVE", label: "Maternity Leave" },
  { value: "PARENTAL_LEAVE", label: "Parental Leave" }
];

export default function LeaveApplyForm({ form, onChange, onSubmit, onCancel, selectedAbsent, employmentType, availableLeaves }) {
  const selectOptions = employmentType === "PROBATION" ? leaveOptionsProbation : leaveOptionsConfirmed;
  const canSubmit = form.from && form.to && form.type && form.reason;
  return (
    <form className="flex flex-col h-full" onSubmit={onSubmit}>
      <div className="pb-4 border-b border-bg100 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xl font-semibold text-neutral700">Apply Leave</div>
            {selectedAbsent && <div className="text-sm text-neutral400 mt-1">For: {selectedAbsent.label}</div>}
          </div>
          <div className="text-right">
            <div className="text-xs text-neutral400">Available</div>
            <div className="mt-1 inline-flex items-center px-3 py-1 rounded-full border border-border bg-bg50 text-sm font-medium">{availableLeaves} days</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <InputField label="From date" name="from" type="date" value={form.from} onChange={onChange} />
          <InputField label="To date" name="to" type="date" value={form.to} onChange={onChange} min={form.from || undefined} />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Leave type</label>
            <div className="rounded-lg border border-neutral50 bg-white">
              <select
                name="type"
                value={form.type}
                onChange={onChange}
                className="w-full px-4 py-3 text-sm outline-none bg-transparent"
              >
                <option value="">Select leave type</option>
                {selectOptions.map((opt) => <option value={opt.value} key={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reason</label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={onChange}
              placeholder="Enter reason for leave"
              rows={6}
              className="w-full px-4 py-3 border border-neutral50 rounded-lg text-sm resize-none bg-white outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-bg100 bg-white sticky bottom-0">
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={onCancel} className="text-sm px-4 py-2">Cancel</Button>
          <Button type="submit" disabled={!canSubmit} className={`text-sm px-5 py-2 ${!canSubmit ? "opacity-60 pointer-events-none" : ""}`}>Submit request</Button>
        </div>
      </div>
    </form>
  );
}
