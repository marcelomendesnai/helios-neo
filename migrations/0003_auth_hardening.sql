-- Compatibilidade para bancos já existentes antes da autenticação v6.
CREATE TABLE IF NOT EXISTS login_attempts (
  ip_hash         TEXT PRIMARY KEY,
  falhas          INTEGER NOT NULL DEFAULT 0,
  janela_inicio   INTEGER NOT NULL,
  bloqueado_ate   INTEGER NOT NULL DEFAULT 0,
  atualizado_em   TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_snapshots_data_unique ON snapshots (data);

