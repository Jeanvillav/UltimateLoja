-- Tabla de jugadores para Futbol Stats

CREATE TABLE IF NOT EXISTS players (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  edad integer NOT NULL,
  posicion text NOT NULL,
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

-- Habilitar RLS (Row Level Security) - por ahora permitimos lectura a todos y escritura a todos para pruebas
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura a todos" 
  ON players FOR SELECT 
  USING (true);

CREATE POLICY "Permitir insertar a todos" 
  ON players FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Permitir actualizar a todos" 
  ON players FOR UPDATE 
  USING (true);

CREATE POLICY "Permitir eliminar a todos" 
  ON players FOR DELETE 
  USING (true);
