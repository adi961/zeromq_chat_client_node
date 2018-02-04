const zmq = require('zmq')
const socket = zmq.socket('req')
const broadcastSub = zmq.socket('sub')

const ip = 'localhost'
const socketPort = '5555'
const broadcastSubPort = '8688'
var uuid


socket.on('message', function(msg) {
    const payload = JSON.parse(msg.toString())
    console.log('paylaod:', payload)

    if(payload.error){
        console.log('error!:',payload)
    }else if(payload.uuid){
        uuid = payload.uuid
        sendMessage('Hello World!')
    }else if(payload.success){
        console.log('Message sent')
    }
})
broadcastSub.on('message', function(msg) {
    console.log('recieved message:', msg.toString())
})
socket.connect('tcp://' + ip + ':' + socketPort)
broadcastSub.connect('tcp://' + ip + ':' + broadcastSubPort)
broadcastSub.subscribe('')
const payload = {name: 'Peters'}
//const payload = {uuid}
console.log('Sending payload: ', payload)
socket.send(JSON.stringify(payload))
function sendMessage(message) {
    socket.send(JSON.stringify({uuid : uuid, content : message}))
}