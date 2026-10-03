import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import ConvocadosClient from './ConvocadosClient';

export const dynamic = 'force-dynamic';

export default async function ConvocadosPage() {
  let players = [];
  
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    // Traer todos los jugadores ordenados por valoración
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('overall_rating', { ascending: false });
    
    if (error) throw error;
    if (data) players = data;
  } catch (err) {
    console.error("Error al obtener jugadores para convocados", err);
  }

  return (
    <div className="container mx-auto px-4 py-8 relative min-h-screen">
      <h1 className="text-4xl md:text-5xl font-black font-outfit text-center mb-4 text-white drop-shadow-[0_0_15px_rgba(0,229,255,0.6)]">
        Convocatoria del Partido
      </h1>
      <p className="text-center text-slate-400 mb-8 max-w-2xl mx-auto text-lg">
        Selecciona entre 5 y 14 jugadores para armar la lista de convocados del partido de hoy.
      </p>

      <ConvocadosClient initialPlayers={players} />
    </div>
  );
}
