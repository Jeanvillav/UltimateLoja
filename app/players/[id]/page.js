import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import RadarChart from '@/components/RadarChart';
import FC26Card from '@/components/FC26Card';
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

    const decodedId = decodeURIComponent(id);
    
    // Check if id is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(decodedId);

    let query = supabase.from('players').select('*');
    if (isUuid) {
      query = query.eq('id', decodedId);
    } else {
      query = query.eq('nombre', decodedId);
    }

    const { data, error } = await query.single();
    if (data) {
      player = data;
    }
  } catch (err) {
    console.error("Error fetching player from Supabase", err);
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
      <Link href="/" className="inline-flex items-center mb-8 text-white hover:text-green-400 transition-colors bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
        <ChevronLeft size={20} className="mr-2" /> Volver
      </Link>
      
      <div className="flex flex-wrap lg:flex-nowrap gap-12 items-start justify-center">
        <div className="flex-shrink-0 flex justify-center sticky top-24">
          <FC26Card player={player} asPreview={true} />
        </div>

        <div className="flex-grow w-full max-w-4xl bg-black/60 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl text-white">
          <div className="mb-8 border-b border-white/10 pb-6">
            <h1 className="text-5xl font-black mb-2 drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{player.nombre}</h1>
            <p className="text-xl text-green-400 font-bold uppercase tracking-widest">{player.posicion} <span className="text-slate-400 mx-2">•</span> <span className="text-yellow-400">{player.edad} años</span></p>
          </div>

            <RadarChart stats={player} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="bg-green-900/20 p-6 rounded-2xl border border-green-500/20">
                <h3 className="text-green-400 font-bold mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span> Fortalezas
                </h3>
                <ul className="space-y-3">
                  {player.fortalezas?.map((f, i) => (
                    <li key={i} className="flex items-start text-slate-200">
                      <span className="text-green-400 font-bold mr-3 mt-1">+</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-red-900/20 p-6 rounded-2xl border border-red-500/20">
                <h3 className="text-red-400 font-bold mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span> Debilidades
                </h3>
                <ul className="space-y-3">
                  {player.debilidades?.map((d, i) => (
                    <li key={i} className="flex items-start text-slate-200">
                      <span className="text-red-400 font-bold mr-3 mt-1">-</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-slate-800/40 p-6 rounded-2xl border border-white/5">
              <h3 className="text-yellow-400 font-bold mb-4 uppercase tracking-wider text-sm">Cualidades Técnicas</h3>
              <div className="flex flex-wrap gap-2">
                {player.cualidades_tecnicas?.map((c, i) => (
                  <span key={i} className="px-4 py-1.5 bg-black/50 border border-slate-600 rounded-full text-sm font-medium text-slate-200">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/5">
                <h3 className="text-blue-400 font-bold mb-3 uppercase tracking-wider text-sm">Perfil Físico</h3>
                <p className="text-slate-300 leading-relaxed text-sm">{player.perfil_fisico}</p>
              </div>

              <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/5">
                <h3 className="text-purple-400 font-bold mb-3 uppercase tracking-wider text-sm">Rol Táctico</h3>
                <p className="text-slate-300 leading-relaxed text-sm">{player.rol_tactico}</p>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
