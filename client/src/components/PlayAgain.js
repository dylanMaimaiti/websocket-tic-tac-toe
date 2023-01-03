import React from "react";

const PlayAgain = (props) => {

    const playingAgain = () => {
        console.log("a player wants to play again");
        //confirm other player still here
        //props.updatePlayAgain(true);
        if (props.opponentConnection) {
            console.log("Still connected");
            //need to wait for the other player to confirm
            props.emitPlayAgain();
            if (props.timerId !== "") {
                clearTimeout(props.timerId);
                props.refreshView(props.currentSymbol, props.otherSymbol, props.opName);
            }
            // props.resetGame();
        } else {
            console.log("they disconnected");
        }
        //then show 10 second countdown for other player to click play again
    }

    function getWaitingState() {
        //if opponent is still online
        if (props.opponentConnection) {
            return "Waiting for opponent";
        } else {
            return "Opponent has left";
        }
    }


    return (
        <div className="playAgainModal hiddenModal">
            <div className="playAgainModalContent">
                <div className="playAgainState">{getWaitingState()}</div>
                <div className="playAgainChoices">
                    <button id="playAgainButton" onClick={playingAgain}>Play again</button>
                    <button id="newMatchButton">New opponent</button>
                </div>
            </div>
        </div>
    );
};

export default PlayAgain;