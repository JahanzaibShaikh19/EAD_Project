import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initDb() {
  console.log('Connecting to database...');
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  
  try {
    const schemaPath = path.join(__dirname, '..', '..', '.gemini', 'antigravity-ide', 'brain', '379c5a0c-6cf6-4acb-9ba3-9372f2c3937e', 'schema.sql');
    console.log('Reading schema file from:', schemaPath);
    
    // In case the exact path above varies, just read it from the known location or CWD fallback
    let sql = '';
    try {
      sql = fs.readFileSync(schemaPath, 'utf8');
    } catch (e) {
      // If exact artifact path fails, assume it's stored somewhere else, or fallback to the one in project root if copied
      console.error('Failed to read artifact, trying root schema.sql', e.message);
      sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    }

    console.log('Running schema...');
    await client.query(sql);
    console.log('Schema created successfully!');
  } catch (err) {
    console.error('Failed to create schema:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

initDb();
