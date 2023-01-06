import React, { useEffect } from "react";

const PlayerSquare = (props) => {
    
    useEffect(() => {
        let element = document.querySelectorAll(".playerContainer");
        let homeElement = element[0];
        element = element[element.length-1];
        if (!homeElement.classList.contains("homePlayerGlow")) {
            homeElement.classList.toggle("homePlayerGlow");
        }
        console.log(props.name);
        if (props.name === "Finding...") {
            if (!element.classList.contains("searchingForPlayer")) {
                element.classList.toggle("searchingForPlayer");
            }
            
        } else {
            if (element.classList.contains("searchingForPlayer")) {
                element.classList.toggle("searchingForPlayer");
                //TODO:
                //make a function that will add the class for player found with a simple animation
            }
        }
    }, [props.name]);

    return (
        
        <div className="playerContainer">
            <div className="displayPlayerName">{props.name}</div>
            <div className="playerSymbol">Symbol: {props.symbol}</div>
        </div>
    )
}

export default PlayerSquare;