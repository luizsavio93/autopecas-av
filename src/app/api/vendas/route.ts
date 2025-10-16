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
    
    // ✅ FORÇAR IDs CURTOS - método garantido
    const vendasFormatadas = vendas.map((venda, index) => {
      // Gerar ID curto baseado na posição (mais recente = ID maior)
      const idCurto = (vendas.length - index).toString();
      
      return {
        id: idCurto, // ✅ SEMPRE ID CURTO
        produto: {
          id: venda.produto.id,
          nome: venda.produto.nome,
          quantidade: venda.produto.quantidade
        },
        quantidade: venda.quantidade,
        data: venda.createdAt.toISOString(),
        valorTotal: venda.valorTotal,
        // Para debug - remover depois
        _idOriginal: venda.id
      };
    });
    
    console.log('📦 Vendas formatadas com IDs curtos:', vendasFormatadas.length);
    
    return NextResponse.json(vendasFormatadas, { headers: corsHeaders });
  } catch (error) {
    console.error("Erro no GET /api/vendas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar vendas" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST → registrar venda - VERSÃO COM DEBUG COMPLETO
export async function POST(req: Request) {
  try {
    console.log("🔄 POST /api/vendas - Iniciando...");
    
    const body = await req.json();
    console.log("📦 Dados recebidos:", body);
    
    const { produtoId, quantidade } = body;

    if (!produtoId || !quantidade || quantidade <= 0) {
      console.log("❌ Validação falhou:", { produtoId, quantidade });
      return NextResponse.json(
        { error: "Produto e quantidade são obrigatórios" },
        { status: 400, headers: corsHeaders }
      );
    }

    const quantidadeNum = Number(quantidade);
    console.log("🔍 Buscando produto:", produtoId);

    // Verifica se o produto existe
    const produto = await prisma.produto.findUnique({
      where: { id: produtoId },
    });

    if (!produto) {
      console.log("❌ Produto não encontrado:", produtoId);
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404, headers: corsHeaders }
      );
    }

    console.log("✅ Produto encontrado:", produto.nome, "Estoque:", produto.quantidade);

    if (produto.quantidade < quantidadeNum) {
      console.log("❌ Estoque insuficiente:", produto.quantidade, "<", quantidadeNum);
      return NextResponse.json(
        { error: `Estoque insuficiente. Disponível: ${produto.quantidade}` },
        { status: 400, headers: corsHeaders }
      );
    }

    // Gerar ID curto sequencial
    console.log("🔍 Buscando última venda para gerar ID...");
    const ultimaVenda = await prisma.venda.findFirst({
      orderBy: { createdAt: "desc" }
    });
    
    let novoId;
    if (ultimaVenda && !isNaN(Number(ultimaVenda.id))) {
      novoId = (parseInt(ultimaVenda.id) + 1).toString();
    } else {
      const totalVendas = await prisma.venda.count();
      novoId = (totalVendas + 1).toString();
    }

    console.log("🎯 Novo ID gerado:", novoId);

    // Usar transação para garantir consistência
    console.log("💾 Iniciando transação...");
    const resultado = await prisma.$transaction(async (tx) => {
      // Cria a venda com ID curto
      console.log("📝 Criando venda...");
      const venda = await tx.venda.create({
        data: {
          id: novoId, // ✅ ID curto sequencial
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

      console.log("✅ Venda criada:", venda.id);

      // Atualiza o estoque do produto
      console.log("📦 Atualizando estoque...");
      await tx.produto.update({
        where: { id: produtoId },
        data: {
          quantidade: produto.quantidade - quantidadeNum,
        },
      });

      console.log("✅ Estoque atualizado");
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

    console.log("🎉 Venda registrada com sucesso:", vendaFormatada);
    
    return NextResponse.json(vendaFormatada, { 
      status: 201, 
      headers: corsHeaders 
    });
    
  } catch (error: any) {
    console.error("💥 ERRO NO POST /api/vendas:", error);
    console.error("💥 Stack trace:", error.stack);
    
    return NextResponse.json(
      { 
        error: "Erro ao registrar venda", 
        details: error.message 
      },
      { status: 500, headers: corsHeaders }
    );
  }
}