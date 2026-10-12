/**
 * Calculates current age from birthdate (YYYY-MM-DD or ISO string).
 * Falls back to fallbackAge if birthdate is not provided or invalid.
 */
export function calculateAge(fechaNacimiento, fallbackAge = null) {
  if (!fechaNacimiento) return fallbackAge !== null ? Number(fallbackAge) : null;
  
  let birthYear, birthMonth, birthDay;
  if (typeof fechaNacimiento === 'string' && fechaNacimiento.includes('-')) {
    const parts = fechaNacimiento.split('T')[0].split('-');
    if (parts.length === 3) {
      birthYear = Number(parts[0]);
      birthMonth = Number(parts[1]) - 1;
      birthDay = Number(parts[2]);
    }
  }

  if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) {
    const fallbackDate = new Date(fechaNacimiento);
    if (isNaN(fallbackDate.getTime())) {
      return fallbackAge !== null ? Number(fallbackAge) : null;
    }
    birthYear = fallbackDate.getFullYear();
    birthMonth = fallbackDate.getMonth();
    birthDay = fallbackDate.getDate();
  }

  const today = new Date();
  let age = today.getFullYear() - birthYear;
  const m = today.getMonth() - birthMonth;
  
  if (m < 0 || (m === 0 && today.getDate() < birthDay)) {
    age--;
  }

  return age >= 0 ? age : fallbackAge;
}

/**
 * Formats a birthdate to a readable string (e.g. "15 de mayo de 2003")
 */
export function formatBirthdate(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  try {
    const [year, month, day] = fechaNacimiento.split('T')[0].split('-');
    if (!year || !month || !day) return null;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return null;
  }
}
