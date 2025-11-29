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
    const value = params[key];

    if (
      value &&
      typeof value === "object" &&
      "type" in value &&
      value?.type !== undefined &&
      "value" in value
    ) {
      let sqlType = value.type as
        | sql.ISqlTypeFactoryWithNoParams
        | sql.ISqlType
        | string;

      if (typeof sqlType === "string") {
        const typeName = sqlType.toLowerCase();
        if (typeName === "varbinary(max)" || typeName === "varbinary_max") {
          sqlType = sql.VarBinary(sql.MAX);
        } else if ((sql as Record<string, any>)[sqlType]) {
          sqlType = (sql as Record<string, any>)[sqlType];
        } else {
          sqlType = undefined as any;
        }
      }

      if (sqlType) {
        request.input(
          key,
          sqlType as sql.ISqlTypeFactoryWithNoParams | sql.ISqlType,
          value.value
        );
      } else {
        request.input(key, value.value);
      }
      continue;
    }

    if (Buffer.isBuffer(value)) {
      request.input(key, sql.VarBinary(sql.MAX), value);
      continue;
    }

    request.input(key, value);
  }

  return request.query(q);
}
