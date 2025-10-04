"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RelatoriosPage() {
  const [relatorio, setRelatorio] = useState<any>(null);

  const carregarRelatorios = async () => {
    try {
      const res = await fetch("/api/relatorios");
      const data = await res.json();
      setRelatorio(data);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    }
  };

  useEffect(() => {
    carregarRelatorios();
  }, []);

  if (!relatorio) {
    return <div style={{ padding: '24px' }}>Carregando relatórios...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        Relatórios de Vendas
      </h1>

      {/* Botão para exportar CSV */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => window.open("/api/relatorios/export", "_blank")}
          style={{
            backgroundColor: '#16a34a',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
        >
          📥 Exportar CSV
        </button>
      </div>

      {/* Resumo */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        <div style={{ 
          padding: '16px', 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px',
          backgroundColor: '#f9fafb'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Total de Vendas
          </h2>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{relatorio.totalVendas}</p>
        </div>
        <div style={{ 
          padding: '16px', 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px',
          backgroundColor: '#f9fafb'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Faturamento Total
          </h2>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
            {Number(relatorio.faturamentoTotal).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
      </div>

      {/* Tabela de produtos mais vendidos */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          Produtos Mais Vendidos
        </h2>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          border: '1px solid #d1d5db'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Produto</th>
              <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Quantidade Vendida</th>
            </tr>
          </thead>
          <tbody>
            {relatorio.produtosMaisVendidos.map((p: any, index: number) => (
              <tr key={index}>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{p.produto}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{p.quantidade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gráfico */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          Gráfico - Produtos Mais Vendidos
        </h2>
        <div style={{ 
          width: '100%', 
          height: '300px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: 'white'
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={relatorio.produtosMaisVendidos}>
              <XAxis dataKey="produto" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}