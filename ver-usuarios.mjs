// ver-usuarios.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verUsuarios() {
  try {
    const usuarios = await prisma.usuario.findMany();
    console.log("Usuários cadastrados:");
    usuarios.forEach(usuario => {
      console.log(`- Email: ${usuario.email}, Nome: ${usuario.nome}, ID: ${usuario.id}`);
    });
  } catch (error) {
    console.error("Erro:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verUsuarios();