import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ PUT → Atualizar venda
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id; // ← MongoDB usa String como ID
    const body = await req.json();
    const { quantidade } = body;

    if (!quantidade || quantidade <= 0) {
      return NextResponse.json(
        { error: "Quantidade inválida" },
        { status: 400, headers: corsHeaders }
      );
    }

    const vendaExistente = await prisma.venda.findUnique({
      where: { id },
      include: { produto: true },
    });

    if (!vendaExistente) {
      return NextResponse.json(
        { error: "Venda não encontrada" },
        { status: 404, headers: corsHeaders }
      );
    }

    const diferenca = quantidade - vendaExistente.quantidade;

    if (diferenca > 0 && vendaExistente.produto.quantidade < diferenca) {
      return NextResponse.json(
        { error: "Estoque insuficiente para atualizar a venda" },
        { status: 400, headers: corsHeaders }
      );
    }

    const vendaAtualizada = await prisma.venda.update({
      where: { id },
      data: { quantidade },
    });

    await prisma.produto.update({
      where: { id: vendaExistente.produtoId },
      data: {
        quantidade: vendaExistente.produto.quantidade - diferenca,
      },
    });

    return NextResponse.json(vendaAtualizada, { headers: corsHeaders });
  } catch (error) {
    console.error("Erro no PUT /api/vendas/[id]:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar venda" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ DELETE → Excluir venda
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id; // ← String (ObjectId)

    const venda = await prisma.venda.findUnique({
      where: { id },
    });

    if (!venda) {
      return NextResponse.json(
        { error: "Venda não encontrada" },
        { status: 404, headers: corsHeaders }
      );
    }

    await prisma.venda.delete({ where: { id } });

    await prisma.produto.update({
      where: { id: venda.produtoId },
      data: { quantidade: { increment: venda.quantidade } },
    });

    return NextResponse.json(
      { message: "Venda excluída com sucesso" },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Erro no DELETE /api/vendas/[id]:", error);
    return NextResponse.json(
      { error: "Erro ao excluir venda" },
      { status: 500, headers: corsHeaders }
    );
  }
}
