import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import App from './App.vue';

/**
 * Verifies that the testing suite is correctly configured.
 * Performs a basic mount check on the App component.
 */
describe('App.vue', () => {
  it('renders correctly', () => {
    // Basic check to ensure the component can be mounted in the test environment
    const wrapper = mount(App, {
      global: {
        stubs: ['router-view', 'AppAuthGuard', 'AppToast']
      }
    });
    expect(wrapper.exists()).toBe(true);
  });
});
