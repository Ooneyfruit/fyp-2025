/**
 * Test suite for Practice Actions logic (Write-Only).
 * verifies updates to practice details and configuration.
 */
import { updateDoc } from 'firebase/firestore';
import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { usePracticeActions } from './usePracticeActions';

// Mock dependencies
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    user: ref({ practiceRef: { id: 'practice_123' } })
  })
}));

vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn()
  })
}));

describe('usePracticeActions', () => {
  it('updates details via Firestore', async () => {
    const { updateDetails } = usePracticeActions();

    // Fixed: Added 'address' to satisfy PracticeDetails interface
    const newDetails = { name: 'New Name', phone: '111', address: '123 Fake St' };

    await updateDetails(newDetails);

    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(), // Document reference
      expect.objectContaining(newDetails)
    );
  });
});
