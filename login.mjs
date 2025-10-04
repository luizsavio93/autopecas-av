// login-teste.mjs
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function login(email, senhaDigitada) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email: email }
    });

    if (!usuario) {
      console.log("Usuário não encontrado");
      return;
    }

    console.log("Hash armazenado:", usuario.senha);
    
    const senhaCorreta = await bcrypt.compare(senhaDigitada, usuario.senha);
    
    if (senhaCorreta) {
      console.log("✅ Login bem-sucedido!");
    } else {
      console.log("❌ Senha incorreta");
      
      // Testar senhas comuns
      const senhasTeste = ["senha123", "123456", "teste", "password", "admin"];
      for (let senha of senhasTeste) {
        const teste = await bcrypt.compare(senha, usuario.senha);
        if (teste) {
          console.log(`🔑 Senha encontrada: "${senha}"`);
          return;
        }
      }
      console.log("Nenhuma senha comum funcionou");
    }
  } catch (error) {
    console.error("Erro:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Teste com diferentes emails
login("av_autopecas@gmail.com", "123456");
// login("teste@teste.com", "123456");