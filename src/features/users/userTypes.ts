/**
 * User domain models.
 * Defines the structure of user profiles, memberships, and roles.
 */

import { type DocumentReference, type Timestamp } from 'firebase/firestore';
import { z } from 'zod';

// --- Validation Schemas ---

/**
 * Runtime schema for the User Profile.
 * Ensures data integrity when reading from the 'users' collection.
 */
export const UserProfileSchema = z.object({
  uid: z.string(),
  email: z.email({ message: 'Invalid email format' }),
  profile_image: z.url({ message: 'Invalid URL format' }).optional(),
  activePracticeName: z.string().default('Unknown Practice'),
  is_administrator: z.boolean().default(false),
  practiceRef: z.custom<DocumentReference>().optional(),
  last_sync: z.string().optional(),
  role: z.string().optional(),
  name: z.string().optional(),
  id: z.string().optional()
});

// --- Type Definitions ---

export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * Common date type for Firestore timestamps or JS dates.
 */
export type FirestoreDate = Timestamp | { seconds: number } | string | number | null | undefined;

/**
 * Represents a user's membership within a specific practice.
 * Updated to match the actual Firestore 'practice_users' document structure.
 */
export interface PracticeMembership {
  id: string;
  user: DocumentReference;
  practice: DocumentReference;
  role: string;
  status?: 'active' | 'invited' | 'suspended'; // Added to fix TS error in RotaShiftModal
  start_date: FirestoreDate;
  end_date?: FirestoreDate;
  is_administrator?: boolean;
  is_employee?: boolean;
}

/**
 * Represents a user row in the administration data table.
 */
export interface PracticeUser extends UserProfile {
  role: string;
  status: 'active' | 'invited' | 'suspended';
  is_employee?: boolean;
  start_date?: FirestoreDate;
  end_date?: FirestoreDate;
}
