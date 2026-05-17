import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDB() {
  try {
    console.log('Connecting to Neon DB...');
    const client = await pool.connect();
    
    console.log('Reading schema.sql...');
    const schemaPath = path.resolve(__dirname, '../config/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    
    console.log('Executing schema...');
    await client.query(schemaSql);
    console.log('✅ Schema successfully created!');

    console.log('Reading seed_diseases.sql...');
    const seedPath = path.resolve(__dirname, '../config/seed_diseases.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf-8');
    
    console.log('Executing seeds...');
    await client.query(seedSql);
    console.log('✅ Disease seeds successfully inserted!');

    client.release();
    console.log('Database initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
  }
}

initDB();
