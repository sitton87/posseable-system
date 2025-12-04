const fs = require("fs");
const path = require("path");
const sql = require("mssql");

async function main() {
  const envPath = path.join(process.cwd(), ".env.local");
  const envText = fs.readFileSync(envPath, "utf8");
  const env = {};

  for (const line of envText.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    env[key] = value;
  }

  const config = {
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    server: env.DB_SERVER,
    database: env.DB_DATABASE,
    options: {
      port: Number(env.DB_PORT) || 1433,
      encrypt: false,
      trustServerCertificate: true,
    },
  };

  const pool = await sql.connect(config);
  const result = await pool.request().query(
    "SELECT name, definition FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('dbo.equipment_item')"
  );
  console.log(result.recordset);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


