import { query } from "@/db/connection";

export async function getAllSurfers() {
  const result = await query(
    "SELECT national_id, full_name, phone, email FROM surfer ORDER BY full_name"
  );
  return result.recordset;
}

export async function addSurfer(data: {
  national_id: string;
  full_name: string;
  phone?: string;
  email?: string;
}) {
  return query(
    `INSERT INTO surfer (national_id, full_name, phone, email)
     VALUES (@id, @name, @phone, @mail)`,
    {
      id: data.national_id,
      name: data.full_name,
      phone: data.phone || null,
      mail: data.email || null,
    }
  );
}
