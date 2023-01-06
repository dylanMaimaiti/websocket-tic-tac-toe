const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require("path");

const PORT = 3001;

const waitingPlayers = [];

app.use(express.static(path.resolve(__dirname, "../client/build")));

io.use((socket, next) => {
    let username = socket.handshake.auth.username;
    socket.username = username;
    next();
})

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
})

io.on('connection', (socket) => {

    socket.on("disconnecting", (reason) => {
        console.log("A client disconnected");
        console.log("The other socket = " + socket.otherSocket);
        console.log("My socket = " + socket.id);
        if (waitingPlayers.includes(socket)) {
            waitingPlayers.splice(waitingPlayers.indexOf(socket), 1);
        }
        for (const room of socket.rooms) {
            console.log(room);
            if (room !== socket.id) {
               io.to(room).emit("player disconnected"); 
            }
        }
        socket.to(socket.otherSocket).emit("player disconnected");
        matchmake(waitingPlayers);
    })


    console.log("connection to socket");
    console.log(socket.id);
    waitingPlayers.push(socket);
    
    matchmake(waitingPlayers);

    socket.on("player move", ({ position, to, playerSymbol }) => {
       // console.log(position);
        socket.to(to).emit("player move", {position, playerSymbol});
    });

    socket.on("winning cells", ({pos1, pos2,pos3, to}) => {
        socket.to(to).emit("winning cells", {pos1, pos2, pos3});
    })

    socket.on("game over", ( {isTie, winner, to, from}) => {
        console.log("server received game over");
        if (isTie) {
            socket.to(to).emit("game over", {
                message: "The game was tied!"
            });
        } else {
            socket.to(to).emit("game over", {
                message: winner + " has won!"
            });
        };
    });

    socket.on("not playing again", ({to}) => {
        socket.to(to).emit("not playing again");
    });

    socket.on("find new game", () => {
        //re queue the socket/player to the game queue
        if (!waitingPlayers.includes(socket)) {
            //wait a random amount of time, between 0 and 1 second to reduce chances of same match up's
            setTimeout(() => {
               waitingPlayers.push(socket);
               matchmake(waitingPlayers);
            }, getRandomTime());
            
        }
    });

    socket.on("play again", ({mySymbol, yourSymbol, name, to}) => {
        //emit to both players
        socket.to(to).emit("play again", {mySymbol, yourSymbol, name});
    });

    socket.on("clear game", ({to}) => {
        socket.to(to).emit("clear game");
    });
});

const getRandomTime = () => {
    let time;
    time = Math.floor(Math.random() * 1000);
    return time;
}

//the array is the array of waiting players
const matchmake = (theArray) => {
    if (theArray.length >= 2) {
        let socket1 = theArray[0];
        let socket2 = theArray[1];
        console.log("in the waiting room");

        socket2.to(socket1.id).emit("player connected", {
            otherSocket: socket2.id,
            yourSymbol: "X",
            otherSymbol: "O",
            from: socket2.id,
            otherName: socket2.username,
            canMove: true
        });

        socket1.to(socket2.id).emit("player connected", {
            otherSocket: socket1.id,
            yourSymbol: "O",
            otherSymbol: "X",
            from: socket1.id,
            otherName: socket1.username,
            canMove: false
        });

        socket1.otherSocket = socket2.id;
        socket2.otherSocket = socket1.id;

        theArray.shift();
        theArray.shift();
    }
}

server.listen(PORT, () => {
    console.log("listening");
})
