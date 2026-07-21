import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export default async function Equipos() {
  let teams = [];
  
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data, error } = await supabase.from('teams').select('*').order('name');
    
    if (error) throw error;
    if (data && data.length > 0) {
      teams = data;
    } else {
      throw new Error("No hay equipos en Supabase");
    }
  } catch (err) {
    try {
      const filePath = path.join(process.cwd(), 'seed_data.json');
      const fileData = fs.readFileSync(filePath, 'utf8');
      teams = JSON.parse(fileData).teams || [];
    } catch (e) {
      console.error("Error reading local data", e);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-black font-outfit text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-500">
        Equipos de Loja
      </h1>
      <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto text-lg">
        Selecciona un equipo para ver su plantilla y analizar sus estadísticas.
      </p>

      {teams.length === 0 ? (
        <p className="text-center text-slate-500">No se encontraron equipos.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {teams.map((team) => (
            <Link href={`/equipos/${team.id}`} key={team.id} className="block group">
              <div className="glass-panel p-8 rounded-2xl flex flex-col items-center transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] border-transparent group-hover:border-green-500/30">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={team.logo_url || `https://placehold.co/150x150/111827/22c55e?text=${team.name.charAt(0)}`} 
                  alt={team.name} 
                  className="w-32 h-32 rounded-full mb-6 object-cover shadow-xl group-hover:scale-110 transition-transform"
                />
                <h2 className="text-2xl font-bold font-outfit text-white group-hover:text-green-400 transition-colors">
                  {team.name}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
