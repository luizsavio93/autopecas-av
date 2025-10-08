"use client";
import { useEffect, useState } from "react";

export default function EstoquePage() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [quantidade, setQuantidade] = useState<number | "">("");
  const [preco, setPreco] = useState<number | "">("");
  const [produtos, setProdutos] = useState<any[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null); // ✅ CORRIGIDO: string em vez de number

  const getToken = () => localStorage.getItem("token");

  const carregarProdutos = async () => {
    try {
      const token = getToken();
      const res = await fetch("/api/produtos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        setProdutos(data);
      } else {
        console.warn("Resposta inesperada da API:", data);
        setProdutos([]);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      setProdutos([]);
    }
  };

  const salvarProduto = async () => {
    if (!nome || quantidade === "" || preco === "") {
      alert("Preencha todos os campos corretamente!");
      return;
    }

    try {
      const token = getToken();
      if (editandoId) {
        const res = await fetch(`/api/produtos/${editandoId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome,
            descricao,
            quantidade: Number(quantidade),
            preco: Number(preco),
          }),
        });

        if (!res.ok) throw new Error("Erro ao atualizar produto");
      } else {
        const res = await fetch("/api/produtos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome,
            descricao,
            quantidade: Number(quantidade),
            preco: Number(preco),
          }),
        });

        if (!res.ok) throw new Error("Erro ao adicionar produto");
      }

      setNome("");
      setDescricao("");
      setQuantidade("");
      setPreco("");
      setEditandoId(null);
      carregarProdutos();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar produto!");
    }
  };

  const excluirProduto = async (id: string) => { // ✅ CORRIGIDO: string em vez de number
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const token = getToken();
      const res = await fetch(`/api/produtos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erro ao excluir produto");
      carregarProdutos();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir produto!");
    }
  };

  const editarProduto = (produto: any) => {
    setEditandoId(produto.id);
    setNome(produto.nome);
    setDescricao(produto.descricao);
    setQuantidade(produto.quantidade);
    setPreco(produto.preco);
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        Controle de Estoque
      </h1>

      {/* Formulário */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          {editandoId ? "Editar Produto" : "Adicionar Produto"}
        </h2>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Nome do produto"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          />
          <input
            type="text"
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          />
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
          <input
            type="number"
            placeholder="Preço (R$)"
            value={preco}
            onChange={(e) =>
              setPreco(e.target.value ? Number(e.target.value) : "")
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
          onClick={salvarProduto}
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
          {editandoId ? "Salvar Alterações" : "Adicionar"}
        </button>
        {editandoId && (
          <button
            onClick={() => {
              setEditandoId(null);
              setNome("");
              setDescricao("");
              setQuantidade("");
              setPreco("");
            }}
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
            Cancelar
          </button>
        )}
      </div>

      {/* Tabela */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          Produtos em Estoque
        </h2>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          border: '1px solid #d1d5db'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>ID</th>
              <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Nome</th>
              <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Descrição</th>
              <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Qtd</th>
              <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Preço (R$)</th>
              <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.length > 0 ? (
              produtos.map((p: any) => (
                <tr key={p.id}>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{p.id}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{p.nome}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{p.descricao}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{p.quantidade}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                    {Number(p.preco).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => editarProduto(p)}
                        style={{
                          backgroundColor: '#d97706',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b45309'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluirProduto(p.id)}
                        style={{
                          backgroundColor: '#dc2626',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '16px' }}>
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}