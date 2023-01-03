import React, {useState, useEffect} from "react";
import PlayerSquare from "./PlayerSquare";
import Game from "./Game";
import "./styles.css";

const PlayTTT = (props) => {
    //should prob make these state
    const [opName, setOpName] = useState("Finding...");
    const [symbolLeft, setSymbolLeft] = useState("");
    const [symbolRight, setSymbolRight] = useState("");
    const [gameState, setGameState] = useState("Matchmaking...");

    useEffect(() => {
        if (opName !== "Finding...") {
            setGameState("Opponent connected!");
        }
    },[]);
 
    return (
        <div className="viewContainer">
            <div className="gameStateContainer">{gameState}</div>
            <div className="playContainer">
                <PlayerSquare symbol={symbolLeft} name={props.username} />
                <Game updateGameState={setGameState} opName={opName} name={props.username} updateOpName={setOpName} symbol={symbolLeft} opSymbol={symbolRight} updateLeftSymbol={setSymbolLeft} updateRightSymbol={setSymbolRight} />
                <PlayerSquare symbol={symbolRight} name={opName} />
            </div>
        </div>
        
    );
};

export default PlayTTT;