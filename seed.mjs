import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  try {
    const filePath = path.join(process.cwd(), 'seed_data.json');
    const fileData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileData);

    console.log(`Found ${data.teams.length} teams to insert...`);
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .insert(data.teams)
      .select();

    if (teamsError) {
      console.error('Error inserting teams:', teamsError);
      return;
    }
    console.log('Successfully inserted teams:', teamsData.length, 'rows.');

    console.log(`Found ${data.players.length} players to insert...`);
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .insert(data.players)
      .select();

    if (playersError) {
      console.error('Error inserting players:', playersError);
    } else {
      console.log('Successfully inserted players:', playersData.length, 'rows.');
    }
  } catch (err) {
    console.error('Failed to seed:', err);
  }
}

seed();
