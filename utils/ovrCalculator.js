export function calculateOVR(stats, position) {
  if (!stats) return 0;
  
  const pac = Number(stats.pace) || Number(stats.ritmo) || 0;
  const sho = Number(stats.shooting) || Number(stats.tiro) || 0;
  const pas = Number(stats.passing) || Number(stats.pase) || 0;
  const dri = Number(stats.dribbling) || Number(stats.regate) || 0;
  const def = Number(stats.defending) || Number(stats.defensa) || 0;
  const phy = Number(stats.physical) || Number(stats.fisico) || 0;

  const pos = (position || 'DEL').toUpperCase().substring(0, 3);
  let ovr = 0;

  switch(pos) {
    case 'POR':
    case 'ARQ':
      // pace -> DIV, dribbling -> REF, shooting -> HAN, defending -> SPD, passing -> KIC, physical -> POS
      const div = pac; // Diving
      const han = sho; // Handling
      const kic = pas; // Kicking
      const ref = dri; // Reflexes
      const spd = def; // Speed
      const gkPos = phy; // Positioning
      ovr = (div * 0.21) + (han * 0.21) + (kic * 0.05) + (ref * 0.21) + (spd * 0.11) + (gkPos * 0.21);
      break;
    case 'DEF':
      // Defensa y Físico son los más importantes, Tiro importa poco
      ovr = (def * 0.35) + (phy * 0.20) + (pac * 0.15) + (pas * 0.15) + (dri * 0.10) + (sho * 0.05);
      break;
    case 'MED':
      // Pase y Regate son clave, equilibrado en lo demás
      ovr = (pas * 0.30) + (dri * 0.25) + (pac * 0.15) + (phy * 0.15) + (sho * 0.10) + (def * 0.05);
      break;
    case 'DEL':
      // Tiro y Ritmo importan mucho, Defensa no importa
      ovr = (sho * 0.35) + (pac * 0.25) + (dri * 0.20) + (phy * 0.10) + (pas * 0.10) + (def * 0.0);
      break;
    default:
      ovr = (pac + sho + pas + dri + def + phy) / 6;
  }

  return Math.round(ovr);
}

export function getDynamicRating(player, pitchPosName) {
  if (!player || !pitchPosName) return 0;
  return calculateOVR(player, pitchPosName);
}
