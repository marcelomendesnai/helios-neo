-- Helios Neo — matriz de fundamentos (2026-07-19)
-- fundamentos_cache: snapshot dos indicadores buscados na bolsai (api.usebolsai.com),
--   1 linha por ticker+trimestre (reference_date). Serve de cache do dia a dia E de
--   histórico "de graça" a partir de agora (plano free da bolsai não da historico).
-- parametros_fundamentos: limites verde/amarelo por setor+indicador. Gerados
--   automaticamente pelo Gemini na primeira vez que um setor novo aparece (ver
--   functions/_lib/gemini.js), e editáveis livremente na tela de Parâmetros do app
--   depois disso — não depende de deploy/código pra calibrar setor novo.

CREATE TABLE IF NOT EXISTS fundamentos_cache (
  ticker          TEXT NOT NULL,
  reference_date  TEXT NOT NULL,   -- data do balanço (trimestre), vem da bolsai
  consultado_em   TEXT NOT NULL,   -- quando a gente buscou (controle de cache diário)
  setor           TEXT,            -- setor oficial CVM devolvido pela bolsai
  close_price     REAL,
  pl              REAL,
  pvp              REAL,
  roe             REAL,
  roa             REAL,
  net_margin      REAL,
  net_debt_ebitda REAL,
  current_ratio   REAL,
  cagr_revenue_5y REAL,
  cagr_earnings_5y REAL,
  dividend_yield  REAL,            -- pode ficar NULL ate confirmarmos a fonte gratuita
  raw_json        TEXT,            -- resposta completa da bolsai, pra nao perder campo nenhum
  leitura_ia      TEXT,            -- paragrafo gerado pelo Gemini (tá bem/tá mal, manter/vender/comprar mais)
  leitura_gerada_em TEXT,          -- quando o paragrafo foi gerado (pra saber se precisa regenerar)
  PRIMARY KEY (ticker, reference_date)
);

CREATE TABLE IF NOT EXISTS parametros_fundamentos (
  setor           TEXT NOT NULL,   -- setor CVM (ex: 'Bancos') ou 'PADRAO' (fallback generico)
  indicador       TEXT NOT NULL,   -- 'pl','pvp','roe','roa','net_margin','net_debt_ebitda',
                                    -- 'current_ratio','cagr_revenue_5y','cagr_earnings_5y','dividend_yield'
  aplicavel       INTEGER NOT NULL DEFAULT 1,  -- 0 = N/A pro setor (ex: divida/liquidez pra banco)
  direcao         TEXT NOT NULL,   -- 'maior_melhor' ou 'menor_melhor'
  verde_limite    REAL,            -- corte pra verde (interpretado conforme direcao)
  amarelo_limite  REAL,            -- corte pra amarelo (alem disso = vermelho)
  peso            INTEGER NOT NULL DEFAULT 2,  -- importancia no score (1-3)
  gerado_por_ia   INTEGER NOT NULL DEFAULT 0,
  gerado_em       TEXT,
  atualizado_em   TEXT,
  PRIMARY KEY (setor, indicador)
);

-- Parametro PADRAO (fallback generico): usado quando um setor novo aparece e ainda
-- nao foi calibrado (nem pelo Gemini, nem manualmente). Gerado aqui direto (nao
-- precisa esperar chamada de IA pra ter algo funcionando desde o dia 1).
INSERT INTO parametros_fundamentos (setor, indicador, aplicavel, direcao, verde_limite, amarelo_limite, peso, gerado_por_ia, gerado_em, atualizado_em) VALUES
('PADRAO','pl',1,'menor_melhor',12,18,2,0,NULL,'2026-07-19'),
('PADRAO','pvp',1,'menor_melhor',2,3.5,2,0,NULL,'2026-07-19'),
('PADRAO','roe',1,'maior_melhor',15,10,3,0,NULL,'2026-07-19'),
('PADRAO','roa',1,'maior_melhor',6,3,2,0,NULL,'2026-07-19'),
('PADRAO','net_margin',1,'maior_melhor',10,5,2,0,NULL,'2026-07-19'),
('PADRAO','net_debt_ebitda',1,'menor_melhor',2,3.5,3,0,NULL,'2026-07-19'),
('PADRAO','current_ratio',1,'maior_melhor',1.3,1.0,1,0,NULL,'2026-07-19'),
('PADRAO','cagr_revenue_5y',1,'maior_melhor',8,3,2,0,NULL,'2026-07-19'),
('PADRAO','cagr_earnings_5y',1,'maior_melhor',8,3,3,0,NULL,'2026-07-19'),
('PADRAO','dividend_yield',1,'maior_melhor',5,2,2,0,NULL,'2026-07-19');
