export const DEFAULT_PLAYER_PHOTO = '/silueta_vacia.jpg';

/**
 * Returns the player's photo URL or the default silhouette if not provided or placeholder.
 */
export function getPlayerPhoto(fotoUrl) {
  if (!fotoUrl || typeof fotoUrl !== 'string') {
    return DEFAULT_PLAYER_PHOTO;
  }
  const trimmed = fotoUrl.trim();
  if (!trimmed || trimmed.includes('placehold.co')) {
    return DEFAULT_PLAYER_PHOTO;
  }
  return trimmed;
}
