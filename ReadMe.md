# Websocket Tic-Tac-Toe using Socket.io (Work in Progress)

## Description
- This is a fullstack 2 player game with real time communication of player moves sent using the Socket.io library (which uses websockets)
- The front end is written in React, HTML, and CSS
- The backend is written in Node.js, Express and uses the Socket.io library
- The database is MongoDB and I used their cloud service (Atlas). I also used the Mongoose library to simplify handling the database
- For client-server communication the Socket.io library is used and it's underlying technology is websockets(sometimes HTTP long polling)
- This is still a work in progress. Currently implementing user authentication
- You can see what it looks like below the Features paragraph

## Features
- Players can have accounts that will store their statistics in a document database. Their display names, unique username, wins, losses, and ties will be stored
- When a player enters the game they are put into a queue of other waiting players. When there are two players in the queue they are put in their own rooms (Socket.io) where they can play the game
- After the game ends (win or tie) both players get the option to request to the other to play again or to find new opponents
  - The find new opponent feature will set a random 0 to 0.5 second long delay before re-entering a player into matchmaking
  - This is done to reduce the number of times players will immediately play against eachother again

## What it looks like

## What I have learned
- Initially I thought that websockets would be the ideal technology for this project and only after nearly completing it that I learned about other client to client message passing technologies that would reduce latency.
  - Instead of emitting an event to the server and having the server emit to the other client, skipping the server would have improved performance.
- I used a NoSQL database like MongoDB because I didn't need the relations of an SQL one. The data I am storing is very simple and only relates to one user/id
- I used Node and Express for the backend API's since I could code them in JavaScript.


## Trying it out
- The only way (currently) to play the game is by cloning the repository and setting up a new database connection for MongoDB cloud atlas
- Then just add the connection in the server file and it should work
- To run the local server you will need to open two terminals
  - I served the front-end/view on a different port then the server and it's API endpoints
  - For the front-end you can use npm start to start the dev server
  - For the server use nodemon while being in the server directory
- Also, after cloning remember to install all the dependencies!

### Created by Dylan Maimaiti