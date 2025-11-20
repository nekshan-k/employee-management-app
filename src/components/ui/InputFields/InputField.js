import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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
          className="absolute right-3 bottom-[10px] text-gray-400"
          tabIndex={-1}
          onClick={() => setVisible(v => !v)}
        >
          {visible ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
        </button>
      )}
    </div>
  );
}
