import React, {useState, useEffect} from "react";
import PlayerSquare from "./PlayerSquare";
import Game from "./Game";
import "./styles.css";

const PlayTTT = (props) => {
    const [opName, setOpName] = useState("Finding...");
    const [symbolLeft, setSymbolLeft] = useState("");
    const [symbolRight, setSymbolRight] = useState("");
    const [gameState, setGameState] = useState("Matchmaking...");
    const [opStats, setOpStats] = useState({wins: 0, losses: 0, ties: 0});
    const [opUserName, setOpUserName] = useState("");
    useEffect(() => {
        if (opName !== "Finding...") {
            setGameState("Opponent connected!");
        }
    },[]);
 
    const sendLogout = async () => {
        const response = await fetch("http://localhost:3001/api/logout", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
        if (response.status !== 200) {
            console.log(response.body);
        } else {
            const readableResponse = await response.json();
            console.log(readableResponse);
            props.resetStats();
        }
    
    }

    return (
        <div className="viewContainer">
            <div className="gameStateContainer">{gameState}</div>
            <div className="playContainer">
                <PlayerSquare symbol={symbolLeft} playerStats={props.playerStats} userName={props.userName} displayName={props.displayName} />
                <Game updateGameState={setGameState} updateOpUserName={setOpUserName} opStats={opStats} updateOpStats={setOpStats} opName={opName} updateStats={props.updateStats} stats={props.playerStats} userName={props.userName} name={props.displayName} updateOpName={setOpName} symbol={symbolLeft} opSymbol={symbolRight} updateLeftSymbol={setSymbolLeft} updateRightSymbol={setSymbolRight} />
                <PlayerSquare symbol={symbolRight} playerStats={opStats} userName={opUserName} displayName={opName} />
            </div>
            <div className="logoutDiv">
                <button onClick={sendLogout} className="submitButton">Logout</button>
            </div>
        </div>
    );
};

export default PlayTTT;