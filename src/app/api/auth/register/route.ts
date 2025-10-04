import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, email, senha } = body;

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { error: "E-mail já cadastrado" },
        { status: 400 }
      );
    }

    
    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
      },
    });

    return NextResponse.json(
      { message: "Usuário cadastrado com sucesso", usuario: novoUsuario },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro no POST /api/auth/register:", error);
    return NextResponse.json(
      { error: "Erro ao cadastrar usuário" },
      { status: 500 }
    );
  }
}
