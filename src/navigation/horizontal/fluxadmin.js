export default [
  {
    title: 'menu.administration.title',
    icon: { icon: 'mdi-shield-account' },
    children: [
      {
        title: 'menu.administration.manageFlux',
        icon: { icon: 'mdi-cog-outline', size: 20 },
      },
      {
        title: 'menu.administration.manageDaemon',
        icon: { icon: 'mdi-office-building-cog', size: 20 },
        privilege: ['admin', 'fluxteam'],
      },
      {
        title: 'menu.administration.manageBenchmark',
        icon: { icon: 'mdi-database-cog', size: 20 },
        privilege: ['admin', 'fluxteam'],
      },
      {
        title: 'menu.administration.manageUsers',
        icon: { icon: 'mdi-fingerprint', size: 20 },
        privilege: ['admin', 'fluxteam'],
      },
      {
        title: 'menu.administration.loggedSessions',
        icon: { icon: 'mdi-account-box-multiple', size: 20 },
        privilege: ['admin', 'fluxteam'],
      },
      {
        title: 'menu.administration.myFluxShare',
        icon: { icon: 'tabler-server', size: 20 },
        privilege: ['admin'],
      },
    ],
  },
]
  