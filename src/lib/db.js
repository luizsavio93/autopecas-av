import { Pool } from 'pg'
import dotenv from 'dotenv'

console.log('🔧 Iniciando configuração do banco...')
console.log('DATABASE_URL existe?', !!process.env.DATABASE_URL)

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
}

const pool = new Pool(poolConfig)

// Testar conexão imediatamente
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Conexão com PostgreSQL estabelecida!'))
  .catch(err => console.error('❌ Erro na conexão PostgreSQL:', err.message))

export default pool