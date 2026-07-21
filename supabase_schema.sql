-- Tablas para Futbol Stats (Ultimate Loja)

-- 1. Tabla de Equipos
CREATE TABLE IF NOT EXISTS teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  logo_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Jugadores
CREATE TABLE IF NOT EXISTS players (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  edad integer NOT NULL,
  posicion text NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  foto_url text,
  
  -- Campos de análisis
  perfil_fisico text,
  cualidades_tecnicas text[] DEFAULT '{}'::text[],
  fortalezas text[] DEFAULT '{}'::text[],
  debilidades text[] DEFAULT '{}'::text[],
  rol_tactico text,
  
  -- Estadísticas estilo FIFA
  overall_rating integer CHECK (overall_rating >= 1 AND overall_rating <= 99),
  pace integer CHECK (pace >= 1 AND pace <= 99),
  shooting integer CHECK (shooting >= 1 AND shooting <= 99),
  passing integer CHECK (passing >= 1 AND passing <= 99),
  dribbling integer CHECK (dribbling >= 1 AND dribbling <= 99),
  defending integer CHECK (defending >= 1 AND defending <= 99),
  physical integer CHECK (physical >= 1 AND physical <= 99),
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Políticas para Teams
CREATE POLICY "Permitir lectura a todos en teams" 
  ON teams FOR SELECT USING (true);

CREATE POLICY "Solo admin puede insertar teams" 
  ON teams FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Solo admin puede actualizar teams" 
  ON teams FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Solo admin puede eliminar teams" 
  ON teams FOR DELETE USING (auth.role() = 'authenticated');


-- Políticas para Players
-- Como vamos a recrear las políticas, primero eliminamos las anteriores si existen
DROP POLICY IF EXISTS "Permitir lectura a todos" ON players;
DROP POLICY IF EXISTS "Permitir insertar a todos" ON players;
DROP POLICY IF EXISTS "Permitir actualizar a todos" ON players;
DROP POLICY IF EXISTS "Permitir eliminar a todos" ON players;

CREATE POLICY "Permitir lectura a todos en players" 
  ON players FOR SELECT USING (true);

CREATE POLICY "Solo admin puede insertar players" 
  ON players FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Solo admin puede actualizar players" 
  ON players FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Solo admin puede eliminar players" 
  ON players FOR DELETE USING (auth.role() = 'authenticated');

-- =========================================================================
-- SUPABASE STORAGE (BUCKETS)
-- =========================================================================

-- Creamos el bucket para las fotos de los jugadores
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS en la tabla de storage.objects (Comentado porque Supabase ya lo tiene por defecto y puede dar error de permisos)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Políticas de Storage

-- Todo el mundo puede ver las fotos (Select)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'photos' );

-- Todo el mundo puede subir fotos (para el sistema de sugerencias)
CREATE POLICY "Public Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'photos' );

-- Solo el admin (autenticado) puede borrar/actualizar fotos
CREATE POLICY "Admin Update Storage" 
ON storage.objects FOR UPDATE 
USING ( auth.role() = 'authenticated' AND bucket_id = 'photos' );

CREATE POLICY "Admin Delete Storage" 
ON storage.objects FOR DELETE 
USING ( auth.role() = 'authenticated' AND bucket_id = 'photos' );
