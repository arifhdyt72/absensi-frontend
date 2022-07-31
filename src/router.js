import { createRouter, createWebHashHistory } from 'vue-router';
import Dashboard from './components/Dashboard.vue';

const routes = [
    {
        path: '/',
        name: 'dashboard',
        component: Dashboard,
        meta: {
            requiredAuthorization: true, 
            roles: ['admin', 'employee'] 
        }
    },
    {
        path: '/users',
        name: 'users',
        component: () => import('./components/MasterUser.vue'),
        meta: {
            requiredAuthorization: true, 
            roles: ['admin'] 
        }
    },
    {
        path: '/report-attendance',
        name: 'report-attendance',
        component: () => import('./components/ReportAttendance.vue'),
        meta: {
            requiredAuthorization: true, 
            roles: ['admin', 'employee'] 
        }
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('./pages/Login.vue')
    },
    {
        path: '/logout',
        name: 'logout',
        component: function(){
            localStorage.removeItem('token');
            router.push({name: "login"});
        },
    },
    {
        path: '/error',
        name: 'error',
        component: () => import('./pages/Error.vue')
    },
    {
        path: '/notfound',
        name: 'notfound',
        component: () => import('./pages/NotFound.vue')
    },
    {
        path: '/access',
        name: 'access',
        component: () => import('./pages/Access.vue')
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

router.beforeEach((to, from, next) => { 
    if (to.meta.requiredAuthorization) {
       if (localStorage.token === undefined) {
           next('/login')
       }
       const base64Url = localStorage.token.split('.')[1];
       if (base64Url === undefined) {
           next('/login')
       }
       const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
       const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
           return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
       }).join(''));
       const user = JSON.parse(jsonPayload);

       let index = to.meta.roles.indexOf(user.role);
       if(index >=0 ){
           next();
       }else{
           next('/access');
       }
    } else {
        next();
    }
 
})

export default router;
