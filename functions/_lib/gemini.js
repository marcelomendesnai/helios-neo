// Helios Neo — geração de parâmetros de setor e leitura textual via Gemini (2026-07-19).
//
// Por que existe: quando um ativo é de um setor sem parâmetro calibrado ainda
// (ex: Marcelo compra uma ação de Mineração e só temos Bancos/Seguros/Varejo
// prontos), NÃO travamos esperando o Marcelo ou o Claude digitarem números —
// o Gemini gera um parâmetro razoável na hora, salva no banco, e a partir daí
// vira dado editável na tela de Parâmetros (nunca mais precisa de código pra
// esse setor de novo). Ver funcao obterParametrosSetor().
//
// direção e peso de cada indicador são FIXOS aqui (não pedimos pro Gemini
// inventar isso, só os dois números de corte + se o indicador se aplica ao
// setor) — reduz a chance de a IA "inventar" um peso ou direção errada.
export const INDICADORES = {
  pl:               { direcao: 'menor_melhor', peso: 2, label: 'P/L' },
  pvp:              { direcao: 'menor_melhor', peso: 2, label: 'P/VP' },
  roe:              { direcao: 'maior_melhor', peso: 3, label: 'ROE' },
  roa:              { direcao: 'maior_melhor', peso: 2, label: 'ROA' },
  net_margin:       { direcao: 'maior_melhor', peso: 2, label: 'Margem Líquida' },
  net_debt_ebitda:  { direcao: 'menor_melhor', peso: 3, label: 'Dívida Líq/EBITDA' },
  current_ratio:    { direcao: 'maior_melhor', peso: 1, label: 'Liquidez Corrente' },
  cagr_revenue_5y:  { direcao: 'maior_melhor', peso: 2, label: 'CAGR Receita 5a' },
  cagr_earnings_5y: { direcao: 'maior_melhor', peso: 3, label: 'CAGR Lucro 5a' },
  dividend_yield:   { direcao: 'maior_melhor', peso: 2, label: 'Dividend Yield' }
};

function construirPromptParametros(setor) {
  return `Você é um analista fundamentalista brasileiro calibrando parâmetros de avaliação de ações do setor "${setor}" (classificação oficial CVM/B3), pro mercado atual.

Para CADA um dos 10 indicadores abaixo, defina o valor de corte pra "verde" (situação boa pro setor) e pra "amarelo" (situação de atenção; passado disso é vermelho/ruim), considerando os padrões TÍPICOS desse setor específico no mercado brasileiro atual. Se o indicador não fizer sentido pra esse tipo de negócio (ex: Dívida Líq/EBITDA e Liquidez Corrente não se aplicam bem a bancos, seguradoras, previdência privada e outras instituições financeiras, porque a estrutura de capital delas é diferente de uma empresa comum), marque "aplicavel": false pra ele.

Indicadores (responda usando a chave exata):
- pl: Preço/Lucro. Menor é melhor (mais barato).
- pvp: Preço/Valor Patrimonial. Menor é melhor.
- roe: Retorno sobre Patrimônio Líquido (%). Maior é melhor.
- roa: Retorno sobre Ativos totais (%). Maior é melhor.
- net_margin: Margem Líquida (%). Maior é melhor.
- net_debt_ebitda: Dívida Líquida / EBITDA (x). Menor é melhor.
- current_ratio: Liquidez Corrente (ativo circulante / passivo circulante). Maior é melhor.
- cagr_revenue_5y: Crescimento anual composto da Receita em 5 anos (%). Maior é melhor.
- cagr_earnings_5y: Crescimento anual composto do Lucro em 5 anos (%). Maior é melhor.
- dividend_yield: Dividend Yield (%). Maior é melhor.

Responda SOMENTE com JSON válido, sem nenhum texto fora do JSON, neste formato exato:
{"indicadores": {
  "pl": {"aplicavel": true, "verde_limite": 0, "amarelo_limite": 0},
  "pvp": {"aplicavel": true, "verde_limite": 0, "amarelo_limite": 0},
  "roe": {"aplicavel": true, "verde_limite": 0, "amarelo_limite": 0},
  "roa": {"aplicavel": true, "verde_limite": 0, "amarelo_limite": 0},
  "net_margin": {"aplicavel": true, "verde_limite": 0, "amarelo_limite": 0},
  "net_debt_ebitda": {"aplicavel": true, "verde_limite": 0, "amarelo_limite": 0},
  "current_ratio": {"aplicavel": true, "verde_limite": 0, "amarelo_limite": 0},
  "cagr_revenue_5y": {"aplicavel": true, "verde_limite": 0, "amarelo_limite": 0},
  "cagr_earnings_5y": {"aplicavel": true, "verde_limite": 0, "amarelo_limite": 0},
  "dividend_yield": {"aplicavel": true, "verde_limite": 0, "amarelo_limite": 0}
}}`;
}

