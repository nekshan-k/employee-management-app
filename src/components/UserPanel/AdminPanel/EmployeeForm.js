import React from "react";
import InputField from "../../ui/InputFields/InputField";
import PhoneInputField from "../../ui/InputFields/PhoneInputField";
import Button from "../../ui/buttons/Button";


export default function EmployeeForm({
  form,
  saving,
  editingUser,
  roleOptions,
  employmentOptions,
  departmentOptions,
  onChange,
  onPhoneChange,
  onSubmit,
  onCancel
}) {
  const [passwords, setPasswords] = React.useState({
    password: "",
    confirmPassword: "",
    match: true
  });
console.log("editingUser", editingUser);
  React.useEffect(() => {
    if (!editingUser) {
      setPasswords({ password: "", confirmPassword: "", match: true });
    }
  }, [editingUser, form.id]);

  function handlePasswordChange(e) {
    const { name, value } = e.target;
    setPasswords(prev => {
      const next = { ...prev, [name]: value };
      next.match = next.password === next.confirmPassword;
      return next;
    });
  }

  function handleLocalSubmit(e) {
    e.preventDefault();
    if (!passwords.match) return;
    const finalPassword =
      editingUser ? undefined : passwords.password || undefined;
    onSubmit(finalPassword);
  }

  return (
    <div className="p-6 text-sm">
      <form onSubmit={handleLocalSubmit} className="space-y-4">
        <InputField
          label="Full name"
          name="fullName"
          value={form.fullName}
          onChange={onChange}
        />
        <InputField
          label="Email"
          name="email"
          value={form.email}
          onChange={onChange}
        />

        {!editingUser && (
          <>
            <InputField
              label="Set password"
              name="password"
              type="password"
              value={passwords.password}
              onChange={handlePasswordChange}
              showEye
            />
            <InputField
              label="Confirm password"
              name="confirmPassword"
              type="password"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              showEye
            />
            {passwords.password || passwords.confirmPassword ? (
              <div
                className={
                  passwords.match
                    ? "text-xs text-green-600"
                    : "text-xs text-red-600"
                }
              >
                {passwords.match ? "Passwords match" : "Passwords do not match"}
              </div>
            ) : null}
          </>
        )}

        <PhoneInputField
          label="Phone number"
          value={form.phone}
          onChange={onPhoneChange}
        />

        <InputField
          label="Employee code"
          name="employeeCode"
          value={form.employeeCode}
          onChange={onChange}
        />

        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            name="roleId"
            value={form.roleId === "" ? "" : form.roleId}
            onChange={onChange}
            className="w-full px-3 py-2  border border-neutral50 rounded bg-white"
          >
            <option value="">Select role</option>
            {roleOptions.map(r => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Employment type
          </label>
          <select
            name="employmentType"
            value={form.employmentType}
            onChange={onChange}
            className="w-full px-3 py-2  border border-neutral50 rounded bg-white"
          >
            <option value="">Select employment type</option>
            {employmentOptions.map(r => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <select
            name="department"
            value={form.department}
            onChange={onChange}
            className="w-full px-3 py-2  border border-neutral50 rounded bg-white"
          >
            <option value="">Select department</option>
            {departmentOptions.map(d => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <InputField
          label="Designation"
          name="designation"
          value={form.designation}
          onChange={onChange}
        />

        <InputField
          label="Date of joining"
          name="dateOfJoining"
          type="date"
          value={form.dateOfJoining}
          onChange={onChange}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Latitude"
            name="latitude"
            value={form.latitude}
            onChange={onChange}
          />
          <InputField
            label="Longitude"
            name="longitude"
            value={form.longitude}
            onChange={onChange}
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving || (!editingUser && !passwords.match)}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
