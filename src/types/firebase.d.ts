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
    // Example: Custom claims if we implement RBAC at the token level later.
    // role?: 'admin' | 'standard';
  }
}
