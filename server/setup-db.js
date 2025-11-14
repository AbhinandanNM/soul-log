#!/usr/bin/env node
/**
 * Database Setup Script for Soul Log
 * 
 * This script helps you set up your PostgreSQL database.
 * Run: node setup-db.js
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function setupDatabase() {
  console.log('🔧 Soul Log Database Setup\n');
  console.log('This script will help you create the database and test the connection.\n');

  // Get database URL
  let databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('No DATABASE_URL found in .env file.\n');
    const host = await question('PostgreSQL host (default: localhost): ') || 'localhost';
    const port = await question('PostgreSQL port (default: 5432): ') || '5432';
    const user = await question('PostgreSQL username (default: postgres): ') || 'postgres';
    const password = await question('PostgreSQL password: ');
    const database = await question('Database name (default: soul_log): ') || 'soul_log';
    
    databaseUrl = `postgresql://${user}:${password}@${host}:${port}/${database}`;
  }

  console.log('\n📡 Testing database connection...\n');

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Successfully connected to database!\n');

    // Create extension
    console.log('📦 Creating UUID extension...');
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    console.log('✅ UUID extension ready\n');

    // Create users table
    console.log('👥 Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        google_id TEXT UNIQUE NOT NULL,
        email TEXT,
        name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Users table ready\n');

    // Session table will be created automatically by connect-pg-simple
    console.log('📝 Session table will be created automatically on first server start\n');

    console.log('🎉 Database setup complete!\n');
    console.log('Next steps:');
    console.log('1. Make sure your .env file has: DATABASE_URL=' + databaseUrl);
    console.log('2. Start the server with: npm run dev\n');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check your connection credentials');
    console.error('3. Ensure the database exists (or use "postgres" database to create it)');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection refused - is PostgreSQL running?');
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed - check your username and password');
    } else if (error.code === '3D000') {
      console.error('\n💡 Database does not exist - create it first with: CREATE DATABASE soul_log;');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
    rl.close();
  }
}

setupDatabase().catch(console.error);



