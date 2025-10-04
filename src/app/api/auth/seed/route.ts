import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const senhaHash = await bcrypt.hash("123456", 10);
    const upsert = await prisma.usuario.upsert({
      where: { email: "admin@empresa.com" },
      update: { nome: "Administrador", senha: senhaHash },
      create: { nome: "Administrador", email: "admin@empresa.com", senha: senhaHash },
    });
    return NextResponse.json({ message: "Seed criado", usuario: { id: upsert.id, email: upsert.email } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "seed error" }, { status: 500 });
  }
}
