'use client';

import { useState, useEffect } from 'react';
import FC26Card from '@/components/FC26Card';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { UserPlus, Search } from 'lucide-react';

export default function JugadoresClient() {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .order('overall_rating', { ascending: false });

        if (!error && data) {
          setPlayers(data);
        }
      } catch (err) {
        console.error('Error al cargar jugadores:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayers();
  }, []);

  const filtered = players.filter((p) => {
    const matchesSearch = p.nombre?.toLowerCase().includes(search.toLowerCase());
    const shortPos = (p.posicion || 'DEL').split(' ')[0].toUpperCase();
    const matchesPos = posFilter === 'ALL' || shortPos === posFilter || (posFilter === 'ARQ' && shortPos === 'POR');
    return matchesSearch && matchesPos;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black font-outfit text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
            Base de Jugadores
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Estadísticas y cartas FC • <span className="text-[var(--color-gold)] font-bold">{players.length} jugadores</span> registrados
          </p>
        </div>

        <Link
          href="/players/nuevo"
          className="px-5 py-2.5 bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)] text-black font-outfit font-black text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-lg hover:scale-105"
        >
          <UserPlus size={16} />
          Crear Mi Carta / Jugador
        </Link>
      </div>

      {/* Buscador y Filtros */}
      <div className="glass-panel p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between border-t-2 border-t-[var(--color-gold)]">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full bg-black/60 border border-gray-700 text-white pl-9 pr-3 py-2 text-xs outline-none focus:border-[var(--color-gold)] uppercase"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {['ALL', 'DEL', 'MED', 'DEF', 'POR'].map((pos) => (
            <button
              key={pos}
              onClick={() => setPosFilter(pos)}
              className={`px-3 py-1.5 text-xs font-outfit font-black uppercase transition cursor-pointer ${
                posFilter === pos
                  ? 'bg-[var(--color-gold)] text-black'
                  : 'bg-black/60 text-gray-300 hover:text-white border border-gray-700'
              }`}
            >
              {pos === 'ALL' ? 'Todos' : pos}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 font-outfit uppercase tracking-widest text-sm animate-pulse">
          Cargando cartas de jugadores...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 glass-panel border border-white/10 p-8 max-w-md mx-auto">
          <p className="text-gray-300 mb-4 font-bold">No se encontraron jugadores.</p>
          <Link
            href="/players/nuevo"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-gold)] text-black font-black font-outfit text-xs uppercase"
          >
            <UserPlus size={16} />
            Crear Carta de Jugador
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-items-center">
          {filtered.map((player) => (
            <FC26Card key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}
