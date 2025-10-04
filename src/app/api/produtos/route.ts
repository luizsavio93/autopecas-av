import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET → listar produtos
export async function GET() {
  try {
    const produtos = await prisma.produto.findMany();
    return NextResponse.json(Array.isArray(produtos) ? produtos : []);
  } catch (error) {
    console.error("Erro no GET /api/produtos:", error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST → adicionar produto
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, descricao, quantidade, preco } = body;

    if (!nome || quantidade == null || preco == null) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      );
    }

    const novoProduto = await prisma.produto.create({
      data: {
        nome,
        descricao,
        quantidade: Number(quantidade),
        preco: Number(preco),
      },
    });

    return NextResponse.json(novoProduto, { status: 201 });
  } catch (error) {
    console.error("Erro no POST /api/produtos:", error);
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { status: 500 }
    );
  }
}
