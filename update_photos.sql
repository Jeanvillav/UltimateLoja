UPDATE players 
SET foto_url = 'https://lkihfwaxvvworwnuyppw.supabase.co/storage/v1/object/public/photos/admin_uploads/Jean_1784605571998.jpeg' 
WHERE nombre = 'Jean';

UPDATE players 
SET foto_url = 'https://lkihfwaxvvworwnuyppw.supabase.co/storage/v1/object/public/photos/admin_uploads/Choclo_1784605573463.jpeg' 
WHERE nombre ILIKE '%Choclo%';
