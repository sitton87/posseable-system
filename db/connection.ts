import sql from "mssql";

const config: sql.config = {
  user: "posseable_user",
  password: "Posseable2025!",
  server: "SITON-PC",
  database: "PosseableDB",
  options: {
    port: 1433,
    encrypt: false,
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
