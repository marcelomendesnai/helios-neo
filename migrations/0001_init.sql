-- Helios Neo — schema D1 limpo.
-- Dados de carteira nunca devem fazer parte do código-fonte ou das migrations.

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
  data_aquis          TEXT,
  calc_real           INTEGER NOT NULL DEFAULT 0 CHECK (calc_real IN (0, 1)),
  preco_atual_manual  TEXT,
  moeda               TEXT NOT NULL DEFAULT 'BRL',
  fonte_url           TEXT,
  observacao          TEXT,
  ativo               INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
  criado_em           TEXT NOT NULL,
  atualizado_em       TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ativos_ativo ON ativos (ativo);
CREATE INDEX IF NOT EXISTS idx_ativos_ticker ON ativos (ticker_api);
CREATE INDEX IF NOT EXISTS idx_ativos_classificacao ON ativos (classif_1, classif_2, classif_3, classif_4);

CREATE TABLE IF NOT EXISTS cotacoes_cache (
  ticker_api     TEXT NOT NULL,
  data           TEXT NOT NULL,
  preco          REAL NOT NULL,
  moeda          TEXT,
  fonte          TEXT,
  atualizado_em  TEXT NOT NULL,
  PRIMARY KEY (ticker_api, data)
);

CREATE TABLE IF NOT EXISTS snapshots (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  data                  TEXT NOT NULL UNIQUE,
  total_bruto           REAL NOT NULL,
  total_liquido         REAL NOT NULL,
  total_por_classif1    TEXT,
  payload_completo_json TEXT
);

CREATE TABLE IF NOT EXISTS classificacoes (
  nivel   INTEGER NOT NULL CHECK (nivel BETWEEN 1 AND 4),
  valor   TEXT NOT NULL,
  parent  TEXT,
  ativo   INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
  UNIQUE (nivel, valor, parent)
);

CREATE TABLE IF NOT EXISTS config (
  chave       TEXT PRIMARY KEY,
  valor       TEXT,
  descricao   TEXT
);

CREATE TABLE IF NOT EXISTS login_attempts (
  ip_hash         TEXT PRIMARY KEY,
  falhas          INTEGER NOT NULL DEFAULT 0,
  janela_inicio   INTEGER NOT NULL,
  bloqueado_ate   INTEGER NOT NULL DEFAULT 0,
  atualizado_em   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ipca_cache (
  data_inicial       TEXT NOT NULL,
  data_referencia    TEXT NOT NULL,
  taxa               REAL NOT NULL,
  atualizado_em      TEXT NOT NULL,
  PRIMARY KEY (data_inicial, data_referencia)
);

INSERT OR IGNORE INTO config (chave, valor, descricao) VALUES
  ('fator_camuflagem','1','Divisor usado ao ocultar valores.'),
  ('modo_privacidade_default','FALSE','Se TRUE, inicia com valores ocultos.'),
  ('moeda_base','BRL','Moeda usada nos totais.'),
  ('intervalo_cotacao_horas','24','Intervalo mínimo entre atualizações automáticas.'),
  ('snapshot_dia_do_mes','1','Dia do snapshot mensal; 0 desabilita.');

