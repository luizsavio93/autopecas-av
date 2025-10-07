import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET → listar vendas
export async function GET() {
  try {
    const vendas = await prisma.venda.findMany({
      include: { produto: true },
      orderBy: { createdAt: "desc" }
    });
    
    return NextResponse.json(vendas, { headers: corsHeaders });
  } catch (error) {
    console.error("Erro no GET /api/vendas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar vendas" },
      { status: 500, headers: corsHeaders }
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
        { status: 400, headers: corsHeaders }
      );
    }

    // Verifica se o produto existe
    const produto = await prisma.produto.findUnique({
      where: { id: produtoId }, // ✅ Agora aceita string
    });

    if (!produto) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404, headers: corsHeaders }
      );
    }

    if (produto.quantidade < quantidade) {
      return NextResponse.json(
        { error: "Estoque insuficiente" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Cria a venda
    const venda = await prisma.venda.create({
      data: {
        produtoId: produtoId, // ✅ String do MongoDB
        quantidade: Number(quantidade),
        valorTotal: produto.preco * Number(quantidade),
      },
    });

    // Atualiza o estoque do produto
    await prisma.produto.update({
      where: { id: produtoId },
      data: {
        quantidade: produto.quantidade - Number(quantidade),
      },
    });

    return NextResponse.json(venda, { 
      status: 201, 
      headers: corsHeaders 
    });
  } catch (error) {
    console.error("Erro no POST /api/vendas:", error);
    return NextResponse.json(
      { error: "Erro ao registrar venda" },
      { status: 500, headers: corsHeaders }
    );
  }
}