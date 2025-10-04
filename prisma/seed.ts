import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  // Verifique se a tabela existe primeiro
  const produtos = await prisma.produto.findMany();
  console.log(`Produtos existentes: ${produtos.length}`);

  // Dados básicos para teste
  const data = [
    { nome: "Filtro", descricao: "Filtro teste", quantidade: 10, preco: 10.0 },
    { nome: "Pastilha", descricao: "Pastilha teste", quantidade: 5, preco: 20.0 }
  ];

  for (const item of data) {
    await prisma.produto.create({
      data: item
    }).catch(e => console.log(`Produto ${item.nome} já existe ou erro:`, e.message));
  }

  console.log("Seed finalizado!");
}