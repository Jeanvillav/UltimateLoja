import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import SquadBuilderClient from './SquadBuilderClient';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export default async function SquadBuilderPage() {
  let teams = [];
  let players = [];

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const teamsRes = await supabase.from('teams').select('*');
    if (teamsRes.data) teams = teamsRes.data;

    const playersRes = await supabase.from('players').select('*').order('overall_rating', { ascending: false });
    if (playersRes.data) players = playersRes.data;
  } catch (err) {
    console.error("Error fetching squad data from Supabase", err);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-black font-outfit text-center mb-8 text-white drop-shadow-[0_0_15px_rgba(0,229,255,0.6)]">
        Squad Builder
      </h1>
      
      <SquadBuilderClient teams={teams} players={players} />
    </div>
  );
}
