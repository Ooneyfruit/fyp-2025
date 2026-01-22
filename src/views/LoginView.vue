<script setup>
import { ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import BaseButton from '../components/shared/BaseButton.vue';

const { user, login } = useAuth();
const router = useRouter();
const errorMsg = ref('');

// FORCED REDIRECT: If a user is already detected, kick them to the dashboard immediately
watchEffect(() => {
  if (user.value) {
    console.log('[LoginView] Active session detected. Redirecting to home.');
    router.push('/');
  }
});

const handleLogin = async () => {
  try {
    await login();
    // Successful login will be caught by the watchEffect above
  } catch (err) {
    console.error(err);
    errorMsg.value = 'Login failed. Please try again.';
  }
};
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="brand">RotaDent</h1>
      <p>Please sign in to access the system.</p>
      <BaseButton label="Sign in with Google" class="full-width" @click="handleLogin" />
      <p v-if="errorMsg" class="error">
        {{ errorMsg }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  padding: var(--spacing-md);
}

.login-card {
  background: white;
  padding: 2.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 25rem;
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
