/**
 * Domain models and validation schemas for the Rota feature.
 * Defines the structure for roles, surgeries, and shifts.
 */

import { type DocumentReference, type Timestamp } from 'firebase/firestore';
import { z } from 'zod';

// --- Domain Interfaces ---

export interface PracticeRole {
  id: string;
  name: string;
  color_index?: number;
  icon_id?: string;
  is_deleted?: boolean;
}

export interface PracticeSurgery {
  id: string;
  name: string;
  is_deleted?: boolean;
}

export interface Shift {
  id: string;
  date: string | Timestamp | Date;
  role_id: DocumentReference;
  surgery_id: DocumentReference;
  staff_member_id?: DocumentReference;
  // Denormalized fields for UI/Performance
  user_id?: string;
  user_name?: string;
  notes?: string;
  start_time?: string;
  end_time?: string;
  is_resolved: boolean;
  roster_status: 'draft' | 'published';
}

export interface ShiftInput {
  date: string | Date;
  role_id: DocumentReference;
  surgery_id: DocumentReference;
  staff_member_id?: DocumentReference;
  // Denormalized fields
  user_id?: string;
  user_name?: string;
  role_name?: string;
  surgery_name?: string;
  notes?: string;
  start_time?: string;
  end_time?: string;
}

// --- Validation Schemas ---

export const PracticeRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  color_index: z.number().optional(),
  icon_id: z.string().optional(),
  is_deleted: z.boolean().optional()
});

export const PracticeSurgerySchema = z.object({
  id: z.string(),
  name: z.string(),
  is_deleted: z.boolean().optional()
});

export const ShiftSchema = z.object({
  id: z.string(),
  date: z.union([z.string(), z.date(), z.custom<Timestamp>()]),
  role_id: z.custom<DocumentReference>(),
  surgery_id: z.custom<DocumentReference>(),
  is_resolved: z.boolean()
});
