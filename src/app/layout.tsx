"use client";

import "./globals.css";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { deleteCookie, getCookie } from "cookies-next";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const token = getCookie("token");
      const hasToken = !!token;
      
      setIsAuthenticated(hasToken);
      setIsLoading(false);

      // Se não está autenticado e não está na página de login, redireciona
      if (!hasToken && pathname !== "/login") {
        router.push("/login");
      }
      
      // Se está autenticado e está na página de login, redireciona para estoque
      if (hasToken && pathname === "/login") {
        router.push("/estoque");
      }
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = () => {
    deleteCookie("token");
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    router.push("/login?logout=1");
  };

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <html lang="pt-BR">
        <body style={{ margin: 0, padding: 0, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
          <div>Carregando...</div>
        </body>
      </html>
    );
  }

  // Se não está autenticado, mostra apenas o conteúdo (login page)
  if (!isAuthenticated) {
    return (
      <html lang="pt-BR">
        <body style={{ margin: 0, padding: 0 }}>
          {children}
        </body>
      </html>
    );
  }

  // Se está autenticado, mostra o layout completo com menu
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, height: '100vh', overflow: 'hidden' }}>
        <div style={{ display: 'flex', height: '100%' }}>
          {/* Menu lateral - APENAS quando autenticado */}
          <div style={{ 
            width: '256px', 
            backgroundColor: '#1e40af', 
            color: 'white', 
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
            {/* Cabeçalho e Menu */}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
                Autopeças AV
              </h1>
              
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link 
                  href="/" 
                  style={{ 
                    padding: '8px', 
                    borderRadius: '4px',
                    textDecoration: 'none',
                    color: 'white',
                    transition: 'background-color 0.2s',
                    display: 'block'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e3a8a'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Home
                </Link>
                <Link 
                  href="/estoque" 
                  style={{ 
                    padding: '8px', 
                    borderRadius: '4px',
                    textDecoration: 'none',
                    color: 'white',
                    transition: 'background-color 0.2s',
                    display: 'block'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e3a8a'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Estoque
                </Link>
                <Link 
                  href="/vendas" 
                  style={{ 
                    padding: '8px', 
                    borderRadius: '4px',
                    textDecoration: 'none',
                    color: 'white',
                    transition: 'background-color 0.2s',
                    display: 'block'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e3a8a'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Vendas
                </Link>
                {/* NOVO LINK PARA CLIENTES */}
                <Link 
                  href="/clientes" 
                  style={{ 
                    padding: '8px', 
                    borderRadius: '4px',
                    textDecoration: 'none',
                    color: 'white',
                    transition: 'background-color 0.2s',
                    display: 'block'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e3a8a'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Clientes
                </Link>
                <Link 
                  href="/relatorios" 
                  style={{ 
                    padding: '8px', 
                    borderRadius: '4px',
                    textDecoration: 'none',
                    color: 'white',
                    transition: 'background-color 0.2s',
                    display: 'block'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e3a8a'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Relatórios
                </Link>
                
                {/* Botão Sair */}
                <button 
                  onClick={handleLogout}
                  style={{ 
                    padding: '8px', 
                    borderRadius: '4px', 
                    textAlign: 'left',
                    border: 'none',
                    background: 'transparent',
                    color: 'white',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background-color 0.2s',
                    fontSize: '16px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e3a8a'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Sair
                </button>
              </nav>
            </div>
          </div>

          {/* Conteúdo principal */}
          <main style={{ 
            flex: 1, 
            margin: 0, 
            padding: 0,
            backgroundColor: 'white',
            overflow: 'auto',
            height: '100%'
          }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}