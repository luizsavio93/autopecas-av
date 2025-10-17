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
  const [clientes, setClientes] = useState<any[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<string>("");
  const [historicoCliente, setHistoricoCliente] = useState<any>(null);

  const carregarRelatorios = async () => {
    try {
      const res = await fetch("/api/relatorios");
      const data = await res.json();
      setRelatorio(data);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    }
  };

  const carregarClientes = async () => {
    try {
      const res = await fetch("/api/clientes");
      const data = await res.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  };

  const carregarHistoricoCliente = async (clienteId: string) => {
    if (!clienteId) {
      setHistoricoCliente(null);
      return;
    }

    try {
      const res = await fetch(`/api/relatorios/clientes/${clienteId}`);
      const data = await res.json();
      setHistoricoCliente(data);
    } catch (error) {
      console.error("Erro ao carregar histórico do cliente:", error);
    }
  };

  useEffect(() => {
    carregarRelatorios();
    carregarClientes();
  }, []);

  useEffect(() => {
    carregarHistoricoCliente(clienteSelecionado);
  }, [clienteSelecionado]);

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
            transition: 'background-color 0.2s',
            marginRight: '8px'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
        >
          📥 Exportar CSV
        </button>
      </div>

      {/* ✅ NOVO: Seleção de Cliente para Histórico */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          Histórico de Compras por Cliente
        </h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'end', flexWrap: 'wrap' }}>
          <select
            value={clienteSelecionado}
            onChange={(e) => setClienteSelecionado(e.target.value)}
            style={{
              minWidth: '300px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          >
            <option value="">Selecione um cliente...</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome} {cliente.cpf && `- ${cliente.cpf}`}
              </option>
            ))}
          </select>
        </div>

        {/* Histórico do Cliente Selecionado */}
        {historicoCliente && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ 
              padding: '16px', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
              marginBottom: '16px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Resumo do Cliente: {historicoCliente.cliente.nome}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Total de Compras</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {historicoCliente.totalCompras}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Valor Total Gasto</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>
                    {Number(historicoCliente.valorTotalGasto).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabela de Compras do Cliente */}
            {historicoCliente.compras.length > 0 ? (
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                border: '1px solid #d1d5db'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Data</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Produto</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Quantidade</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Valor Unitário</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {historicoCliente.compras.map((compra: any, index: number) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                        {new Date(compra.data).toLocaleDateString("pt-BR")}
                      </td>
                      <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                        {compra.produto.nome}
                      </td>
                      <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                        {compra.quantidade}
                      </td>
                      <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                        {Number(compra.produto.preco).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                        {Number(compra.quantidade * compra.produto.preco).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                Nenhuma compra registrada para este cliente.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resumo Geral */}
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
              <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Faturamento</th>
            </tr>
          </thead>
          <tbody>
            {relatorio.produtosMaisVendidos.map((p: any, index: number) => (
              <tr key={index}>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{p.produto}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{p.quantidade}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                  {Number(p.faturamento).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
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