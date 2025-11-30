import { randomBytes } from "crypto";

const PASSWORD_PREFIX = "PoS_";
const PASSWORD_LENGTH = 8;
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const CHARSET = `${LOWERCASE}${UPPERCASE}${DIGITS}`;

function pickRandomChar(source: string) {
  const byte = randomBytes(1)[0];
  return source[byte % source.length];
}

function shuffle(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = randomBytes(1)[0] % (i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function generateTemporaryPassword(length = PASSWORD_LENGTH) {
  if (length < 3) {
    throw new Error("Password length must be at least 3 characters.");
  }

  const requiredChars = [
    pickRandomChar(LOWERCASE),
    pickRandomChar(UPPERCASE),
    pickRandomChar(DIGITS),
  ];

  const remainingLength = length - requiredChars.length;
  for (let i = 0; i < remainingLength; i++) {
    requiredChars.push(pickRandomChar(CHARSET));
  }

  const randomized = shuffle(requiredChars);
  return `${PASSWORD_PREFIX}${randomized.join("")}`;
}


