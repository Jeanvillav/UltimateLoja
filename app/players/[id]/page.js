import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import RadarChart from '@/components/RadarChart';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export default async function PlayerPage({ params }) {
  const { id } = await params;
  let player = null;

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.from('players').select('*').eq('id', id).single();
    if (data) {
      player = data;
    } else {
      throw new Error("No encontrado en DB");
    }
  } catch (err) {
    try {
      const filePath = path.join(process.cwd(), 'seed_data.json');
      const fileData = fs.readFileSync(filePath, 'utf8');
      const players = JSON.parse(fileData);
      
      const decodedId = decodeURIComponent(id);
      player = players.find(p => p.id === decodedId || p.nombre === decodedId);
    } catch (e) {
      console.error(e);
    }
  }

  if (!player) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Jugador no encontrado</h2>
        <Link href="/" className="btn" style={{ marginTop: '1rem' }}>Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
        <ChevronLeft size={20} /> Volver
      </Link>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
        <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center' }}>
          <div className="fifa-card" style={{ 
            background: player.overall_rating >= 75 ? "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)" : 
                        player.overall_rating >= 65 ? "linear-gradient(135deg, #94a3b8 0%, #475569 100%)" : 
                        "linear-gradient(135deg, #b45309 0%, #78350f 100%)",
            transform: 'scale(1.2)', 
            transformOrigin: 'top center',
            marginBottom: '4rem'
          }}>
            <div className="fifa-card-header">
              <div className="fifa-rating">{player.overall_rating}</div>
              <div className="fifa-position">{player.posicion.split(' ')[0].substring(0, 3).toUpperCase()}</div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '10px' }}>
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="fifa-name">{player.nombre}</div>
            <div className="fifa-stats-grid">
              <div className="fifa-stat-row"><span className="fifa-stat-label">PAC</span><span className="fifa-stat-val">{player.pace}</span></div>
              <div className="fifa-stat-row"><span className="fifa-stat-label">DRI</span><span className="fifa-stat-val">{player.dribbling}</span></div>
              <div className="fifa-stat-row"><span className="fifa-stat-label">SHO</span><span className="fifa-stat-val">{player.shooting}</span></div>
              <div className="fifa-stat-row"><span className="fifa-stat-label">DEF</span><span className="fifa-stat-val">{player.defending}</span></div>
              <div className="fifa-stat-row"><span className="fifa-stat-label">PAS</span><span className="fifa-stat-val">{player.passing}</span></div>
              <div className="fifa-stat-row"><span className="fifa-stat-label">PHY</span><span className="fifa-stat-val">{player.physical}</span></div>
            </div>
          </div>
        </div>

        <div style={{ flex: '2 1 500px' }} className="glass">
          <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{player.nombre}</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>{player.posicion} • {player.edad} años</p>

            <RadarChart stats={player} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
              <div>
                <h3 style={{ color: 'var(--green)', marginBottom: '1rem' }}>Fortalezas</h3>
                <ul style={{ listStyle: 'none' }}>
                  {player.fortalezas?.map((f, i) => (
                    <li key={i} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--green)', marginRight: '0.5rem' }}>+</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 style={{ color: 'var(--red)', marginBottom: '1rem' }}>Debilidades</h3>
                <ul style={{ listStyle: 'none' }}>
                  {player.debilidades?.map((d, i) => (
                    <li key={i} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--red)', marginRight: '0.5rem' }}>-</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Cualidades Técnicas</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {player.cualidades_tecnicas?.map((c, i) => (
                  <span key={i} style={{ padding: '0.25rem 0.75rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '999px', fontSize: '0.9rem' }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Perfil Físico</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{player.perfil_fisico}</p>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Rol Táctico</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{player.rol_tactico}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
