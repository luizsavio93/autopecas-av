import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Headers CORS para evitar problemas
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// OPTIONS handler para CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET → listar produtos
export async function GET() {
  try {
    console.log("GET /api/produtos - Buscando produtos...");
    const produtos = await prisma.produto.findMany({
      orderBy: { nome: 'asc' }
    });
    
    console.log(`GET /api/produtos - ${produtos.length} produtos encontrados`);
    
    return NextResponse.json(Array.isArray(produtos) ? produtos : [], {
      headers: corsHeaders
    });
  } catch (error) {
    console.error("Erro no GET /api/produtos:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar produtos" }, 
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// POST → adicionar produto
export async function POST(req: Request) {
  try {
    console.log("POST /api/produtos - Criando novo produto...");
    
    const body = await req.json();
    const { nome, descricao, quantidade, preco } = body;

    console.log("Dados recebidos:", body);

    if (!nome || quantidade == null || preco == null) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    const novoProduto = await prisma.produto.create({
      data: {
        nome,
        descricao: descricao || "",
        quantidade: Number(quantidade),
        preco: Number(preco),
      },
    });

    console.log("POST /api/produtos - Produto criado:", novoProduto.id);

    return NextResponse.json(novoProduto, { 
      status: 201,
      headers: corsHeaders
    });
  } catch (error) {
    console.error("Erro no POST /api/produtos:", error);
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}