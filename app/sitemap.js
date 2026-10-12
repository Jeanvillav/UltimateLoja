import { createClient } from '@supabase/supabase-js';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ultimate-loja.vercel.app';

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/convocados`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/squad-builder`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/equipos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/jugadores`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sugerir`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terminos`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  let dynamicRoutes = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Teams
      const { data: teams } = await supabase.from('teams').select('id, created_at');
      if (teams) {
        dynamicRoutes.push(
          ...teams.map((t) => ({
            url: `${baseUrl}/equipos/${t.id}`,
            lastModified: t.created_at ? new Date(t.created_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          }))
        );
      }

      // Players
      const { data: players } = await supabase.from('players').select('id, created_at');
      if (players) {
        dynamicRoutes.push(
          ...players.map((p) => ({
            url: `${baseUrl}/players/${p.id}`,
            lastModified: p.created_at ? new Date(p.created_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          }))
        );
      }
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
