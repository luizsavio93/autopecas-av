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
      include: { 
        produto: {
          select: {
            id: true,
            nome: true,
            quantidade: true,
            preco: true
          }
        } 
      },
      orderBy: { createdAt: "desc" }
    });
    
    // Formatar os dados para compatibilidade com a página
    const vendasFormatadas = vendas.map(venda => ({
      id: venda.id,
      produto: {
        id: venda.produto.id,
        nome: venda.produto.nome,
        quantidade: venda.produto.quantidade
      },
      quantidade: venda.quantidade,
      data: venda.createdAt.toISOString(),
      valorTotal: venda.valorTotal
    }));
    
    return NextResponse.json(vendasFormatadas, { headers: corsHeaders });
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

    const quantidadeNum = Number(quantidade);

    // Verifica se o produto existe
    const produto = await prisma.produto.findUnique({
      where: { id: produtoId },
    });

    if (!produto) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404, headers: corsHeaders }
      );
    }

    if (produto.quantidade < quantidadeNum) {
      return NextResponse.json(
        { error: `Estoque insuficiente. Disponível: ${produto.quantidade}` },
        { status: 400, headers: corsHeaders }
      );
    }

    // Usar transação para garantir consistência
    const resultado = await prisma.$transaction(async (tx) => {
      // Cria a venda
      const venda = await tx.venda.create({
        data: {
          produtoId: produtoId,
          quantidade: quantidadeNum,
          valorTotal: produto.preco * quantidadeNum,
        },
        include: {
          produto: {
            select: {
              id: true,
              nome: true,
              quantidade: true,
              preco: true
            }
          }
        }
      });

      // Atualiza o estoque do produto
      await tx.produto.update({
        where: { id: produtoId },
        data: {
          quantidade: produto.quantidade - quantidadeNum,
        },
      });

      return venda;
    });

    // Formatar resposta para compatibilidade
    const vendaFormatada = {
      id: resultado.id,
      produto: {
        id: resultado.produto.id,
        nome: resultado.produto.nome,
        quantidade: resultado.produto.quantidade
      },
      quantidade: resultado.quantidade,
      data: resultado.createdAt.toISOString(),
      valorTotal: resultado.valorTotal
    };

    return NextResponse.json(vendaFormatada, { 
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