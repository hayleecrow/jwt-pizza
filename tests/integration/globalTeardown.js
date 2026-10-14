import { dropTestDb } from './testDb.js';

// Removes the throwaway test database once the whole run has finished.
export default async function globalTeardown() {
  try {
    await dropTestDb();
  } catch (e) {
    console.warn(`Could not drop the integration test database: ${e.message}`);
  }
}
