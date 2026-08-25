-- Histórico v2: inflação do intervalo e metadados da fotografia mensal.
ALTER TABLE snapshots ADD COLUMN ipca_periodo REAL;
ALTER TABLE snapshots ADD COLUMN capturado_em TEXT;
ALTER TABLE snapshots ADD COLUMN origem TEXT DEFAULT 'legado';

UPDATE snapshots
   SET capturado_em = COALESCE(capturado_em, data || 'T00:00:00.000Z'),
       origem = COALESCE(origem, 'legado');

