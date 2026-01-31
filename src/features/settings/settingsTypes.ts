/**
 * Settings domain models.
 * Defines the structure for practice configuration data including surgeries and roles.
 */

import { type Timestamp } from 'firebase/firestore';

/**
 * Represents a professional role within the practice configuration.
 */
export interface PracticeRoleConfig {
  id: string;
  name: string;
  type: string;
  icon_url?: string;
}

/**
 * Represents a surgery definition including its operating hours.
 */
export interface SurgeryConfig {
  id: string;
  name: string;
  days_of_operation: string[];
  start_time: Timestamp;
  end_time: Timestamp;
}

/**
 * Defines the minimum staffing requirement for a specific role in a specific surgery.
 */
export interface MinimumStaffConfig {
  id: string;
  surgery_id: unknown; // loose typing to handle reference vs string during fetch
  role_id: unknown;
  staff_count: number;
}

/**
 * Aggregated details for the practice settings view.
 */
export interface PracticeDetails {
  name: string;
  address: string;
}
