import JugadoresClient from './JugadoresClient';

export const metadata = {
  title: 'Jugadores | Base de Datos y Cartas FC',
  description: 'Conoce y edita a todos los jugadores de tu sala con estadísticas de ritmo, tiro, pase, regate, defensa y físico estilo FIFA 15.',
};

export default function JugadoresPage() {
  return <JugadoresClient />;
}
