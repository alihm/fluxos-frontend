
export function getDetectedBackendURL() {
  try {
    const { protocol, hostname, port } = window.location
    let mybackend = protocol + '//'

    // Check for Flux app domain format (5+ segments with dashes containing IP)
    if (hostname.split('-')[4]) {
      const splitted = hostname.split('-')
      const names = splitted[4].split('.')
      const adjP = +names[0] + 1

      names[0] = adjP.toString()
      names[2] = 'api'
      splitted[4] = ''
      mybackend += splitted.join('-') + names.join('.')
    }

    // Check for pure IP address (not localhost, not domain)
    else if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      mybackend += hostname

      const numericPort = parseInt(port, 10)
      if (numericPort > 16100) {
        mybackend += `:${numericPort + 1}`
      } else {
        mybackend = 'https://api.runonflux.io'
      }
    }

    // For localhost or any domain name, use default API
    else {
      mybackend = 'https://api.runonflux.io'
    }

    // Fallback check for malformed URLs
    if (mybackend.endsWith('//api')) {
      mybackend = 'https://api.runonflux.io'
    }

    return mybackend
  } catch (err) {
    console.error('❌ Failed to detect backend URL:', err)

    return 'https://api.runonflux.io'
  }
}
