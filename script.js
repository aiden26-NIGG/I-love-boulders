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
let boulderSpeed = 4; // Initial speed of boulders
let spawnRate = 1000; // Initial spawn rate of boulders (in milliseconds)
let gameInterval;
let boulderInterval;
let waveCount = 0;
let isWaveActive = false;

// Player position (bottom center)
const playerX = 400; // Half of game container width
const playerY = 560; // Near the bottom
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
  const isBigBoulder = Math.random() < 0.3; // 30% chance of big boulder
  const boulder = document.createElement('div');
  boulder.classList.add('boulder');
  boulder.textContent = isBigBoulder ? '🪨' : '🪨'; // Use the same emoji for now
  boulder.style.fontSize = isBigBoulder ? '60px' : '40px'; // Big boulders are larger
  boulder.style.left = `${Math.random() * 760}px`; // Random horizontal position
  boulder.style.top = `-40px`; // Start above the screen
  bouldersContainer.appendChild(boulder);

  const speed = isBigBoulder ? boulderSpeed - 1 : boulderSpeed + 1; // Big boulders are slower
  const points = isBigBoulder ? 20 : 10; // Big boulders give more points
  const damage = isBigBoulder ? 2 : 1; // Big boulders take more lives

  const moveBoulder = setInterval(() => {
    const boulderY = parseFloat(boulder.style.top);
    boulder.style.top = `${boulderY + speed}px`; // Move boulder downward

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
        loseLife(damage); // Pass damage amount to loseLife
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
        damageWall(wall, isBigBoulder ? 20 : 10); // Big boulders do more damage
      }
    });

    // Remove boulder if it goes off screen
    if (boulderY > 600) {
      clearInterval(moveBoulder);
      boulder.remove();
      score += points; // Add points based on boulder size
      scoreElement.textContent = `Score: ${score}`;
      increaseDifficulty(); // Increase difficulty as score increases
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
    wall.remove(); // Remove wall if HP drops to 0
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
  wall.dataset.hp = 100; // Set initial HP

  // Position the wall at the top of the screen
  wall.style.left = `${Math.random() * 740}px`; // Random horizontal position
  wall.style.top = `10px`; // Fixed vertical position at the top
  wallsContainer.appendChild(wall);
}

// Start a new wave of boulders
function startWave() {
  isWaveActive = true;
  waveCount++;
  console.log(`Wave ${waveCount} started!`);
  boulderInterval = setInterval(createBoulder, spawnRate); // Spawn boulders

  // End the wave after 30 seconds
  setTimeout(() => {
    clearInterval(boulderInterval);
    isWaveActive = false;
    console.log(`Wave ${waveCount} ended!`);
    startBreak(); // Start a break after the wave
  }, 30000); // Wave lasts for 30 seconds
}

// Start a 10-second break between waves
function startBreak() {
  console.log("10-second break started!");
  setTimeout(() => {
    startWave(); // Start the next wave after the break
  }, 10000); // Break lasts for 10 seconds
}

// Increase difficulty as score increases
function increaseDifficulty() {
  if (score % 50 === 0) {
    boulderSpeed += 1; // Increase boulder speed
    spawnRate = Math.max(500, spawnRate - 100); // Decrease spawn rate (minimum 500ms)
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
  if (isShieldActive) return; // Prevent multiple shields
  isShieldActive = true;
  player.style.backgroundColor = 'rgba(0, 255, 0, 0.5)'; // Visual indicator

  setTimeout(() => {
    isShieldActive = false;
    player.style.backgroundColor = ''; // Remove visual indicator
  }, 5000); // Shield lasts for 5 seconds
}

// Update score
function updateScore() {
  scoreElement.textContent = `Score: ${score}`;
}

// Lose a life (or multiple lives for big boulders)
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
  player.style.backgroundColor = ''; // Reset shield visual
  startGame();
}

// Start game
function startGame() {
  gameInterval = setInterval(updateScore, 1000);
  startWave(); // Start the first wave
}

startGame();