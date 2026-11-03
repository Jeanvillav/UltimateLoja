import PlayerEditorClient from '@/app/players/PlayerEditorClient';

export const metadata = {
  title: 'Crear Mi Carta | Ultimate Loja',
  description: 'Crea tu carta personalizada de jugador para tu sala de fútbol sintético.',
};

export default function NuevoJugadorPage() {
  return <PlayerEditorClient isNew={true} />;
}
