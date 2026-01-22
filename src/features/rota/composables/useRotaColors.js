/**
 * Manages color logic for the Rota view.
 * - Generates consistent, accessible colors for Job Roles based on their ID.
 */
export function useRotaColors() {
  
  // A palette of accessible tones.
  const ROLE_PALETTE = [
    { bg: '#e0f2fe', accent: '#0369a1' }, // Sky Blue
    { bg: '#f3e8ff', accent: '#7e22ce' }, // Purple
    { bg: '#dcfce7', accent: '#15803d' }, // Green
    { bg: '#ffedd5', accent: '#c2410c' }, // Orange
    { bg: '#fae8ff', accent: '#a21caf' }, // Fuchsia
    { bg: '#fef08a', accent: '#854d0e' }, // Yellow
    { bg: '#ffe4e6', accent: '#a03f58' }, // Rose
    { bg: '#e2e8f0', accent: '#334155' }, // Slate
    { bg: '#e0f2fe', accent: '#0369a1' }, // Sky Blue
    { bg: '#ffedd5', accent: '#c2410c' }, // Orange
    { bg: '#fae8ff', accent: '#a21caf' }, // Fuchsia
    { bg: '#fef08a', accent: '#854d0e' }, // Yellow
    { bg: '#ffe4e6', accent: '#a03f58' }, // Rose
    { bg: '#e2e8f0', accent: '#334155' }, // Slate
  ];

  /**
   * Deterministically assigns a color palette to a Role ID.
   * @param {string} roleId 
   * @returns {Object} { bg, accent }
   */
  const getRoleColor = (roleId) => {
    if (!roleId) return ROLE_PALETTE[7]; // Default Slate
    const hash = roleId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return ROLE_PALETTE[hash % ROLE_PALETTE.length];
  };

  return { getRoleColor };
}