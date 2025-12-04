export function formatPhoneNumber(value?: string | null) {
  if (!value) return "—";

  const digits = value.replace(/\D/g, "");

  if (digits.length === 10 && digits.startsWith("05")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 9 && digits.startsWith("5")) {
    return `0${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }

  return value;
}



