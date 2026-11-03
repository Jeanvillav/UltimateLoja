import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import PlayerEditorClient from '@/app/players/PlayerEditorClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: `Editar Carta | Ultimate Loja`,
  };
}

export default async function EditarJugadorPage({ params }) {
  const { id } = await params;
  let player = null;

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data } = await supabase.from('players').select('*').eq('id', id).single();
    player = data;
  } catch (err) {
    console.error('Error cargando jugador a editar:', err);
  }

  if (!player) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-outfit uppercase font-bold text-white mb-4">Jugador no encontrado</h2>
        <Link href="/jugadores" className="px-5 py-2.5 bg-[var(--color-gold)] text-black font-bold uppercase text-xs">
          Volver a Jugadores
        </Link>
      </div>
    );
  }

  return <PlayerEditorClient initialPlayer={player} isNew={false} />;
}
