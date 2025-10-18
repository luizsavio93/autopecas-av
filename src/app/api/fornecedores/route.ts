import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Listar todos os fornecedores
export async function GET() {
  try {
    console.log("🔍 Buscando fornecedores...");
    
    const fornecedores = await prisma.fornecedor.findMany({
      orderBy: { razaoSocial: 'asc' }
    });
    
    console.log(`✅ ${fornecedores.length} fornecedores encontrados`);
    return NextResponse.json(fornecedores);
  } catch (error) {
    console.error("❌ Erro ao buscar fornecedores:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar novo fornecedor
export async function POST(request: NextRequest) {
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

    // Verificar se CNPJ já existe
    if (cnpj) {
      const fornecedorExistente = await prisma.fornecedor.findFirst({
        where: { cnpj }
      });
      if (fornecedorExistente) {
        return NextResponse.json(
          { error: "CNPJ já cadastrado" },
          { status: 400 }
        );
      }
    }

    const fornecedor = await prisma.fornecedor.create({
      data: {
        razaoSocial,
        cnpj: cnpj || null,
        email: email || null,
        telefone: telefone || null,
        logradouro: logradouro || null,
        numero: numero || null,
        complemento: complemento || null,
        bairro: bairro || null,
        cidade: cidade || null,
        estado: estado || null,
        cep: cep || null,
      },
    });

    console.log("✅ Fornecedor criado:", fornecedor.id);
    return NextResponse.json(fornecedor, { status: 201 });
  } catch (error) {
    console.error("❌ Erro ao criar fornecedor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}