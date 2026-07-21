import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Obteniendo jugadores...");
  const { data: players, error } = await supabase.from('players').select('id, nombre, foto_url');
  
  if (error) {
    console.error("Error obteniendo jugadores:", error);
    return;
  }

  for (const player of players) {
    if (player.foto_url && player.foto_url.includes('admin_uploads/')) {
        const oldUrl = player.foto_url;
        const newUrl = oldUrl.replace('admin_uploads/', 'players/');
        
        const oldPath = oldUrl.split('public/photos/')[1];
        const newPath = newUrl.split('public/photos/')[1];

        console.log(`Moviendo ${oldPath} a ${newPath}...`);
        
        // Move file in storage
        const { error: moveError } = await supabase.storage
            .from('photos')
            .move(oldPath, newPath);
            
        if (moveError && moveError.message !== 'The resource already exists') {
            console.error(`Error moviendo archivo de ${player.nombre}:`, moveError);
            continue;
        }

        // Update database
        const { error: updateError } = await supabase
            .from('players')
            .update({ foto_url: newUrl })
            .eq('id', player.id);
            
        if (updateError) {
            console.error(`Error actualizando URL en DB para ${player.nombre}:`, updateError);
        } else {
            console.log(`✅ ${player.nombre} actualizado correctamente.`);
        }
    }
  }
  
  console.log("¡Proceso completado!");
}

run();
