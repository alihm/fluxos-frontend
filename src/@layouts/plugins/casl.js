import { useFluxStore } from '@/stores/flux' // Assuming this is your custom store that holds user data/privileges

/**
 * Custom function to check if the user has a specific privilege.
 * @param {Array} privileges - List of privileges required for the action/subject
 */
export const hasPrivilege = (privileges = []) => {
  const fluxStore = useFluxStore() // Access the user's privileges from the flux store
  const userPrivilege = fluxStore.privilege || 'none' // Default to 'none' if no privilege is found

  // If no privileges are provided, consider this accessible
  if (privileges.length === 0) {
    return true
  }

  return privileges.includes(userPrivilege) // Check if the user's privilege is one of the required privileges
}

/**
 * Check if user can view the item based on its privilege
 * Based on the item's action and subject, and hide the group if all of its children are hidden
 * @param {object} item - Navigation object item
 */
export const canViewNavMenuGroup = item => {
  // If item has no privilege defined (no 'item.privilege'), we check the following cases:
  
  // 1. If no privileges and no children, the parent is visible
  if (!(item.privilege) && (!item.children || item.children.length === 0)) {
    return true  // Parent without children and no privileges is visible by default
  }

  // 2. If no privileges and there are children, check if any of the children are visible
  if (!(item.privilege) && item.children) {
    // Check if any child has a visible privilege
    return item.children.some(child => hasPrivilege(child.privilege)) // Show parent if any child is visible
  }

  // If item has privileges defined (item.privilege), show the parent based on its privilege
  const parentIsVisible = hasPrivilege(item.privilege)

  // Check if any child item has a visible privilege
  const hasAnyVisibleChild = item.children?.some(child => hasPrivilege(child.privilege))

  // If parent is visible and at least one child is visible, show the parent
  return parentIsVisible && hasAnyVisibleChild
}

/**
 * Check if the user can navigate to a route based on the route's required privileges.
 * @param {object} to - Target route object
 */
export const canNavigate = to => {
  const fluxStore = useFluxStore() // Access user's privilege from the flux store

  // Get the most specific route (last one in the matched array)
  const targetRoute = to.matched[to.matched.length - 1]

  // If the route has specific privileges, check those first
  if (targetRoute?.meta?.privilege) {
    return hasPrivilege(targetRoute.meta.privilege)
  }

  // If no specific privileges, fallback to checking if any parent route allows access
  return to.matched.some(route => hasPrivilege(route.meta.privilege))
}
