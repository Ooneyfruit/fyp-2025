/**
 * Navigation domain models.
 * Defines the structure for the application's routing and menu systems.
 */

import { type RouteLocationRaw } from 'vue-router';

import { type Nullable } from '@/types/generic';

/**
 * Represents a single item in the side or top navigation menu.
 */
export interface NavItem {
  label: string;
  to: RouteLocationRaw;
  icon?: string;
  requiresAdmin?: boolean;
  requiredRole?: string;
  children?: NavItem[];
}

/**
 * Represents the context of the active practice shown in the navbar.
 */
export interface ActivePracticeContext {
  id: string;
  name: string;
  logoUrl: Nullable<string>;
}

/**
 * Lightweight practice details used in the context switcher.
 */
export interface PracticeSummary {
  id: string;
  name: string;
  [key: string]: unknown; // Allow for other Firestore fields
}
