const API_BASE = 'http://localhost:3000/api/artistas';

const paletas = [
  ['#714c94', '#30294d', '#c792e4'],
  ['#a75e8e', '#583554', '#e9a4d0'],
  ['#5c5a9d', '#283860', '#b2a5ef'],
  ['#9b615b', '#503547', '#efa896'],
];

const grade = document.querySelector('#card-grid');
const mensagem = document.querySelector('#mensagem');
const botaoAtualizar = document.querySelector('#atualizar');
const botaoAdicionar = document.querySelector('#adicionar');
const formulario = document.querySelector('#artista-form');
const janelaFormulario = document.querySelector('#form-dialog');
const janelaConfirmacao = document.querySelector('#confirm-dialog');

const estado = {
  artistas: [],
  conectado: false,
  editandoId: null,
  excluindoId: null,
};

function mostrarMensagem(texto, aviso = false) {
  mensagem.textContent = texto;
  mensagem.className = aviso ? 'mensagem aviso' : 'mensagem';
}

async function requisicao(caminho = '', opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(`${API_BASE}${caminho}`, {
      ...opcoes,
      headers: { 'Content-Type': 'application/json', ...opcoes.headers },
    });
  } catch {
    throw new Error('Não foi possível acessar a API em http://localhost:3000. Inicie o backend com npm.cmd start.');
  }

  if (!resposta.ok) {
    let erro = 'Não foi possível concluir a operação.';
    try { erro = (await resposta.json()).mensagem || erro; } catch { /* resposta sem JSON */ }
    throw new Error(erro);
  }

  return resposta.status === 204 ? null : resposta.json();
}

function mostrarArtistas() {
  grade.replaceChildren();
  const artistas = estado.artistas;

  document.querySelector('#stat-total').textContent = artistas.length;
  document.querySelector('#nav-total').textContent = artistas.length;
  document.querySelector('#result-count').textContent = `(${artistas.length})`;
  document.querySelector('#stat-bandas').textContent = artistas.filter((item) => item.tipo === 'Banda').length;
  document.querySelector('#stat-artistas').textContent = artistas.filter((item) => item.tipo === 'Artista').length;

  if (!artistas.length) {
    const vazio = document.createElement('p');
    vazio.className = 'empty-state';
    vazio.textContent = estado.conectado
      ? 'Sua coleção está vazia. Clique em Adicionar para começar.'
      : 'Não foi possível carregar o banco de dados.';
    grade.appendChild(vazio);
    return;
  }

  artistas.forEach((artista, indice) => {
    const [inicio, fim, destaque] = paletas[indice % paletas.length];
    const cartao = document.createElement('article');
    cartao.className = 'card';

    const capa = document.createElement('div');
    capa.className = 'card-art';
    capa.style.setProperty('--cover-start', inicio);
    capa.style.setProperty('--cover-end', fim);
    capa.style.setProperty('--cover-accent', destaque);

    const disco = document.createElement('div');
    disco.className = 'cover-disc';
    const rotulo = document.createElement('div');
    rotulo.className = 'cover-label';
    rotulo.textContent = artista.nome.trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();
    disco.appendChild(rotulo);

    const tipo = document.createElement('span');
    tipo.className = 'type-badge';
    tipo.textContent = artista.tipo;
    capa.append(disco, tipo);

    const corpo = document.createElement('div');
    corpo.className = 'card-body';
    const nome = document.createElement('h3');
    nome.className = 'card-name';
    nome.textContent = artista.nome;
    const ano = document.createElement('p');
    ano.className = 'card-year';
    ano.textContent = `Desde ${artista.ano}`;

    const acoes = document.createElement('div');
    acoes.className = 'card-actions';
    const editar = document.createElement('button');
    editar.type = 'button';
    editar.dataset.action = 'editar';
    editar.dataset.id = artista.id;
    editar.textContent = 'Editar';
    editar.disabled = !estado.conectado;
    editar.setAttribute('aria-label', `Editar ${artista.nome}`);
    const excluir = document.createElement('button');
    excluir.type = 'button';
    excluir.className = 'delete-button';
    excluir.dataset.action = 'excluir';
    excluir.dataset.id = artista.id;
    excluir.textContent = 'Excluir';
    excluir.disabled = !estado.conectado;
    excluir.setAttribute('aria-label', `Excluir ${artista.nome}`);
    acoes.append(editar, excluir);

    corpo.append(nome, ano, acoes);
    cartao.append(capa, corpo);
    grade.appendChild(cartao);
  });
}

