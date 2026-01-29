/**
 * Entry point for the Vue application.
 * Initialises the main Vue instance, integrates the router, and mounts the application to the DOM.
 */
import './assets/main.css';

import { createApp } from 'vue';

import App from './App.vue';
import router from './router';

// Initialise the root Vue application component.
const app = createApp(App);

// Attach the router instance to the application.
app.use(router);

// Mount the application to the element with the identifier of app.
app.mount('#app');
