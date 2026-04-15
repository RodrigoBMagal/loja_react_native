require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./src/db');

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...\n');

    // Criar tabelas
    console.log('📋 Criando tabelas...');
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
    console.log('✅ Tabelas criadas com sucesso!\n');

    // Inserir usuários de teste
    console.log('👤 Inserindo usuários de teste...');
    const hashedPassword = await bcrypt.hash('123456', 10);

    await pool.query(
      `INSERT INTO users (username, password, role) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (username) DO NOTHING`,
      ['admin', hashedPassword, 'admin']
    );

    await pool.query(
      `INSERT INTO users (username, password, role) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (username) DO NOTHING`,
      ['funcionario', hashedPassword, 'funcionario']
    );
    console.log('✅ Usuários criados!\n');

    // Inserir produtos de teste
    console.log('📦 Inserindo produtos de teste...');
    const products = [
      ['Antibiótico Amoxicilina', 'Medicamento', 50, 10, 'unidade', 25.50, 'Fornecedor A', null],
      ['Seringa 10ml', 'Equipamento', 100, 20, 'caixa', 45.00, 'Fornecedor B', null],
      ['Alimento Premium Cão', 'Alimento', 30, 15, 'kg', 120.00, 'Fornecedor C', '2025-12-31'],
      ['Colírio Oftalmológico', 'Medicamento', 20, 5, 'unidade', 35.75, 'Fornecedor A', null],
      ['Luva Látex Médica', 'Equipamento', 200, 50, 'caixa', 15.50, 'Fornecedor D', null],
    ];

    for (const product of products) {
      await pool.query(
        `INSERT INTO products (name, category, quantity, min_quantity, unit, price, supplier, expiry_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT DO NOTHING`,
        product
      );
    }
    console.log('✅ Produtos criados!\n');

    console.log('🎉 Seed concluído com sucesso!\n');
    console.log('📝 Usuários de teste:');
    console.log('   Admin: admin / 123456');
    console.log('   Funcionário: funcionario / 123456\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao fazer seed:', err.message);
    process.exit(1);
  }
};

seedDatabase();
