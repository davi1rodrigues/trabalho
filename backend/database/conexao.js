import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'acervo_musical',
  waitForConnections: true,
  connectionLimit: 10,
});

async function testarConexao() {
  try {
    await pool.query('SELECT 1');
    console.log('Banco de dados conectado com sucesso.');
    return true;
  } catch (error) {
    console.error(`Não foi possível conectar ao banco: ${error.message}`);
    return false;
  }
}

export { pool, testarConexao };
