const { Client } = require('pg');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const dbName = 'societe_du_vide';
  console.log('\n// SOCIÉTÉ DU VIDE // ------------------------------------');
  console.log('[1/4] Connecting to Laragon local PostgreSQL...');

  // Try connecting with 'root' password (common Laragon Postgres setup)
  let client = new Client({
    user: 'postgres',
    password: 'root',
    host: 'localhost',
    port: 5432,
    database: 'postgres'
  });

  let connected = false;
  let usedPassword = 'root';

  try {
    await client.connect();
    connected = true;
  } catch (err) {
    if (err.message.includes('password authentication failed')) {
      console.log('      Failed with password "root", trying empty password...');
      usedPassword = '';
      client = new Client({
        user: 'postgres',
        password: '',
        host: 'localhost',
        port: 5432,
        database: 'postgres'
      });
      try {
        await client.connect();
        connected = true;
      } catch (innerErr) {
        if (innerErr && innerErr.code === 'ECONNREFUSED') {
          console.error('\\n[X] PostgreSQL Service IS NOT RUNNING!');
          console.error('    Please open your Laragon Control Panel, start PostgreSQL (Port 5432), and try again.');
        } else {
          console.error('      FATAL: Could not connect to PostgreSQL. Please ensure Laragon PostgreSQL is running on port 5432.', innerErr.message || innerErr);
        }
        process.exit(1);
      }
    } else {
      if (err && err.code === 'ECONNREFUSED') {
        console.error('\\n[X] PostgreSQL Service IS NOT RUNNING!');
        console.error('    Please open your Laragon Control Panel, start PostgreSQL (Port 5432), and try again.');
      } else {
        console.error('      FATAL: Could not connect to PostgreSQL. Is Laragon PostgreSQL running on port 5432?', err.message || err);
      }
      process.exit(1);
    }
  }

  if (connected) {
    console.log('      Connected successfully!');
    
    // Create database if not exists
    try {
      const res = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = '${dbName}'`);
      if (res.rowCount === 0) {
        console.log(`[2/4] Database "${dbName}" not found. Creating it now...`);
        await client.query(`CREATE DATABASE "${dbName}"`);
        console.log(`      Database "${dbName}" created successfully!`);
      } else {
        console.log(`[2/4] Database "${dbName}" already exists. Proceeding...`);
      }
    } catch (err) {
      console.error('      Error checking/creating database:', err.message);
      // Wait, we should close connection before exiting
    } finally {
      await client.end();
    }

    // Update .env file based on the password that worked
    console.log('[3/4] Ensuring .env connection string is correct...');
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      // replace only the user:pass combination in PostgreSQL url
      const dbUrlRegex = /DATABASE_URL="postgresql:\/\/postgres:.*@localhost:5432\/.*/g;
      const newDbUrl = `DATABASE_URL="postgresql://postgres:${usedPassword}@localhost:5432/${dbName}?schema=public"`;
      
      if (dbUrlRegex.test(envContent)) {
        envContent = envContent.replace(dbUrlRegex, newDbUrl);
      } else {
        // Fallback replacement if it doesn't strictly match the first regex
        const generalDbUrlRegex = /DATABASE_URL=".+"/g;
        if (generalDbUrlRegex.test(envContent)) {
           envContent = envContent.replace(generalDbUrlRegex, newDbUrl);
        } else {
           envContent += `\n${newDbUrl}`;
        }
      }
      fs.writeFileSync(envPath, envContent);
    }
    
    // Now trigger Prisma
    console.log('[4/4] Pushing Schema and Seeding Data...');
    try {
      // Sync DB schema
      console.log('      > Running "npx prisma db push"...');
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
      
      // Seed Data
      console.log('      > Running "npx prisma db seed"...');
      execSync('npx prisma db seed', { stdio: 'inherit' });
      
      console.log('\n// DATABASE SETUP COMPLETE // ------------------------------------');
      console.log('Data seed executed. Admin account created: admin@societeduvide.com / password123');
      console.log('Starting Next.js Development Server on http://localhost:3000\n');
      
      // Start Dev Server
      execSync('npm run dev', { stdio: 'inherit' });
    } catch (err) {
      console.error('\nERROR executing setup commands:', err.message);
      process.exit(1);
    }
  }
}

setupDatabase();
