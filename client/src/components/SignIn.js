import React, { useState } from "react";
import "./styles.css";
import { redirect, useNavigate } from "react-router";

const SignIn = (props) => {

    const [signingUp, setSigningUp] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        let userNameField = document.querySelector("#username");
        let passField = document.querySelector("#password");
        let name = userNameField.value;
        let pass = passField.value;
        passField.value = "";
        userNameField.value = "";
        let errorMessage = document.querySelector(".loginMessage");
        //errorMessage.classList.toggle("hiddenModal");
        fetch("http://localhost:3001/api/login", {
            method: "POST",
            credentials: 'include',
            body: JSON.stringify({
                username: name,
                password: pass,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then((response) => {
            console.log("Status = " + response.status);
            //server returns 401 on unauthorized
            if (response.status !== 200) {
                //do some error handling
                console.log("Success error handler");
                if (errorMessage.classList.contains("hiddenModal")) {
                   errorMessage.classList.toggle("hiddenModal"); 
                }
                
            } else {
                //valid login
                errorMessage.classList.toggle("hiddenModal");
                response.json().then((result) => {
                    console.log(result);
                    
                    props.updateName(result.displayName);
                    props.updateUsername(result.username);
                    props.updateStats(result.stats);
                }).catch((err) => {

                });
            }
        }).catch((err) => {
            console.log("unauthed");
        })
    }

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
                    <label htmlFor="password">Enter your password:</label>
                    <input name="password" type="password" id="password" required></input>
                    <button type="submit" className="submitButton">Play!</button>
                </form>
                <div className="loginMessage hiddenModal">
                    <h4>Incorrect username or password!</h4>
                </div>
                <div onClick={redirectToSignUp} className="submitButton">
                    Sign up
                </div>
            </div>
        </div>
    );
};

export default SignIn;