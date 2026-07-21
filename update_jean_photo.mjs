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

async function uploadPhoto(playerName, filename) {
  try {
    const filePath = path.join(process.cwd(), filename);
    if (!fs.existsSync(filePath)) {
      console.log(`Archivo no encontrado para ${playerName}: ${filename}`);
      return;
    }
    
    const fileBuffer = fs.readFileSync(filePath);
    const uniqueFileName = `admin_uploads/${playerName}_${Date.now()}.jpeg`;
    
    console.log(`Subiendo foto para ${playerName}...`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(uniqueFileName, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.error(`Upload Error para ${playerName}:`, uploadError.message);
      return;
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(uniqueFileName);
    console.log(`URL pública para ${playerName}:`, publicUrl);

    // Buscamos al jugador por nombre y lo actualizamos (Usamos ilike por si hay mayúsculas diferentes)
    console.log(`Actualizando la base de datos para ${playerName}...`);
    const { data: updateData, error: updateError } = await supabase
      .from('players')
      .update({ foto_url: publicUrl })
      .ilike('nombre', `%${playerName}%`)
      .select();

    if (updateError) {
      console.error(`Update Error para ${playerName}:`, updateError);
    } else {
      console.log(`¡Jugador ${playerName} actualizado con éxito!`, updateData.length > 0 ? 'OK' : 'No encontrado en DB');
    }
  } catch (err) {
    console.error(`Script Failed para ${playerName}:`, err);
  }
}

async function run() {
  await uploadPhoto('Jean', 'Jean.jpeg');
  await uploadPhoto('Choclo', 'SebastianChocloMendieta.jpeg'); // Asumo que "Sebastian" es "Choclo" según la DB original
}

run();
