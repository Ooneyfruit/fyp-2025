import { createApp } from 'vue';
import './assets/main.css';     // Global CSS
import App from './App.vue';    // Root Component
import router from './router';  // Automatically finds ./router/index.js

const app = createApp(App);

app.use(router); // Tells Vue to use the router we just built
app.mount('#app');