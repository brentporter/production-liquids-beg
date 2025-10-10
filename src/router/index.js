import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: 'Dashboard' }
    },
    {
        path: '/map',
        name: 'Map',
        component: () => import('../views/MapView.vue'),
        meta: { title: 'Map View' }
    },
    {
        path: '/analytics',
        name: 'Analytics',
        component: () => import('../views/Analytics.vue'),
        meta: { title: 'Analytics' }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/NotFound.vue'),
        meta: { title: '404 - Not Found' }
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior() {
        return { top: 0 }
    }
})

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title} | PW Dashboard`
    next()
})

export default router
