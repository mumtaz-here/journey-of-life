-- DROP kolom lama yang tidak dipakai
ALTER TABLE entries
DROP COLUMN IF EXISTS analysis;

-- RENAME kolom yang salah nama
ALTER TABLE reflections
RENAME COLUMN week TO reflection_date;

-- PASTIKAN reflection_date bertipe DATE
ALTER TABLE reflections
ALTER COLUMN reflection_date TYPE DATE
USING reflection_date::date;

-- TAMBAH created_at jika belum ada
ALTER TABLE reflections
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
