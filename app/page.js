import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import FifaCard from '@/components/FifaCard';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let players = [];
  
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data, error } = await supabase.from('players').select('*').order('overall_rating', { ascending: false });
    
    if (error) {
      console.warn("Error leyendo de Supabase. Usando datos locales.", error.message);
      throw error;
    }
    
    if (data && data.length > 0) {
      players = data;
    } else {
      throw new Error("No hay datos en Supabase");
    }
  } catch (err) {
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
