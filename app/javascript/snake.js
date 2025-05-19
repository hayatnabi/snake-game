document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const scoreDisplay = document.getElementById("scoreDisplay");
    const gameMessage = document.getElementById("gameMessage");
    const restartButton = document.getElementById("restartButton");
  
    const box = 20;
    let score = 0;
    let snake;
    let food;
    let direction;
    let game; // Interval ID
    let gameRunning = false;
    let gameOver = false;
  
    function initGame() {
        score = 0;
        snake = [{ x: 9 * box, y: 10 * box }];
        food = {
            x: Math.floor(Math.random() * 19 + 1) * box,
            y: Math.floor(Math.random() * 19 + 1) * box
        };
        direction = null;
        gameRunning = false;
        gameOver = false;
        scoreDisplay.innerText = `Score: ${score}`;
        gameMessage.innerText = "Press any arrow key to start";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        location.reload
        restartButton.style.display = "none"; // 👈 hide at start or restart
        draw(); // Draws snake and food at game start initially.
    }
  
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      // Draw snake
      for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "green" : "lightgreen";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
      }
  
      // Draw food
      ctx.fillStyle = "red";
      ctx.fillRect(food.x, food.y, box, box);
  
      // Don't move if no direction (game hasn't started yet)
      if (!direction) return;
  
      let headX = snake[0].x;
      let headY = snake[0].y;
  
      if (direction === "LEFT") headX -= box;
      if (direction === "UP") headY -= box;
      if (direction === "RIGHT") headX += box;
      if (direction === "DOWN") headY += box;
  
      // Collision detection
      if (
        headX < 0 || headY < 0 || headX >= canvas.width || headY >= canvas.height ||
        snake.some(segment => segment.x === headX && segment.y === headY)
      ) {
        clearInterval(game);
        gameRunning = false;
        gameOver = true;
        postScore(score);
        gameMessage.innerText += " — Game Over! Press Restart to play again.";
        restartButton.style.display = "inline-block"; // 👈 show the button
        return;
      }
  
      // Eat food
      if (headX === food.x && headY === food.y) {
        score++;
        scoreDisplay.innerText = `Score: ${score}`;
        food = {
          x: Math.floor(Math.random() * 19 + 1) * box,
          y: Math.floor(Math.random() * 19 + 1) * box
        };
      } else {
        snake.pop();
      }
  
      snake.unshift({ x: headX, y: headY });
    }
  
    // Keyboard controls
    document.addEventListener("keydown", (event) => {
      if (gameOver) return;
  
      const allowedKeys = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"];
      if (!allowedKeys.includes(event.key)) return;
  
      if (!gameRunning) {
        gameRunning = true;
        gameMessage.innerText = "";
        direction = event.key.replace("Arrow", "").toUpperCase();
        game = setInterval(draw, 100);
      } else {
        if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
        if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
        if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
        if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
      }
    });
  
    // Restart game button
    restartButton.addEventListener("click", () => {
      if (gameRunning) clearInterval(game);
      initGame();
    });
  
    // Submit score to backend
    function postScore(score) {
      fetch("/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.querySelector("[name='csrf-token']").content
        },
        body: JSON.stringify({ score: score })
      }).then(() => {
        document.getElementById("gameMessage").innerText = `Game Over! Your score: ${score} — Press Restart to play again.`;
        // location.reload // reloads the page over and over again...
      });
    }
  
    // Start fresh on page load
    initGame();
  });
  