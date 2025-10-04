import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const vendas = await prisma.venda.findMany({
      include: { produto: true },
      orderBy: { data: "desc" },
    });

    if (!vendas || vendas.length === 0) {
      return NextResponse.json({ error: "Nenhuma venda encontrada" }, { status: 404 });
    }

    let csv = "ID Venda,Produto,Quantidade,Preço Unitário,Total,Data\n";
    vendas.forEach((v) => {
      const total = v.quantidade * (v.produto?.preco || 0);
      const nome = (v.produto?.nome || "").replace(/"/g, '""'); // escape
      csv += `${v.id},"${nome}",${v.quantidade},${v.produto?.preco},${total},"${new Date(v.data).toLocaleString("pt-BR")}"\n`;
    });

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="relatorio_vendas.csv"`,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar CSV:", error);
    return NextResponse.json({ error: "Erro ao exportar relatório" }, { status: 500 });
  }
}
