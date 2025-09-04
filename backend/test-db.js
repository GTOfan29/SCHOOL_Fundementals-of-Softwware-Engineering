const { Pool } = require('pg');

async function testConnection(password) {
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: password,
    port: 5432,
  });

  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Connection successful! Current time:', result.rows[0].now);
    return true;
  } catch (err) {
    console.error('Connection failed:', err.message);
    return false;
  } finally {
    await pool.end();
  }
}

// Test a password
const password = process.argv[2];
if (!password) {
  console.log('Usage: node test-db.js <password>');
  process.exit(1);
}

testConnection(password); 