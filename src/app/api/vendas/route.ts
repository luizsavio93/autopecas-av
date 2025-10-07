import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET → listar vendas
export async function GET() {
  try {
    const vendas = await prisma.venda.findMany({
      include: { produto: true }, // inclui nome do produto
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(vendas);
  } catch (error) {
    console.error("Erro no GET /api/vendas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar vendas" },
      { status: 500 }
    );
  }
}

// POST → registrar venda
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { produtoId, quantidade } = body;

    if (!produtoId || !quantidade || quantidade <= 0) {
      return NextResponse.json(
        { error: "Produto e quantidade são obrigatórios" },
        { status: 400 }
      );
    }

    // verifica se o produto existe
    const produto = await prisma.produto.findUnique({
      where: { id: Number(produtoId) },
    });

    if (!produto) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    if (produto.quantidade < quantidade) {
      return NextResponse.json(
        { error: "Estoque insuficiente" },
        { status: 400 }
      );
    }

    // cria a venda
    const venda = await prisma.venda.create({
      data: {
        produtoId: Number(produtoId),
        quantidade: Number(quantidade),
      },
    });

    // atualiza o estoque do produto
    await prisma.produto.update({
      where: { id: Number(produtoId) },
      data: {
        quantidade: produto.quantidade - Number(quantidade),
      },
    });

    return NextResponse.json(venda, { status: 201 });
  } catch (error) {
    console.error("Erro no POST /api/vendas:", error);
    return NextResponse.json(
      { error: "Erro ao registrar venda" },
      { status: 500 }
    );
  }
}
