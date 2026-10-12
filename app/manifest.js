export default function manifest() {
  return {
    name: 'Ultimate Loja | Fútbol Sintética & Stats',
    short_name: 'Ultimate Loja',
    description: 'Arma tu equipo ideal, analiza estadísticas y organiza partidos en canchas sintéticas de Loja.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#22c55e',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
