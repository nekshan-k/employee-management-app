import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function PhoneInputField({ value, onChange, label }) {
  return (
    <div className="mb-3 w-full">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="w-full">
        <PhoneInput
          country='gb'
  regions={'europe'}
          value={value}
          onChange={onChange}
          containerClass="!w-full"
          inputClass="!w-full !h-10 !text-base border rounded focus:ring-2 focus:ring-primary500"
          buttonClass="border-r"
          dropdownClass="z-50"
          placeholder="Phone number"
        />
      </div>
    </div>
  );
}
