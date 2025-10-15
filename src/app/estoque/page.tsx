"use client";
import { useEffect, useState } from "react";

export default function EstoquePage() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [quantidade, setQuantidade] = useState<string>("");
  const [preco, setPreco] = useState<string>("");
  const [produtos, setProdutos] = useState<any[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("token");

  // ✅ FUNÇÃO ATUALIZADA COM DEBUG
  const carregarProdutos = async () => {
    try {
      console.log("🔍 Iniciando carregamento de produtos...");
      
      const token = getToken();
      console.log("🔍 Token:", token);
      
      const res = await fetch("/api/produtos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("🔍 Status:", res.status);
      console.log("🔍 URL:", res.url);
      
      // Verifica o tipo de conteúdo
      const contentType = res.headers.get("content-type");
      console.log("🔍 Content-Type:", contentType);
      
      if (!res.ok) {
        const text = await res.text();
        console.error("🔍 Erro HTTP:", res.status, text.substring(0, 500));
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("🔍 Resposta não é JSON:", text.substring(0, 500));
        throw new Error("API retornou HTML em vez de JSON");
      }
      
      const data = await res.json();
      console.log("🔍 Dados recebidos:", data);

      if (Array.isArray(data)) {
        setProdutos(data);
      } else {
        console.warn("🔍 Resposta inesperada da API:", data);
        setProdutos([]);
      }
    } catch (error) {
      console.error("🔍 Erro ao carregar produtos:", error);
      setProdutos([]);
    }
  };

  // ✅ FUNÇÃO CORRIGIDA - tratamento seguro para números
  const salvarProduto = async () => {
    if (!nome || !quantidade || !preco) {
      alert("Preencha todos os campos corretamente!");
      return;
    }

    // ✅ Conversão segura para número
    const quantidadeNum = Number(quantidade);
    const precoNum = Number(preco);

    // ✅ Validação dos números
    if (isNaN(quantidadeNum) || isNaN(precoNum)) {
      alert("Quantidade e preço devem ser números válidos!");
      return;
    }

    if (quantidadeNum < 0 || precoNum < 0) {
      alert("Quantidade e preço não podem ser negativos!");
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
            quantidade: quantidadeNum,
            preco: precoNum,
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
            quantidade: quantidadeNum,
            preco: precoNum,
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
      alert(editandoId ? "Produto atualizado com sucesso!" : "Produto adicionado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar produto!");
    }
  };

  // ✅ FUNÇÃO CORRIGIDA - com melhor tratamento de erro
  const excluirProduto = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const token = getToken();
      const res = await fetch(`/api/produtos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao excluir produto");
      }

      carregarProdutos();
      alert("Produto excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert(error instanceof Error ? error.message : "Erro ao excluir produto!");
    }
  };

  // ✅ FUNÇÃO CORRIGIDA - conversão segura ao editar
  const editarProduto = (produto: any) => {
    setEditandoId(produto.id);
    setNome(produto.nome || "");
    setDescricao(produto.descricao || "");
    setQuantidade(produto.quantidade?.toString() || "");
    setPreco(produto.preco?.toString() || "");
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
            onChange={(e) => setQuantidade(e.target.value)}
            min="0"
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
            onChange={(e) => setPreco(e.target.value)}
            min="0"
            step="0.01"
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