import './assets/main.css'
import './assets/esri-styles.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import {createVuetify} from "vuetify";
import 'vuetify/styles'
import VueApexCharts from "vue3-apexcharts";
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const app = createApp(App)
const vuetify = createVuetify({
    icons: {
        defaultSet: 'mdi', // This is already the default value - only for display purposes
    },
    themes: {
        defaultTheme: 'dark'
    },
    components,
    directives,
})
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(VueApexCharts);
app.mount('#app')