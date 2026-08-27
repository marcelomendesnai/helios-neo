const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { buildContext, copyText } = require('../context-export.js');

function fixture() {
  return {
    dashboard: {
      total_bruto: 150000,
      total_liquido: 140000,
      por_classif1: { FINANCEIRO: 100000, 'ATIVOS REAIS': 40000 },
      por_classif2: { 'FINANCEIRO > RENDA FIXA': 60000, 'FINANCEIRO > ACOES': 40000, 'ATIVOS REAIS > VEICULO': 40000 },
      qtd_ativos: 3,
      atualizado_em: '2026-08-27T14:30:00.000Z',
      token: 'TOKEN-NAO-DEVE-SAIR'
    },
    ativos: [
      {
        id: 'interno-1', nome: 'Tesouro Selic', ticker_api: 'SELIC', classif_1: 'FINANCEIRO',
        classif_2: 'RENDA FIXA', classif_3: 'CORRETORA', classif_4: 'TESOURO', qtd: 2,
        preco_atual: 30000, preco_medio: 25000, total_atual: 60000, variacao_pct: 0.2,
        moeda: 'BRL', data_aquis: '2025-01-10', preco_atual_fonte: 'api',
        fonte_url: 'https://exemplo.test/cotacao?token=URL-SECRETA',
        observacao: 'Longo prazo. Senha: OBSERVACAO-SECRETA'
      },
      {
        nome: 'Tiggo', classif_1: 'ATIVOS REAIS', classif_2: 'VEICULO', qtd: 1,
        preco_atual: 40000, preco_medio: 50000, total_atual: 40000, moeda: 'BRL',
        data_aquis: '2024-03-01', preco_atual_fonte: 'manual', calc_real: 1,
        ganho_real: { nominal_pct: -0.2, ipca_pct: 0.1, real_pct: -0.272727 }
      },
      {
        nome: 'Financiamento', classif_1: 'DIVIDAS', classif_2: 'VEICULO', qtd: 1,
        preco_atual: -10000, total_atual: -10000, moeda: 'BRL', preco_atual_fonte: 'manual'
      }
    ],
    snapshots: [
      { data: '2026-07-01', total_bruto: 140000, total_liquido: 130000, por_classif1: { FINANCEIRO: 90000, 'ATIVOS REAIS': 40000 }, origem: 'legado' },
      { data: '2026-08-01', total_bruto: 150000, total_liquido: 140000, por_classif1: { FINANCEIRO: 100000, 'ATIVOS REAIS': 40000 }, ipca_periodo: 0.004, origem: 'automatico', capturado_em: '2026-08-01T03:00:00.000Z' }
    ],
    alvoPercentuais: { FINANCEIRO: 70, 'ATIVOS REAIS': 30 },
    fundamentosLoaded: true,
    indicadoresMeta: { roe: { label: 'ROE' } },
    fundamentos: [{
      nome: 'Banco Exemplo', ticker: 'BANC4', setor: 'BANCOS', reference_date: '2026-06-30',
      indice_alerta: 20, detalhe: [{ indicador: 'roe', sinal: 'verde' }],
      fundamentos: { roe: 18.5 }, leitura_ia: 'Leitura baseada nos parâmetros configurados.'
    }],
    parametrosLoaded: true,
    parametros: [{ setor: 'BANCOS', indicador: 'roe', aplicavel: 1, direcao: 'maior_melhor', verde_limite: 15, amarelo_limite: 10, peso: 3, gerado_por_ia: 0 }],
    version: 'v6.2.0',
    generatedAt: new Date('2026-08-27T15:00:00.000Z'),
    pin: 'PIN-NAO-DEVE-SAIR',
    cookie: 'COOKIE-NAO-DEVE-SAIR'
  };
}

