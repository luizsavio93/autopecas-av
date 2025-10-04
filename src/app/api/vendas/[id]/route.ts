import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT → atualizar uma venda
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const { quantidade } = body;

    if (!quantidade || quantidade <= 0) {
      return NextResponse.json(
        { error: "Quantidade inválida" },
        { status: 400 }
      );
    }

    // Verifica se a venda existe
    const vendaExistente = await prisma.venda.findUnique({
      where: { id },
      include: { produto: true },
    });

    if (!vendaExistente) {
      return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 });
    }

    // Calcula diferença no estoque
    const diferenca = quantidade - vendaExistente.quantidade;

    if (vendaExistente.produto.quantidade < diferenca) {
      return NextResponse.json(
        { error: "Estoque insuficiente para atualizar a venda" },
        { status: 400 }
      );
    }

    // Atualiza a venda
    const vendaAtualizada = await prisma.venda.update({
      where: { id },
      data: { quantidade },
    });

    // Atualiza estoque
    await prisma.produto.update({
      where: { id: vendaExistente.produtoId },
      data: {
        quantidade: vendaExistente.produto.quantidade - diferenca,
      },
    });

    return NextResponse.json(vendaAtualizada);
  } catch (error) {
    console.error("Erro no PUT /api/vendas/[id]:", error);
    return NextResponse.json({ error: "Erro ao atualizar venda" }, { status: 500 });
  }
}

// DELETE → excluir uma venda
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    // Busca a venda para devolver estoque
    const venda = await prisma.venda.findUnique({
      where: { id },
    });

    if (!venda) {
      return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 });
    }

    // Exclui a venda
    await prisma.venda.delete({
      where: { id },
    });

    // Devolve a quantidade vendida ao estoque
    await prisma.produto.update({
      where: { id: venda.produtoId },
      data: {
        quantidade: { increment: venda.quantidade },
      },
    });

    return NextResponse.json({ message: "Venda excluída com sucesso" });
  } catch (error) {
    console.error("Erro no DELETE /api/vendas/[id]:", error);
    return NextResponse.json({ error: "Erro ao excluir venda" }, { status: 500 });
  }
}
