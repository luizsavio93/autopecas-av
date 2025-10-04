import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT → atualizar produto
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
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

    return NextResponse.json(produtoAtualizado);
  } catch (error) {
    console.error("Erro no PUT /api/produtos/[id]:", error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

// DELETE → excluir produto
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    await prisma.produto.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Produto excluído com sucesso" });
  } catch (error) {
    console.error("Erro no DELETE /api/produtos/[id]:", error);
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 });
  }
}
