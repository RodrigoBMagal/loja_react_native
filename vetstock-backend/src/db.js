const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const createTables = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(30) DEFAULT 'funcionario',
            created_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      category VARCHAR(80),
      quantity INTEGER DEFAULT 0,
      min_quantity INTEGER DEFAULT 0,
      unit VARCHAR(50),
      price NUMERIC(10,2),
      supplier VARCHAR(100),
      expiry_date DATE,
      last_updated TIMESTAMP DEFAULT NOW()
    );
    `);
};

module.exports = {pool, createTables};