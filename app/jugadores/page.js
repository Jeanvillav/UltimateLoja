import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import FC26Card from '@/components/FC26Card';

export const dynamic = 'force-dynamic';

export default async function JugadoresPage() {
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
    console.error("Error al obtener jugadores globales", err);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl md:text-5xl font-black font-outfit text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-500">
        Base de Datos de Jugadores
      </h1>
      <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto text-lg">
        Explora la lista global de todos los jugadores de las canchas sintéticas de Loja.
      </p>

      {players.length === 0 ? (
        <p className="text-center text-slate-500">No se encontraron jugadores en la base de datos.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-items-center">
          {players.map((player) => (
            <FC26Card key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}
