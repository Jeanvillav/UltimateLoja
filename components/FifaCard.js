import Link from 'next/link';

export default function FifaCard({ player }) {
  // If the player doesn't have an ID, we might just be showing static data.
  // We'll use the name as fallback for the URL.
  const idOrName = player.id || player.nombre;

  // Determine card background based on rating
  let bgClass = "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)"; // Gold
  if (player.overall_rating < 75) {
    bgClass = "linear-gradient(135deg, #94a3b8 0%, #475569 100%)"; // Silver
  }
  if (player.overall_rating < 65) {
    bgClass = "linear-gradient(135deg, #b45309 0%, #78350f 100%)"; // Bronze
  }

  // Get a short position name
  const shortPos = player.posicion.split(' ')[0].substring(0, 3).toUpperCase();

  return (
    <Link href={`/players/${encodeURIComponent(idOrName)}`} className="hover-lift">
      <div className="fifa-card" style={{ background: bgClass }}>
        <div className="fifa-card-header">
          <div className="fifa-rating">{player.overall_rating}</div>
          <div className="fifa-position">{shortPos}</div>
        </div>
        
        {/* Placeholder for player face */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '10px' }}>
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>

        <div className="fifa-name">{player.nombre.split(' ')[0]}</div>

        <div className="fifa-stats-grid">
          <div className="fifa-stat-row">
            <span className="fifa-stat-label">{shortPos === 'POR' ? 'DIV' : 'PAC'}</span>
            <span className="fifa-stat-val">{player.pace}</span>
          </div>
          <div className="fifa-stat-row">
            <span className="fifa-stat-label">{shortPos === 'POR' ? 'REF' : 'DRI'}</span>
            <span className="fifa-stat-val">{player.dribbling}</span>
          </div>
          <div className="fifa-stat-row">
            <span className="fifa-stat-label">{shortPos === 'POR' ? 'HAN' : 'SHO'}</span>
            <span className="fifa-stat-val">{player.shooting}</span>
          </div>
          <div className="fifa-stat-row">
            <span className="fifa-stat-label">{shortPos === 'POR' ? 'SPD' : 'DEF'}</span>
            <span className="fifa-stat-val">{player.defending}</span>
          </div>
          <div className="fifa-stat-row">
            <span className="fifa-stat-label">{shortPos === 'POR' ? 'KIC' : 'PAS'}</span>
            <span className="fifa-stat-val">{player.passing}</span>
          </div>
          <div className="fifa-stat-row">
            <span className="fifa-stat-label">{shortPos === 'POR' ? 'POS' : 'PHY'}</span>
            <span className="fifa-stat-val">{player.physical}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
