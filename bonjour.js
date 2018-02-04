const bonjour = require('bonjour')()

bonjour.find({ type: 'tcp' }, function (service) {
    console.log('Found an HTTP server:', service)
  })