"use client";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [resumo, setResumo] = useState({
    totalProdutos: 0,
    totalVendas: 0,
    faturamentoTotal: 0,
  });

  // Carrega dados gerais ao entrar na Home
  useEffect(() => {
    const carregarResumo = async () => {
      try {
        const [produtosRes, vendasRes, relatorioRes] = await Promise.all([
          fetch("/api/produtos"),
          fetch("/api/vendas"),
          fetch("/api/relatorios"),
        ]);

        const produtos = await produtosRes.json();
        const vendas = await vendasRes.json();
        const relatorio = await relatorioRes.json();

        setResumo({
          totalProdutos: Array.isArray(produtos) ? produtos.length : 0,
          totalVendas: relatorio?.totalVendas || 0,
          faturamentoTotal: relatorio?.faturamentoTotal || 0,
        });
      } catch (error) {
        console.error("Erro ao carregar resumo:", error);
      }
    };

    carregarResumo();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>
        📊 Resumo Geral
      </h1>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* Total de Produtos */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
            Produtos
          </h2>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1d4ed8' }}>
            {resumo.totalProdutos}
          </p>
        </div>

        {/* Total de Vendas */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
            Total de Vendas
          </h2>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a' }}>
            {resumo.totalVendas}
          </p>
        </div>

        {/* Faturamento Total */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
            Faturamento
          </h2>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed' }}>
            {resumo.faturamentoTotal.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
      </div>

      <p style={{ 
        marginTop: '32px', 
        color: '#6b7280',
        fontSize: '16px',
        lineHeight: '1.5'
      }}>
        Use o menu lateral para gerenciar o <strong style={{ color: '#374151' }}>estoque</strong>, 
        registrar <strong style={{ color: '#374151' }}>vendas</strong> ou gerar <strong style={{ color: '#374151' }}>relatórios</strong>.
      </p>
    </div>
  );
}