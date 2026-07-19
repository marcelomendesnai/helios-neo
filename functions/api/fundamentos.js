// GET /api/fundamentos — matriz de fundamentos das ações (classif_4='ACAO' com ticker).
// Pra cada ativo: busca fundamentos (cache diário), acha o parâmetro do setor
// (gera via Gemini se for setor novo — ver _lib/gemini.js), calcula o índice de
// alerta ponderado e gera/reaproveita a leitura em texto.
import { checkAuth, unauthorized } from '../_lib/auth.js';
import { obterFundamentosCache, calcularScore } from '../_lib/fundamentos.js';
import { obterParametrosSetor, gerarLeitura, INDICADORES } from '../_lib/gemini.js';

export async function onRequestGet({ request, env }) {
  if (!checkAuth(request, env)) return unauthorized();
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, nome, ticker_api FROM ativos WHERE ativo = 1 AND classif_4 = 'ACAO' AND ticker_api IS NOT NULL AND ticker_api != ''"
    ).all();

    const saida = [];
    for (const a of (results || [])) {
      const fund = await obterFundamentosCache(env.DB, a.ticker_api, env);
      if (!fund) {
        saida.push({ id: a.id, nome: a.nome, ticker: a.ticker_api, erro: 'sem_dados_bolsai' });
        continue;
      }

      const setorUsado = fund.setor || 'PADRAO';
      const { parametros, gerado_agora, erro_geracao } = await obterParametrosSetor(env.DB, setorUsado, env);
      const score = calcularScore(fund, parametros);

      // Leitura em texto: só gera de novo se ainda nao tem, ou se o cache de
      // fundamentos foi renovado hoje (leitura ficaria desatualizada com o texto velho).
      let leitura = fund.leitura_ia;
      const precisaLeitura = !leitura || fund.leitura_gerada_em !== fund.consultado_em;
      if (precisaLeitura) {
        try {
          leitura = await gerarLeitura(a.nome, a.ticker_api, setorUsado, score.indiceAlerta, score.detalhe, env);
          await env.DB.prepare(
            'UPDATE fundamentos_cache SET leitura_ia = ?, leitura_gerada_em = ? WHERE ticker = ? AND reference_date = ?'
          ).bind(leitura, fund.consultado_em, a.ticker_api, fund.reference_date).run();
        } catch (e) {
          leitura = leitura || null; // mantem o que tinha (ou null) se o Gemini falhar agora
        }
      }

      saida.push({
        id: a.id,
        nome: a.nome,
        ticker: a.ticker_api,
        setor: setorUsado,
        setor_sem_calibracao: !!gerado_agora,
        erro_parametro: erro_geracao || null,
        reference_date: fund.reference_date,
        indice_alerta: score.indiceAlerta,
        detalhe: score.detalhe,
        fundamentos: {
          close_price: fund.close_price, pl: fund.pl, pvp: fund.pvp, roe: fund.roe, roa: fund.roa,
          net_margin: fund.net_margin, net_debt_ebitda: fund.net_debt_ebitda, current_ratio: fund.current_ratio,
          cagr_revenue_5y: fund.cagr_revenue_5y, cagr_earnings_5y: fund.cagr_earnings_5y, dividend_yield: fund.dividend_yield
        },
        leitura_ia: leitura
      });
    }

    return json({ ok: true, data: saida, indicadores: INDICADORES });
  } catch (e) {
    return json({ erro: e.message }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}
