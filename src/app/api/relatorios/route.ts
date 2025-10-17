import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Exportar relatórios em CSV
export async function GET() {
  try {
    const vendas = await prisma.venda.findMany({
      include: {
        produto: true,
        cliente: true,
      },
      orderBy: { data: 'desc' }
    });

    // Cabeçalho do CSV
    let csv = "Data,Produto,Cliente,Quantidade,Preço Unitário,Valor Total\n";
    
    // Dados
    vendas.forEach(venda => {
      const data = new Date(venda.data).toLocaleDateString('pt-BR');
      const produto = venda.produto.nome;
      const cliente = venda.cliente?.nome || "Cliente não identificado";
      const quantidade = venda.quantidade;
      const precoUnitario = venda.produto.preco;
      const valorTotal = quantidade * precoUnitario;
      
      csv += `"${data}","${produto}","${cliente}",${quantidade},${precoUnitario},${valorTotal}\n`;
    });

    // Retornar como arquivo CSV
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="relatorio-vendas.csv"',
      },
    });
  } catch (error) {
    console.error("Erro ao exportar CSV:", error);
    return NextResponse.json(
      { error: "Erro ao exportar relatório" },
      { status: 500 }
    );
  }
}