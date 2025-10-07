const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.usuario.create({
    data: {
      nome: "Administrador",
      email: "admin@autopecas.com",
      senha: "hFGXDK0wiAqMAlCc"
    }
  })
  console.log("Usuário admin criado!")
}

main()