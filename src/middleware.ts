export const runtime = 'nodejs'; // 
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  
  console.log("🔍 MIDDLEWARE - URL:", req.url);
  console.log("🔍 MIDDLEWARE - Token encontrado:", !!token);
  console.log("🔍 MIDDLEWARE - Token value:", token);

  if (!token) {
    console.log("🔍 MIDDLEWARE - ❌ Sem token, redirecionando para login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || "uma_senha_secreta_segura");
    console.log("🔍 MIDDLEWARE - Token válido, permitindo acesso");
    return NextResponse.next();
  } catch (err) {
    console.log("🔍 MIDDLEWARE - Token inválido:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/estoque/:path*", "/vendas/:path*", "/relatorios/:path*"],
};