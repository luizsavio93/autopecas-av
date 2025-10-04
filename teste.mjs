// teste.mjs
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function criarUsuario() {
  try {
    const senhahash = await bcrypt.hash('senha123', 10);
    
    const usuario = await prisma.usuario.create({
      data: {
        email: "av_autopecas@gmail.com", 
        senha: senhahash,
        nome: "Auto Peças AV"  // ← CAMPO OBRIGATÓRIO ADICIONADO
      },
    });
    
    console.log("Usuário criado:", usuario);
  } catch (error) {
    console.error("Erro:", error);
  } finally {
    await prisma.$disconnect();
  }
}

criarUsuario();