import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import SquadBuilderClient from './SquadBuilderClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Squad Builder | Constructor de Plantillas Tácticas',
  description: 'Diseña tu alineación ideal para fútbol 5, 6 y 7 en cancha sintética con valoraciones y químicas de jugadores de Loja.',
};

export default async function SquadBuilderPage() {
  let teams = [];
  let players = [];
  let isAdmin = false;

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: authData } = await supabase.auth.getUser();
    isAdmin = !!authData?.user;

    const teamsRes = await supabase.from('teams').select('*');
    if (teamsRes.data) teams = teamsRes.data;

    const playersRes = await supabase.from('players').select('*, player_teams(team_id)').order('overall_rating', { ascending: false });
    if (playersRes.data) players = playersRes.data;
  } catch (err) {
    console.error("Error fetching squad data from Supabase", err);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-black font-outfit text-center mb-8 text-white drop-shadow-[0_0_15px_rgba(0,229,255,0.6)]">
        Squad Builder
      </h1>
      
      <SquadBuilderClient teams={teams} players={players} isAdmin={isAdmin} />
    </div>
  );
}
