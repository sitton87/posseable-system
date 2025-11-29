import { query } from "@/db/connection";

type SqlParams = Record<string, string | number | boolean>;

export type AppUserRecord = {
  national_id: string;
  full_name: string;
  email: string;
  role: string;
  must_reset: boolean;
  created_at: string;
};

export async function fetchAppUsers() {
  return query(
    `
    SELECT national_id, full_name, email, role, must_reset, created_at
    FROM app_user
    ORDER BY created_at DESC
  `
  );
}

export async function findExistingAppUser(params: {
  national_id?: string;
  email?: string;
}) {
  const clauses: string[] = [];
  const sqlParams: SqlParams = {};

  if (params.national_id) {
    clauses.push("national_id = @national_id");
    sqlParams.national_id = params.national_id;
  }

  if (params.email) {
    clauses.push("email = @email");
    sqlParams.email = params.email;
  }

  if (!clauses.length) {
    return { recordset: [] };
  }

  return query(
    `
    SELECT national_id, email
    FROM app_user
    WHERE ${clauses.join(" OR ")}
  `,
    sqlParams
  );
}

export async function insertAppUser(params: {
  national_id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: string;
  must_reset?: boolean;
}) {
  const { national_id, full_name, email, password_hash, role } = params;

  return query(
    `
      INSERT INTO app_user (
        national_id,
        full_name,
        email,
        password_hash,
        must_reset,
        role,
        created_at
      ) VALUES (
        @national_id,
        @full_name,
        @email,
        @password_hash,
        @must_reset,
        @role,
        GETDATE()
      )
    `,
    {
      national_id,
      full_name,
      email,
      password_hash,
      role,
      must_reset: params.must_reset ?? true,
    }
  );
}

export async function updateAppUser(
  national_id: string,
  updates: Partial<{
    full_name: string;
    email: string;
    role: string;
    must_reset: boolean;
    password_hash: string;
  }>
) {
  const fields: string[] = [];
  const parameters: SqlParams = { national_id };

  if (typeof updates.full_name === "string") {
    fields.push("full_name = @full_name");
    parameters.full_name = updates.full_name;
  }

  if (typeof updates.email === "string") {
    fields.push("email = @email");
    parameters.email = updates.email;
  }

  if (typeof updates.role === "string") {
    fields.push("role = @role");
    parameters.role = updates.role;
  }

  if (typeof updates.must_reset === "boolean") {
    fields.push("must_reset = @must_reset");
    parameters.must_reset = updates.must_reset ? 1 : 0;
  }

  if (typeof updates.password_hash === "string") {
    fields.push("password_hash = @password_hash");
    parameters.password_hash = updates.password_hash;
    if (!fields.includes("must_reset = @must_reset")) {
      fields.push("must_reset = 1");
    }
  }

  if (!fields.length) {
    return { rowsAffected: [0] };
  }

  return query(
    `UPDATE app_user SET ${fields.join(", ")} WHERE national_id = @national_id`,
    parameters
  );
}

