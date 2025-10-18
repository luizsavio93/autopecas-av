import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Buscar fornecedor por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fornecedor = await prisma.fornecedor.findUnique({
      where: { id: params.id },
    });

    if (!fornecedor) {
      return NextResponse.json(
        { error: "Fornecedor não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(fornecedor);
  } catch (error) {
    console.error("❌ Erro ao buscar fornecedor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar fornecedor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { 
      razaoSocial, 
      cnpj, 
      email, 
      telefone,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep
    } = await request.json();

    if (!razaoSocial) {
      return NextResponse.json(
        { error: "Razão social é obrigatória" },
        { status: 400 }
      );
    }

    // Verificar se CNPJ já existe em outro fornecedor
    if (cnpj) {
      const fornecedorComCNPJ = await prisma.fornecedor.findFirst({
        where: { 
          cnpj,
          NOT: { id: params.id }
        }
      });
      if (fornecedorComCNPJ) {
        return NextResponse.json(
          { error: "CNPJ já cadastrado em outro fornecedor" },
          { status: 400 }
        );
      }
    }

    const fornecedor = await prisma.fornecedor.update({
      where: { id: params.id },
      data: {
        razaoSocial,
        cnpj: cnpj || null,
        email: email || null,
        telefone: telefone || null,
        numero: numero || null,
        complemento: complemento || null,
        bairro: bairro || null,
        cidade: cidade || null,
        estado: estado || null,
        cep: cep || null,
      },
    });

    console.log("✅ Fornecedor atualizado:", fornecedor.id);
    return NextResponse.json(fornecedor);
  } catch (error) {
    console.error("❌ Erro ao atualizar fornecedor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir fornecedor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o fornecedor tem produtos associados
    const produtosAssociados = await prisma.produto.findMany({
      where: { fornecedorId: params.id }
    });

    if (produtosAssociados.length > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir fornecedor com produtos associados" },
        { status: 400 }
      );
    }

    await prisma.fornecedor.delete({
      where: { id: params.id },
    });

    console.log("✅ Fornecedor excluído:", params.id);
    return NextResponse.json({ message: "Fornecedor excluído com sucesso" });
  } catch (error) {
    console.error("❌ Erro ao excluir fornecedor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}