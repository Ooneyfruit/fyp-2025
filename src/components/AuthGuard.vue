<template>
  <div class="auth-wrapper">
    <div v-if="!isAuthReady" class="loading-msg">
      Checking authentication...
    </div>

    <div v-else-if="!user" class="login-wall">
      <div class="login-card">
        <h2>{{ title }}</h2>
        <p>You must be logged in to view this page.</p>
        <button @click="handleLogin" class="google-btn">
          Sign in with Google
        </button>
        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      </div>
    </div>

    <slot v-else />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';

defineProps({
  title: {
    type: String,
    default: 'Access Restricted'
  }
});

const { user, isAuthReady, login } = useAuth();
const errorMsg = ref("");

const handleLogin = async () => {
  errorMsg.value = "";
  try {
    await login();
  } catch (err) {
    errorMsg.value = "Login failed: " + err.message;
  }
};
</script>

<style scoped>
.loading-msg { text-align: center; margin-top: 50px; color: #666; }
.login-wall { display: flex; justify-content: center; margin-top: 60px; }
.login-card {
  text-align: center;
  border: 1px solid #ddd;
  padding: 40px;
  border-radius: 8px;
  background: #f9f9f9;
  max-width: 400px;
  width: 100%;
}
.google-btn {
  background-color: #4285F4;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 15px;
  font-weight: 500;
}
.google-btn:hover { background-color: #357ae8; }
.error { color: #e74c3c; margin-top: 15px; }
</style>