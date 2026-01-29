import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';

const runMigrate = async () => {
  console.log('Running migrations...');
  const dbPath = process.env.DATABASE_FILE || 'data/sqlite.db';
  console.log(`Using database: ${dbPath}`);
  
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigrate();
