import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET → gerar relatórios de vendas
export async function GET() {
  try {
    console.log("🔍 Iniciando geração de relatórios...");

    // total de vendas
    const totalVendas = await prisma.venda.count();
    console.log("📊 Total de vendas:", totalVendas);

    // vendas detalhadas para faturamento
    const vendasDetalhadas = await prisma.venda.findMany({
      include: { 
        produto: true,
        cliente: true 
      },
    });
    console.log("📦 Vendas encontradas:", vendasDetalhadas.length);

    const faturamentoTotal = vendasDetalhadas.reduce(
      (acc, v) => acc + v.quantidade * (v.produto?.preco || 0),
      0
    );

    // ✅ VERSÃO SIMPLIFICADA: produtos mais vendidos
    const produtosAgrupados = vendasDetalhadas.reduce((acc: any[], venda) => {
      const produtoExistente = acc.find(item => item.produtoId === venda.produtoId);
      
      if (produtoExistente) {
        produtoExistente.quantidade += venda.quantidade;
        produtoExistente.faturamento += venda.quantidade * (venda.produto?.preco || 0);
      } else {
        acc.push({
          produtoId: venda.produtoId,
          produto: venda.produto?.nome || "Desconhecido",
          quantidade: venda.quantidade,
          faturamento: venda.quantidade * (venda.produto?.preco || 0),
        });
      }
      return acc;
    }, []);

    // ordenar por quantidade
    const produtosMaisVendidos = produtosAgrupados
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    // ✅ VERSÃO SIMPLIFICADA: clientes que mais compraram
    const clientesAgrupados = vendasDetalhadas.reduce((acc: any[], venda) => {
      const clienteId = venda.clienteId || "anonimo";
      const clienteExistente = acc.find(item => item.clienteId === clienteId);
      
      if (clienteExistente) {
        clienteExistente.totalCompras += 1;
        clienteExistente.totalItens += venda.quantidade;
        clienteExistente.faturamento += venda.quantidade * (venda.produto?.preco || 0);
      } else {
        acc.push({
          clienteId: clienteId,
          cliente: venda.cliente?.nome || "Cliente não identificado",
          totalCompras: 1,
          totalItens: venda.quantidade,
          faturamento: venda.quantidade * (venda.produto?.preco || 0),
        });
      }
      return acc;
    }, []);

    const clientesMaisCompraram = clientesAgrupados
      .sort((a, b) => b.faturamento - a.faturamento)
      .slice(0, 5);

    // ✅ VERSÃO SIMPLIFICADA: vendas por mês
    const vendasPorMes = vendasDetalhadas.reduce((acc: any[], venda) => {
      const mes = new Date(venda.data).toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      const mesExistente = acc.find(item => item.mes === mes);
      
      if (mesExistente) {
        mesExistente.quantidade += venda.quantidade;
      } else {
        acc.push({
          mes,
          quantidade: venda.quantidade,
        });
      }
      
      return acc;
    }, []).sort((a, b) => {
      // Ordenar por data
      const [mesA, anoA] = a.mes.split(' ');
      const [mesB, anoB] = b.mes.split(' ');
      return new Date(`${mesA} 1, ${anoA}`).getTime() - new Date(`${mesB} 1, ${anoB}`).getTime();
    });

    console.log("✅ Relatórios gerados com sucesso");

    return NextResponse.json({
      totalVendas,
      faturamentoTotal,
      produtosMaisVendidos,
      clientesMaisCompraram,
      vendasPorMes,
    });

  } catch (error) {
    console.error("❌ Erro no GET /api/relatorios:", error);
    return NextResponse.json(
      { error: `Erro ao gerar relatórios: ${error}` },
      { status: 500 }
    );
  }
}