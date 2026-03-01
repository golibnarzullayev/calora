import React from "react";

interface PhoneInputProps {
  value: string; // must be 998XXXXXXXXX (digits only)
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "Telefon raqam",
  required = false,
  disabled = false,
  className = "",
}) => {
  // Always keep 998 prefix
  const normalize = (digits: string) => {
    let cleaned = digits.replace(/\D/g, "");

    if (!cleaned.startsWith("998")) {
      cleaned = "998" + cleaned.replace(/^998/, "");
    }

    return cleaned.slice(0, 12); // 998 + 9 digits
  };

  const format = (digits: string) => {
    const cleaned = normalize(digits);
    const local = cleaned.slice(3); // remove 998

    if (local.length === 0) return "+998 ";
    if (local.length <= 2) return `+998 (${local}`;
    if (local.length <= 5)
      return `+998 (${local.slice(0, 2)}) ${local.slice(2)}`;
    if (local.length <= 7)
      return `+998 (${local.slice(0, 2)}) ${local.slice(
        2,
        5,
      )}-${local.slice(5)}`;

    return `+998 (${local.slice(0, 2)}) ${local.slice(
      2,
      5,
    )}-${local.slice(5, 7)}-${local.slice(7, 9)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    const normalized = normalize(digits);

    onChange(`+${normalized}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cursor = input.selectionStart ?? 0;

    // Prevent deleting "+998 "
    if (
      (e.key === "Backspace" && cursor <= 5) ||
      (e.key === "Delete" && cursor < 5)
    ) {
      e.preventDefault();
      return;
    }

    const allowed = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Enter",
    ];

    if (e.ctrlKey && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) return;

    if (!/\d/.test(e.key) && !allowed.includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <input
      type="tel"
      value={format(value)}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all ${className}`}
    />
  );
};
