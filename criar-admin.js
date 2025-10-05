const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const senha = await bcrypt.hash('123456', 10);
  const usuario = await prisma.usuario.create({
    data: {
      nome: 'Admin',
      email: 'admin@admin.com',
      senha: senha
    }
  });
  console.log('Usuário criado:', usuario);
}

main();