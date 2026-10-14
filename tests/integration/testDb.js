import { createRequire } from 'node:module';
import path from 'node:path';

// Integration tests run their own copy of jwt-pizza-service against a throwaway database,
// on its own port, so they can never touch the real `pizza` database or a dev service on :3000.
export const TEST_DB = 'pizza_test';
export const SERVICE_PORT = 3100;
export const SERVICE_DIR = path.resolve(process.env.SERVICE_DIR ?? '../jwt-pizza-service');

// Drops the test database. Refuses to touch any database other than pizza_test.
// The service recreates its tables (and default admin) itself when it next connects.
export async function dropTestDb() {
  process.env.DB_NAME = TEST_DB;
  const requireFromService = createRequire(path.join(SERVICE_DIR, 'package.json'));
  const config = requireFromService('./src/config.js');
  const { database, host, user, password, connectTimeout } = config.db.connection;
  if (database !== TEST_DB) {
    throw new Error(`Refusing to drop database "${database}"; integration tests must use ${TEST_DB}`);
  }

  const mysql = requireFromService('mysql2/promise');
  const connection = await mysql.createConnection({ host, user, password, connectTimeout });
  try {
    await connection.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
  } finally {
    await connection.end();
  }
}
