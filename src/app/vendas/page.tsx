"use client";
import { useEffect, useState } from "react";

export default function VendasPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [vendas, setVendas] = useState<any[]>([]);
  const [produtoId, setProdutoId] = useState<string>("");
  const [clienteId, setClienteId] = useState<string>("");
  const [quantidade, setQuantidade] = useState<string>("");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [buscaCliente, setBuscaCliente] = useState<string>("");

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

  // Carregar clientes
  const carregarClientes = async () => {
    try {
      const res = await fetch("/api/clientes");
      const data = await res.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
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

    try {
      const res = await fetch("/api/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          produtoId, 
          clienteId: clienteId || null, // ✅ Cliente opcional
          quantidade: qtdNum 
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        alert(`Erro ao registrar venda: ${res.status} ${res.statusText}`);
        return;
      }

      const data = await res.json();
      console.log("✅ Venda registrada com sucesso:", data);

      setProdutoId("");
      setClienteId("");
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

  // Clientes filtrados pela busca
  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
    cliente.cpf?.includes(buscaCliente)
  );

  useEffect(() => {
    carregarProdutos();
    carregarClientes();
    carregarVendas();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        Controle de Vendas
      </h1>

      {/* Registrar Venda */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          Registrar Venda
        </h2>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <select
            value={produtoId}
            onChange={(e) => setProdutoId(e.target.value)}
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
                {p.nome} {p.quantidade !== undefined && `(Estoque: ${p.quantidade})`}
              </option>
            ))}
          </select>
          
          {/* ✅ NOVO: Seleção de Cliente */}
          <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Buscar cliente (nome ou CPF)"
              value={buscaCliente}
              onChange={(e) => setBuscaCliente(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                marginBottom: '4px'
              }}
            />
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            >
              <option value="">Cliente não identificado</option>
              {clientesFiltrados.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} {cliente.cpf && `- ${cliente.cpf}`}
                </option>
              ))}
            </select>
          </div>

          <input
            type="number"
            placeholder="Quantidade"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            style={{
              width: '120px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
            min="1"
            step="1"
          />

          <button
            onClick={registrarVenda}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              marginRight: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            Registrar Venda
          </button>
        </div>
      </div>

      {/* Resto do código permanece igual... */}
      {/* Filtros de Vendas */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          Filtros de Vendas
        </h2>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <select style={{
            flex: '1',
            minWidth: '200px',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px'
          }}>
            <option>Todos os produtos</option>
            {produtos.map((p) => (
              <option key={p.id}>{p.nome}</option>
            ))}
          </select>
          
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            style={{
              width: '150px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          />
          
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            style={{
              width: '150px',
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
              marginRight: '8px',
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

      {/* Histórico de Vendas */}
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
              <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Cliente</th>
              <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Quantidade</th>
              <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Data</th>
            </tr>
          </thead>
          <tbody>
            {vendas.length > 0 ? (
              vendas.map((v, index) => (
                <tr key={v.id}>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                    {v.id && v.id.length > 10 ? (vendas.length - index).toString() : v.id}
                  </td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                    {v.produto?.nome || v.produto}
                  </td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                    {v.cliente?.nome || "Cliente não identificado"}
                  </td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{v.quantidade}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                    {v.data && v.data !== "Invalid Date" 
                      ? new Date(v.data).toLocaleDateString("pt-BR")
                      : "Data inválida"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '16px' }}>
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