async function listarArtistas() {
  botaoAtualizar.disabled = true;
  botaoAdicionar.disabled = true;
  mostrarMensagem('Carregando...');

  try {
    const artistas = await requisicao();
    if (!Array.isArray(artistas)) throw new Error('Resposta inválida');
    estado.artistas = artistas;
    estado.conectado = true;
    mostrarMensagem(`${artistas.length} registro(s) carregado(s) do banco de dados.`);
    return true;
  } catch (erro) {
    estado.artistas = [];
    estado.conectado = false;
    mostrarMensagem(erro.message, true);
    return false;
  } finally {
    botaoAtualizar.disabled = false;
    botaoAdicionar.disabled = !estado.conectado;
    mostrarArtistas();
  }
}

function abrirFormulario(id = null) {
  const artista = estado.artistas.find((item) => String(item.id) === String(id));
  estado.editandoId = artista ? artista.id : null;
  formulario.reset();
  document.querySelector('#form-error').hidden = true;
  document.querySelector('#form-title').textContent = artista ? 'Editar artista' : 'Adicionar artista';
  document.querySelector('#form-submit').textContent = artista ? 'Salvar alterações' : 'Adicionar';
  if (artista) {
    formulario.elements.nome.value = artista.nome;
    formulario.elements.tipo.value = artista.tipo;
    formulario.elements.ano.value = artista.ano;
  }
  janelaFormulario.showModal();
  document.querySelector('#campo-nome').focus();
}

async function salvarArtista(evento) {
  evento.preventDefault();
  const dados = new FormData(formulario);
  const artista = {
    nome: String(dados.get('nome') || '').trim(),
    tipo: String(dados.get('tipo') || ''),
    ano: Number(dados.get('ano')),
  };
  const erro = document.querySelector('#form-error');

  if (!artista.nome || artista.nome.length > 150 || !['Banda', 'Artista'].includes(artista.tipo) ||
      !Number.isInteger(artista.ano) || artista.ano < 1850 || artista.ano > new Date().getFullYear()) {
    erro.textContent = 'Preencha nome, tipo e ano de início válidos.';
    erro.hidden = false;
    return;
  }

  const id = estado.editandoId;
  const botao = document.querySelector('#form-submit');
  botao.disabled = true;
  try {
    if (!estado.conectado) throw new Error('MySQL indisponível. Atualize a página e tente novamente.');
    await requisicao(id === null ? '' : `/${id}`, {
      method: id === null ? 'POST' : 'PUT',
      body: JSON.stringify(artista),
    });
    janelaFormulario.close();
    const recarregou = await listarArtistas();
    if (recarregou) mostrarMensagem(id === null ? 'Artista salvo no MySQL.' : 'Artista atualizado no MySQL.');
    else mostrarMensagem('O registro foi salvo, mas a lista não pôde ser recarregada.', true);
  } catch (falha) {
    erro.textContent = falha.message;
    erro.hidden = false;
  } finally {
    botao.disabled = false;
  }
}

function confirmarExclusao(id) {
  const artista = estado.artistas.find((item) => String(item.id) === String(id));
  if (!artista) return;
  estado.excluindoId = artista.id;
  document.querySelector('#confirm-message').textContent = `Deseja remover “${artista.nome}” da coleção?`;
  janelaConfirmacao.showModal();
}

async function excluirArtista() {
  const id = estado.excluindoId;
  const botao = document.querySelector('#confirm-delete');
  botao.disabled = true;
  try {
    if (!estado.conectado) throw new Error('MySQL indisponível. Atualize a página e tente novamente.');
    await requisicao(`/${id}`, { method: 'DELETE' });
    janelaConfirmacao.close();
    estado.excluindoId = null;
    const recarregou = await listarArtistas();
    if (recarregou) mostrarMensagem('Artista excluído do MySQL.');
    else mostrarMensagem('O registro foi excluído, mas a lista não pôde ser recarregada.', true);
  } catch (falha) {
    document.querySelector('#confirm-message').textContent = falha.message;
  } finally {
    botao.disabled = false;
  }
}

botaoAtualizar.addEventListener('click', listarArtistas);
document.querySelector('#adicionar').addEventListener('click', () => abrirFormulario());
formulario.addEventListener('submit', salvarArtista);
document.querySelector('#confirm-delete').addEventListener('click', excluirArtista);

grade.addEventListener('click', (evento) => {
  const botao = evento.target.closest('button[data-action]');
  if (!botao) return;
  if (botao.dataset.action === 'editar') abrirFormulario(botao.dataset.id);
  if (botao.dataset.action === 'excluir') confirmarExclusao(botao.dataset.id);
});

document.querySelectorAll('[data-close]').forEach((botao) => {
  botao.addEventListener('click', () => document.querySelector(`#${botao.dataset.close}`).close());
});

listarArtistas();
