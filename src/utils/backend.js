
export function getDetectedBackendURL() {
  try {
    const { protocol, hostname, port } = window.location
    let mybackend = protocol + '//'

    const regex = /[A-Z]/i

    if (hostname.split('-')[4]) {
      const splitted = hostname.split('-')
      const names = splitted[4].split('.')
      const adjP = +names[0] + 1

      names[0] = adjP.toString()
      names[2] = 'api'
      splitted[4] = ''
      mybackend += splitted.join('-') + names.join('.')
    } else if (regex.test(hostname)) {
      const names = hostname.split('.')

      names[0] = 'api'
      mybackend += names.join('.')
    } else {
      mybackend += hostname

      const numericPort = parseInt(port, 10)
      if (numericPort > 16100) {
        mybackend += `:${numericPort + 1}`
      } else {
        mybackend = 'https://api.runonflux.io'
      }
    }

    if (mybackend.endsWith('//api')) {
      mybackend = 'https://api.runonflux.io'
    }

    return mybackend
  } catch (err) {
    console.error('❌ Failed to detect backend URL:', err)
    
    return 'https://api.runonflux.io'
  }
}
