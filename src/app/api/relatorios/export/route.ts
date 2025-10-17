import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log("🔍 Iniciando exportação CSV...");

    const vendas = await prisma.venda.findMany({
      include: { 
        produto: true,
        cliente: true 
      },
      orderBy: { data: "desc" },
    });

    console.log("📦 Vendas para exportação:", vendas.length);

    if (!vendas || vendas.length === 0) {
      return NextResponse.json({ error: "Nenhuma venda encontrada" }, { status: 404 });
    }

    // ✅ CABEÇALHO ATUALIZADO COM CLIENTE
    let csv = "Data,Produto,Cliente,Quantidade,Preço Unitário,Valor Total\n";
    
    vendas.forEach((v) => {
      const data = new Date(v.data).toLocaleDateString("pt-BR");
      const produto = (v.produto?.nome || "").replace(/"/g, '""');
      const cliente = (v.cliente?.nome || "Cliente não identificado").replace(/"/g, '""');
      const quantidade = v.quantidade;
      const precoUnitario = v.produto?.preco || 0;
      const valorTotal = quantidade * precoUnitario;
      
      // ✅ FORMATO CORRETO COM CLIENTE
      csv += `"${data}","${produto}","${cliente}",${quantidade},${precoUnitario},${valorTotal}\n`;
    });

    console.log("✅ CSV gerado com sucesso");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="relatorio_vendas_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar CSV:", error);
    return NextResponse.json({ error: "Erro ao exportar relatório" }, { status: 500 });
  }
}