import { pool } from '../database/conexao.js';

function validarArtista(body) {
  const nome = String(body?.nome ?? '').trim();
  const tipo = String(body?.tipo ?? '').trim();
  const ano = Number(body?.ano);

  if (!nome || nome.length > 150 || !['Banda', 'Artista'].includes(tipo) ||
      !Number.isInteger(ano) || ano < 1850 || ano > new Date().getFullYear()) {
    return null;
  }

  return { nome, tipo, ano };
}

function idValido(id) {
  const numero = Number(id);
  return Number.isSafeInteger(numero) && numero > 0;
}

async function listarArtistas(_req, res) {
  try {
    const [artistas] = await pool.query('SELECT * FROM artistas ORDER BY id');
    res.status(200).json(artistas);
  } catch (erro) {
    console.error('Erro ao buscar artistas:', erro);
    res.status(500).json({ mensagem: 'Não foi possível consultar o MySQL. Verifique a conexão e a tabela artistas.' });
  }
}

async function adicionarArtista(req, res) {
  const artista = validarArtista(req.body);
  if (!artista) return res.status(400).json({ mensagem: 'Informe nome, tipo e ano válidos.' });

  try {
    const [resultado] = await pool.execute(
      'INSERT INTO artistas (nome, tipo, ano) VALUES (?, ?, ?)',
      [artista.nome, artista.tipo, artista.ano]
    );
    return res.status(201).json({ id: resultado.insertId, ...artista });
  } catch (erro) {
    console.error('Erro ao adicionar artista:', erro);
    return res.status(500).json({ mensagem: 'Erro ao adicionar artista' });
  }
}

async function atualizarArtista(req, res) {
  if (!idValido(req.params.id)) return res.status(400).json({ mensagem: 'ID inválido.' });
  const artista = validarArtista(req.body);
  if (!artista) return res.status(400).json({ mensagem: 'Informe nome, tipo e ano válidos.' });

  try {
    const [resultado] = await pool.execute(
      'UPDATE artistas SET nome = ?, tipo = ?, ano = ? WHERE id = ?',
      [artista.nome, artista.tipo, artista.ano, Number(req.params.id)]
    );
    if (!resultado.affectedRows) return res.status(404).json({ mensagem: 'Artista não encontrado.' });
    return res.status(200).json({ id: Number(req.params.id), ...artista });
  } catch (erro) {
    console.error('Erro ao atualizar artista:', erro);
    return res.status(500).json({ mensagem: 'Erro ao atualizar artista' });
  }
}

async function excluirArtista(req, res) {
  if (!idValido(req.params.id)) return res.status(400).json({ mensagem: 'ID inválido.' });

  try {
    const [resultado] = await pool.execute('DELETE FROM artistas WHERE id = ?', [Number(req.params.id)]);
    if (!resultado.affectedRows) return res.status(404).json({ mensagem: 'Artista não encontrado.' });
    return res.status(204).send();
  } catch (erro) {
    console.error('Erro ao excluir artista:', erro);
    return res.status(500).json({ mensagem: 'Erro ao excluir artista' });
  }
}

export { listarArtistas, adicionarArtista, atualizarArtista, excluirArtista };
