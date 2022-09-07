// DOM Elements
const joinBtn = document.getElementById("joinBtn");
const sendMssgBtn = document.getElementById("sendMssgBtn");
const mssgTextBox = document.getElementById("mssgTextBox");
const mssgList = document.getElementById("mssgList");
const disconnectBtn = document.getElementById("disconnectBtn");

const recipientId = 'grandpa'


// disabled till the peer is set up
joinBtn.disabled = true;

// disabled till a connection is established
sendMssgBtn.disabled = true;
disconnectBtn.disabled = true;

// Global variables:
let connections = [];       // array of connections


// --- PEER EVENT LISTENERS ---

// peer set up successfully   
peer.on('open', function (id) {
    // enable join
    joinBtn.disabled = false;

    let mssgElement = document.createElement("button");
    mssgElement.className = "list-group-item list-group-item-primary text-center";
    mssgElement.innerText = `Logged in as:  ${peer.id}`;
    mssgList.append(mssgElement);
});


// received a connection 
peer.on('connection', function (conn) {

    conn.on('open', function () {
        onOpenConnection(conn);

        // send the peer id of all connections
        // so that the new peer can connect to
        // all peers this peer is connected to
        // forming a complete graph
        connections.forEach((connection) => {
            if (connection.peer != conn.peer) {
                conn.send({
                    type: "peer",
                    message: connection.peer
                });
            }
        });
    });

    // Event Listener for received data
    conn.on('data', function (data) { onReceiveData(conn, data) });

    conn.on('close', function () { onCloseConnection(conn); });
});


peer.on('error', function (err) {
    if (err.type == 'peer-unavailable') {
        let mssgElement = document.createElement("li");
        mssgElement.className = "list-group-item list-group-item-primary text-center";
        mssgElement.innerText = `Coudnt not connect to a peer`;
        mssgList.append(mssgElement);
    }
});





// --- ACTIONS ---

// Try to connect to remote peer
function connect(peerId) {
    // if connection already exists ignore
    for (let i = 0; i < connections.length; i++) {
        if (connections[i].peer == peerId)
            return;
    }

    let conn = peer.connect(peerId);

    conn.on('open', function () {
        onOpenConnection(conn);
        console.log(connections)
        connections.forEach((connection) => {
            console.log(connection)
            makeCall(peer, connection.peer, document.getElementById("videoContainer"))
        })
    });

    // Receive messages
    conn.on('data', function (data) { onReceiveData(conn, data) });
    conn.on('close', function () { onCloseConnection(conn); });
}

receiveCall(peer, document.getElementById("videoContainer"))

function disconnectAll() {
    while (connections.length > 0) {
        connections[0].close();
    }
}


function onOpenConnection(connection) {
    // if connection already exists close this new connection
    for (let i = 0; i < connections.length; i++) {
        if (connections[i].peer == connection.peer) {
            connection.close();
            return;
        }
    }

    sendMssgBtn.disabled = false;
    disconnectBtn.disabled = false;

    connections.push(connection);

    let mssgElement = document.createElement("li");
    mssgElement.className = "list-group-item list-group-item-primary text-center";
    mssgElement.innerText = `Connected to | ${connection.peer}`;
    mssgList.append(mssgElement);
}


function onCloseConnection(connection) {
    console.log("Closed connection")

    let mssgElement = document.createElement("li");
    mssgElement.className = "list-group-item list-group-item-primary text-center";
    mssgElement.innerText = `Data Connection closed | ${connection.peer}`;
    mssgList.append(mssgElement);

    // remove from connections:
    removeFromArray(connections, connection);

    if (connections.length == 0) {
        sendMssgBtn.disabled = true;
        disconnectBtn.disabled = true;
    }

    // Deletes video element on disconnect
    document.querySelector('[data-peer="' + connection.peer + '"]').remove();

    console.log(connections);
}


function onReceiveData(connection, data) {
    if (data.type == "message") {
        let mssgElement = document.createElement("li");
        mssgElement.className = "list-group-item";
        mssgElement.innerText = "[ " + peer.id + " ]  |  " + data.message;
        mssgList.append(mssgElement);
    }
    
    if (data.type == "peer") {
        connect(data.message);
    }
}




// --- BUTTON ONCLICK FUNCTIONS ---

joinBtn.onclick = () => {
    // join a new lobby
    // diconnect from the current lobby
    disconnectAll();
    connect(recipientId);
    joinBtn.disabled = true;
    disconnectBtn.disabled = false;
};


sendMssgBtn.onclick = () => {
    if (!mssgTextBox.value) return;
    const mssg = {
        type: "message",
        message: mssgTextBox.value
    };
    mssgTextBox.value = "";

    let mssgElement = document.createElement("li");
    mssgElement.className = "list-group-item text-end";
    mssgElement.innerText = mssg.message + "  |  [ You] ";
    mssgList.append(mssgElement);

    broadcast(mssg);
};

disconnectBtn.onclick = () => {
    disconnectAll();
    console.log(connections);
    disconnectBtn.disabled = true;
    joinBtn.disabled = false;
};





showLocalVideo(document.getElementById("videoContainer"))