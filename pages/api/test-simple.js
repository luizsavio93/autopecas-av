export default async function handler(req, res) {
  console.log('✅ API test-simple chamada')
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'CONFIGURADA' : 'NÃO CONFIGURADA')
  
  res.status(200).json({ 
    message: 'API funcionando',
    databaseConfigured: !!process.env.DATABASE_URL,
    timestamp: new Date().toISOString()
  })
}