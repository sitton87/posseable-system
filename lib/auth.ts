import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET || "default_dev_secret_key_change_me_in_prod";
const key = new TextEncoder().encode(secretKey);

export async function encryptSession(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(key);
}

export async function decryptSession(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