test('monta snapshot completo, legível e em formato brasileiro', () => {
  const markdown = buildContext(fixture());

  assert.match(markdown, /^# Snapshot da carteira Helios/m);
  assert.match(markdown, /27\/08\/2026/);
  assert.match(markdown, /R\$ 150\.000,00/);
  assert.match(markdown, /## Composição por classe/);
  assert.match(markdown, /## Metas de alocação/);
  assert.match(markdown, /Tesouro Selic/);
  assert.match(markdown, /nominal \+20,00%/);
  assert.match(markdown, /## Histórico e snapshots/);
  assert.match(markdown, /Ganho real/);
  assert.match(markdown, /## Fundamentos carregados nesta sessão/);
  assert.match(markdown, /## Parâmetros de fundamentos carregados nesta sessão/);
});

test('usa whitelist e remove segredos reconhecíveis das observações', () => {
  const markdown = buildContext(fixture());

  assert.doesNotMatch(markdown, /TOKEN-NAO-DEVE-SAIR/);
  assert.doesNotMatch(markdown, /URL-SECRETA/);
  assert.doesNotMatch(markdown, /PIN-NAO-DEVE-SAIR/);
  assert.doesNotMatch(markdown, /COOKIE-NAO-DEVE-SAIR/);
  assert.doesNotMatch(markdown, /OBSERVACAO-SECRETA/);
  assert.match(markdown, /Senha: \[REMOVIDO\]/i);
  assert.doesNotMatch(markdown, /interno-1/);
});

test('gera contexto principal mesmo sem seções carregadas sob demanda', () => {
  const input = fixture();
  input.fundamentosLoaded = false;
  input.parametrosLoaded = false;
  input.fundamentos = [];
  input.parametros = [];
  const markdown = buildContext(input);

  assert.match(markdown, /## Resumo patrimonial/);
  assert.doesNotMatch(markdown, /## Fundamentos carregados nesta sessão/);
  assert.doesNotMatch(markdown, /## Parâmetros de fundamentos carregados nesta sessão/);
});

test('recusa exportação antes do carregamento do dashboard', () => {
  assert.throws(() => buildContext({ ativos: [] }), /dados_indisponiveis/);
});

test('copia pela API moderna da área de transferência', async () => {
  let copied = '';
  const result = await copyText('contexto', {
    navigator: { clipboard: { writeText: async (text) => { copied = text; } } }
  });

  assert.equal(result, 'clipboard');
  assert.equal(copied, 'contexto');
});

test('usa fallback compatível com navegadores móveis quando a API moderna falha', async () => {
  let command = '';
  let removed = false;
  const textarea = {
    value: '', style: {}, setAttribute() {}, focus() {}, select() {}, setSelectionRange() {}, parentNode: null
  };
  const parent = { removeChild() { removed = true; textarea.parentNode = null; } };
  const document = {
    body: { appendChild(element) { assert.equal(element, textarea); textarea.parentNode = parent; } },
    createElement(tag) { assert.equal(tag, 'textarea'); return textarea; },
    execCommand(value) { command = value; return true; }
  };

  const result = await copyText('contexto mobile', {
    navigator: { clipboard: { writeText: async () => { throw new Error('negado'); } } },
    document
  });

  assert.equal(result, 'fallback');
  assert.equal(textarea.value, 'contexto mobile');
  assert.equal(command, 'copy');
  assert.equal(removed, true);
});

test('propaga erro quando nenhum método de cópia está disponível', async () => {
  await assert.rejects(copyText('contexto', { navigator: {}, document: null }), /clipboard_indisponivel/);
});

test('mantém botão, módulo e cache da PWA alinhados na v6.2.0', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

  assert.match(html, /id="btn-copy-contexto"/);
  assert.match(html, /<script src="context-export\.js"><\/script>/);
  assert.match(html, /const APP_VERSION = 'v6\.2\.0'/);
  assert.match(html, /HeliosContextExport\.buildContext/);
  assert.match(html, /HeliosContextExport\.copyText/);
  assert.match(sw, /helios-neo-v6\.2\.0/);
  assert.match(sw, /\.\/context-export\.js/);
});
