import React, { useState } from "react";
import "./styles.css";
import { redirect, useNavigate } from "react-router";

const SignIn = (props) => {

    const [signingUp, setSigningUp] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        let userNameField = document.querySelector("#username");
        let name = userNameField.value;
        userNameField.value = "";
        fetch("http://localhost:3001/api/login?username=" + name, {
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then((response) => {
            console.log("Status = " + response.status);
            if (response.status !== 200) {
                //do some error handling
            } else {
                response.json().then((result) => {
                    console.log(result);
                    if (result.notfound) {
                        let input = document.querySelector("#username");
                        input.setCustomValidity("That user does not exist!");
                    } else {
                        props.updateName(result.displayName);
                        props.updateUsername(result.username);
                        props.updateStats(result.stats);
                    }
                });   
            }
        })
    }

    // const validateUsername = () => {
    //     let input = document.querySelector("#username");
    //     let userInput;
    //     userInput = input.value;
    //     let validityMessage = "Username cannot be all spaces!";
    //     for (let i = 0; i < userInput.length; i++) {
    //         if (userInput[i] !== " ") {
    //             validityMessage = "";
    //         }
    //     }

    //     if (userInput.length === 0) {
    //         validityMessage = "Cannot have an empty username!";
    //     }

    //     input.setCustomValidity(validityMessage);
    // }

    let navigate = useNavigate();

    const redirectToSignUp = () => {
        let newPath = "/signup";
        navigate(newPath);
    }

    return (
        <div>
            <div className="signContainer">
                <form onSubmit={(event) => handleSubmit(event)}>
                    <label htmlFor="username1">Enter your username:</label>
                    <input type="text" name="username1" id="username" required="required"></input>
                    <button type="submit" className="submitButton">Play!</button>
                </form>
                <div onClick={redirectToSignUp} className="submitButton">
                    Sign up
                </div>
            </div>
        </div>
    );
};

export default SignIn;