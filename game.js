const screen = document.getElementById("screen");
const startBtn = document.getElementById("startBtn");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const livesEl = document.getElementById("lives");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

let score = 0;
let lives = 3;
let best = Number(localStorage.getItem("sepebrendaBest") || 0);
let player;
let playerX = 50;
let running = false;
let speed = 4;
let objects = [];
let spawnTimer = 0;
let animationId = 0;
let lastTime = 0;

bestEl.textContent = best;

function makePlayer() {
  player = document.createElement("div");
  player.className = "player";
  player.textContent = "🎮";
  screen.appendChild(player);
  playerX = 50;
  updatePlayer();
}

function updatePlayer() {
  if (!player) return;
  player.style.left = `calc(${playerX}% - 36px)`;
  player.style.bottom = "24px";
}

function move(dir) {
  if (!running) return;
  playerX += dir * 6;
  playerX = Math.max(7, Math.min(93, playerX));
  updatePlayer();
}

function spawn(type) {
  const el = document.createElement("div");
  el.className = type === "coin" ? "coin" : "obstacle";
  el.textContent = type === "coin" ? "★" : "💥";
  const x = Math.random() * 88 + 6;
  el.style.left = `calc(${x}% - ${type === "coin" ? 17 : 27}px)`;
  el.style.top = "-70px";
  screen.appendChild(el);
  objects.push({ el, type, x, y: -70 });
}

function collision(obj) {
  const playerRect = player.getBoundingClientRect();
  const rect = obj.el.getBoundingClientRect();
  return !(
    playerRect.right < rect.left ||
    playerRect.left > rect.right ||
    playerRect.bottom < rect.top ||
    playerRect.top > rect.bottom
  );
}

function endGame() {
  running = false;
  cancelAnimationFrame(animationId);

  if (score > best) {
    best = score;
    localStorage.setItem("sepebrendaBest", best);
    bestEl.textContent = best;
  }

  const overlay = document.createElement("div");
  overlay.className = "game-over";
  overlay.innerHTML = `
    <div>
      <h2>GAME OVER</h2>
      <p>Hiciste <strong>${score}</strong> puntos.</p>
      <button id="restartBtn">JUGAR DE NUEVO</button>
    </div>
  `;
  screen.appendChild(overlay);

  document.getElementById("restartBtn").onclick = startGame;
}

function loop(time) {
  if (!running) return;

  const dt = Math.min((time - lastTime) / 16.67, 2);
  lastTime = time;

  spawnTimer += dt;
  if (spawnTimer > Math.max(18, 46 - score / 8)) {
    spawn(Math.random() < .7 ? "obstacle" : "coin");
    spawnTimer = 0;
  }

  speed = 4 + Math.min(score / 90, 5);

  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i];
    obj.y += speed * dt;
    obj.el.style.top = `${obj.y}px`;

    if (collision(obj)) {
      if (obj.type === "coin") {
        score += 10;
        scoreEl.textContent = score;
      } else {
        lives--;
        livesEl.textContent = lives;
        if (lives <= 0) {
          obj.el.remove();
          objects.splice(i, 1);
          endGame();
          return;
        }
      }
      obj.el.remove();
      objects.splice(i, 1);
      continue;
    }

    if (obj.y > screen.clientHeight + 80) {
      obj.el.remove();
      objects.splice(i, 1);
      if (obj.type === "obstacle") {
        score++;
        scoreEl.textContent = score;
      }
    }
  }

  animationId = requestAnimationFrame(loop);
}

function clearObjects() {
  objects.forEach(o => o.el.remove());
  objects = [];
  screen.querySelectorAll(".player, .game-over").forEach(el => el.remove());
}

function startGame() {
  cancelAnimationFrame(animationId);
  clearObjects();

  score = 0;
  lives = 3;
  speed = 4;
  spawnTimer = 0;
  scoreEl.textContent = score;
  livesEl.textContent = lives;

  makePlayer();
  running = true;
  lastTime = performance.now();
  animationId = requestAnimationFrame(loop);
}

startBtn.addEventListener("click", startGame);

leftBtn.addEventListener("pointerdown", () => move(-1));
rightBtn.addEventListener("pointerdown", () => move(1));

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") move(-1);
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") move(1);
  if (e.key === "Enter" && !running) startGame();
});
