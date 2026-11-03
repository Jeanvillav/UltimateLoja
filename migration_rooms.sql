-- =========================================================================
-- MIGRACIÓN SUPABASE: SISTEMA DE SALAS (ROOMS) SIN CUENTAS + SALA LOJA
-- =========================================================================

-- 1. Crear tabla de salas (rooms)
CREATE TABLE IF NOT EXISTS rooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,             -- Código de acceso único en mayúsculas (ej: 'LOJA', 'SAN-PEDRO', 'A7X2')
  name text NOT NULL,                    -- Nombre del grupo o torneo (ej: 'Canchas Sintéticas de Loja')
  description text,                      -- Descripción opcional
  admin_pin text,                        -- PIN / contraseña ligera del creador para administrar la sala sin login
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_active_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para búsqueda rápida por código
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);

-- Habilitar RLS en rooms
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Lectura pública para cualquier usuario que tenga el código o consulte la sala
CREATE POLICY "Permitir lectura publica de salas"
  ON rooms FOR SELECT USING (true);

-- Creación libre de salas por cualquier usuario (sin autenticación pesada)
CREATE POLICY "Permitir crear salas a cualquiera"
  ON rooms FOR INSERT WITH CHECK (true);

-- Actualización permitida
CREATE POLICY "Permitir actualizar salas"
  ON rooms FOR UPDATE USING (true);

-- 2. Insertar sala por defecto "LOJA" si aún no existe
INSERT INTO rooms (code, name, description, admin_pin)
VALUES (
  'LOJA', 
  'Canchas Sintéticas de Loja', 
  'Sala oficial de fútbol sintético y estadísticas en Loja, Ecuador',
  '1234'
)
ON CONFLICT (code) DO NOTHING;

-- 3. Agregar columna room_id a teams y players
ALTER TABLE teams 
  ADD COLUMN IF NOT EXISTS room_id uuid REFERENCES rooms(id) ON DELETE CASCADE;

ALTER TABLE players 
  ADD COLUMN IF NOT EXISTS room_id uuid REFERENCES rooms(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_teams_room_id ON teams(room_id);
CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id);

-- 4. Migrar todos los registros existentes sin room_id a la sala 'LOJA'
DO $$
DECLARE
  v_loja_room_id uuid;
BEGIN
  SELECT id INTO v_loja_room_id FROM rooms WHERE code = 'LOJA' LIMIT 1;
  
  IF v_loja_room_id IS NOT NULL THEN
    -- Asignar equipos huérfanos a la sala LOJA
    UPDATE teams 
    SET room_id = v_loja_room_id 
    WHERE room_id IS NULL;

    -- Asignar jugadores huérfanos a la sala LOJA
    UPDATE players 
    SET room_id = v_loja_room_id 
    WHERE room_id IS NULL;
  END IF;
END $$;

-- 5. Ajustar políticas RLS para permitir interacción abierta o por sala
-- Si usas autenticación anónima/pública sin cuentas:
DROP POLICY IF EXISTS "Solo admin puede insertar players" ON players;
DROP POLICY IF EXISTS "Solo admin puede actualizar players" ON players;
DROP POLICY IF EXISTS "Solo admin puede eliminar players" ON players;

CREATE POLICY "Permitir insertar players" 
  ON players FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualizar players" 
  ON players FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminar players" 
  ON players FOR DELETE USING (true);

DROP POLICY IF EXISTS "Solo admin puede insertar teams" ON teams;
DROP POLICY IF EXISTS "Solo admin puede actualizar teams" ON teams;
DROP POLICY IF EXISTS "Solo admin puede eliminar teams" ON teams;

CREATE POLICY "Permitir insertar teams" 
  ON teams FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualizar teams" 
  ON teams FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminar teams" 
  ON teams FOR DELETE USING (true);

