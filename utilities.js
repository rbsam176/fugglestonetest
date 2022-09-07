// --- UTILITY FUNCTIONS ---

function broadcast(data) {
    connections.forEach((conn) => {
        if (conn.open) {
            conn.send(data);
        }
    });
}


function removeFromArray(array, toRemove) {
    const index = array.indexOf(toRemove);
    if (index > -1) {
        array.splice(index, 1);
    }
}


function copyToClipboard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};


let LOCAL_STREAM = null;

// Show local video
function showLocalVideo(videosContainer) {
    navigator.mediaDevices.getUserMedia({video: true})
        .then(stream => {
            LOCAL_STREAM = stream // Needs to set global variable so that it can be used in makeCall()
            const localVideoElement = document.createElement("video")
            localVideoElement.srcObject = stream
            localVideoElement.id = 'local'
            localVideoElement.onloadedmetadata = () => localVideoElement.play()
            localVideoElement.dataset.peer = 'local'
            videosContainer.append(localVideoElement)
        })
}


// Receive calls
function receiveCall(peer, videosContainer) {
    if (document.querySelector(`[data-peer=${peer.id}]`)) {
        return 
    }
    peer.on('call', call => {
        if (document.querySelector(`[data-peer=${call.peer}]`)) {
            return
        }
        console.log(call)
        call.answer(LOCAL_STREAM)
        // RECIPIENTS_CONNECTED.push(call.peer)
        if (peer.id !== call.peer){
            call.on("stream", stream => {
                const recipientElement = document.createElement("video")
                recipientElement.srcObject = stream
                recipientElement.onloadedmetadata = () => recipientElement.play()
                recipientElement.id = `receiveCall-${call.peer}`
                recipientElement.dataset.peer = call.peer
                videosContainer.append(recipientElement)
            })
        }
    })
}


// Make calls
function makeCall(peer, remotePeerId, videosContainer) {
    if (document.querySelector(`[data-peer=${remotePeerId}]`)) {
        return
    }
    const call = peer.call(remotePeerId, LOCAL_STREAM)
    if (peer.id !== call.peer){
        call.on("stream", stream => {
            const remoteVideoElement = document.createElement("video")
            remoteVideoElement.srcObject = stream
            remoteVideoElement.id = `makeCall-${remotePeerId}`
            remoteVideoElement.dataset.peer = remotePeerId
            remoteVideoElement.onloadedmetadata = () => remoteVideoElement.play()
            videosContainer.append(remoteVideoElement)
        })
    }
}