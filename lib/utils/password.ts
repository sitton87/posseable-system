import { randomInt } from "crypto";

const PASSWORD_PREFIX = "POS-";
const DIGITS = "0123456789";

export function generateTemporaryPassword() {
  const suffix = Array.from({ length: 6 }, () => DIGITS[randomInt(10)]).join(
    ""
  );
  return `${PASSWORD_PREFIX}${suffix}`;
}
