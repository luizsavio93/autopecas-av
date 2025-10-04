import pool from '../../lib/db'

export default async function handler(req, res) {
  try {
    console.log('Tentando conectar ao banco...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ Não configurada')
    
    const client = await pool.connect()
    console.log('✅ Conexão estabelecida')
    
    const result = await client.query('SELECT NOW() as current_time')
    client.release()
    
    console.log('✅ Query executada com sucesso')
    
    res.status(200).json({ 
      success: true, 
      message: 'Conexão OK',
      databaseTime: result.rows[0].current_time,
      connection: 'Funcionando'
    })
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message)
    res.status(500).json({ 
      success: false, 
      error: error.message,
      connectionString: process.env.DATABASE_URL ? 'Configurada' : 'Não configurada'
    })
  }
}