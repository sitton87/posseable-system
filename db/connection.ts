import sql from "mssql";

const config: sql.config = {
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  server: process.env.DB_SERVER!,
  database: process.env.DB_DATABASE!,
  options: {
    port: Number(process.env.DB_PORT) || 1433,
    encrypt: process.env.NODE_ENV === "production",
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Singleton pool management
let pool: sql.ConnectionPool | null = null;
let poolPromise: Promise<sql.ConnectionPool> | null = null;

async function getPool() {
  if (pool?.connected) {
    return pool;
  }

  if (poolPromise) {
    return poolPromise;
  }

  poolPromise = sql.connect(config)
    .then((p) => {
      pool = p;
      console.log("Database connected successfully");
      return p;
    })
    .catch((err) => {
      poolPromise = null;
      console.error("Database connection failed:", err);
      throw err;
    });

  return poolPromise;
}

export async function query(q: string, params: any = {}) {
  const currentPool = await getPool();
  
  const request = currentPool.request();

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
