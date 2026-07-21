import { supabase } from '@/utils/supabase/client';
import FifaCard from '@/components/FifaCard';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering to avoid build-time Supabase errors if env vars are missing
export const dynamic = 'force-dynamic';

export default async function Home() {
  let players = [];
  
  try {
    const { data, error } = await supabase.from('players').select('*').order('overall_rating', { ascending: false });
    
    if (error) {
      console.warn("Supabase no configurado o tabla no existe. Usando datos locales.", error.message);
      throw error;
    }
    
    if (data && data.length > 0) {
      players = data;
    } else {
      throw new Error("No hay datos en Supabase");
    }
  } catch (err) {
    // Fallback to local JSON if Supabase is not set up
    try {
      const filePath = path.join(process.cwd(), 'seed_data.json');
      const fileData = fs.readFileSync(filePath, 'utf8');
      players = JSON.parse(fileData);
    } catch (e) {
      console.error("Error reading local data", e);
    }
  }

  return (
    <div>
      <h1 className="page-title text-gradient">Futbol Stats</h1>
      <p style={{textAlign: 'center', marginBottom: '3rem', color: 'var(--text-secondary)'}}>
        Las estadísticas y valoraciones de los jugadores de tu equipo en un formato premium.
      </p>

      {players.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p>No hay jugadores registrados.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {players.map((p, idx) => (
            <FifaCard key={p.id || idx} player={p} />
          ))}
        </div>
      )}
    </div>
  );
}
