import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function calculateOVR(stats, position) {
  if (!stats) return 0;
  
  const pac = Number(stats.pace) || 0;
  const sho = Number(stats.shooting) || 0;
  const pas = Number(stats.passing) || 0;
  const dri = Number(stats.dribbling) || 0;
  const def = Number(stats.defending) || 0;
  const phy = Number(stats.physical) || 0;

  const pos = (position || 'DEL').toUpperCase().substring(0, 3);
  let ovr = 0;

  switch(pos) {
    case 'POR':
    case 'ARQ':
      ovr = (def * 0.55) + (phy * 0.35) + (pas * 0.1);
      break;
    case 'DEF':
      ovr = (def * 0.6) + (phy * 0.3) + (pac * 0.1);
      break;
    case 'MED':
      ovr = (pas * 0.4) + (dri * 0.3) + (def * 0.1) + (sho * 0.1) + (phy * 0.1);
      break;
    case 'DEL':
      ovr = (sho * 0.45) + (pac * 0.25) + (dri * 0.2) + (phy * 0.1);
      break;
    default:
      ovr = (pac + sho + pas + dri + def + phy) / 6;
  }

  return Math.round(ovr);
}

async function run() {
  console.log("Obteniendo jugadores...");
  const { data: players, error } = await supabase.from('players').select('*');
  
  if (error) {
    console.error("Error obteniendo jugadores:", error);
    return;
  }

  console.log(`Se encontraron ${players.length} jugadores. Recalculando...`);

  for (const player of players) {
    const newOvr = calculateOVR(player, player.posicion);
    console.log(`Jugador: ${player.nombre} | OVR Viejo: ${player.overall_rating} -> OVR Nuevo: ${newOvr}`);
    
    if (newOvr !== player.overall_rating) {
        const { error: updateError } = await supabase
        .from('players')
        .update({ overall_rating: newOvr })
        .eq('id', player.id);
        
        if (updateError) {
            console.error(`Error actualizando a ${player.nombre}:`, updateError);
        } else {
            console.log(`✅ Actualizado correctamente.`);
        }
    } else {
        console.log(`➖ Sin cambios.`);
    }
  }
  
  console.log("¡Proceso completado!");
}

run();
