// lib/db.ts - UPDATED with connection parameter support
import mysql, { 
  Pool, 
  PoolOptions, 
  RowDataPacket, 
  ResultSetHeader,
  PoolConnection,
  FieldPacket
} from "mysql2/promise";

let pool: mysql.Pool | null = null;

function getPoolConfig(): PoolOptions {
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!host || !user || !password || !database) {
    throw new Error(
      "Missing required database environment variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME",
    );
  }

  return {
    host,
    port: port ? parseInt(port, 10) : 3306,
    user,
    password,
    database,
    connectionLimit: process.env.DB_CONNECTION_LIMIT
      ? parseInt(process.env.DB_CONNECTION_LIMIT, 10)
      : 10,
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    charset: 'utf8mb4',
  };
}

export function getPool(): mysql.Pool {
  if (process.env.NODE_ENV === "development") {
    const globalWithMySQL = global as typeof globalThis & {
      mysqlPool?: mysql.Pool;
    };

    if (globalWithMySQL.mysqlPool) {
      return globalWithMySQL.mysqlPool;
    }

    pool = mysql.createPool(getPoolConfig());
    globalWithMySQL.mysqlPool = pool;
    return pool;
  }

  if (!pool) {
    pool = mysql.createPool(getPoolConfig());
  }
  return pool;
}

// ✅ SELECT queries - now accepts optional connection for transactions
export async function dbQuery<T extends RowDataPacket[]>(
  sql: string,
  params?: any[],
  connection?: PoolConnection,
): Promise<[T, FieldPacket[]]> {
  const executor = connection || getPool();
  try {
    return await executor.query<T>(sql, params);
  } catch (error) {
    console.error("Database query error:", { sql, params, error });
    throw error;
  }
}

// ✅ INSERT/UPDATE/DELETE - now accepts optional connection for transactions
export async function dbExecute(
  sql: string,
  params?: any[],
  connection?: PoolConnection,
): Promise<[ResultSetHeader, FieldPacket[]]> {
  const executor = connection || getPool();
  try {
    return await executor.query<ResultSetHeader>(sql, params);
  } catch (error) {
    console.error("Database execute error:", { sql, params, error });
    throw error;
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    if (process.env.NODE_ENV === "development") {
      const globalWithMySQL = global as typeof globalThis & {
        mysqlPool?: mysql.Pool;
      };
      delete globalWithMySQL.mysqlPool;
    }
  }
}

export default getPool;