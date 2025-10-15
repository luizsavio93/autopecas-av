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

    try {
      const res = await fetch("/api/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produtoId, quantidade: qtdNum }),
      });

      if (res.ok) {
        setProdutoId("");
        setQuantidade("");
        await carregarVendas();
        await carregarProdutos();
        alert("Venda registrada com sucesso!");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao registrar venda!");
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
    <div className="p-6">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Autopeças AV</h1>
        <h2 className="text-xl font-semibold text-gray-700">Controle de Vendas</h2>
      </div>

      {/* Registrar Venda */}
      <div className="mb-8 p-4 border rounded-lg bg-white">
        <h3 className="font-bold mb-3 text-lg">Registrar Venda</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Selecione um produto</label>
            <select
              value={produtoId}
              onChange={(e) => setProdutoId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um produto</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} {p.quantidade !== undefined && `(Estoque: ${p.quantidade})`}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-32">
            <label className="block text-sm font-medium mb-1">Quantidade</label>
            <input
              type="number"
              placeholder="Qtd"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              step="1"
            />
          </div>

          <button
            onClick={registrarVenda}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium"
          >
            Registrar Venda
          </button>
        </div>
      </div>

      <hr className="my-6 border-gray-300" />

      {/* Filtros de Vendas */}
      <div className="mb-8 p-4 border rounded-lg bg-white">
        <h3 className="font-bold mb-3 text-lg">Filtros de Vendas</h3>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Todos os produtos</label>
            <select className="border border-gray-300 rounded px-3 py-2 w-48">
              <option>Todos os produtos</option>
              {produtos.map((p) => (
                <option key={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Data inicial</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-40"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Data final</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-40"
            />
          </div>

          <button
            onClick={aplicarFiltros}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
          >
            Filter
          </button>

          <button
            onClick={limparFiltros}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium"
          >
            Limpar
          </button>
        </div>
      </div>

      <hr className="my-6 border-gray-300" />

      {/* Histórico de Vendas */}
      <div className="p-4 border rounded-lg bg-white">
        <h3 className="font-bold mb-3 text-lg">Histórico de Vendas</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-3 text-left font-semibold">ID</th>
              <th className="border border-gray-300 p-3 text-left font-semibold">Produto</th>
              <th className="border border-gray-300 p-3 text-left font-semibold">Quantidade</th>
              <th className="border border-gray-300 p-3 text-left font-semibold">Data</th>
            </tr>
          </thead>
          <tbody>
            {vendas.length > 0 ? (
              vendas.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3">{v.id}</td>
                  <td className="border border-gray-300 p-3">
                    {v.produto?.nome || v.produto}
                  </td>
                  <td className="border border-gray-300 p-3">{v.quantidade}</td>
                  <td className="border border-gray-300 p-3">
                    {v.data && v.data !== "Invalid Date" 
                      ? new Date(v.data).toLocaleDateString("pt-BR")
                      : "Data inválida"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="border border-gray-300 p-3 text-center text-gray-500">
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