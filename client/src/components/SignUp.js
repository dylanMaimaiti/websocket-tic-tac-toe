import React from "react";
import { useNavigate } from "react-router";

const SignUp = () => {

    function checkUsername(event) {
        event.preventDefault();
        const username = document.getElementById("username").value;
        const display = document.getElementById("displayname").value;
        fetch("http://localhost:3001/api/user", {
            method: "POST",
            body: JSON.stringify({
                username: username,
                displayName: display,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then((response) => {
            console.log(response.status);
            response.json().then((result) => {
                console.log(result);
                const { userCreated, message } = result;
                if (userCreated) {
                    //can put up a little modal with a button to the login page
                    let modal = document.querySelector(".signUpModal");
                    if (modal.classList.contains("hiddenModal")) {
                        modal.classList.toggle("hiddenModal");
                    }
                } else {
                    //a message saying that user is taken
                    let input = document.querySelector("#username");

                    let validityMessage = message;

                    input.setCustomValidity(validityMessage);
                }
            })
        })
            .catch(err => console.log(err));
    }

    let navigate = useNavigate();
    const backToLogin = () => {
        let modal = document.querySelector(".signUpModal");
        if (!modal.classList.contains("hiddenModal")) {
            modal.classList.toggle("hiddenModal");
        }
        let newPath = "/";
        navigate(newPath);
    }


    return (
        <div className="signUpContainer" >
            <form onSubmit={(event) => checkUsername(event)}>
                <label name="username">Enter a username</label>
                <input type="text" id="username" required></input>
                <label name="displayname">Enter a display name</label>
                <input type="text" id="displayname" required></input>
                <button type="submit" className="submitButton" id="signUpSubmit">Submit</button>
            </form>
            <div className="signUpModal modalPopup hiddenModal">
                <div className="modalContent">
                    <div className="modalMessage">Your account was made</div>
                    <button className="submitButton" onClick={backToLogin}>Login</button>
                </div>
            </div>
        </div>
    );
}

export default SignUp;