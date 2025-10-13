import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/pwd/',
        name: 'Map',
        component: () => import('../views/MapView.vue'),
        meta: { title: 'Produced Energy Explorer' }
    },
    {
        path: '',
        name: 'pwd',
        redirect: to => {
            // the function receives the target route as the argument
            // we return a redirect path/location here.
            return {path: '/pwd/'}
        }
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