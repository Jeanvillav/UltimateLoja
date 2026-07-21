export function calculateOVR(stats, position) {
  if (!stats) return 0;
  
  const pac = Number(stats.ritmo) || 0;
  const sho = Number(stats.tiro) || 0;
  const pas = Number(stats.pase) || 0;
  const dri = Number(stats.regate) || 0;
  const def = Number(stats.defensa) || 0;
  const phy = Number(stats.fisico) || 0;

  const pos = (position || 'DEL').toUpperCase().substring(0, 3);
  let ovr = 0;

  switch(pos) {
    case 'POR':
    case 'ARQ':
      // GKs usually have specific stats, but we use what we have
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
