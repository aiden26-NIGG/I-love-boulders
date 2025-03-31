// Show instructions first
const instructions = document.getElementById('instructions');
const gameContainer = document.querySelector('.game-container');

// Start game on any key press
document.addEventListener('keydown', function() {
  instructions.style.display = 'none';
  gameContainer.style.display = 'block';
  startGame();
}, { once: true }); // Only trigger once

// Rest of your existing game code...
const player = document.getElementById('player');
const bouldersContainer = document.getElementById('boulders');
const wallsContainer = document.getElementById('walls');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const extraLifeButton = document.getElementById('extra-life');
const shieldButton = document.getElementById('shield');
const buyWallButton = document.getElementById('buy-wall');

let score = 0;
let lives = 3;
let isShieldActive = false;
let boulderSpeed = 4;
let spawnRate = 1000;
let gameInterval;
let boulderInterval;
let waveCount = 0;
let isWaveActive = false;

// Player position
const playerX = 400;
const playerY = 560;
player.style.left = `${playerX}px`;
player.style.top = `${playerY}px`;

// Move player with arrow keys
document.addEventListener('keydown', (e) => {
  const playerRect = player.getBoundingClientRect();
  const gameRect = player.parentElement.getBoundingClientRect();

  if (e.key === 'ArrowLeft' && playerRect.left > gameRect.left) {
    player.style.left = `${player.offsetLeft - 20}px`;
  }
  if (e.key === 'ArrowRight' && playerRect.right < gameRect.right) {
    player.style.left = `${player.offsetLeft + 20}px`;
  }
});

// Create boulders (big or small)
function createBoulder() {
  const isBigBoulder = Math.random() < 0.3;
  const boulder = document.createElement('div');
  boulder.classList.add('boulder');
  boulder.textContent = isBigBoulder ? '🪨' : '🪨';
  boulder.style.fontSize = isBigBoulder ? '60px' : '40px';
  boulder.style.left = `${Math.random() * 760}px`;
  boulder.style.top = `-40px`;
  bouldersContainer.appendChild(boulder);

  const speed = isBigBoulder ? boulderSpeed - 1 : boulderSpeed + 1;
  const points = isBigBoulder ? 20 : 10;
  const damage = isBigBoulder ? 2 : 1;

  const moveBoulder = setInterval(() => {
    const boulderY = parseFloat(boulder.style.top);
    boulder.style.top = `${boulderY + speed}px`;

    // Check for collision with player
    const boulderRect = boulder.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    if (
      boulderRect.left < playerRect.right &&
      boulderRect.right > playerRect.left &&
      boulderRect.top < playerRect.bottom &&
      boulderRect.bottom > playerRect.top
    ) {
      clearInterval(moveBoulder);
      boulder.remove();
      if (!isShieldActive) {
        loseLife(damage);
      }
    }

    // Check for collision with walls
    wallsContainer.childNodes.forEach((wall) => {
      const wallRect = wall.getBoundingClientRect();
      if (
        boulderRect.left < wallRect.right &&
        boulderRect.right > wallRect.left &&
        boulderRect.top < wallRect.bottom &&
        boulderRect.bottom > wallRect.top
      ) {
        clearInterval(moveBoulder);
        boulder.remove();
        damageWall(wall, isBigBoulder ? 20 : 10);
      }
    });

    if (boulderY > 600) {
      clearInterval(moveBoulder);
      boulder.remove();
      score += points;
      scoreElement.textContent = `Score: ${score}`;
      increaseDifficulty();
    }
  }, 20);
}

// Damage a wall
function damageWall(wall, damage) {
  let hp = parseInt(wall.dataset.hp) || 100;
  hp -= damage;
  wall.dataset.hp = hp;
  wall.textContent = `HP: ${hp}`;

  if (hp <= 0) {
    wall.remove();
  }
}

// Buy and place a wall
buyWallButton.addEventListener('click', () => {
  if (score >= 200) {
    score -= 200;
    scoreElement.textContent = `Score: ${score}`;
    createWallAtTop();
  }
});

// Create a wall at the top of the screen
function createWallAtTop() {
  const wall = document.createElement('div');
  wall.classList.add('wall');
  wall.textContent = 'HP: 100';
  wall.dataset.hp = 100;
  wall.style.left = `${Math.random() * 740}px`;
  wall.style.top = `10px`;
  wallsContainer.appendChild(wall);
}

// Start a new wave of boulders
function startWave() {
  isWaveActive = true;
  waveCount++;
  boulderInterval = setInterval(createBoulder, spawnRate);

  setTimeout(() => {
    clearInterval(boulderInterval);
    isWaveActive = false;
    startBreak();
  }, 30000);
}

// Start a 10-second break between waves
function startBreak() {
  setTimeout(() => {
    startWave();
  }, 10000);
}

// Increase difficulty as score increases
function increaseDifficulty() {
  if (score % 50 === 0) {
    boulderSpeed += 1;
    spawnRate = Math.max(500, spawnRate - 100);
  }
}

// Upgrade: Extra Life
extraLifeButton.addEventListener('click', () => {
  if (score >= 100) {
    score -= 100;
    lives++;
    livesElement.textContent = `Lives: ${lives}`;
    scoreElement.textContent = `Score: ${score}`;
  }
});

// Upgrade: Shield for 5 seconds
shieldButton.addEventListener('click', () => {
  if (score >= 50) {
    score -= 50;
    scoreElement.textContent = `Score: ${score}`;
    activateShield();
  }
});

// Activate shield
function activateShield() {
  if (isShieldActive) return;
  isShieldActive = true;
  player.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';

  setTimeout(() => {
    isShieldActive = false;
    player.style.backgroundColor = '';
  }, 5000);
}

// Update score
function updateScore() {
  scoreElement.textContent = `Score: ${score}`;
}

// Lose a life
function loseLife(damage = 1) {
  lives -= damage;
  livesElement.textContent = `Lives: ${lives}`;
  if (lives <= 0) {
    endGame();
  }
}

// End game
function endGame() {
  clearInterval(gameInterval);
  clearInterval(boulderInterval);
  alert(`Game Over! Your final score is ${score}.`);
  resetGame();
}

// Reset game
function resetGame() {
  bouldersContainer.innerHTML = '';
  wallsContainer.innerHTML = '';
  score = 0;
  lives = 3;
  boulderSpeed = 4;
  spawnRate = 1000;
  waveCount = 0;
  isWaveActive = false;
  isShieldActive = false;
  scoreElement.textContent = `Score: ${score}`;
  livesElement.textContent = `Lives: ${lives}`;
  player.style.backgroundColor = '';
}

// Start game
function startGame() {
  gameInterval = setInterval(updateScore, 1000);
  startWave();
}