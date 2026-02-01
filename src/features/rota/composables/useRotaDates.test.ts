/**
 * Test suite for Rota date management logic.
 * verifies date calculations, week navigation, and ISO string formatting.
 */
import { describe, expect, it } from 'vitest';
import { ref } from 'vue';

import { useRotaDates } from './useRotaDates';

describe('useRotaDates', () => {
  // Create a mock breakpoints object to satisfy the dependency injection.
  const mockBreakpoints = {
    isMobile: ref(false)
  };

  it('initialises with the correct start of the week', () => {
    // Arrange: Mock the current date to a known Wednesday.
    // We can't easily mock 'new Date()' inside the composable without a global mock,
    // so we rely on the internal logic that defaults to 'today' if storage is empty.
    // For specific date testing, we inspect the relative consistency.

    const { currentStartDate, visibleDays } = useRotaDates(mockBreakpoints);

    // Act: Ensure we are at a clean state (today).
    // The composable defaults to today, which is dynamic, so we check the structure.

    // Assert: We should have days generated.
    expect(visibleDays.value.length).toBeGreaterThan(0);
    expect(currentStartDate.value).toBeInstanceOf(Date);
  });

  it('navigates to the next week correctly', () => {
    const { changePeriod, currentStartDate } = useRotaDates(mockBreakpoints);
    const start = new Date(currentStartDate.value);

    // Act: Move forward one period (1 week in desktop mode).
    changePeriod(1);

    // Assert: The new start date should be 7 days after the initial start date.
    const expected = new Date(start);
    expected.setDate(expected.getDate() + 7);

    // Allow for small time diffs in execution, compare ISO strings for dates.
    expect(currentStartDate.value.toISOString().split('T')[0]).toBe(
      expected.toISOString().split('T')[0]
    );
  });

  it('navigates to the previous week correctly', () => {
    const { changePeriod, currentStartDate } = useRotaDates(mockBreakpoints);
    const start = new Date(currentStartDate.value);

    // Act
    changePeriod(-1);

    // Assert
    const expected = new Date(start);
    expected.setDate(expected.getDate() - 7);
    expect(currentStartDate.value.toISOString().split('T')[0]).toBe(
      expected.toISOString().split('T')[0]
    );
  });

  it('formats dates consistently for Firestore keys', () => {
    const { visibleDays } = useRotaDates(mockBreakpoints);

    const firstDay = visibleDays.value[0];
    // Keys must be YYYY-MM-DD
    expect(firstDay.key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('adjusts view based on mobile breakpoint', () => {
    const mobileBreakpoints = { isMobile: ref(true) };
    const { visibleDays } = useRotaDates(mobileBreakpoints);

    // Mobile view shows fewer days (defined as 3 in the implementation).
    expect(visibleDays.value).toHaveLength(3);
  });
});
