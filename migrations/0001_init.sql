-- Helios Neo — schema D1 (migração do Google Sheets, planilha "Helios Base")
-- Gerado em 2026-07-19 a partir de:
-- https://docs.google.com/spreadsheets/d/1f_jrL5D4N7QSxOl7i3G3pcCfeZ-rN-Q1hUbic30CSIQ
-- cotacoes_cache NAO migra (é cache diário, a Function recria sozinha via BRAPI/AwesomeAPI).

CREATE TABLE IF NOT EXISTS ativos (
  id                  TEXT PRIMARY KEY,
  classif_1           TEXT,
  classif_2           TEXT,
  classif_3           TEXT,
  classif_4           TEXT,
  nome                TEXT NOT NULL,
  ticker_api          TEXT,
  qtd                 REAL,
  preco_medio         REAL,
  data_aquis          TEXT,      -- 'YYYY-MM-DD'
  calc_real           INTEGER,   -- 0/1: TRUE = usa preco_atual_manual como valor "real" (bens: imóvel, carro)
  preco_atual_manual  TEXT,      -- texto pq às vezes guarda 'ATUALIZAR' como marcador
  moeda               TEXT,
  fonte_url           TEXT,
  observacao          TEXT,
  ativo               INTEGER NOT NULL DEFAULT 1,  -- soft-delete (0 = removido)
  criado_em           TEXT,
  atualizado_em       TEXT
);

CREATE TABLE IF NOT EXISTS cotacoes_cache (
  ticker_api     TEXT NOT NULL,
  data           TEXT NOT NULL,   -- 'YYYY-MM-DD'
  preco          REAL NOT NULL,
  moeda          TEXT,
  fonte          TEXT,
  atualizado_em  TEXT,
  PRIMARY KEY (ticker_api, data)
);

CREATE TABLE IF NOT EXISTS snapshots (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  data                  TEXT NOT NULL,   -- 'YYYY-MM-DD', 1 por mês
  total_bruto           REAL NOT NULL,
  total_liquido         REAL NOT NULL,
  total_por_classif1    TEXT,   -- JSON
  payload_completo_json TEXT    -- JSON (por_classif2 + top_ativos)
);

