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

// ✅ PUT → Atualizar produto
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "ID do produto é obrigatório" },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { nome, descricao, quantidade, preco } = body;

    if (!nome?.trim()) {
      return NextResponse.json(
        { error: "Nome do produto é obrigatório" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (quantidade == null || preco == null) {
      return NextResponse.json(
        { error: "Quantidade e preço são obrigatórios" },
        { status: 400, headers: corsHeaders }
      );
    }

    const quantidadeNum = Number(quantidade);
    const precoNum = Number(preco);

    if (isNaN(quantidadeNum) || isNaN(precoNum)) {
      return NextResponse.json(
        { error: "Quantidade e preço devem ser números válidos" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (quantidadeNum < 0 || precoNum < 0) {
      return NextResponse.json(
        { error: "Quantidade e preço não podem ser negativos" },
        { status: 400, headers: corsHeaders }
      );
    }

    const produtoAtualizado = await prisma.produto.update({
      where: { id }, // ✅ agora id é string
      data: {
        nome: nome.trim(),
        descricao: (descricao || "").trim(),
        quantidade: quantidadeNum,
        preco: precoNum,
      },
    });

    return NextResponse.json(produtoAtualizado, { headers: corsHeaders });
  } catch (error) {
    console.error("Erro no PUT /api/produtos/[id]:", error);

    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { error: "Erro ao atualizar produto" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ DELETE → Excluir produto
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "ID do produto é obrigatório" },
        { status: 400, headers: corsHeaders }
      );
    }

    const produto = await prisma.produto.findUnique({
      where: { id }, // ✅ string aqui também
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
