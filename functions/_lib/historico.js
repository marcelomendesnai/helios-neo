// Histórico mensal: uma fotografia imutável no primeiro acesso de cada mês
// e IPCA oficial (SGS 433/BCB) para comparar evolução nominal e real.

function primeiroDiaMes(date = new Date()) {
  return date.toISOString().slice(0, 7) + '-01';
}

function ultimoDiaMesAnterior(dataAtual) {
  const [ano, mes] = String(dataAtual).slice(0, 7).split('-').map(Number);
  return new Date(Date.UTC(ano, mes - 1, 0));
}

function fmtBCB(date) {
  return String(date.getUTCDate()).padStart(2, '0') + '/' +
    String(date.getUTCMonth() + 1).padStart(2, '0') + '/' + date.getUTCFullYear();
}

export async function garantirSchemaHistorico(db) {
  const colunas = await db.prepare('PRAGMA table_info(snapshots)').all();
  const nomes = new Set((colunas.results || []).map((c) => c.name));
  const adicionar = async (sql) => {
    try { await db.prepare(sql).run(); }
    catch (e) { if (!/duplicate column/i.test(String(e && e.message))) throw e; }
  };
  if (!nomes.has('ipca_periodo')) await adicionar('ALTER TABLE snapshots ADD COLUMN ipca_periodo REAL');
  if (!nomes.has('capturado_em')) await adicionar('ALTER TABLE snapshots ADD COLUMN capturado_em TEXT');
  if (!nomes.has('origem')) await adicionar("ALTER TABLE snapshots ADD COLUMN origem TEXT DEFAULT 'legado'");
}

export async function garantirSnapshotMensal(db, dashboard) {
  await garantirSchemaHistorico(db);
  const data = primeiroDiaMes();
  const existente = await db.prepare('SELECT data FROM snapshots WHERE data = ?').bind(data).first();
  if (existente) return false;
  const agora = new Date().toISOString();
  await db.prepare(
    `INSERT OR IGNORE INTO snapshots
      (data, total_bruto, total_liquido, total_por_classif1, payload_completo_json, capturado_em, origem)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    data,
    dashboard.total_bruto,
    dashboard.total_liquido,
    JSON.stringify(dashboard.por_classif1 || {}),
    JSON.stringify({ por_classif2: dashboard.por_classif2 || {}, top_ativos: dashboard.top_ativos || [] }),
    agora,
    'automatico'
  ).run();
  return true;
}

async function buscarIpcaPeriodo(dataAnterior, dataAtual) {
  const inicio = new Date(String(dataAnterior).slice(0, 7) + '-01T00:00:00Z');
  const fim = ultimoDiaMesAnterior(dataAtual);
  if (fim < inicio) return null;
  const url = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json&dataInicial=' +
    fmtBCB(inicio) + '&dataFinal=' + fmtBCB(fim);
  try {
    const resposta = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!resposta.ok) return null;
    const meses = await resposta.json();
    if (!Array.isArray(meses) || !meses.length) return null;
    let acumulado = 1;
    let validos = 0;
    meses.forEach((item) => {
      const taxa = Number(String(item.valor).replace(',', '.'));
      if (Number.isFinite(taxa)) {
        acumulado *= 1 + taxa / 100;
        validos += 1;
      }
    });
    return validos ? acumulado - 1 : null;
  } catch (_) {
    return null;
  }
}

export async function listarSnapshotsComIpca(db) {
  await garantirSchemaHistorico(db);
  const { results } = await db.prepare(
    `SELECT data, total_bruto, total_liquido, total_por_classif1,
            ipca_periodo, capturado_em, origem
       FROM snapshots ORDER BY data`
  ).all();
  const snapshots = results || [];
  for (let i = 1; i < snapshots.length; i += 1) {
    const atual = snapshots[i];
    if (atual.ipca_periodo !== null && atual.ipca_periodo !== undefined) continue;
    const taxa = await buscarIpcaPeriodo(snapshots[i - 1].data, atual.data);
    if (taxa === null) continue;
    await db.prepare('UPDATE snapshots SET ipca_periodo = ? WHERE data = ?').bind(taxa, atual.data).run();
    atual.ipca_periodo = taxa;
  }
  return snapshots.map((s) => ({
    data: s.data,
    total_bruto: s.total_bruto,
    total_liquido: s.total_liquido,
    por_classif1: parseJsonSeguro(s.total_por_classif1),
    ipca_periodo: s.ipca_periodo === null || s.ipca_periodo === undefined ? null : Number(s.ipca_periodo),
    capturado_em: s.capturado_em || null,
    origem: s.origem || 'legado'
  }));
}

function parseJsonSeguro(value) {
  if (!value) return null;
  try { return JSON.parse(value); } catch (_) { return null; }
}

