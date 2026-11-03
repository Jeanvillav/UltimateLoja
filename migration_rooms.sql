-- =========================================================================
-- MIGRACIÓN SUPABASE: SISTEMA DE SALAS (ROOMS) CON REGLAS Y EXPIRACIÓN
-- =========================================================================

-- 1. Crear tabla de salas (rooms)
CREATE TABLE IF NOT EXISTS rooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code varchar(8) UNIQUE NOT NULL,      -- Solo letras mayúsculas, máx 8 caracteres (ej: 'LOJA')
  name text NOT NULL,                   -- Nombre de la sala o pichanga
  admin_pin varchar(4) NOT NULL,        -- Contraseña ligera de 4 dígitos numéricos
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_active_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Validaciones de integridad:
  CONSTRAINT valid_room_code CHECK (code ~ '^[A-Z]{2,8}$'),
  CONSTRAINT valid_admin_pin CHECK (admin_pin ~ '^[0-9]{4}$')
);

CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_last_active ON rooms(last_active_at);

-- Habilitar RLS en rooms
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura publica de salas"
  ON rooms FOR SELECT USING (true);

CREATE POLICY "Permitir crear salas a cualquiera"
  ON rooms FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualizar salas"
  ON rooms FOR UPDATE USING (true);

-- 2. Insertar sala base "LOJA" (la tuya actual) si no existe
INSERT INTO rooms (code, name, admin_pin)
VALUES ('LOJA', 'Canchas Sintéticas de Loja', '1234')
ON CONFLICT (code) DO NOTHING;

-- 3. Vincular teams y players con room_id
ALTER TABLE teams 
  ADD COLUMN IF NOT EXISTS room_id uuid REFERENCES rooms(id) ON DELETE CASCADE;

-- Cada jugador puede tener un PIN opcional personal de 4 dígitos para editar su propia carta
ALTER TABLE players 
  ADD COLUMN IF NOT EXISTS room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS edit_pin varchar(4);

CREATE INDEX IF NOT EXISTS idx_teams_room_id ON teams(room_id);
CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id);

-- 4. Migrar datos existentes a la sala LOJA
DO $$
DECLARE
  v_loja_room_id uuid;
BEGIN
  SELECT id INTO v_loja_room_id FROM rooms WHERE code = 'LOJA' LIMIT 1;
  
  IF v_loja_room_id IS NOT NULL THEN
    UPDATE teams SET room_id = v_loja_room_id WHERE room_id IS NULL;
    UPDATE players SET room_id = v_loja_room_id WHERE room_id IS NULL;
  END IF;
END $$;

-- 5. Función para purgar salas inactivas por más de 6 meses (protegiendo siempre a 'LOJA')
CREATE OR REPLACE FUNCTION purge_inactive_rooms()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Eliminar salas inactivas en los últimos 6 meses (excepto LOJA)
  -- Gracias a ON DELETE CASCADE, esto borra automáticamente sus teams y players
  DELETE FROM rooms
  WHERE code != 'LOJA'
    AND last_active_at < (now() - INTERVAL '6 months');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para actualizar last_active_at cada vez que se modifique o toque la sala
CREATE OR REPLACE FUNCTION update_room_activity()
RETURNS trigger AS $$
BEGIN
  UPDATE rooms 
  SET last_active_at = timezone('utc'::text, now())
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_room_activity_players ON players;
CREATE TRIGGER trg_update_room_activity_players
AFTER INSERT OR UPDATE ON players
FOR EACH ROW
WHEN (NEW.room_id IS NOT NULL)
EXECUTE FUNCTION update_room_activity();

-- 7. Políticas permisivas para inserción/edición pública por sala
DROP POLICY IF EXISTS "Permitir lectura a todos en players" ON players;
DROP POLICY IF EXISTS "Solo admin puede insertar players" ON players;
DROP POLICY IF EXISTS "Solo admin puede actualizar players" ON players;
DROP POLICY IF EXISTS "Solo admin puede eliminar players" ON players;

CREATE POLICY "Permitir lectura players" ON players FOR SELECT USING (true);
CREATE POLICY "Permitir insertar players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizar players" ON players FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminar players" ON players FOR DELETE USING (true);

DROP POLICY IF EXISTS "Permitir lectura a todos en teams" ON teams;
DROP POLICY IF EXISTS "Solo admin puede insertar teams" ON teams;
DROP POLICY IF EXISTS "Solo admin puede actualizar teams" ON teams;
DROP POLICY IF EXISTS "Solo admin puede eliminar teams" ON teams;

CREATE POLICY "Permitir lectura teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Permitir insertar teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizar teams" ON teams FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminar teams" ON teams FOR DELETE USING (true);