async function chamarGemini(prompt, env) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + env.GEMINI_API_KEY;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
  };
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error('gemini_http_' + r.status);
  const j = await r.json();
  const texto = j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts && j.candidates[0].content.parts[0] && j.candidates[0].content.parts[0].text;
  if (!texto) throw new Error('gemini_resposta_vazia');
  return JSON.parse(texto);
}

export async function gerarParametrosSetor(setor, env) {
  const resposta = await chamarGemini(construirPromptParametros(setor), env);
  return resposta.indicadores;
}

export async function salvarParametrosSetor(db, setor, indicadoresGerados) {
  const agora = new Date().toISOString();
  for (const ind of Object.keys(INDICADORES)) {
    const g = indicadoresGerados[ind];
    if (!g) continue;
    const cfg = INDICADORES[ind];
    await db.prepare(
      `INSERT OR REPLACE INTO parametros_fundamentos (setor, indicador, aplicavel, direcao, verde_limite, amarelo_limite, peso, gerado_por_ia, gerado_em, atualizado_em) VALUES (?,?,?,?,?,?,?,1,?,?)`
    ).bind(
      setor, ind,
      g.aplicavel === false ? 0 : 1,
      cfg.direcao,
      g.verde_limite ?? null,
      g.amarelo_limite ?? null,
      cfg.peso,
      agora, agora
    ).run();
  }
}

// Busca parâmetros do setor; se não existir NENHUM registro pra esse setor,
// gera na hora via Gemini e já salva (próxima consulta usa o cache, não gera de novo).
export async function obterParametrosSetor(db, setor, env) {
  const setorChave = setor && setor.trim() ? setor.trim() : 'PADRAO';
  const { results } = await db.prepare('SELECT * FROM parametros_fundamentos WHERE setor = ?').bind(setorChave).all();
  if (results && results.length) {
    return { parametros: results, gerado_agora: false, setor: setorChave };
  }
  try {
    const gerados = await gerarParametrosSetor(setorChave, env);
    await salvarParametrosSetor(db, setorChave, gerados);
    const r2 = await db.prepare('SELECT * FROM parametros_fundamentos WHERE setor = ?').bind(setorChave).all();
    return { parametros: r2.results, gerado_agora: true, setor: setorChave };
  } catch (e) {
    // Gemini falhou (rate limit, chave invalida etc) -> cai pro PADRAO generico, nunca quebra a tela.
    const rPadrao = await db.prepare('SELECT * FROM parametros_fundamentos WHERE setor = ?').bind('PADRAO').all();
    return { parametros: rPadrao.results, gerado_agora: false, setor: 'PADRAO', erro_geracao: e.message };
  }
}

function construirPromptLeitura(nome, ticker, setor, indiceAlerta, detalhe) {
  const linhas = detalhe
    .filter((d) => d.sinal !== 'na')
    .map((d) => `- ${INDICADORES[d.indicador].label}: ${d.valor} (${d.sinal}, peso ${d.peso})`)
    .join('\n');
  return `Você é um analista de carteira pessoal. Com base SOMENTE nos dados abaixo (não invente nenhum número que não esteja aqui), escreva UM parágrafo curto (4-6 frases, português do Brasil, direto, sem enrolação) sobre a ação ${nome} (${ticker}), setor ${setor}.

Índice de alerta calculado: ${indiceAlerta}% (percentual do peso dos indicadores fora do parâmetro ideal — quanto maior, pior).

Indicadores e situação:
${linhas}

O parágrafo deve: dizer se a situação geral está boa ou ruim, apontar quais indicadores pesam mais nisso, e terminar com uma leitura prática (algo como "manter", "vale reforçar posição" ou "vale reavaliar/reduzir") — sempre deixando claro que é uma leitura automática baseada nos parâmetros configurados, não uma recomendação de investimento formal. Não use bullet points, é parágrafo corrido.`;
}

export async function gerarLeitura(nome, ticker, setor, indiceAlerta, detalhe, env) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + env.GEMINI_API_KEY;
  const body = {
    contents: [{ parts: [{ text: construirPromptLeitura(nome, ticker, setor, indiceAlerta, detalhe) }] }],
    generationConfig: { temperature: 0.4 }
  };
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error('gemini_http_' + r.status);
  const j = await r.json();
  const texto = j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts && j.candidates[0].content.parts[0] && j.candidates[0].content.parts[0].text;
  if (!texto) throw new Error('gemini_resposta_vazia');
  return texto.trim();
}
