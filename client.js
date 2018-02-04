const zmq = require('zmq')
const socket = zmq.socket('req')
const broadcastSub = zmq.socket('sub')
const libui = require('libui-node')
const timestamp = require('unix-timestamp')
const bonjour = require('bonjour')()

var ip,
    clPort,
    broadcastSubPort,
    uuid,
    userName

bonjour.find({ type: 'tcp' }, function (service) {
    console.log('Found an HTTP server:', service)
    if(service.txt.service == 'cpp'){
        ipTextBox.text = service.referer.address
        clPortTextBox.text = service.port
        brPortTextBox.text = service.txt.brport
        ip = service.referer.address
        clPort = service.port
        broadcastSubPort = service.txt.brport

    }
  })

libui.Ui.init()

var win = new libui.UiWindow('Code chat protocol', 640, 480, false)


var hbox = new libui.UiHorizontalBox()
hbox.padded = true
win.setChild(hbox)

var vbox = new libui.UiVerticalBox()
vbox.padded = true
hbox.append(vbox, true)

var nameTextBox = new libui.UiEntry()
vbox.append(nameTextBox, false)


var ipTextBox = new libui.UiEntry()
vbox.append(ipTextBox, false)

var clPortTextBox = new libui.UiEntry()
vbox.append(clPortTextBox, false)

var brPortTextBox = new libui.UiEntry()
vbox.append(brPortTextBox, false)

var connectBtn = new libui.UiButton();
connectBtn.text = 'Connect'
connectBtn.onClicked(connect)
vbox.append(connectBtn, false)

var chatBox = new libui.UiMultilineEntry()
chatBox.enabled = false
chatBox.readOnly = true
vbox.append(chatBox, true)



var chatTextBox = new libui.UiEntry()
chatTextBox.enabled = false
//vbox.append(chatTextBox, false)

var sendBtn = new libui.UiButton();
sendBtn.enabled = false
sendBtn.text = 'Send >>>'
sendBtn.onClicked(sendMessage)

var sendGrid = new libui.UiGrid()
sendGrid.padded = true
sendGrid.append(chatTextBox, 0, 0, 70, 1, 0, 0, 0, 1)
sendGrid.append(sendBtn, 100, 0, 2, 1, 0, 0, 0, 1)
vbox.append(sendGrid, false)

win.onClosing(function () {
    win.close();
    libui.stopLoop();
});

win.show();

libui.startLoop();

//event callbacks
function connect() {
    if(nameTextBox.text != '' && ipTextBox.text != '' && clPortTextBox.text != '' && brPortTextBox.text != ''){
        ip = ipTextBox.text
        socket.connect('tcp://' + ip + ':' + clPort)
        broadcastSub.connect('tcp://' + ip + ':' + broadcastSubPort)
        broadcastSub.subscribe('')
        console.log('Connected to:', ip)
        const payload = {name: nameTextBox.text}
        console.log('Sending payload: ', payload)
        socket.send(JSON.stringify(payload))
    }else{
        chatBox.text = 'Please enter username an IP address'
    }

}

function sendMessage() {
    if(chatTextBox != '') {
        socket.send(JSON.stringify({uuid : uuid, content : chatTextBox.text}))
        chatTextBox.text = ''
    }
    
}


function createDispMsg(payload, fromMe) {
    var message
    
    if(fromMe == false) {
        message = '### \t ' + payload.user_name.toUpperCase() + '\t at: ' + 
        timestamp.toDate(payload.timestamp)+ '\t ### \n \t\t' + payload.content + '\n###\n\n'
    } else {
        const spaces = '\t\t\t\t\t\t\t\t\t\t\t\t\t'
        message = spaces + '### \t ME\t at: ' + 
        timestamp.toDate(payload.timestamp)+ '\t ### \n \t\t' + spaces + payload.content + '\n' + spaces + '###\n\n'
    }
    return message
}

//function sendMess

socket.on('message', function(msg) {
    const payload = JSON.parse(msg.toString())
    console.log('paylaod:', payload)

    if(payload.error){
        if(payload.error == '-1'){
            chatBox.text = 'Username already taken'
        }
        console.log('error!:',payload)
    }else if(payload.uuid){
        uuid = payload.uuid
        userName = nameTextBox.text
        sendBtn.enabled = true
        chatTextBox.enabled = true
        chatBox.enabled = true
        ipTextBox.enabled = false
        nameTextBox.enabled = false
        clPortTextBox.enabled = false
        brPortTextBox.enabled = false
        connectBtn.enabled = false
        //sendMessage('Hello World!')
    }else if(payload.success){
        console.log('Message sent')
    }
})

broadcastSub.on('message', function(msg) {
    const payload = JSON.parse(msg.toString())
    if(payload.user_name == userName){
        console.log('recieved message:', payload)
    chatBox.append(createDispMsg(payload, true))
    } else {
        console.log('recieved message:', payload)
    chatBox.append(createDispMsg(payload, false))
    }
    
    
})