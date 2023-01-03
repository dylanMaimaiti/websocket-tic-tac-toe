import React from "react";
import "./styles.css";

const SignIn = (props) => {

    const handleSubmit = (event) => {
        event.preventDefault();
        let userNameField = document.querySelector("#username");
        let name = userNameField.value;
        userNameField.value = "";
        //saveName(name);
        props.updateName(name);
        return false;
    }

    // const saveName = (username) => {
    //     //localStorage.setItem("playerName", username);
    // }

    const validateUsername = () => {
        let input = document.querySelector("#username");
        let userInput;
        userInput = input.value;
        let validityMessage = "Username cannot be all spaces!";
        for (let i = 0; i < userInput.length; i++) {
            if (userInput[i] !== " ") {
                validityMessage = "";
            }
        }

        if (userInput.length === 0) {
            validityMessage = "Cannot have an empty username!";
        }

        input.setCustomValidity(validityMessage);
    }


    return (
        <div className="signContainer">
            <form onSubmit={(event) => handleSubmit(event)}>
                <label htmlFor="username1">Enter your username:</label>
                <input type="text" name="username1" id="username" onInput={validateUsername} required="required"></input>
                <button type="submit">Play!</button>
            </form>
        </div>
    );
};

export default SignIn;