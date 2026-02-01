/**
 * Registry of available role icons.
 * Maps unique identifiers to their corresponding SVG components.
 */

import { type Component, markRaw } from 'vue';

import IconClose from '@/components/icons/IconClose.vue';
import IconRoleBadge from '@/components/icons/roles/IconRoleBadge.vue';
import IconRoleBriefcase from '@/components/icons/roles/IconRoleBriefcase.vue';
import IconRoleClipboard from '@/components/icons/roles/IconRoleClipboard.vue';
import IconRoleDenture from '@/components/icons/roles/IconRoleDenture.vue';
import IconRoleDrill from '@/components/icons/roles/IconRoleDrill.vue';
import IconRoleHands from '@/components/icons/roles/IconRoleHands.vue';
import IconRoleHeadset from '@/components/icons/roles/IconRoleHeadset.vue';
import IconRoleMask from '@/components/icons/roles/IconRoleMask.vue';
import IconRoleMirror from '@/components/icons/roles/IconRoleMirror.vue';
import IconRoleNurseHeadband from '@/components/icons/roles/IconRoleNurseHeadband.vue';
import IconRolePen from '@/components/icons/roles/IconRolePen.vue';
import IconRoleScaler from '@/components/icons/roles/IconRoleScaler.vue';
import IconRoleSyringe from '@/components/icons/roles/IconRoleSyringe.vue';
import IconRoleTelephone from '@/components/icons/roles/IconRoleTelephone.vue';
import IconRoleTooth from '@/components/icons/roles/IconRoleTooth.vue';
import IconRoleToothbrush from '@/components/icons/roles/IconRoleToothbrush.vue';

/**
 * Interface for icon registry items.
 * Internal only as it is not consumed by other modules.
 */
interface RoleIconItem {
  id: string | null;
  component: Component;
  label: string;
}

/**
 * List of icons available for assignment to practice roles.
 * Includes a null option for 'No Icon'.
 */
export const ROLE_ICONS: RoleIconItem[] = [
  { id: null, component: markRaw(IconClose), label: 'No Icon' },
  { id: 'toothbrush', component: markRaw(IconRoleToothbrush), label: 'Toothbrush' },
  { id: 'nurse-headband', component: markRaw(IconRoleNurseHeadband), label: 'Nurse' },
  { id: 'tooth', component: markRaw(IconRoleTooth), label: 'Tooth' },
  { id: 'telephone', component: markRaw(IconRoleTelephone), label: 'Telephone' },
  { id: 'clipboard', component: markRaw(IconRoleClipboard), label: 'Clipboard' },
  { id: 'mirror', component: markRaw(IconRoleMirror), label: 'Mirror' },
  { id: 'syringe', component: markRaw(IconRoleSyringe), label: 'Syringe' },
  { id: 'pen', component: markRaw(IconRolePen), label: 'Pen' },
  { id: 'drill', component: markRaw(IconRoleDrill), label: 'Drill' },
  { id: 'scaler', component: markRaw(IconRoleScaler), label: 'Scaler' },
  { id: 'denture', component: markRaw(IconRoleDenture), label: 'Denture' },
  { id: 'headset', component: markRaw(IconRoleHeadset), label: 'Headset' },
  { id: 'briefcase', component: markRaw(IconRoleBriefcase), label: 'Management' },
  { id: 'badge', component: markRaw(IconRoleBadge), label: 'Leadership' },
  { id: 'mask', component: markRaw(IconRoleMask), label: 'Protection' },
  { id: 'hands', component: markRaw(IconRoleHands), label: 'Support' }
];

/**
 * Retrieves an icon component by its unique identifier.
 *
 * @param id - The identifier of the icon.
 * @returns The Vue component or null if not found.
 */
export function getRoleIcon(id?: string | null): Component | null {
  // Return null early if no ID is provided.
  if (!id) {
    return null;
  }

  return ROLE_ICONS.find((icon) => icon.id === id)?.component || null;
}
