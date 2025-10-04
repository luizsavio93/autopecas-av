// resetar-senha.mjs
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetarSenha() {
  try {
    const senhahash = await bcrypt.hash('123456', 10);
    
    const usuario = await prisma.usuario.update({
      where: { email: "av_autopecas@gmail.com" },
      data: { 
        senha: senhahash
      },
    });
    
    console.log("✅ Senha resetada!");
    console.log("Email: av_autopecas@gmail.com");
    console.log("Nova senha: 123456");
  } catch (error) {
    console.error("Erro:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetarSenha();