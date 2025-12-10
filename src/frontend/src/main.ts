import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Import Bootstrap and custom SCSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/main.scss';

// Import component mounting for Umbraco integration
import './component-mount';

// Import navigation functionality
import './navigation';

// Import search overlay functionality
import './components/search-overlay';

// Import translation service
import './translation';

// Import video component functionality
import './video';



const app = createApp(App);

app.use(router);
app.mount('#app');
