// Playwright webServer command for the integration tests: starts a fresh jwt-pizza-service
// on SERVICE_PORT backed by an empty pizza_test database.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { dropTestDb, SERVICE_DIR, SERVICE_PORT, TEST_DB } from './testDb.js';

await dropTestDb();

const service = spawn(process.execPath, ['index.js', String(SERVICE_PORT)], {
  cwd: path.join(SERVICE_DIR, 'src'),
  env: { ...process.env, DB_NAME: TEST_DB },
  stdio: 'inherit',
});

service.on('exit', (code) => process.exit(code ?? 0));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => service.kill());
}
