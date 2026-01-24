/**
 * Navbar feature public API.
 * Orchestrates the primary application navigation and contextual actions.
 */

export { default as NavBar } from './components/NavBar.vue';
export { useNavigation } from './composables/useNavigation';
export type { NavItem } from './navTypes';
