/**
 * Navigation domain models.
 * Defines the structure for the application's routing and menu systems.
 */

import { type Component } from 'vue';

/**
 * Represents a single item in the side or top navigation menu.
 */
export interface NavItem {
  label: string;
  to: string;
  icon?: Component;
  requiresAdmin?: boolean;
}

/**
 * Lightweight practice details used in the context switcher.
 */
export interface PracticeSummary {
  id: string;
  name: string;
  [key: string]: unknown; // Allow for other Firestore fields.
}