CREATE TABLE IF NOT EXISTS classificacoes (
  nivel   INTEGER NOT NULL,
  valor   TEXT NOT NULL,
  parent  TEXT,
  ativo   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS config (
  chave       TEXT PRIMARY KEY,
  valor       TEXT,
  descricao   TEXT
);

INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('e5832a55', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'ACAO', 'AZZA3', 'AZZA3', 2, 0.0, NULL, 0, 'ATUALIZAR', 'BRL', NULL, 'Azzas 2154 S.A. - bonificacao (preco medio 0)', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('c2ecf105', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'ACAO', 'BBDC4', 'BBDC4', 484, 20.32, NULL, 0, 'ATUALIZAR', 'BRL', NULL, 'Banco Bradesco S.A.', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('21b73484', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'ACAO', 'BBSE3', 'BBSE3', 300, 26.7, NULL, 0, 'ATUALIZAR', 'BRL', NULL, 'BB Seguridade', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('c4aa18cd', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'ACAO', 'ITUB4', 'ITUB4', 396, 23.2, NULL, 0, 'ATUALIZAR', 'BRL', NULL, 'Itau Unibanco Holding S.A.', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('5a58e35f', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'ACAO', 'BBAS3', 'BBAS3', 14, 21.2, NULL, 0, 'ATUALIZAR', 'BRL', NULL, 'Banco do Brasil S.A.', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('f83c7595', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'FUNDO IMOB', 'BTHF11', 'BTHF11', 102, 10.25, NULL, 0, 'ATUALIZAR', 'BRL', NULL, 'BTG Pactual Real Estate HF', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('6f24041b', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'FUNDO IMOB', 'HTMX11', 'HTMX11', 25, 123.94, NULL, 0, 'ATUALIZAR', 'BRL', NULL, 'FII Hotel Maxinvest', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('9ad1af51', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'FUNDO IMOB', 'TGAR11', 'TGAR11', 23, 130.44, NULL, 0, 'ATUALIZAR', 'BRL', NULL, 'TG Ativo Real', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('00ea896b', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'FUNDO IMOB', 'BBRC11', 'BBRC11', 3, 100.96, NULL, 0, 'ATUALIZAR', 'BRL', NULL, 'BB Renda Corporativa', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('11fcb50b', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'FUNDO IMOB', 'BTLG11', 'BTLG11', 3, 102.78, NULL, 0, 'ATUALIZAR', 'BRL', NULL, 'BTG Pactual Logistica', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('478e55d0', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'FUNDO IMOB', 'HCRI11', 'HCRI11', 1, 229.89, NULL, 0, 'ATUALIZAR', 'BRL', NULL, 'FII Hospital da Crianca', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('4b0d76f0', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'FUNDO IMOB', 'HGLG11', 'HGLG11', 3, 165.23, NULL, 0, 'ATUALIZAR', 'BRL', NULL, 'CSHG Logistica', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('3ead1cbe', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'FUNDO IMOB', 'HSML11', 'HSML11', 3, 93.44, NULL, 0, 'ATUALIZAR', 'BRL', NULL, 'HSI Malls', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('8b03484c', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'FUNDO IMOB', 'HTMX11', 'HTMX11', 48, 123.94, NULL, 0, 'ATUALIZAR', 'BRL', NULL, 'FII Hotel Maxinvest (XP)', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('fe11fb59', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'FUNDO IMOB', 'RZTR11', 'RZTR11', 3, 105.24, NULL, 0, 'ATUALIZAR', 'BRL', NULL, 'Riza Terrax', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('0b41cf65', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'FUNDO IMOB', 'TGAR11', 'TGAR11', 61, 130.44, NULL, 0, 'ATUALIZAR', 'BRL', NULL, 'TG Ativo Real (XP)', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('10c9ee53', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'FUNDO IMOB', 'TRXF11', 'TRXF11', 3, 108.96, NULL, 0, 'ATUALIZAR', 'BRL', NULL, 'TRX Real Estate', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('134bedfd', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'FUNDO IMOB', 'VISC11', 'VISC11', 3, 112.77, NULL, 0, 'ATUALIZAR', 'BRL', NULL, 'Vinci Shopping Centers', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('3aa8a28e', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'FUNDO IMOB', 'XPML11', 'XPML11', 2, 103.55, NULL, 0, 'ATUALIZAR', 'BRL', NULL, 'XP Malls', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('efa058ee', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'FUNDO RF', 'BNP Paribas Match DI FIRF Referenciado CP', NULL, 1, 33765.68, NULL, 0, 37484.67, 'BRL', NULL, 'Atualizacao manual - fundo de RF', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('4bdd9182', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'FUNDO RF', 'Trend Investback FIC FIRF Simples', NULL, 1, 1725.64, NULL, 0, 2213.22, 'BRL', NULL, 'Atualizacao manual', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('472f93a7', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'FUNDO RF', 'Western Asset Total Credit Advisory FIC FIRF CP', NULL, 1, 1413.32, NULL, 0, 2235.25, 'BRL', NULL, 'Atualizacao manual', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('213f6a8c', 'FINANCEIRO', 'RENDA VARIAVEL', 'XP', 'FUNDO RV', 'Vinland Macro Advisory FIC FIM', NULL, 1, 2088.7, NULL, 0, 2817.82, 'BRL', NULL, 'Atualizacao manual - fundo multimercado', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('7b61976c', 'FINANCEIRO', 'RENDA FIXA', 'XP', 'RENDA FIXA', 'Tesouro Selic 2031', NULL, 1, 30006.74, NULL, 0, 31497.73, 'BRL', NULL, 'Atualizacao manual', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('2b362909', 'FINANCEIRO', 'PREVIDENCIA PRIVADA', 'XP', 'PREV PRIVADA', 'LEBLON ICATU PREV FIM', NULL, 1, 37943.98, NULL, 0, 41490.37, 'BRL', NULL, 'Atualizacao manual', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('a2df06d9', 'FINANCEIRO', 'CAIXA', 'CLEAR', 'SALDO', 'SALDO CLEAR', NULL, 1, 1000.0, NULL, 0, 1000.0, 'BRL', NULL, 'Saldo em conta', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('70284939', 'FINANCEIRO', 'CAIXA', 'XP', 'SALDO', 'SALDO CONTA CORRENTE', NULL, 1, 21000.0, NULL, 0, 21000.0, 'BRL', NULL, 'Conta corrente XP - zerada', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('89444653', 'FINANCEIRO', 'CAIXA', 'XP', 'SALDO', 'SALDO CONTA INVESTIMENTO', NULL, 1, 41000.0, NULL, 0, 41000.0, 'BRL', NULL, 'Conta investimento XP', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('266751ba', 'FINANCEIRO', 'POUPANCA', 'BB', 'SALDO', 'POUPANCA BB', NULL, 1, 1000.0, NULL, 0, 1000.0, 'BRL', NULL, 'Poupanca Banco do Brasil', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('adcc63ec', 'FINANCEIRO', 'MOEDA ESTRANGEIRA', 'MOEDA ESTRANGEIRA', 'EURO', 'CONTA PORTUGAL', 'EUR-BRL', 23040.96, 0.0, NULL, 0, 23040.96, 'EUR', 'https://economia.awesomeapi.com.br/last/EUR-BRL', 'Saldo em EUR - cotacao automatica via AwesomeAPI', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('7dbc897e', 'FINANCEIRO', 'MOEDA ESTRANGEIRA', 'MOEDA ESTRANGEIRA', 'DOLAR', 'CONTA EUA', 'USD-BRL', 1931, 0.0, NULL, 0, 1931.0, 'USD', 'https://economia.awesomeapi.com.br/last/USD-BRL', 'Saldo em USD - cotacao automatica', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('04df9129', 'FINANCEIRO', 'DIVIDA', 'DIVIDA', 'DIVIDA', 'DIVIDAS CURTO PRAZO (PARCELAMENTO)', NULL, 1, -24500.0, NULL, 0, -24500.0, 'BRL', NULL, 'Parcelamentos Diversos + Carro (cartão)', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('0a0fbfc7', 'ATIVOS REAIS', 'IMOVEL', 'BEM IMOVEL', 'APTO', 'APTO 1', NULL, 1, 23000.0, '2013-03-01', 1, 40000.0, 'BRL', NULL, 'Apto Vila Natal', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('beaed429', 'ATIVOS REAIS', 'IMOVEL', 'BEM IMOVEL', 'APTO', 'APTO 2', NULL, 1, 160000.0, '2022-05-05', 1, 160000.0, 'BRL', NULL, 'Apto Golden Beach', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('9dbfde88', 'ATIVOS REAIS', 'IMOVEL', 'BEM IMOVEL', 'TERRENO', 'SITIO', NULL, 1, 65000.0, '2023-08-01', 1, 250000.0, 'BRL', NULL, 'Sítio Anastácia', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('d63dca73', 'ATIVOS REAIS', 'IMOVEL', 'BEM IMOVEL', 'TERRENO', 'TERRENO SERRA NEGRA', NULL, 1, 65000.0, '2025-09-30', 1, 90000.0, 'BRL', NULL, 'Terreno Serra Negra', 1, '2026-04-21', '2026-04-21');
INSERT INTO ativos (id, classif_1, classif_2, classif_3, classif_4, nome, ticker_api, qtd, preco_medio, data_aquis, calc_real, preco_atual_manual, moeda, fonte_url, observacao, ativo, criado_em, atualizado_em) VALUES ('8eb92e4a', 'ATIVOS REAIS', 'CARRO', 'BEM MOVEL', 'CARRO', 'TIGGO 7 PRO', NULL, 1, 134000.0, '2026-04-21', 1, 115000.0, 'BRL', 'https://www.mobiauto.com.br/tabela-fipe/carros/volkswagen/taos/2022', 'Valor atual de revenda (real)', 1, '2026-04-21', '2026-04-21');
-- classificacoes
INSERT INTO classificacoes (nivel, valor, parent, ativo) VALUES
(1,'FINANCEIRO',NULL,1),
(1,'ATIVOS REAIS',NULL,1),
(2,'RENDA VARIAVEL','FINANCEIRO',1),
(2,'RENDA FIXA','FINANCEIRO',1),
(2,'CAIXA','FINANCEIRO',1),
(2,'DIVIDA','FINANCEIRO',1),
(2,'MOEDA ESTRANGEIRA','FINANCEIRO',1),
(2,'POUPANCA','FINANCEIRO',1),
(2,'PREVIDENCIA PRIVADA','FINANCEIRO',1),
(2,'IMOVEL','BEM',1),
(2,'CARRO','BEM',1),
(3,'CLEAR','RENDA VARIAVEL',1),
(3,'XP','RENDA VARIAVEL',1),
(3,'XP','RENDA FIXA',1),
(3,'CLEAR','CAIXA',1),
(3,'XP','CAIXA',1),
(3,'DIVIDA','CAIXA',1),
(3,'BB','POUPANCA',1),
(3,'MOEDA ESTRANGEIRA','MOEDA ESTRANGEIRA',1),
(3,'BEM IMOVEL','IMOVEL',1),
(3,'BEM MOVEL','CARRO',1),
(3,'XP','PREVIDENCIA PRIVADA',1),
(4,'ACAO','CLEAR',1),
(4,'ACAO','XP',1),
(4,'FUNDO IMOB','CLEAR',1),
(4,'FUNDO IMOB','XP',1),
(4,'FUNDO RF','XP',1),
(4,'FUNDO RV','XP',1),
(4,'RENDA FIXA','XP',1),
(4,'PREV PRIVADA','XP',1),
(4,'SALDO','CLEAR',1),
(4,'SALDO','XP',1),
(4,'SALDO','BB',1),
(4,'DIVIDA','DIVIDA',1),
(4,'EURO','MOEDA ESTRANGEIRA',1),
(4,'DOLAR','MOEDA ESTRANGEIRA',1),
(4,'APTO','BEM IMOVEL',1),
(4,'SITIO','BEM IMOVEL',1),
(4,'TERRENO','BEM IMOVEL',1),
(4,'CARRO','BEM MOVEL',1);

-- config
INSERT INTO config (chave, valor, descricao) VALUES
('fator_camuflagem','1','Divisor aplicado a todos valores quando Modo Privacidade esta ligado. 1 = sem camuflagem.'),
('modo_privacidade_default','FALSE','Se TRUE, app abre com Modo Privacidade ligado.'),
('moeda_base','BRL','Moeda usada no total geral.'),
('intervalo_cotacao_horas','24','Intervalo minimo em horas entre refreshes automaticos.'),
('snapshot_dia_do_mes','1','Dia do mes em que snapshot automatico roda. 0 = desabilitado.'),
('api_brapi_base','https://brapi.dev/api/quote/','Endpoint base BRAPI.'),
('api_awesome_base','https://economia.awesomeapi.com.br/last/','Endpoint base AwesomeAPI.'),
('owner_email','marcelomendesnai@gmail.com','Email autorizado no Apps Script.');

-- snapshots (payload_completo_json entra como texto JSON bruto)
INSERT INTO snapshots (data, total_bruto, total_liquido, total_por_classif1, payload_completo_json) VALUES
('2026-05-01', 1037270.049, 1012770.049,
 '{"FINANCEIRO":357770.04859251995,"ATIVOS REAIS":655000}',
 '{"por_classif2":{"FINANCEIRO > RENDA VARIAVEL":101250.32,"FINANCEIRO > RENDA FIXA":31497.73,"FINANCEIRO > PREVIDENCIA PRIVADA":41490.37,"FINANCEIRO > CAIXA":63000,"FINANCEIRO > POUPANCA":1000,"FINANCEIRO > MOEDA ESTRANGEIRA":144031.62859252,"FINANCEIRO > DIVIDA":-24500,"ATIVOS REAIS > IMOVEL":540000,"ATIVOS REAIS > CARRO":115000},"top_ativos":[{"nome":"SITIO","ticker":"","classif":"ATIVOS REAIS > IMOVEL","total":250000,"variacao_pct":2.8461538461538463},{"nome":"APTO 2","ticker":"","classif":"ATIVOS REAIS > IMOVEL","total":160000,"variacao_pct":0},{"nome":"CONTA PORTUGAL","ticker":"EUR-BRL","classif":"FINANCEIRO > MOEDA ESTRANGEIRA","total":134394.16400351998,"variacao_pct":null},{"nome":"TIGGO 7 PRO","ticker":"","classif":"ATIVOS REAIS > CARRO","total":115000,"variacao_pct":-0.1417910447761194},{"nome":"TERRENO SERRA NEGRA","ticker":"","classif":"ATIVOS REAIS > IMOVEL","total":90000,"variacao_pct":0.38461538461538464},{"nome":"LEBLON ICATU PREV FIM","ticker":"","classif":"FINANCEIRO > PREVIDENCIA PRIVADA","total":41490.37,"variacao_pct":0.09346383800539636},{"nome":"SALDO CONTA INVESTIMENTO","ticker":"","classif":"FINANCEIRO > CAIXA","total":41000,"variacao_pct":0},{"nome":"APTO 1","ticker":"","classif":"ATIVOS REAIS > IMOVEL","total":40000,"variacao_pct":0.7391304347826086},{"nome":"BNP Paribas Match DI FIRF Referenciado CP","ticker":"","classif":"FINANCEIRO > RENDA VARIAVEL","total":37484.67,"variacao_pct":0.1101411255452281},{"nome":"Tesouro Selic 2031","ticker":"","classif":"FINANCEIRO > RENDA FIXA","total":31497.73,"variacao_pct":0.04968850331625488}]}'
),
('2026-06-01', 1035620.554, 1011120.554,
 '{"FINANCEIRO":356120.5535652,"ATIVOS REAIS":655000}',
 '{"por_classif2":{"FINANCEIRO > RENDA VARIAVEL":98605.42,"FINANCEIRO > RENDA FIXA":31497.73,"FINANCEIRO > PREVIDENCIA PRIVADA":41490.37,"FINANCEIRO > CAIXA":63000,"FINANCEIRO > POUPANCA":1000,"FINANCEIRO > MOEDA ESTRANGEIRA":145027.0335652,"FINANCEIRO > DIVIDA":-24500,"ATIVOS REAIS > IMOVEL":540000,"ATIVOS REAIS > CARRO":115000},"top_ativos":[{"nome":"SITIO","ticker":"","classif":"ATIVOS REAIS > IMOVEL","total":250000,"variacao_pct":2.8461538461538463},{"nome":"APTO 2","ticker":"","classif":"ATIVOS REAIS > IMOVEL","total":160000,"variacao_pct":0},{"nome":"CONTA PORTUGAL","ticker":"EUR-BRL","classif":"FINANCEIRO > MOEDA ESTRANGEIRA","total":135294.6738432,"variacao_pct":null},{"nome":"TIGGO 7 PRO","ticker":"","classif":"ATIVOS REAIS > CARRO","total":115000,"variacao_pct":-0.1417910447761194},{"nome":"TERRENO SERRA NEGRA","ticker":"","classif":"ATIVOS REAIS > IMOVEL","total":90000,"variacao_pct":0.38461538461538464},{"nome":"LEBLON ICATU PREV FIM","ticker":"","classif":"FINANCEIRO > PREVIDENCIA PRIVADA","total":41490.37,"variacao_pct":0.09346383800539636},{"nome":"SALDO CONTA INVESTIMENTO","ticker":"","classif":"FINANCEIRO > CAIXA","total":41000,"variacao_pct":0},{"nome":"APTO 1","ticker":"","classif":"ATIVOS REAIS > IMOVEL","total":40000,"variacao_pct":0.7391304347826086},{"nome":"BNP Paribas Match DI FIRF Referenciado CP","ticker":"","classif":"FINANCEIRO > RENDA VARIAVEL","total":37484.67,"variacao_pct":0.1101411255452281},{"nome":"Tesouro Selic 2031","ticker":"","classif":"FINANCEIRO > RENDA FIXA","total":31497.73,"variacao_pct":0.04968850331625488}]}'
),
('2026-07-01', 1038486.284, 1013986.284,
 '{"FINANCEIRO":358986.28400984005,"ATIVOS REAIS":655000}',
 '{"por_classif2":{"FINANCEIRO > RENDA VARIAVEL":100539.86000000002,"FINANCEIRO > RENDA FIXA":31497.73,"FINANCEIRO > PREVIDENCIA PRIVADA":41490.37,"FINANCEIRO > CAIXA":63000,"FINANCEIRO > POUPANCA":1000,"FINANCEIRO > MOEDA ESTRANGEIRA":145958.32400984,"FINANCEIRO > DIVIDA":-24500,"ATIVOS REAIS > IMOVEL":540000,"ATIVOS REAIS > CARRO":115000},"top_ativos":[{"nome":"SITIO","ticker":"","classif":"ATIVOS REAIS > IMOVEL","total":250000,"variacao_pct":2.8461538461538463},{"nome":"APTO 2","ticker":"","classif":"ATIVOS REAIS > IMOVEL","total":160000,"variacao_pct":0},{"nome":"CONTA PORTUGAL","ticker":"EUR-BRL","classif":"FINANCEIRO > MOEDA ESTRANGEIRA","total":135964.22109984,"variacao_pct":null},{"nome":"TIGGO 7 PRO","ticker":"","classif":"ATIVOS REAIS > CARRO","total":115000,"variacao_pct":-0.1417910447761194},{"nome":"TERRENO SERRA NEGRA","ticker":"","classif":"ATIVOS REAIS > IMOVEL","total":90000,"variacao_pct":0.38461538461538464},{"nome":"LEBLON ICATU PREV FIM","ticker":"","classif":"FINANCEIRO > PREVIDENCIA PRIVADA","total":41490.37,"variacao_pct":0.09346383800539636},{"nome":"SALDO CONTA INVESTIMENTO","ticker":"","classif":"FINANCEIRO > CAIXA","total":41000,"variacao_pct":0},{"nome":"APTO 1","ticker":"","classif":"ATIVOS REAIS > IMOVEL","total":40000,"variacao_pct":0.7391304347826086},{"nome":"BNP Paribas Match DI FIRF Referenciado CP","ticker":"","classif":"FINANCEIRO > RENDA VARIAVEL","total":37484.67,"variacao_pct":0.1101411255452281},{"nome":"Tesouro Selic 2031","ticker":"","classif":"FINANCEIRO > RENDA FIXA","total":31497.73,"variacao_pct":0.04968850331625488}]}'
);
