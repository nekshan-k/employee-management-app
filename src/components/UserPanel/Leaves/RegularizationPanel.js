import React, { useState } from "react";
import SidePanel from "../../ui/SidePanel";
import InputField from "../../ui/InputFields/InputField";


const reasons = [
  "Missed check-out",
  "Missed check-in",
  "Network/Power issue",
  "Others",
];

export default function RegularizationPanel({ open, onClose }) {
  const [form, setForm] = useState({
    period: "Day",
    date: "",
    checkIn: "",
    checkOut: "",
    totalHours: "",
    reason: "",
    description: "",
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    // submit logic
    onClose();
  };

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title="Request Regularization"
      subtitle=""
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Period</label>
            <select
              name="period"
              value={form.period}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded text-xs outline-none bg-bg50 focus:ring-2 focus:ring-primary100"
            >
              <option value="Day">Day</option>
              <option value="Hour">Hour</option>
            </select>
          </div>

          <InputField
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Check-in"
            name="checkIn"
            type="datetime-local"
            value={form.checkIn}
            onChange={handleChange}
          />
          <InputField
            label="Check-out"
            name="checkOut"
            type="datetime-local"
            value={form.checkOut}
            onChange={handleChange}
          />
        </div>

        <InputField
          label="Total Hours"
          name="totalHours"
          type="text"
          value={form.totalHours}
          onChange={handleChange}
          placeholder="0:00"
        />

        <div>
          <label className="block text-sm font-medium mb-1">Reason</label>
          <select
            name="reason"
            value={form.reason}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded text-xs outline-none bg-bg50 focus:ring-2 focus:ring-primary100"
          >
            <option value="">Select</option>
            {reasons.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded text-xs outline-none bg-bg50 resize-none focus:ring-2 focus:ring-primary100"
            placeholder="Description"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-border text-xs text-neutral500 bg-white hover:bg-bg50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-1.5 rounded-lg bg-primary600 text-xs font-medium text-white hover:bg-primary700"
          >
            Submit
          </button>
        </div>
      </form>
    </SidePanel>
  );
}
