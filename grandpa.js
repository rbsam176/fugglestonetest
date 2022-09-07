// DOM Elements
const mssgList = document.getElementById("mssgList");

// Global variables:
let connections = [];       // array of connections


// --- PEER EVENT LISTENERS ---

// peer set up successfully   
peer.on('open', function (id) {

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

// 
receiveCall(peer, document.getElementById("videoContainer"))
// 

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
    });

    // Receive messages
    conn.on('data', function (data) { onReceiveData(conn, data) });
    conn.on('close', function () { onCloseConnection(conn); });
}


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

    connections.push(connection);

    let mssgElement = document.createElement("li");
    mssgElement.className = "list-group-item list-group-item-primary text-center";
    mssgElement.innerText = `Connected to | ${connection.peer}`;
    mssgList.append(mssgElement);
}


function onCloseConnection(connection) {
    let mssgElement = document.createElement("li");
    mssgElement.className = "list-group-item list-group-item-primary text-center";
    mssgElement.innerText = `Data Connection closed | ${connection.peer}`;
    mssgList.append(mssgElement);

    // remove from connections:
    removeFromArray(connections, connection);

    // Deletes video element on disconnect
    document.querySelector('[data-peer="' + connection.peer + '"]').remove();
}


function onReceiveData(connection, data) {
    if (data.type == "message") {
        let mssgElement = document.createElement("li");
        mssgElement.className = "list-group-item";
        mssgElement.innerText = "[ " + connection.peer + " ]  |  " + data.message;
        mssgList.append(mssgElement);
    }
    if (data.type == "peer") {
        connect(data.message);
        // makeCall(peer, data.message, document.getElementById("videoContainer"))
    }
}







showLocalVideo(document.getElementById("videoContainer"))