import React, { useEffect, useState } from "react";

const PlayAgain = (props) => {

    const [stateMessage, setStateMessage] = useState("");

    const playingAgain = () => {
        console.log("a player wants to play again");
        //confirm other player still here
        if (props.opponentConnection) {
            console.log("Still connected");
            //need to wait for the other player to confirm
            props.emitPlayAgain();
            if (props.timerId !== "") {
                clearInterval(props.intervalId);
                clearTimeout(props.timerId);
                props.refreshView(props.currentSymbol, props.otherSymbol, props.opName);
            }
        } else {
            console.log("they disconnected");
        }
        //then show 10 second countdown for other player to click play again
    }

    useEffect(() => {
        //have an actual temporary message
        if (props.tempMessage !== "") {
            setStateMessage(props.tempMessage);
            //add animation to the play again modal
            let modal = document.querySelector(".playAgainModal");
            //if modal has rendered
            if (modal) {
                //remove hiddenModal
                let hiddenClass = document.querySelector(".hiddenModal");
                //a class with hidden modal is found
                //only shows if the play again modal is not already being shown
                if (modal.classList.contains("hiddenModal")) {
                    modal.classList.toggle("hiddenModal");
                    modal.classList.toggle("animateTempMessage");
                    setTimeout(() => {
                        //restore the hidden modal class
                        //get the dom element again, since 5 seconds is enough for their to be a change
                        modal = document.querySelector(".playAgainModal");
                        if (!modal.classList.contains("hiddenModal")) {
                            modal.classList.toggle("hiddenModal");
                        }
                        modal.classList.toggle("animateTempMessage");
                        props.modifyTempMessage("");
                        setStateMessage("");
                    }, 5000);
                }
            }
        }
    }, [props.tempMessage]);

    useEffect(() => {
        if (props.modalMessage !== "") {
            setStateMessage(props.modalMessage);
        }
    }, [props.modalMessage]);

    return (
        <div className="playAgainModal hiddenModal">
            <div className="playAgainModalContent">
                <div className="playAgainState">{stateMessage}</div>
                <div className="playAgainChoices">
                    {props.showButton && props.tempMessage === "" ? <button id="playAgainButton" onClick={playingAgain}>Play again</button> : null }
                    {props.tempMessage === "" ? <button id="newMatchButton" onClick={props.newGame}>New opponent</button> : null}
                </div>
            </div>
        </div>
    );
};

export default PlayAgain;