"use client";
import { useEffect, useState } from "react";

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [cep, setCep] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Formatar CNPJ enquanto digita
  const formatarCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  };

  // Formatar telefone enquanto digita
  const formatarTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  // Formatar CEP enquanto digita
  const formatarCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  // Carregar fornecedores
  const carregarFornecedores = async () => {
    setCarregando(true);
    try {
      const res = await fetch("/api/fornecedores");
      const data = await res.json();
      setFornecedores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
      alert("Erro ao carregar fornecedores!");
    } finally {
      setCarregando(false);
    }
  };

  // Salvar/Editar fornecedor
  const salvarFornecedor = async () => {
    if (!razaoSocial.trim()) {
      alert("Preencha a razão social do fornecedor!");
      return;
    }

    try {
      const fornecedorData = { 
        razaoSocial: razaoSocial.trim(), 
        cnpj: cnpj.replace(/\D/g, '') || null,
        email: email.trim() || null,
        telefone: telefone.replace(/\D/g, '') || null,
        logradouro: logradouro.trim() || null,
        numero: numero.trim() || null,
        complemento: complemento.trim() || null,
        bairro: bairro.trim() || null,
        cidade: cidade.trim() || null,
        estado: estado.trim() || null,
        cep: cep.replace(/\D/g, '') || null,
      };

      if (editandoId) {
        await fetch(`/api/fornecedores/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fornecedorData),
        });
      } else {
        await fetch("/api/fornecedores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fornecedorData),
        });
      }

      // Limpar formulário
      setRazaoSocial("");
      setCnpj("");
      setLogradouro("");
      setNumero("");
      setComplemento("");
      setBairro("");
      setCidade("");
      setEstado("");
      setCep("");
      setTelefone("");
      setEmail("");
      setEditandoId(null);
      
      carregarFornecedores();
      alert(editandoId ? "Fornecedor atualizado!" : "Fornecedor adicionado!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar fornecedor!");
    }
  };

  // Excluir fornecedor
  const excluirFornecedor = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este fornecedor?")) return;
    
    try {
      await fetch(`/api/fornecedores/${id}`, { method: "DELETE" });
      carregarFornecedores();
      alert("Fornecedor excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir fornecedor:", error);
      alert("Erro ao excluir fornecedor!");
    }
  };

  // Editar fornecedor
  const editarFornecedor = (fornecedor: any) => {
    setEditandoId(fornecedor.id);
    setRazaoSocial(fornecedor.razaoSocial || "");
    setCnpj(fornecedor.cnpj ? formatarCNPJ(fornecedor.cnpj) : "");
    setLogradouro(fornecedor.logradouro || "");
    setNumero(fornecedor.numero || "");
    setComplemento(fornecedor.complemento || "");
    setBairro(fornecedor.bairro || "");
    setCidade(fornecedor.cidade || "");
    setEstado(fornecedor.estado || "");
    setCep(fornecedor.cep ? formatarCEP(fornecedor.cep) : "");
    setTelefone(fornecedor.telefone ? formatarTelefone(fornecedor.telefone) : "");
    setEmail(fornecedor.email || "");
  };

  // Fornecedores filtrados pela busca
  const fornecedoresFiltrados = fornecedores.filter(fornecedor =>
    fornecedor.razaoSocial.toLowerCase().includes(busca.toLowerCase()) ||
    fornecedor.cnpj?.includes(busca) ||
    fornecedor.email?.toLowerCase().includes(busca.toLowerCase())
  );

  useEffect(() => {
    carregarFornecedores();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        Cadastro de Fornecedores
      </h1>

      {/* Formulário */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          {editandoId ? "Editar Fornecedor" : "Adicionar Fornecedor"}
        </h2>
        
        {/* Primeira linha - Dados principais */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Razão Social *"
            value={razaoSocial}
            onChange={(e) => setRazaoSocial(e.target.value)}
            style={{
              flex: '1',
              minWidth: '250px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          />
          <input
            type="text"
            placeholder="CNPJ"
            value={cnpj}
            onChange={(e) => setCnpj(formatarCNPJ(e.target.value))}
            maxLength={18}
            style={{
              width: '200px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          />
        </div>

        {/* Segunda linha - Endereço */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Logradouro"
            value={logradouro}
            onChange={(e) => setLogradouro(e.target.value)}
            style={{
              flex: '2',
              minWidth: '200px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          />
          <input
            type="text"
            placeholder="Número"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            style={{
              width: '100px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          />
          <input
            type="text"
            placeholder="Complemento"
            value={complemento}
            onChange={(e) => setComplemento(e.target.value)}
            style={{
              width: '150px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          />
        </div>

        {/* Terceira linha - Endereço continuacao */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Bairro"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            style={{
              width: '150px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          />
          <input
            type="text"
            placeholder="Cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            style={{
              width: '150px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          />
          <input
            type="text"
            placeholder="Estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            maxLength={2}
            style={{
              width: '80px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          />
          <input
            type="text"
            placeholder="CEP"
            value={cep}
            onChange={(e) => setCep(formatarCEP(e.target.value))}
            maxLength={9}
            style={{
              width: '120px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          />
          <input
            type="text"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            maxLength={15}
            style={{
              width: '150px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          />
        </div>

        <button
          onClick={salvarFornecedor}
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
          {editandoId ? "Salvar Alterações" : "Adicionar Fornecedor"}
        </button>
        {editandoId && (
          <button
            onClick={() => {
              setEditandoId(null);
              setRazaoSocial("");
              setCnpj("");
              setLogradouro("");
              setNumero("");
              setComplemento("");
              setBairro("");
              setCidade("");
              setEstado("");
              setCep("");
              setTelefone("");
              setEmail("");
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

      {/* Busca de Fornecedores */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Buscar fornecedores por razão social, CNPJ ou email..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px'
          }}
        />
      </div>

      {/* Tabela de Fornecedores */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          Fornecedores Cadastrados {fornecedoresFiltrados.length > 0 && `(${fornecedoresFiltrados.length})`}
        </h2>
        
        {carregando ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Carregando fornecedores...
          </div>
        ) : (
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            border: '1px solid #d1d5db'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>ID</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Razão Social</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>CNPJ</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Cidade/UF</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Telefone</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {fornecedoresFiltrados.length > 0 ? (
                fornecedoresFiltrados.map((fornecedor: any, index: number) => (
                  <tr key={fornecedor.id}>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                      {index + 1}
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{fornecedor.razaoSocial}</td>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                      {fornecedor.cnpj ? formatarCNPJ(fornecedor.cnpj) : '-'}
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                      {fornecedor.cidade && fornecedor.estado ? `${fornecedor.cidade}/${fornecedor.estado}` : '-'}
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                      {fornecedor.telefone ? formatarTelefone(fornecedor.telefone) : '-'}
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => editarFornecedor(fornecedor)}
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
                          onClick={() => excluirFornecedor(fornecedor.id)}
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
                    {busca ? "Nenhum fornecedor encontrado para a busca." : "Nenhum fornecedor cadastrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}