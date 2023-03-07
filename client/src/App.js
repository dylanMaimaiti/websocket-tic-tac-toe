import './App.css';
import React, { useState } from "react";
import SignIn from "./components/SignIn.js";
import SignUp from "./components/SignUp.js";
import PlayTTT from "./components/PlayTTT.js";
import Error from "./components/Error.js";
import { Route, Routes, Navigate } from "react-router-dom";

function App() {
  //name will be display name
  const [name, setName] = useState("Unknown");
  const [username, setUsername] = useState("Unknown");
  const [stats, setStats] = useState({wins: 0, losses:0, ties: 0});

  const resetStats = () => {
    setName("Unknown");
    setUsername("Unknown");
    setStats({wins: 0, losses: 0, ties: 0});
  }

  return (
      <Routes>
        <Route path="/" element={name === "Unknown" ? <SignIn updateStats={setStats} updateUsername={setUsername} updateName={setName} /> : <Navigate to="/play" />} exact />
        <Route path="/play" element={name === "Unknown" ? <Navigate to="/" /> : <PlayTTT resetStats={resetStats}updateStats={setStats} playerStats={stats} userName={username} displayName={name} /> } />
        <Route path="/signup" element = {<SignUp />} />
        <Route path="*" element={<Error />} />
      </Routes>
  );
}

export default App;
