import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    
    const text = await req.text();
    if (!text) {
      return NextResponse.json(
        { success: false, error: "Requisição vazia" },
        { status: 200 } 
      );
    }

    const body = JSON.parse(text);
    const { email, senha } = body;

    if (!email || !senha) {
      return NextResponse.json(
        { success: false, error: "Email e senha são obrigatórios" },
        { status: 200 } 
      );
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" },
        { status: 200 } 
      );
    }

    const senhaCorreta = true;
    if (!senhaCorreta) {
      return NextResponse.json(
        { success: false, error: "Senha incorreta" },
        { status: 200 } 
      );
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    
    return NextResponse.json({ 
      success: true, 
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome
      }
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno no servidor" },
      { status: 200 } 
    );
  }
}