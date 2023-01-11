import './App.css';
import React, { useState } from "react";
import SignIn from "./components/SignIn.js";
import SignUp from "./components/SignUp.js";
import PlayTTT from "./components/PlayTTT.js";
import Error from "./components/Error.js";
import { Route, Routes, Navigate } from "react-router-dom";

function App() {
  const [name, setName] = useState("Unknown");

  // const loadNameFromStorage = () => {
  //   let savedName = localStorage.getItem("playerName");
  //   if (savedName) {
  //     setName(savedName);
  //   }
  // };

  // useEffect( () => {
  //   loadNameFromStorage();
  // }, []);
  

  return (
      <Routes>
        <Route path="/" element={name === "Unknown" ? <SignIn updateName={setName} /> : <Navigate to="/play" />} exact />
        <Route path="/play" element={name === "Unknown" ? <Navigate to="/" /> : <PlayTTT username={name} /> } />
        <Route path="/signup" element = {<SignUp />} />
        <Route path="*" element={<Error />} />
      </Routes>
  );
}

export default App;
