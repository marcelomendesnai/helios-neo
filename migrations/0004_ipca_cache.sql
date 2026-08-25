CREATE TABLE IF NOT EXISTS ipca_cache (
  data_inicial       TEXT NOT NULL,
  data_referencia    TEXT NOT NULL,
  taxa               REAL NOT NULL,
  atualizado_em      TEXT NOT NULL,
  PRIMARY KEY (data_inicial, data_referencia)
);

