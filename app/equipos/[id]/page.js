import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import FC26Card from '@/components/FC26Card';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export default async function EquipoPage({ params }) {
  const { id } = await params;
  let team = null;
  let players = [];

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const teamRes = await supabase.from('teams').select('*').eq('id', id).single();
    if (teamRes.data) team = teamRes.data;

    const playersRes = await supabase.from('players').select('*').eq('team_id', id).order('overall_rating', { ascending: false });
    if (playersRes.data) players = playersRes.data;
  } catch (err) {
    console.error("Error fetching team/players from Supabase", err);
  }

  if (!team) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl text-slate-300">Equipo no encontrado</h2>
        <Link href="/equipos" className="mt-4 inline-block px-6 py-2 bg-slate-800 rounded-lg hover:bg-slate-700">Volver a Equipos</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/equipos" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
        <ChevronLeft size={20} className="mr-1" /> Volver a Equipos
      </Link>

      <div className="flex flex-col md:flex-row items-center gap-6 mb-12 glass-panel p-6 rounded-2xl">
         {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={team.logo_url || `https://placehold.co/150x150/111827/22c55e?text=${team.name.charAt(0)}`} 
          alt={team.name} 
          className="w-24 h-24 rounded-full object-cover shadow-lg"
        />
        <div>
          <h1 className="text-4xl font-black font-outfit text-white">{team.name}</h1>
          <p className="text-slate-400 mt-2">{players.length} jugadores en la plantilla</p>
        </div>
        
        <div className="md:ml-auto mt-4 md:mt-0">
          <Link href={`/squad-builder?base=${team.id}`} className="px-6 py-3 btn-fifa w-full font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            Usar como Base en Squad Builder
          </Link>
        </div>
      </div>

      {players.length === 0 ? (
        <p className="text-center text-slate-500 text-lg">No hay jugadores registrados en este equipo.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
          {players.map((player) => (
            <FC26Card key={player.id || player.nombre} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}
