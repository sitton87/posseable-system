import sql from "mssql";

const config: sql.config = {
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  server: process.env.DB_SERVER!,
  database: process.env.DB_DATABASE!,
  options: {
    port: Number(process.env.DB_PORT) || 1433,
    encrypt: false, // MSSQL local
    trustServerCertificate: true,
  },
};

export async function query(q: string, params: any = {}) {
  const pool = await sql.connect(config);
  const request = pool.request();

  for (const key in params) {
    request.input(key, params[key]);
  }

  return request.query(q);
}
