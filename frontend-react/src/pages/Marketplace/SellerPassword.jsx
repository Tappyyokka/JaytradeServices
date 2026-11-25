import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function SellerPassword({ name = "password", label = "Password", autoComplete = "new-password", minLength }) {
  const [visible, setVisible] = useState(false);
  return (
    <label>
      {label}
      <span className="mp-password">
        <input name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} minLength={minLength} maxLength={128} required />
        <button type="button" aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`} onClick={() => setVisible(!visible)}>
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
    </label>
  );
}
