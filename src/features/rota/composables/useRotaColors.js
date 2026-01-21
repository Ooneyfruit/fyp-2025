import { computed } from 'vue';

/**
 * Manages color logic for the Rota view.
 * - Generates consistent, accessible colors for Job Roles based on their ID.
 * - Determines background classes for calendar columns (Weekdays vs Weekends).
 */
export function useRotaColors() {
  
  // A palette of accessible tones.
  // Each has a 'bg' (light/faint for pill background) and 'accent' (darker for initials/border).
  // Colors chosen to be distinct but readable.
  const ROLE_PALETTE = [
    { bg: '#e0f2fe', accent: '#0369a1' }, // Sky Blue
    { bg: '#f3e8ff', accent: '#7e22ce' }, // Purple
    { bg: '#dcfce7', accent: '#15803d' }, // Green
    { bg: '#ffedd5', accent: '#c2410c' }, // Orange
    { bg: '#fae8ff', accent: '#a21caf' }, // Fuchsia
    { bg: '#fef08a', accent: '#854d0e' }, // Yellow (Darker accent for readability)
    { bg: '#ffe4e6', accent: '#a03f58' }, // Rose
    { bg: '#e2e8f0', accent: '#334155' }, // Slate
  ];

  /**
   * Deterministically assigns a color palette to a Role ID.
   * Handles collisions by cycling through the palette.
   * @param {string} roleId 
   * @returns {Object} { bg, accent }
   */
  const getRoleColor = (roleId) => {
    if (!roleId) return ROLE_PALETTE[7]; // Default Slate
    // Simple hash: sum char codes % palette length
    const hash = roleId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return ROLE_PALETTE[hash % ROLE_PALETTE.length];
  };

  /**
   * Returns specific classes for the Day columns to create the "Striped" aesthetic.
   * Logic: 
   * - Tue (2) & Thu (4): Alternating Grey
   * - Sat (6) & Sun (0): Weekend Grey
   */
  const getColumnClass = (dateIso) => {
    const day = new Date(dateIso).getDay();
    if (day === 0 || day === 6) return 'col-weekend';
    if (day === 2 || day === 4) return 'col-alt-weekday';
    return ''; // Mon, Wed, Fri stay white/default
  };

  return { getRoleColor, getColumnClass };
}