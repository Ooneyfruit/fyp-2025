/**
 * Rota domain models.
 * Defines the structure for shifts, surgeries, and professional roles.
 */

import { type DocumentReference, type Timestamp } from 'firebase/firestore';
import { z } from 'zod';

// --- Validation Schemas ---

/**
 * Runtime schema for a professional role (e.g., "Dentist", "Hygienist").
 */
export const PracticeRoleSchema = z.object({
  id: z.string(),
  name: z.string()
});

/**
 * Runtime schema for a surgery room (e.g., "Surgery 1").
 */
export const PracticeSurgerySchema = z.object({
  id: z.string(),
  name: z.string()
});

/**
 * Runtime schema for a Shift document.
 * Includes loose validation for Firestore references to prevent runtime crashes.
 */
export const ShiftSchema = z.object({
  id: z.string(),
  date: z.custom<Timestamp>((val) => typeof val === 'object' && val !== null),
  role_id: z.custom<DocumentReference>().optional(),
  surgery_id: z.custom<DocumentReference>().optional(),
  user_id: z.string().optional(),
  // Denormalised fields for UI performance
  user_name: z.string().optional(),
  role_name: z.string().optional(),
  surgery_name: z.string().optional(),
  // Status flags
  is_resolved: z.boolean().default(false),
  roster_status: z.enum(['draft', 'published', 'archived']).default('draft')
});

// --- Type Definitions ---

export type PracticeRole = z.infer<typeof PracticeRoleSchema>;
export type PracticeSurgery = z.infer<typeof PracticeSurgerySchema>;

/**
 * The Shift model as it exists in the application state.
 */
export type Shift = z.infer<typeof ShiftSchema>;

/**
 * The Data Transfer Object (DTO) for creating or updating a shift.
 * Allows 'date' to be a string or Date object before conversion to Timestamp.
 */
export interface ShiftInput {
  date: string | Date | Timestamp;
  role_id?: DocumentReference;
  surgery_id?: DocumentReference;
  user_id?: string;
  user_name?: string;
  role_name?: string;
  surgery_name?: string;
}
