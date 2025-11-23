import { query } from "@/db/connection";

export async function findUserByCredentials(
  national_id: string,
  email: string
) {
  return await query(
    `SELECT national_id, full_name, email, password_hash, must_reset, role
     FROM app_user
     WHERE national_id = @id AND email = @mail`,
    { id: national_id, mail: email }
  );
}

export async function updatePassword(national_id: string, hash: string) {
  return await query(
    `UPDATE app_user
     SET password_hash = @hash, must_reset = 0
     WHERE national_id = @id`,
    { id: national_id, hash }
  );
}

export async function getUserBasicInfo(national_id: string) {
  return await query(
    `SELECT national_id, full_name, role
     FROM app_user
     WHERE national_id = @id`,
    { id: national_id }
  );
}
