import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import artistasRoutes from './routes/artistasRoutes.js';
import { testarConexao } from './database/conexao.js';

const app = express();
const dirname = path.dirname(fileURLToPath(import.meta.url));
const frontend = path.resolve(dirname, '../frontend');
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use('/api/artistas', artistasRoutes);
app.use(express.static(frontend));
app.get('/', (_req, res) => res.sendFile(path.join(frontend, 'index.html')));
app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ mensagem: 'JSON inválido.' });
  console.error(error);
  return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Acervo musical disponível em http://localhost:${port}`);
  void testarConexao();
});