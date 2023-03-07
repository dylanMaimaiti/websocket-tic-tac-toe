import React, { useEffect } from "react";

const PlayerSquare = (props) => {
    
    useEffect(() => {
        let element = document.querySelectorAll(".playerContainer");
        let homeElement = element[0];
        element = element[element.length-1];
        if (!homeElement.classList.contains("homePlayerGlow")) {
            homeElement.classList.toggle("homePlayerGlow");
        }
        if (props.name === "Finding...") {
            if (!element.classList.contains("searchingForPlayer")) {
                element.classList.toggle("searchingForPlayer");
            }
            
        } else {
            if (element.classList.contains("searchingForPlayer")) {
                element.classList.toggle("searchingForPlayer");
            }
        }
    }, [props.name]);

    return (
        
        <div className="playerContainer">
            <div className="displayPlayerName">{props.displayName}</div>
            <div className="displayUsername">@{props.userName}</div>
            <div className="statsContainer">
                <div className="winStats">Wins: {props.playerStats.wins}</div>
                <div className="lossStats">Losses: {props.playerStats.losses}</div>
                <div className="tieStats">Ties: {props.playerStats.ties}</div>
            </div>
            <div className="playerSymbol">Symbol: {props.symbol}</div>
        </div>
    )
}

export default PlayerSquare;