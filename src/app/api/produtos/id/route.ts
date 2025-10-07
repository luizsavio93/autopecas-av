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

// PUT → atualizar produto
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id; // ✅ Já é string - MongoDB ObjectId
    const body = await req.json();
    const { nome, descricao, quantidade, preco } = body;

    const produtoAtualizado = await prisma.produto.update({
      where: { id },
      data: {
        nome,
        descricao,
        quantidade: Number(quantidade),
        preco: Number(preco),
      },
    });

    return NextResponse.json(produtoAtualizado, { headers: corsHeaders });
  } catch (error) {
    console.error("Erro no PUT /api/produtos/[id]:", error);
    return NextResponse.json(
      { error: "Produto não encontrado ou erro ao atualizar" }, 
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE → excluir produto
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id; // ✅ Já é string - MongoDB ObjectId

    // Verifica se o produto existe
    const produto = await prisma.produto.findUnique({
      where: { id },
    });

    if (!produto) {
      return NextResponse.json(
        { error: "Produto não encontrado" }, 
        { status: 404, headers: corsHeaders }
      );
    }

    await prisma.produto.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Produto excluído com sucesso" },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Erro no DELETE /api/produtos/[id]:", error);
    return NextResponse.json(
      { error: "Erro ao excluir produto" },
      { status: 500, headers: corsHeaders }
    );
  }
}