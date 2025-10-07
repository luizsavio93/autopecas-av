"use client";
import { useEffect, useState } from "react";

export default function VendasPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [vendas, setVendas] = useState<any[]>([]);
  const [produtoId, setProdutoId] = useState<number | "">("");
  const [quantidade, setQuantidade] = useState<number | "">("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  // Carregar produtos
  const carregarProdutos = async () => {
    try {
      const res = await fetch("/api/produtos");
      const data = await res.json();
      setProdutos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  };

  // Carregar vendas
  const carregarVendas = async () => {
    try {
      const res = await fetch("/api/vendas");
      const data = await res.json();
      setVendas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
    }
  };

  // Registrar nova venda
  const registrarVenda = async () => {
    if (!produtoId || !quantidade || quantidade <= 0) {
      alert("Selecione um produto e informe uma quantidade válida!");
      return;
    }

    try {
      const res = await fetch("/api/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produtoId, quantidade }),
      });

      if (!res.ok) {
        throw new Error("Erro ao registrar venda");
      }

      setProdutoId("");
      setQuantidade("");
      carregarVendas();
      carregarProdutos();
    } catch (error) {
      console.error(error);
      alert("Erro ao registrar venda!");
    }
  };

  // Aplicar filtros
  const aplicarFiltros = async () => {
    let url = "/api/vendas?";
    if (produtoId) url += `produtoId=${produtoId}&`;
    if (dataInicial) url += `dataInicial=${dataInicial}&`;
    if (dataFinal) url += `dataFinal=${dataFinal}&`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setVendas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao filtrar vendas:", error);
    }
  };

  // Limpar filtros
  const limparFiltros = () => {
    setProdutoId("");
    setDataInicial("");
    setDataFinal("");
    carregarVendas();
  };

  useEffect(() => {
    carregarProdutos();
    carregarVendas();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        Controle de Vendas
      </h1>

      {/* Formulário de venda */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          Registrar Venda
        </h2>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <select
            value={produtoId}
            onChange={(e) => setProdutoId(Number(e.target.value))}
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          >
            <option value="">Selecione um produto</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} (Qtd: {p.quantidade})
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Quantidade"
            value={quantidade}
            onChange={(e) =>
              setQuantidade(e.target.value ? Number(e.target.value) : "")
            }
            style={{
              width: '120px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          />
        </div>
        <button
          onClick={registrarVenda}
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
          Registrar Venda
        </button>
      </div>

      {/* Filtros */}
      <div style={{ 
        marginBottom: '24px', 
        padding: '16px', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px',
        backgroundColor: '#f9fafb'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          Filtros de Vendas
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select
            value={produtoId}
            onChange={(e) => setProdutoId(e.target.value ? Number(e.target.value) : "")}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              minWidth: '150px'
            }}
          >
            <option value="">Todos os produtos</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          />

          <input
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          />

          <button
            onClick={aplicarFiltros}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            Filtrar
          </button>

          <button
            onClick={limparFiltros}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
          >
            Limpar
          </button>
        </div>
      </div>
        
      {/* Listagem de vendas */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          Histórico de Vendas
        </h2>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          border: '1px solid #d1d5db'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>ID</th>
              <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Produto</th>
              <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Quantidade</th>
              <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Data</th>
            </tr>
          </thead>
          <tbody>
            {vendas.length > 0 ? (
              vendas.map((v: any) => (
                <tr key={v.id}>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{v.id}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{v.produto?.nome}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{v.quantidade}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                    {new Date(v.data).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '16px' }}>
                  Nenhuma venda registrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}