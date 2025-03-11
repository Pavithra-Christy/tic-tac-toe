document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const status = document.getElementById("status");
    const resetButton = document.getElementById("reset");
    const pvpButton = document.getElementById("pvp");
    const aiButton = document.getElementById("ai");
    const aiDifficulty = document.getElementById("ai-difficulty");
    const themeToggle = document.getElementById("theme-toggle");
    const winnerPopup = document.getElementById("winner-popup");
    const winnerText = document.getElementById("winner-text");
    const closePopup = document.getElementById("close-popup");

    const clickSound = new Audio("click.mp3");
    const winSound = new Audio("win.wav");

    let currentPlayer = "X";
    let gameBoard = Array(9).fill(null);
    let gameOver = false;
    let aiEnabled = false;
    let difficulty = "hard"; // Default AI difficulty

    // Theme Toggle Button
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");
        themeToggle.textContent = document.body.classList.contains("dark-theme") ? "🌙" : "☀️";
    });

    // AI Difficulty Selection
    aiDifficulty.addEventListener("change", (e) => {
        difficulty = e.target.value;
    });

    // Check for a winner
    function checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
                return { winner: gameBoard[a], pattern };
            }
        }
        return gameBoard.includes(null) ? null : { winner: "Draw" };
    }

    // Handle user click
    function handleClick(index) {
        if (gameOver || gameBoard[index]) return;

        gameBoard[index] = currentPlayer;
        clickSound.currentTime = 0;
        clickSound.play();
        renderBoard();

        let result = checkWinner();
        if (result) {
            gameOver = true;
            if (result.winner === "Draw") {
                playDrawSound();
            } else {
                winSound.play();
                triggerConfetti();
            }
            showWinner(result.winner);
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
        status.textContent = `Player ${currentPlayer}'s Turn`;

        if (aiEnabled && currentPlayer === "O") {
            setTimeout(bestMove, 500);
        }
    }

    // Show winner in popup
    function showWinner(winner) {
        winnerText.textContent = winner === "Draw" ? "It's a Draw!" : `Player ${winner} Wins!`;
        winnerPopup.classList.remove("hidden");
        winnerPopup.classList.add("show-popup");
    }

    // Close popup and reset game
    closePopup.addEventListener("click", () => {
        winnerPopup.classList.add("hidden");
        winnerPopup.classList.remove("show-popup");
        resetGame();
    });

    // Render game board
    function renderBoard() {
        board.innerHTML = "";
        gameBoard.forEach((value, index) => {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.textContent = value || "";
            cell.addEventListener("click", () => handleClick(index));
            board.appendChild(cell);
        });
    }

    // Reset game
    function resetGame() {
        gameBoard.fill(null);
        currentPlayer = "X";
        gameOver = false;
        status.textContent = "Player X's Turn";
        renderBoard();
    }

    // AI Move based on difficulty
    function bestMove() {
        if (gameOver) return;
        
        let move;
        if (difficulty === "easy") {
            move = randomMove();
        } else if (difficulty === "medium") {
            move = Math.random() > 0.5 ? randomMove() : minimax([...gameBoard], 0, true).index;
        } else {
            move = minimax([...gameBoard], 0, true).index;
        }

        if (move !== null) handleClick(move);
    }

    // Minimax Algorithm for AI decision-making
    function minimax(board, depth, isMax) {
        let result = checkWinner();
        if (result) {
            if (result.winner === "X") return { score: -10 + depth };
            if (result.winner === "O") return { score: 10 - depth };
            return { score: 0 };
        }

        let bestMove = { score: isMax ? -Infinity : Infinity, index: null };
        board.forEach((val, i) => {
            if (!val) {
                board[i] = isMax ? "O" : "X";
                let score = minimax(board, depth + 1, !isMax).score;
                board[i] = null;
                if (isMax ? score > bestMove.score : score < bestMove.score) {
                    bestMove = { score, index: i };
                }
            }
        });
        return bestMove.index !== null ? bestMove : { score: 0, index: randomMove() };
    }

    // Get a random available move
    function randomMove() {
        const moves = gameBoard.map((val, i) => (!val ? i : null)).filter(v => v !== null);
        return moves.length ? moves[Math.floor(Math.random() * moves.length)] : null;
    }

    // Play sound effect for a draw
    function playDrawSound() {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.5);
    }

    // Confetti effect for winning
    function triggerConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    // Event Listeners for game modes
    pvpButton.addEventListener("click", () => {
        aiEnabled = false;
        resetGame();
        status.textContent = "Player X's Turn (PvP Mode)";
    });

    aiButton.addEventListener("click", () => {
        aiEnabled = true;
        resetGame();
        status.textContent = "Player X's Turn (Vs AI)";
    });

    // Reset button event listener
    resetButton.addEventListener("click", resetGame);

    // Initialize board
    renderBoard();
});
