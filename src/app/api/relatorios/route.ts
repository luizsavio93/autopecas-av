import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET → gerar relatórios de vendas
export async function GET() {
  try {
    // total de vendas
    const totalVendas = await prisma.venda.count();

    // faturamento total
    const faturamento = await prisma.venda.aggregate({
      _sum: { quantidade: true },
    });

    // faturamento em R$ (considerando preço * quantidade)
    const vendasDetalhadas = await prisma.venda.findMany({
      include: { produto: true },
    });

    const faturamentoTotal = vendasDetalhadas.reduce(
      (acc, v) => acc + v.quantidade * (v.produto?.preco || 0),
      0
    );

    // produtos mais vendidos
    const produtosMaisVendidos = await prisma.venda.groupBy({
      by: ["produtoId"],
      _sum: { quantidade: true },
      orderBy: { _sum: { quantidade: "desc" } },
      take: 5,
    });

    // junta com nomes dos produtos
    const produtosComNome = await Promise.all(
      produtosMaisVendidos.map(async (item) => {
        const produto = await prisma.produto.findUnique({
          where: { id: item.produtoId },
        });
        return {
          produto: produto?.nome || "Desconhecido",
          quantidade: item._sum.quantidade || 0,
        };
      })
    );

    return NextResponse.json({
      totalVendas,
      faturamentoTotal,
      produtosMaisVendidos: produtosComNome,
    });
  } catch (error) {
    console.error("Erro no GET /api/relatorios:", error);
    return NextResponse.json(
      { error: "Erro ao gerar relatórios" },
      { status: 500 }
    );
  }
}
