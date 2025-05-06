// 👉 Redirects
export const redirects = [
  // ℹ️ We are redirecting to different pages based on role.
  // NOTE: Role is just for UI purposes. ACL is based on abilities.
  {
    path: '/',
    name: 'index',
    component: () => import('@/pages/dashboards/home.vue'),
    meta: {
      layout: 'default',
    },
  },
  {
    path: '/dashboards/home',
    redirect: '/',
  },
]
