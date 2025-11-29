import { query } from "@/db/connection";

export async function getAllVolunteers() {
  const result = await query(
    `SELECT national_id, full_name, phone, email, kind, active
     FROM volunteer
     ORDER BY full_name`
  );
  return result.recordset;
}

export async function addVolunteer(data: {
  national_id: string;
  full_name: string;
  phone?: string;
  email?: string;
  kind: "Water" | "Media";
}) {
  return query(
    `INSERT INTO volunteer (national_id, full_name, phone, email, kind)
     VALUES (@id, @name, @phone, @mail, @kind)`,
    {
      id: data.national_id,
      name: data.full_name,
      phone: data.phone || null,
      mail: data.email || null,
      kind: data.kind,
    }
  );
}
