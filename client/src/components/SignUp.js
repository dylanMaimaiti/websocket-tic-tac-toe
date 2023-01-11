import React from "react";

const SignUp = () => {

    function checkUsername(event) {
        event.preventDefault();
        fetch("http://localhost:3001/api/confirmUnique", {
            method: "POST",
            body: JSON.stringify({
                userId: 1,
                title: "Fix my bugs",
                completed: false
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then((response) => response.json().then((result) => {
            console.log(result);
        }))
        .catch(err => console.log(err));

    }

    return (
        <div className="signUpContainer" >
            <form onSubmit={(event) => checkUsername(event)}>
                <label name="username">Enter a username</label>
                <input type="text" id="username" required></input>
                <label name="displayname">Enter a display name</label>
                <input type="text" id="displayname" required></input>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default SignUp;