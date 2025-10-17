import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Listar todas as vendas com produto e cliente
export async function GET() {
  try {
    const vendas = await prisma.venda.findMany({
      include: {
        produto: true,
        cliente: true, // ✅ Incluir dados do cliente
      },
      orderBy: { data: 'desc' }
    });
    return NextResponse.json(vendas);
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar nova venda
export async function POST(request: NextRequest) {
  try {
    const { produtoId, clienteId, quantidade } = await request.json();

    if (!produtoId || !quantidade) {
      return NextResponse.json(
        { error: "Produto e quantidade são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se produto existe e tem estoque
    const produto = await prisma.produto.findUnique({
      where: { id: produtoId }
    });

    if (!produto) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    if (produto.quantidade < quantidade) {
      return NextResponse.json(
        { error: "Quantidade em estoque insuficiente" },
        { status: 400 }
      );
    }

    // Criar venda
    const venda = await prisma.venda.create({
      data: {
        produtoId,
        clienteId: clienteId || null, // ✅ Cliente opcional
        quantidade: parseInt(quantidade),
      },
      include: {
        produto: true,
        cliente: true, // ✅ Incluir dados do cliente
      }
    });

    // Atualizar estoque do produto
    await prisma.produto.update({
      where: { id: produtoId },
      data: {
        quantidade: produto.quantidade - quantidade
      }
    });

    return NextResponse.json(venda, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar venda:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}