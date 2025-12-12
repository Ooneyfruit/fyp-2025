import { createApp } from 'vue';
import './assets/main.css';
import StaffManagement from './components/StaffManagement.vue';

const app = createApp(StaffManagement);
app.mount('#app');