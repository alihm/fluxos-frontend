
import apps from './apps'
import dashboard from './dashboard'
import fluxadmin from './fluxadmin'
import xdao from './xdao'
import fluxdrive from './fluxdrive'

// Custom order: apps, fluxdrive, cost calculator, administration, flux network, api reference
export default [
  ...apps,
  ...fluxdrive,
  xdao[0], // Cost Calculator
  ...fluxadmin, // Administration
  ...dashboard, // Flux Network
  xdao[1], // API Reference
]
