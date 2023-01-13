const express = require("express");
const http = require("http");
const app = express();
const User = require("./models/user.js");
const mongoose = require("mongoose");
const Config = require("./config.js");
const server = http.createServer(app);
const { Server } = require("socket.io");
//the front end and back end now live seperately
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    }
});
const PORT = 3001;

const dbURI = Config.db;
mongoose.connect(dbURI).then((result) => {
    console.log("connected to db");
    //listen for requests after connecting to db
    server.listen(PORT, () => {
        console.log("listening");
    })
}).catch((error) => {
    console.log("There is an error: " + error);
});


app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const waitingPlayers = [];


app.get("/api/login", (req, res) => {
    res.setHeader("Content-type", "application/json");
    let username = req.query.username;
    let display = username;

    let response;
    //check db for user
    User.find({username: username}, (err, data) => {
        //console.log(data);
        let user = data[0];
        if (!err) {
            if (data && data.length === 1) {
                response = {
                    id: user._id,
                    username: user.username,
                    displayName: user.displayName,
                    stats: user.stats
                }
            } else {
                response = {
                    notfound: true
                }
            }
        } else {
            console.log(err);
            res.status(500).end(JSON.stringify("Server error"));
        }
        //this should return data from the database thats relevant to the user
        res.status(200).end(JSON.stringify(response));
    })
    
});


app.post("/api/newUser", (req, res) => {
    res.setHeader("Content-type", "application/json");
    let userData = (req.body);
    console.log(userData);
    userData.stats = {
        wins: 0,
        losses: 0,
        ties: 0
    }
    const theResponse = {
        userCreated: false,
        message: "",
    }

    //make sure username and displayname are valid
    //will strip all $
    if ((userData.username).includes("$") || (userData.displayName).includes("$") || (userData.username).length == 0 || (userData.displayName).length == 0) {
        //return bad input message
        theResponse.message = "Invalid username";
        res.end(JSON.stringify(theResponse));
    }
    res.statusCode = 201;
                        theResponse.userCreated = true;
                        theResponse.message = "some id";
                        res.end(JSON.stringify(theResponse));
    const user = new User(userData);
    //checking if user exists
    User.find({ username: userData.username }, (err, docs) => {
        if (err) {
            console.log(err);
            theResponse.message = "There was an error with the database";
            res.end(JSON.stringify(theResponse));
        } else {
            //console.log(docs);
            if (docs) {
                //valid username so create document
                if (docs.length == 0) {
                    user.save().then((result) => {
                        //new document created
                        res.statusCode = 201;
                        theResponse.userCreated = true;
                        theResponse.message = result._id;
                        res.end(JSON.stringify(theResponse));
                    })
                } else {
                    //res.statusCode = 406;
                    theResponse.message = "That username is taken";
                    res.end(JSON.stringify(theResponse));
                }
            } else {
                //need to return that something went wrong
                theResponse.message = "Something went wrong";
                res.statusCode = 500;
                res.end(JSON.stringify(theResponse));
            }
        }
    })
})

app.put("/api/updateStats", (req, res) => {
    //console.log(req.body);
    let updateUser;
    let response = {
        saved: false
    }
    //finding the existing user document, then will save the update
    User.find({username: req.body.username}, (err, results) => {
        if (!err && results.length !== 0) {
            updateUser = results[0];
            updateUser.stats = req.body.stats;
            updateUser.save().then((result) => {
                if (result === updateUser) {
                    response.saved = true;
                } else {
                    res.end(JSON.stringify(response));
                }
            }).catch((err) => {
                res.end(JSON.stringify(response));
            });
        } else {
            res.end(JSON.stringify(response));
        }
    })
});


io.on('connection', (socket) => {
    socket.playerData = socket.handshake.auth;

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

        setTimeout(() => {
            matchmake(waitingPlayers);
        }, "500");
    })


    console.log("connection to socket");
    console.log(socket.id);
    waitingPlayers.push(socket);

    matchmake(waitingPlayers);

    socket.on("player move", ({ position, to, playerSymbol }) => {
        socket.to(to).emit("player move", { position, playerSymbol });
    });

    socket.on("winning cells", ({ pos1, pos2, pos3, to }) => {
        socket.to(to).emit("winning cells", { pos1, pos2, pos3 });
    })

    socket.on("game over", ({ isTie, winner, to, from }) => {
        console.log("server received game over");
        if (isTie) {
            socket.to(to).emit("game over", {
                message: "The game was tied!",
                isTie: isTie,
            });
        } else {
            socket.to(to).emit("game over", {
                message: winner + " has won!",
                isTie: isTie,
            });
        };
    });

    socket.on("not playing again", ({ to }) => {
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

    socket.on("play again", ({ mySymbol, yourSymbol, name, to }) => {
        //emit to both players
        socket.to(to).emit("play again", { mySymbol, yourSymbol, name });
    });

    socket.on("clear game", ({ to }) => {
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
            otherName: socket2.playerData.displayName,
            canMove: true,
            playerData: socket2.playerData
        });

        socket1.to(socket2.id).emit("player connected", {
            otherSocket: socket1.id,
            yourSymbol: "O",
            otherSymbol: "X",
            from: socket1.id,
            otherName: socket1.playerData.displayName,
            canMove: false,
            playerData: socket1.playerData
        });

        socket1.otherSocket = socket2.id;
        socket2.otherSocket = socket1.id;

        theArray.shift();
        theArray.shift();
    }
}    

//cannot connect to db right now at uni
// server.listen(PORT, () => {
//     console.log("listening");
// })