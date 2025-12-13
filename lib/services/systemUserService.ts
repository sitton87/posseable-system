import { query } from "@/db/connection";

type SqlParams = Record<string, string | number | boolean | null>;

export async function fetchAppUsers() {
  return query(
    `
    SELECT national_id, full_name, email, role, role_group_code, must_reset, created_at, is_active
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
  role_group_code?: string | null;
}) {
  const { national_id, full_name, email, password_hash, role, role_group_code } =
    params;

  return query(
    `
      INSERT INTO app_user (
        national_id,
        full_name,
        email,
        password_hash,
        must_reset,
        role,
        role_group_code,
        created_at
      ) VALUES (
        @national_id,
        @full_name,
        @email,
        @password_hash,
        @must_reset,
        @role,
        @role_group_code,
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
      role_group_code: role_group_code ?? "management",
    }
  );
}

export async function updateAppUser(
  national_id: string,
  updates: Partial<{
    full_name: string;
    email: string;
    role: string;
    role_group_code: string | null;
    must_reset: boolean;
    password_hash: string;
    is_active: boolean;
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

  if (typeof updates.role_group_code === "string") {
    fields.push("role_group_code = @role_group_code");
    parameters.role_group_code = updates.role_group_code;
  }

  if (typeof updates.must_reset === "boolean") {
    fields.push("must_reset = @must_reset");
    parameters.must_reset = updates.must_reset ? 1 : 0;
  }

  if (typeof updates.is_active === "boolean") {
    fields.push("is_active = @is_active");
    parameters.is_active = updates.is_active ? 1 : 0;
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

export async function deleteAppUser(national_id: string) {
  return query("DELETE FROM app_user WHERE national_id = @national_id", {
    national_id,
  });
}

export async function fetchRoleGroups() {
  return query(
    `
    SELECT code, name, description, is_default, created_at
    FROM app_role_group
    ORDER BY CASE WHEN is_default = 1 THEN 0 ELSE 1 END, name
  `
  );
}

export async function fetchAppPages() {
  return query(
    `
    SELECT page_key, display_name, route_path, category, is_active, created_at
    FROM app_page
    WHERE is_active = 1
    ORDER BY category, display_name
  `
  );
}

export async function fetchPermissionsForRoleGroup(role_group_code: string) {
  return query(
    `
    SELECT role_group_code, page_key, permission_level, updated_at, updated_by
    FROM app_role_group_permission
    WHERE role_group_code = @role_group_code
  `,
    { role_group_code }
  );
}

export async function upsertRoleGroupPermissions(
  role_group_code: string,
  permissions: Array<{ page_key: string; permission_level: string }>,
  updated_by?: string
) {
  for (const permission of permissions) {
    await query(
      `
      MERGE app_role_group_permission AS target
      USING (SELECT @role_group_code AS role_group_code, @page_key AS page_key) AS source
      ON target.role_group_code = source.role_group_code AND target.page_key = source.page_key
      WHEN MATCHED THEN
        UPDATE SET permission_level = @permission_level,
                   updated_at = SYSUTCDATETIME(),
                   updated_by = @updated_by
      WHEN NOT MATCHED THEN
        INSERT (role_group_code, page_key, permission_level, updated_at, updated_by)
        VALUES (@role_group_code, @page_key, @permission_level, SYSUTCDATETIME(), @updated_by);
    `,
      {
        role_group_code,
        page_key: permission.page_key,
        permission_level: permission.permission_level,
        updated_by: updated_by ?? null,
      }
    );
  }
}

export async function syncAppPages(
  pages: Array<{
    page_key: string;
    display_name: string;
    route_path: string;
    category?: string;
  }>
) {
  let count = 0;
  const activeKeys: string[] = [];

  for (const page of pages) {
    activeKeys.push(page.page_key);
    await query(
      `
      MERGE app_page AS target
      USING (SELECT @page_key AS page_key) AS source
      ON target.page_key = source.page_key
      WHEN MATCHED THEN
        UPDATE SET display_name = @display_name,
                   route_path = @route_path,
                   category = @category,
                   is_active = 1
      WHEN NOT MATCHED THEN
        INSERT (page_key, display_name, route_path, category, is_active, created_at)
        VALUES (@page_key, @display_name, @route_path, @category, 1, SYSUTCDATETIME());
    `,
      {
        page_key: page.page_key,
        display_name: page.display_name,
        route_path: page.route_path,
        category: page.category ?? null,
      }
    );
    count++;
  }

  // Deactivate pages not in the list
  if (activeKeys.length > 0) {
    const params: SqlParams = {};
    const placeholders = activeKeys.map((key, index) => {
      const paramName = `k${index}`;
      params[paramName] = key;
      return `@${paramName}`;
    });

    await query(
      `UPDATE app_page SET is_active = 0 WHERE page_key NOT IN (${placeholders.join(", ")})`,
      params
    );
  } else {
    await query(`UPDATE app_page SET is_active = 0`);
  }

  return count;
}