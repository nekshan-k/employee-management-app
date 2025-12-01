import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
export default function InputField({ label, type = "text", value, onChange, name, showEye, style, ...rest }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="mb-3 relative">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        name={name}
        className="w-full px-4 py-2 border border-neutral50 rounded outline-none focus:outline-none pr-10"
        type={isPassword && visible ? "text" : type}
        value={value}
        onChange={onChange}
        style={style}
        {...rest}
      />
      {isPassword && showEye && (
        <button type="button"
          className="absolute top-1/2 right-3 sm:right-4 -translate-y-1/2 cursor-pointer text-neutral200"
          tabIndex={-1}
          onClick={() => setVisible(v => !v)}
        >
          {visible ? <FiEye size={18} /> : <FiEyeOff size={18} />}
        </button>
      )}
    </div>
  );
}
