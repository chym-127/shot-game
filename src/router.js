import { createRouter, createWebHistory } from 'vue-router'

// 路由表
const routes = [
    {
        path: '/',
        name: 'shot-ball',
        component: () => import('@views/shot-ball/index.vue')
    }
]

// 创建 Router 实例
const router = createRouter({
    history: createWebHistory(),
    routes
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
    // 如果路由需要登录
    if (to.meta?.auth) {
        const token = localStorage.getItem('token')
        if (!token) return next('/login')
    }
    next()
})

export default router
