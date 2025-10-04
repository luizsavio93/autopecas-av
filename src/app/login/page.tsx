"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCookie } from "cookies-next";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    // Verificar se já está logado
    const token = getCookie("token");
    if (token) {
      router.push("/estoque");
      return;
    }

    // Corrigido: verificar se searchParams não é null
    if (searchParams && searchParams.get("logout") === "1") {
      setMensagem("Sessão encerrada com sucesso.");
      // Remove o parâmetro da URL depois de mostrar
      const url = new URL(window.location.href);
      url.searchParams.delete("logout");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        setMensagem("Login bem-sucedido! Redirecionando...");
        
        // SALVAR TOKEN CORRETAMENTE
        document.cookie = `token=${data.token}; path=/; max-age=86400`; // 24 horas
        
        // Também salvar no localStorage para backup
        localStorage.setItem("token", data.token);
        
        // Pequeno delay para mostrar a mensagem
        setTimeout(() => {
          router.push("/estoque");
        }, 1000);
      } else {
        setMensagem(`❌ ${data.error || "Erro no login"}`);
        setCarregando(false);
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setMensagem("❌ Erro de conexão com o servidor");
      setCarregando(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f3f4f6'
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px'
        }}
      >
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          Login
        </h1>

        {mensagem && (
          <p style={{ 
            textAlign: 'center', 
            fontSize: '14px', 
            marginBottom: '12px', 
            color: mensagem.includes('❌') ? '#dc2626' : '#16a34a'
          }}>
            {mensagem}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            marginBottom: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            marginBottom: '16px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
          required
        />

        <button
          type="submit"
          disabled={carregando}
          style={{
            width: '100%',
            backgroundColor: carregando ? '#9ca3af' : '#2563eb',
            color: 'white',
            padding: '10px 16px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '500',
            cursor: carregando ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => !carregando && (e.currentTarget.style.backgroundColor = '#1d4ed8')}
          onMouseOut={(e) => !carregando && (e.currentTarget.style.backgroundColor = '#2563eb')}
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}