import { useState, useEffect } from "react";
import InputField from "../../ui/InputFields/InputField";
import PhoneInputField from "../../ui/InputFields/PhoneInputField";
import Button from "../../ui/buttons/Button";
import Modal from "../../ui/modals/Modal";

function validateEmail(email) {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(in|com|co|uk|[a-z]{2,})(\.[a-z]{2,})?$/.test(email);
}
function getPasswordValidationStatus(p) {
  return {
    length: p.length >= 8,
    upper: /[A-Z]/.test(p),
    lower: /[a-z]/.test(p),
    num: /[0-9]/.test(p),
    symbol: /[^A-Za-z0-9]/.test(p)
  };
}
function validateUsername(u) { return u && !/\s/.test(u); }

export default function UserModal({ open, onClose, onSave, user }) {
  const [form, setForm] = useState({
    fullName: "", username: "", email: "", phone: "", status: "Active", password: "", confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [showPwdBlock, setShowPwdBlock] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ ...user, password: "", confirmPassword: "" });
      setShowPwdBlock(false);
    } else {
      setForm({ fullName: "", username: "", email: "", phone: "", status: "Active", password: "", confirmPassword: "" });
      setShowPwdBlock(true);
    }
  }, [open, user]);

  function handleChange(e) {
    const { name, value } = e.target;
    if(name === "username" && /\s/.test(value)) return;
    setForm(f => ({ ...f, [name]: value }));
  }
  function handlePhone(value) {
    setForm(f => ({ ...f, phone: value }));
  }
  function onSubmit(e) {
    e.preventDefault();
    if (!form.fullName || !form.username || !form.email || !form.phone || !form.status) { setError("All fields required"); return; }
    if (!validateUsername(form.username)) { setError("Username must not contain spaces"); return; }
    if (!validateEmail(form.email)) { setError("Invalid email address"); return; }
    if (showPwdBlock) {
      if (!validatePw(form.password)) { setError("Password does not meet requirements"); return; }
      if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    }
    onSave({ ...form, password: undefined, confirmPassword: undefined });
  }
  function validatePw(p) {
    const s = getPasswordValidationStatus(p);
    return s.length && s.upper && s.lower && s.num && s.symbol;
  }
  const pwStatus = getPasswordValidationStatus(form.password || "");
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-4 gap-2 flex-col sm:flex-row">
        <div className="text-xl font-semibold">{user ? "Edit Employee" : "Add Employee"}</div>
        {user &&
          <button className="rounded-md border px-3 py-1 text-sm font-medium bg-primary100 text-primary600 hover:bg-primary200"
            type="button"
            onClick={() => setShowPwdBlock(v => !v)}>
            {showPwdBlock ? "Cancel Change Password" : "Change Password"}
          </button>
        }
      </div>
      <form onSubmit={onSubmit} className="space-y-2">
        <div className="flex flex-col gap-2 md:flex-row md:gap-4">
          <div className="w-full md:w-1/2">
            <InputField label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} />
          </div>
          <div className="w-full md:w-1/2">
            <InputField
              label="User Name"
              name="username"
              value={form.username}
              onChange={handleChange}
              style={{ borderColor: form.username === "" ? "" : validateUsername(form.username) ? "#22c55e" : "#ef4444" }}
            />
            {form.username && !validateUsername(form.username) && (
              <div className="text-xs text-red-600 px-1">No spaces allowed</div>
            )}
          </div>
        </div>
        <InputField
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          type="email"
          style={{ borderColor: form.email === "" ? "" : validateEmail(form.email) ? "#22c55e" : "#ef4444" }}
        />
        <div className="flex flex-col gap-2 md:flex-row md:gap-4">
          <div className="w-full md:w-1/2">
            <PhoneInputField label="Phone Number" value={form.phone} onChange={handlePhone} />
          </div>
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-2 border border-neutral50 rounded focus:outline-none ">
              <option value="Active">Active</option>
              <option value="Blocked">In-Active</option>
            </select>
          </div>
        </div>
        {showPwdBlock && (
          <>
            {user &&
              <InputField label="Last Password" name="lastPassword" type="password" value={form.lastPassword || ""} onChange={handleChange} showEye />}
            <InputField label="Set Password" name="password" value={form.password} onChange={handleChange} type="password" showEye />
            <div className="mb-1 flex flex-wrap gap-x-4 gap-y-1 px-2 text-xs">
              <span className={pwStatus.length ? "text-green-600" : "text-red-600"}>8+ chars</span>
              <span className={pwStatus.upper ? "text-green-600" : "text-red-600"}>Upper</span>
              <span className={pwStatus.lower ? "text-green-600" : "text-red-600"}>Lower</span>
              <span className={pwStatus.num ? "text-green-600" : "text-red-600"}>Number</span>
              <span className={pwStatus.symbol ? "text-green-600" : "text-red-600"}>Symbol</span>
            </div>
            <InputField
              label="Confirm Password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              type="password"
              showEye
              style={{
                borderColor: form.confirmPassword === ""
                  ? ""
                  : form.password === form.confirmPassword
                    ? "#22c55e"
                    : "#ef4444"
              }}
            />
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <div className="text-xs text-red-600 px-1">Passwords do not match</div>
            )}
          </>
        )}
        <div className="flex gap-3 justify-end mt-2">
          <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit">{user ? "Save" : "Add"}</Button>
        </div>
        {error && <div className="mt-2 text-red-600 font-semibold">{error}</div>}
      </form>
    </Modal>
  );
}
