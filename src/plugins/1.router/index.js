import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router/auto'
import { redirects } from './additional-routes'
import { setupGuards } from './guards'

function recursiveLayouts(route) {
  if (route.children) {
    for (let i = 0; i < route.children.length; i++) {
      route.children[i] = recursiveLayouts(route.children[i])
    }

    return route
  }
  
  return setupLayouts([route])[0]
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash) {

      return { el: to.hash, behavior: 'smooth', top: 60 }
    }

    return { top: 0 }
  },
  extendRoutes: pages => {
    const allRoutes = [...pages, ...redirects]
  
    allRoutes.forEach(route => {
      if (!route.meta) route.meta = {}
      if (!route.meta.layout) route.meta.layout = 'default'
    })
  
    return setupLayouts(allRoutes)
  },
})

setupGuards(router)

export { router }

export default function (app) {
  app.use(router)
}
