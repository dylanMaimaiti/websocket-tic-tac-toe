function TicTacToe() {
    let numCells = 9;
    let board = [numCells];
    let winningCells = [3];

    function initBoard() {
        for (let i = 0; i < 9; i++) {
            board[i] = " ";
        }
    }

    function makeMove(cellNum, aSymbol) {
        let arrayPosition = cellNum - 1;
        //this means already selected
        // if (playerSelectedButtons.includes(cellNum)) {
        //     return false;
        // }
        if (board[arrayPosition] === " ") {
            board[arrayPosition] = aSymbol;
            return true;
        } else {
            return false;
        }
    }

    function checkWinner() {
        if (checkVerticalWinner() || checkHorizontalWinner() || checkDiagonalWinner()) {
            return true;
        } else {
            return false;
        }
    }

    function checkDiagonalWinner() {
        if (board[0] !== " ") {
            if (board[0] === board[4] && board[0] === board[8]) {
                winningCells = [0, 4, 8];
                return true;
            }
        }

        if (board[2] !== " ") {
            if (board[2] === board[4] && board[2] === board[6]) {
                winningCells = [2, 4, 6];
                return true;
            }
        }
        return false;
    }

    function checkHorizontalWinner() {
        for (let i = 0; i < 9; i += 3) {
            if (board[i] !== " ") {
                if (board[i] === board[i + 1] && board[i] === board[i + 2]) {
                    //console.log("horizontal prob");
                    winningCells = [i, i + 1, i + 2];
                    return true;
                }
            }
        }
        return false;
    }

    function checkVerticalWinner() {
        for (let i = 0; i < 3; i++) {
            if (board[i] !== " ") {
                if (board[i] === board[i + 3] && board[i] === board[i + 6]) {
                    //console.log("vertical prob");
                    winningCells = [i, i + 3, i + 6];
                    return true;
                }
            }
        }
        return false;
    }

    function checkTie() {
        for (let i = 0; i < numCells; i++) {
            if (board[i] === " ") {
                return false;
            }
        }
        return true;
    }

    function isGameOver() {
        if (checkWinner() === true) {
            return true;
        }
        if (checkTie() === true) {
            return true;
        }
        return false;
    }

    function getWinningCells() {
        let cellArray = [3];
        cellArray[0] = winningCells[0] + 1;
        cellArray[1] = winningCells[1] + 1;
        cellArray[2] = winningCells[2] + 1;
        return cellArray;
    }

    function toString() {
        let theString = " ";
        for (let i = 0; i < numCells; i++) {
            theString += board[i] + ", ";
        }
        return theString;
    }

    return { makeMove, checkWinner, checkTie, isGameOver, initBoard, getWinningCells, toString }
}

export default TicTacToe;