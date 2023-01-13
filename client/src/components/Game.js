import React, { useEffect, useState } from "react";
import PlayAgain from "./PlayAgain";
import "./styles.css";
import TicTacToe from "../TicTacToe";
const { io } = require("socket.io-client");
//seperated the front and back end
//by putting them on different servers
//can also remove the localhost to mean server is same port
//on connection include username 
const socket = io("http://localhost:3001", {
    autoConnect: false,
});

let gameT = new TicTacToe();
gameT.initBoard();
let playAgain = false;

const Game = (props) => {
    //just stores position number (1 based)
    let playerSelectedButtons = [];
    let symbol = props.symbol;
    let opSymbol = props.opSymbol;
    // let receivedAgain = false;
    const [opponentConnected, setOpponentConnected] = useState("");
    const [playAgainTimer, setPlayAgainTimer] = useState("");
    const [playAgainInterval, setPlayAgainInterval] = useState("");
    const [showPlayAgainButton, setShowPlayAgainButton] = useState(true);
    const [modalMessage, setModalMessage] = useState("");
    const [temporaryMessage, setTemporaryMessage] = useState("");


    const ensureCleanStates = () => {
        setOpponentConnected(false);
        setPlayAgainTimer("");
        setPlayAgainInterval("");
        setModalMessage("");
        setTemporaryMessage("");
        setShowPlayAgainButton(true);
    }

    useEffect(() => {
        socket.auth = {
            username: props.userName,
            displayName: props.name,
            stats: props.stats
        };
        socket.connect();
        disableAllButtons();

        socket.on("player connected", ({ otherSocket, from, yourSymbol, otherSymbol, otherName, playerData }) => {
            socket.otherSocket = otherSocket;
            ensureCleanStates();
            //props.updateLeftSymbol(yourSymbol);
            console.log("opponent was connected");
            setOpponentConnected(true);
            // console.log("here is their id: " + socket.otherSocket);
            // console.log("here is your id: " + socket.id);
            props.updateOpStats(playerData.stats);
            props.updateOpName(otherName);
            props.updateOpUserName(playerData.username);
            console.log(playerData.stats);
            
            console.log(props.opStats);
            props.updateLeftSymbol(yourSymbol);
            props.updateRightSymbol(otherSymbol);
            showInfoModal("Opponent found");
            //setModalMessage("Waiting for opponent");
            if (yourSymbol === "X") {
                props.updateGameState("It's your turn!");
                enablePlayableButtons();
            } else {
                props.updateGameState("It's " + otherName + "'s turn!");
                disableAllButtons();
            }
        });

        socket.on("player disconnected", () => {
            console.log("Socket recieved the other disconnected");
            setOpponentConnected(false);
            setModalMessage("Opponent has disconnected");
            console.log("The state of playagain = " + playAgain);
            if (!playAgain) {
                setModalMessage("");
                setTemporaryMessage("Opponent has disconnected");
            } else {
                setTemporaryMessage("");
            }
            props.updateGameState("Matchmaking...");
            disableAllButtons();
            setTimeout(() => {
                opponentIsGone();
                findNewGame();
            }, 1500);

        })

        socket.on("player move", ({ position, playerSymbol }) => {
            console.log("new position:" + position);
            // enablePlayableButtons();
            handleIncomingMove(position, playerSymbol);
            props.updateGameState("It's your turn!");
        });

        socket.on("game over", ({ message, isTie, stats }) => {
            console.log("receiving game over message");
            console.log("Opponent stats: " + stats);
            // console.log(props.opStats);
            if (isTie) {
                //opponent makes final move which ends game as tie
                updateStats("ties");
            } else {
                //they win
                updateStats("losses");
            }
            props.updateOpStats(stats);
            endGame(message);
        });

        socket.on("winning cells", ({ pos1, pos2, pos3 }) => {
            console.log("received the winning cells");
            highlightWin(pos1, pos2, pos3, false);
        });

        //means the other player wants to play again
        socket.on("play again", ({ mySymbol, yourSymbol, name }) => {
            console.log("Other player wants to play again");
            setTemporaryMessage("");
            //didn't click play again first
            if (!playAgain) {
                //wait 5 seconds if the current player has not yet hit play again
                let intervalId;

                let timerId = setTimeout(() => {
                    if (playAgain) {
                        refreshViewAfterPlayAgain(mySymbol, yourSymbol, name);
                    } else {
                        console.log("Opponent didn't hit play");
                        if (intervalId) {
                            clearInterval(intervalId);
                        }
                        notPlayingAgain();
                        return;
                    }
                }, "6500");
                setPlayAgainTimer(timerId);
                let timeCounter = 5;
                intervalId = setInterval(() => {
                    console.log("timer");
                    setModalMessage("Your opponent would like to play again:\n\nYou have " + timeCounter + " seconds to respond.");
                    timeCounter--;
                }, 1000);
                setPlayAgainInterval(intervalId);
            } else {
                //idk why I swapped the 2
                refreshViewAfterPlayAgain(yourSymbol, mySymbol, name);
            }

        });

        socket.on("clear game", () => {
            resetGame();
        });

        socket.on("not playing again", () => {
            playAgain = false;
            setShowPlayAgainButton(false);
            setTemporaryMessage("");
            setModalMessage("Your opponent did not want to play again");
        })

    }, []);


    //hide the play again button in the modal
    const notPlayingAgain = () => {
        setShowPlayAgainButton(false);
        playAgain = false;
        setTemporaryMessage("");
        setModalMessage("You did not want to play again");
        socket.emit("not playing again", {
            to: socket.otherSocket
        });
    }

    const refreshViewAfterPlayAgain = (mySymbol, yourSymbol, name) => {
        //need to swap symbols
        symbol = yourSymbol;
        opSymbol = mySymbol
        props.updateLeftSymbol(symbol);
        props.updateRightSymbol(opSymbol);
        if (symbol === "X") {
            props.updateGameState("It's your turn!");
            enablePlayableButtons();
        } else {
            props.updateGameState("It's " + name + "'s turn!");
            disableAllButtons();
        }
        playAgain = false;
        setShowPlayAgainButton(true);
        setTemporaryMessage("");
        setModalMessage("Waiting for opponent");
        emitStats();
        resetGame();
    }

    const emitToServer = (cell) => {
        props.updateGameState("It's " + props.opName + "'s turn!");
        socket.emit("player move", {
            position: cell,
            playerSymbol: symbol,
            to: socket.otherSocket,
        });
    }

    //need to update the socket object with the new stats
    const emitStats = () => {
        socket.emit("updated stats", {
            stats: props.stats,
        });
    }

    const emitGameOver = () => {
        console.log("game is over");
        let gameWinner;
        let wasTie;
        if (gameT.checkWinner()) {
            gameWinner = props.name;
            wasTie = false;
        } else if (gameT.checkTie()) {
            wasTie = true;
            gameWinner = "It was a tie!";
        }
        let newStats;
        if (wasTie) {
            newStats = updateStats("ties");
            emitGameOverToServer(newStats, wasTie);
            endGame("The game was tied!");
        } else {
            newStats = updateStats("wins");
            emitGameOverToServer(newStats, wasTie);
            endGame("You have won!");
        }
    }

    const emitGameOverToServer = (newStats, wasTie) => {
        socket.emit("game over", {
            isTie: wasTie,
            winner: props.name,
            to: socket.otherSocket,
            from: socket.id,
            stats: newStats
        });
    }

    const updateStats = (theStat) => {
        let theOpStats = props.opStats;
        if (theStat === "ties") {
            theOpStats.ties = theOpStats.ties + 1;
        } else if (theStat === "losses") {
            theOpStats.wins = theOpStats.wins + 1;
        } else if (theStat === "wins") {
            theOpStats.losses = theOpStats.losses + 1;
        }
        let currentStats = props.stats;
        currentStats[theStat] = currentStats[theStat] + 1;
        props.updateStats(currentStats);

        updateServerStats(currentStats);
        return currentStats;
    }

    //update database everytime stats updates 
    async function updateServerStats(newStats) {
        let response = await fetch("http://localhost:3001/api/updateStats", {
            method: "PUT",
            body: JSON.stringify({
                username: props.userName,
                stats: newStats
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
        let readableResponse = await response.json();
        console.log(readableResponse);
    }

    const emitWinningCells = (theCells) => {
        socket.emit("winning cells", {
            pos1: theCells[0],
            pos2: theCells[1],
            pos3: theCells[2],
            to: socket.otherSocket
        });
        highlightWin(theCells[0], theCells[1], theCells[2], true);
    }

    //used to show temporary lasting messages using the play again modal
    const showInfoModal = (message) => {
        setTemporaryMessage(message);

    }

    const opponentIsGone = () => {
        //setTemporaryMessage("Opponent has left");
        //setShowPlayAgainButton(false);
        props.updateOpName("Finding...");
        props.updateOpUserName("");
        props.updateOpStats({});
        props.updateRightSymbol("");
    }

    //highlight the 3 winning cells, depending on who won it'll be a different color
    //green if the client won, red if the opponent won
    const highlightWin = (cell1, cell2, cell3, youWon) => {
        let element1 = document.querySelector("#gameButton" + cell1);
        let element2 = document.querySelector("#gameButton" + cell2);
        let element3 = document.querySelector("#gameButton" + cell3);

        let winningClass = "losingCell";
        if (youWon) {
            winningClass = "winningCell";
        }
        element1.classList.toggle(winningClass);
        element2.classList.toggle(winningClass);
        element3.classList.toggle(winningClass);
    }


    const endGame = (msg) => {
        setTemporaryMessage("");
        setModalMessage("Game over. Want to play again?");
        props.updateGameState(msg);
        disableAllButtons();
        showPlayAgain();
    }

    const handleIncomingMove = (position, playerSymbol) => {
        gameT.makeMove(position, playerSymbol);
        let chosenButton = document.getElementById("gameButton" + position);
        chosenButton.disabled = true;
        chosenButton.textContent = playerSymbol;
        playerSelectedButtons.push(position);
        disableAllButtons();
        enablePlayableButtons();
    }

    const buttonHandler = (event) => {
        console.log(event);
        let whichButton = event.target.id;
        //this is 1 based. So last cell is 9, first is 1
        let whichCellNum = whichButton[whichButton.length - 1];
        //if good move disable selected button
        if (gameT.makeMove(whichCellNum, symbol) === true) {
            let chosenButton = document.getElementById(whichButton);
            chosenButton.disabled = true;
            chosenButton.textContent = symbol;
            disableAllButtons();
            playerSelectedButtons.push(whichCellNum);
            emitToServer(whichCellNum);
            if (gameT.isGameOver() === true) {
                if (gameT.checkWinner()) {
                    emitWinningCells(gameT.getWinningCells());
                }
                emitGameOver();
            }

        }
    };

    function disableAllButtons() {
        let partialId = "gameButton";
        for (let i = 1; i <= 9; i++) {
            document.getElementById(partialId + i).disabled = true;
        }
    }

    function enablePlayableButtons() {
        let partialId = "gameButton";
        for (let i = 1; i <= 9; i++) {
            //some button was not clicked, so re-enable
            if (!playerSelectedButtons.includes(i)) {
                document.getElementById(partialId + i).disabled = false;
            }
        }
    }

    function showPlayAgain() {
        let modal = document.querySelector(".playAgainModal");
        if (modal.classList.contains("hiddenModal")) {
            modal.classList.toggle("hiddenModal");
            setShowPlayAgainButton(true);
        }
    }

    function hidePlayAgain() {
        let modal = document.querySelector(".playAgainModal");
        if (!modal.classList.contains("hiddenModal")) {
            modal.classList.toggle("hiddenModal");
        }
    }

    //resets the game object, the game view and hides the play again modal
    function resetGame() {
        gameT = new TicTacToe();
        gameT.initBoard();
        playerSelectedButtons = [];
        for (let i = 1; i <= 9; i++) {
            let button = document.querySelector("#gameButton" + i);
            button.textContent = "";
            if (button.classList.contains("winningCell")) {
                button.classList.remove("winningCell");
            }
            if (button.classList.contains("losingCell")) {
                button.classList.remove("losingCell");
            }
        }
        playAgain = false;
        setPlayAgainTimer("");
        hidePlayAgain();
    }

    function emitPlayAgain() {
        //only emit if the other player has not emitted

        console.log("play again was emitted");
        setTemporaryMessage("");
        setModalMessage("Waiting for opponent");
        playAgain = true;

        socket.emit("play again", {
            mySymbol: symbol,
            yourSymbol: opSymbol,
            name: props.name,
            to: socket.otherSocket
        });
        //after we emit then we should hide the button to prevent multiple emits
        setShowPlayAgainButton(false);
    }

    function findNewGame() {
        socket.emit("find new game");
        emitStats();
        props.updateGameState("Matchmaking...");
        if (opponentConnected) {
            socket.emit("not playing again", {
                to: socket.otherSocket
            });
        }
        //clear board and reset view
        resetGame();
        //clear symbol and opponent name
        props.updateLeftSymbol("");
        // props.updateRightSymbol("");
        // props.updateOpName("Finding...");
        opponentIsGone();
        setShowPlayAgainButton(true);
        setTemporaryMessage("");
        setModalMessage("Waiting for opponent");
        playAgain = false;
    }

    return (
        <div className="gameContainer">
            <PlayAgain modifyTempMessage={setTemporaryMessage} tempMessage={temporaryMessage} newGame={findNewGame} modalMessage={modalMessage} showButton={showPlayAgainButton} emitPlayAgain={emitPlayAgain} currentSymbol={symbol} otherSymbol={opSymbol} opName={props.opName} refreshView={refreshViewAfterPlayAgain} intervalId={playAgainInterval} timerId={playAgainTimer} opponentConnection={opponentConnected} />
            <button id="gameButton1" onClick={(event) => buttonHandler(event)}></button>
            <button id="gameButton2" onClick={(event) => buttonHandler(event)}></button>
            <button id="gameButton3" onClick={(event) => buttonHandler(event)}></button>
            <button id="gameButton4" onClick={(event) => buttonHandler(event)}></button>
            <button id="gameButton5" onClick={(event) => buttonHandler(event)}></button>
            <button id="gameButton6" onClick={(event) => buttonHandler(event)}></button>
            <button id="gameButton7" onClick={(event) => buttonHandler(event)}></button>
            <button id="gameButton8" onClick={(event) => buttonHandler(event)}></button>
            <button id="gameButton9" onClick={(event) => buttonHandler(event)}></button>
        </div>
    );
};

export default Game;