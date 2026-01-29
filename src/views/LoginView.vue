<script setup lang="ts">
/**
 * Public-facing login page.
 * Handles authentication via the useAuth composable and redirects authenticated users.
 */
import { ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

// Components
import BaseButton from '@/components/shared/BaseButton.vue';
import { useAuth } from '@/composables/useAuth';

// --- Logic & State ---

const { user, login } = useAuth();

const router = useRouter();
const errorMsg = ref('');

// Automatic redirect: if a user session is detected, navigate to the dashboard immediately.
watchEffect(() => {
  if (user.value) {
    router.push('/');
  }
});

/**
 * Triggers the login flow and handles potential errors.
 * Displays a user-friendly message if the authentication sequence fails.
 */
const handleLogin = async (): Promise<void> => {
  try {
    await login();
    // Successful login will be caught by the watchEffect above.
  } catch {
    errorMsg.value = 'Login failed. Please try again.';
  }
};
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="brand">RotaDent</h1>
      <p>Please sign in to access the system.</p>
      <BaseButton class="full-width" label="Sign in with Google" @click="handleLogin" />
      <p v-if="errorMsg" class="error">
        {{ errorMsg }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  align-items: center;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  min-height: 100vh;
  padding: var(--spacing-md);
}

.login-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.25rem 0.75rem rgb(0 0 0 / 10%);
  max-width: 25rem;
  padding: 2.5rem;
  text-align: center;
  width: 100%;
}

.brand {
  color: var(--color-primary);
  margin-bottom: 0.625rem;
}

.error {
  color: var(--color-danger);
  margin-top: 0.9375rem;
}
</style>
