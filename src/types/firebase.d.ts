/**
 * Firebase type definitions and overrides.
 * Extensions to the official SDK types for RotaDent-specific contexts.
 */

import { type User as FirebaseUser } from 'firebase/auth';

declare module 'firebase/auth' {
  /**
   * Extends the standard Firebase User with custom claims used in RotaDent.
   * This helps when accessing idTokenResult.claims.
   */
  interface User extends FirebaseUser {
    /**
     * Custom role parameter for role-based access control.
     * Logic: allows distinguishing between admins and standard users at the token level.
     */
    role?: 'admin' | 'standard';
  }
}
