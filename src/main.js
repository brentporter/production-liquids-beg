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
import { defineCustomElements as defineCalciteElements } from "@esri/calcite-components/dist/loader";
// define custom elements in the browser, and load the assets from the CDN
defineCalciteElements(window, { resourcesUrl: 'https://js.arcgis.com/calcite-components/2.8.6/assets' });


const app = createApp(App)
const vuetify = createVuetify({
    icons: {
        defaultSet: 'mdi', // This is already the default value - only for display purposes
    },
    themes: {
        dark: {
            colors: {
                background: '#121212',
                surface: '#1e1e1e',
                primary: '#667eea',
                secondary: '#764ba2',
            }
        }
    },
    components,
    directives,
})
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(VueApexCharts);
app.mount('#app')