"use client";
import { useEffect, useState } from "react";

export default function VendasPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [vendas, setVendas] = useState<any[]>([]);
  const [produtoId, setProdutoId] = useState<string>("");
  const [quantidade, setQuantidade] = useState<string>("");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");

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
    const qtdNum = Number(quantidade);
    if (!produtoId || !quantidade || isNaN(qtdNum) || qtdNum <= 0) {
      alert("Selecione um produto e informe uma quantidade válida!");
      return;
    }

    console.log("🔄 Tentando registrar venda...", { produtoId, quantidade: qtdNum });

    try {
      const res = await fetch("/api/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          produtoId, 
          quantidade: qtdNum 
        }),
      });

      console.log("📡 Resposta da API:", res.status, res.statusText);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Erro da API:", errorText);
        alert(`Erro ao registrar venda: ${res.status} ${res.statusText}`);
        return;
      }

      const data = await res.json();
      console.log("✅ Venda registrada com sucesso:", data);

      setProdutoId("");
      setQuantidade("");
      await carregarVendas();
      await carregarProdutos();
      alert("Venda registrada com sucesso!");
      
    } catch (error) {
      console.error("💥 Erro ao registrar venda:", error);
      alert("Erro ao registrar venda! Verifique o console.");
    }
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    // Implementar lógica de filtro por data
    alert(`Filtrando de ${dataInicio} até ${dataFim}`);
  };

  // Limpar filtros
  const limparFiltros = () => {
    setDataInicio("");
    setDataFim("");
    carregarVendas();
  };

  useEffect(() => {
    carregarProdutos();
    carregarVendas();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      {/* Menu de Navegação - Igual ao Estoque */}
      <div style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
        <span style={{ marginRight: '16px' }}>Home</span>
        <span style={{ marginRight: '16px' }}>Estoque</span>
        <span style={{ marginRight: '16px', color: '#2563eb' }}>Vendas</span>
        <span style={{ marginRight: '16px' }}>Relatórios</span>
        <span>Sair</span>
      </div>

      <hr style={{ marginBottom: '24px', border: '1px solid #d1d5db' }} />

      {/* Cabeçalho */}
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
        Autopeças AV
      </h1>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#374151' }}>
        Controle de Vendas
      </h2>

      {/* Registrar Venda */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          Registrar Venda
        </h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'end' }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Selecione um produto
            </label>
            <select
              value={produtoId}
              onChange={(e) => setProdutoId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">Selecione um produto</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} {p.quantidade !== undefined && `(Estoque: ${p.quantidade})`}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ width: '120px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Quantidade
            </label>
            <input
              type="number"
              placeholder="Qtd"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              min="1"
              step="1"
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
              fontSize: '14px',
              fontWeight: '500',
              height: '36px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
          >
            Registrar Venda
          </button>
        </div>
      </div>

      {/* Filtros de Vendas */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          Filtros de Vendas
        </h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Todos os produtos
            </label>
            <select style={{
              width: '200px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              <option>Todos os produtos</option>
              {produtos.map((p) => (
                <option key={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Data inicial
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              style={{
                width: '150px',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Data final
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              style={{
                width: '150px',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <button
            onClick={aplicarFiltros}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              height: '36px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            Filter
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
              fontSize: '14px',
              fontWeight: '500',
              height: '36px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
          >
            Limpar
          </button>
        </div>
      </div>

      <hr style={{ marginBottom: '24px', border: '1px solid #d1d5db' }} />

      {/* Histórico de Vendas */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          Histórico de Vendas
        </h3>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          border: '1px solid #d1d5db'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>ID</th>
              <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Produto</th>
              <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Quantidade</th>
              <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Data</th>
            </tr>
          </thead>
          <tbody>
            {vendas.length > 0 ? (
              vendas.map((v, index) => (
                <tr key={v.id}>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px', fontSize: '14px' }}>
                    {v.id && v.id.length > 10 ? (vendas.length - index).toString() : v.id}
                  </td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px', fontSize: '14px' }}>
                    {v.produto?.nome || v.produto}
                  </td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px', fontSize: '14px' }}>{v.quantidade}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px', fontSize: '14px' }}>
                    {v.data && v.data !== "Invalid Date" 
                      ? new Date(v.data).toLocaleDateString("pt-BR")
                      : "Data inválida"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '16px', fontSize: '14px', color: '#6b7280' }}>
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