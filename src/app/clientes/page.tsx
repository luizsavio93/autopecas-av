"use client";
import { useEffect, useState } from "react";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Formatar CPF enquanto digita
  const formatarCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  // Formatar telefone enquanto digita
  const formatarTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  // ✅ VALIDAÇÃO DE CPF COMPLETA
  const validarCPF = (cpf: string) => {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Elimina CPFs com todos os dígitos iguais
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Valida 1º dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    
    // Valida 2º dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  };

  // ✅ VALIDAÇÃO DE EMAIL
  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Carregar clientes
  const carregarClientes = async () => {
    setCarregando(true);
    try {
      const res = await fetch("/api/clientes");
      const data = await res.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      alert("Erro ao carregar clientes!");
    } finally {
      setCarregando(false);
    }
  };

  // Salvar/Editar cliente
  const salvarCliente = async () => {
    if (!nome.trim()) {
      alert("Preencha o nome do cliente!");
      return;
    }

    // Validar CPF
    const cpfNumeros = cpf.replace(/\D/g, '');
    if (cpfNumeros && !validarCPF(cpfNumeros)) {
      alert("CPF inválido!");
      return;
    }

    // Validar email
    if (email && !validarEmail(email)) {
      alert("E-mail inválido!");
      return;
    }

    try {
      const clienteData = { 
        nome: nome.trim(), 
        email: email.trim() || null,
        telefone: telefone.replace(/\D/g, '') || null,
        cpf: cpfNumeros || null
      };

      if (editandoId) {
        await fetch(`/api/clientes/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clienteData),
        });
      } else {
        await fetch("/api/clientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clienteData),
        });
      }

      // Limpar formulário
      setNome("");
      setEmail("");
      setTelefone("");
      setCpf("");
      setEditandoId(null);
      
      carregarClientes();
      alert(editandoId ? "Cliente atualizado!" : "Cliente adicionado!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar cliente!");
    }
  };

  // Excluir cliente
  const excluirCliente = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
    
    try {
      await fetch(`/api/clientes/${id}`, { method: "DELETE" });
      carregarClientes();
      alert("Cliente excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      alert("Erro ao excluir cliente!");
    }
  };

  // Editar cliente
  const editarCliente = (cliente: any) => {
    setEditandoId(cliente.id);
    setNome(cliente.nome || "");
    setEmail(cliente.email || "");
    setTelefone(cliente.telefone ? formatarTelefone(cliente.telefone) : "");
    setCpf(cliente.cpf ? formatarCPF(cliente.cpf) : "");
  };

  // ✅ CLIENTES FILTRADOS PELA BUSCA
  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.cpf?.includes(busca) ||
    cliente.email?.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.telefone?.includes(busca)
  );

  useEffect(() => {
    carregarClientes();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        Cadastro de Clientes
      </h1>

      {/* Formulário */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          {editandoId ? "Editar Cliente" : "Adicionar Cliente"}
        </h2>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Nome completo *"
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
            placeholder="CPF"
            value={cpf}
            onChange={(e) => setCpf(formatarCPF(e.target.value))}
            maxLength={14}
            style={{
              width: '150px',
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
          onClick={salvarCliente}
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
          {editandoId ? "Salvar Alterações" : "Adicionar Cliente"}
        </button>
        {editandoId && (
          <button
            onClick={() => {
              setEditandoId(null);
              setNome("");
              setEmail("");
              setTelefone("");
              setCpf("");
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

      {/* ✅ BUSCA DE CLIENTES */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Buscar clientes por nome, CPF, email ou telefone..."
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

      {/* Tabela de Clientes */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          Clientes Cadastrados {clientesFiltrados.length > 0 && `(${clientesFiltrados.length})`}
        </h2>
        
        {carregando ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Carregando clientes...
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
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Nome</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>CPF</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>E-mail</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Telefone</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.length > 0 ? (
                clientesFiltrados.map((cliente: any, index: number) => (
                  <tr key={cliente.id}>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                      {index + 1}
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{cliente.nome}</td>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                      {cliente.cpf ? formatarCPF(cliente.cpf) : '-'}
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                      {cliente.email || '-'}
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                      {cliente.telefone ? formatarTelefone(cliente.telefone) : '-'}
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => editarCliente(cliente)}
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
                          onClick={() => excluirCliente(cliente.id)}
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
                    {busca ? "Nenhum cliente encontrado para a busca." : "Nenhum cliente cadastrado."}
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