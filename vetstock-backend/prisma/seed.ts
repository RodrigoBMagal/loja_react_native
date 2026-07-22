import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SeedProduct = {
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  price: number;
  supplier: string;
  expiryDate: string | null;
};

const PRODUCTS: SeedProduct[] = [
  { name: 'Antibiótico Amoxicilina', category: 'Medicamento', quantity: 50, minQuantity: 10, unit: 'unidade', price: 25.5, supplier: 'Fornecedor A', expiryDate: null },
  { name: 'Seringa 10ml', category: 'Equipamento', quantity: 100, minQuantity: 20, unit: 'caixa', price: 45.0, supplier: 'Fornecedor B', expiryDate: null },
  { name: 'Alimento Premium Cão', category: 'Alimento', quantity: 30, minQuantity: 15, unit: 'kg', price: 120.0, supplier: 'Fornecedor C', expiryDate: '2025-12-31' },
  { name: 'Colírio Oftalmológico', category: 'Medicamento', quantity: 20, minQuantity: 5, unit: 'unidade', price: 35.75, supplier: 'Fornecedor A', expiryDate: null },
  { name: 'Luva Látex Médica', category: 'Equipamento', quantity: 200, minQuantity: 50, unit: 'caixa', price: 15.5, supplier: 'Fornecedor D', expiryDate: null },
];

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  console.log('👤 Inserindo usuários de teste...');
  const hashedPassword = await bcrypt.hash('123456', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: hashedPassword, role: 'admin' },
  });

  await prisma.user.upsert({
    where: { username: 'funcionario' },
    update: {},
    create: { username: 'funcionario', password: hashedPassword, role: 'funcionario' },
  });
  console.log('✅ Usuários criados!\n');

  console.log('📦 Inserindo produtos de teste...');
  for (const product of PRODUCTS) {
    const exists = await prisma.product.findFirst({ where: { name: product.name } });
    if (!exists) {
      await prisma.product.create({
        data: {
          ...product,
          expiryDate: product.expiryDate ? new Date(product.expiryDate) : null,
        },
      });
    }
  }
  console.log('✅ Produtos criados!\n');

  console.log('🎉 Seed concluído com sucesso!\n');
  console.log('📝 Usuários de teste:');
  console.log('   Admin: admin / 123456');
  console.log('   Funcionário: funcionario / 123456\n');
}

main()
  .catch((err) => {
    console.error('❌ Erro ao fazer seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
