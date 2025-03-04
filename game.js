// DOM Elements
const bird = document.getElementById('bird');
const gameContainer = document.getElementById('game-container');
const scoreDisplayValue = document.getElementById('score-value');
const rocketCountDisplayValue = document.getElementById('rocket-value');
const highScoreDisplayValue = document.getElementById('high-score-value');
const gameOverScreen = document.getElementById('game-over-screen');
const startScreen = document.getElementById('start-screen');
const finalScoreDisplay = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');
const startButton = document.getElementById('start-button');

// Game Constants
const GRAVITY = 0.5;
const GLIDE_GRAVITY = 0.1;
const JUMP_STRENGTH = -8;
const ROCKET_SPEED = 8;
const ENEMY_SPEED = 3;
const INITIAL_PIPE_SPEED = 2;
const PIPE_SPAWN_INTERVAL = 2200;
const ENEMY_SPAWN_INTERVAL = 2000;
const DIFFICULTY_INCREASE_INTERVAL = 10000;
const ROCKETS_PER_PIPES = 2;
const POWER_UP_CHANCE = 0.15; // 15% chance of spawning a power-up
const POWER_UP_TYPES = ['shield', 'slow', 'multi'];
const POWER_UP_DURATION = 5000; // 5 seconds

// Game Variables
let birdY;
let birdVelocity;
let gameLoopInterval;
let pipeSpawnInterval;
let enemySpawnInterval;
let powerUpSpawnInterval;
let difficultyIncreaseInterval;
let score;
let isGameOver;
let isGameStarted = false;
let pipes = [];
let pipeSpeed;
let rockets = [];
let enemies = [];
let powerUps = [];
let rocketCount;
let pipesPassedForRocket;
let scoreToDisplay;
let rocketBoostTimeout = null;
let touchStartX = 0;
let touchStartY = 0;
let isGliding = false;
let highScore = localStorage.getItem('highScore') || 0;
let activePowerUps = {
    shield: false,
    slow: false,
    multi: false
};
let powerUpTimers = {
    shield: null,
    slow: null,
    multi: null
};

// Set high score display
highScoreDisplayValue.textContent = highScore;

// Game Functions
function initGame() {
    // Show start screen
    startScreen.style.display = 'block';
    gameOverScreen.style.display = 'none';
    
    // Position bird for preview
    birdY = gameContainer.offsetHeight * 0.3333;
    bird.style.top = birdY + 'px';
    bird.style.transform = 'rotate(0deg)';
    
    // Clean up any existing elements
    document.querySelectorAll('.pipe, .rocket, .enemy, .power-up, .particle, .explosion').forEach(el => el.remove());
}

function startGame() {
    // Hide screens
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    
    // Reset game state
    isGameStarted = true;
    isGameOver = false;
    birdY = gameContainer.offsetHeight * 0.3333;
    birdVelocity = 0;
    score = 0;
    scoreToDisplay = 0;
    rocketCount = 3; // Start with 3 rockets
    pipesPassedForRocket = 0;
    pipeSpeed = INITIAL_PIPE_SPEED;
    
    // Reset power-ups
    activePowerUps = {
        shield: false,
        slow: false,
        multi: false
    };
    
    Object.keys(powerUpTimers).forEach(key => {
        if (powerUpTimers[key]) {
            clearTimeout(powerUpTimers[key]);
            powerUpTimers[key] = null;
        }
    });
    
    // Update display
    scoreDisplayValue.textContent = "0";
    rocketCountDisplayValue.textContent = "3";
    highScoreDisplayValue.textContent = highScore;
    
    // Clear arrays and elements
    pipes = [];
    rockets = [];
    enemies = [];
    powerUps = [];
    document.querySelectorAll('.pipe, .rocket, .enemy, .power-up, .particle, .explosion').forEach(el => el.remove());
    
    // Clear timeouts and intervals
    clearTimeout(rocketBoostTimeout);
    clearInterval(gameLoopInterval);
    clearInterval(pipeSpawnInterval);
    clearInterval(enemySpawnInterval);
    clearInterval(powerUpSpawnInterval);
    clearInterval(difficultyIncreaseInterval);
    
    // Set up game intervals
    gameLoopInterval = setInterval(gameLoop, 20);
    pipeSpawnInterval = setInterval(spawnPipe, PIPE_SPAWN_INTERVAL);
    enemySpawnInterval = setInterval(spawnEnemy, ENEMY_SPAWN_INTERVAL);
    powerUpSpawnInterval = setInterval(spawnPowerUp, 3000);
    difficultyIncreaseInterval = setInterval(increaseDifficulty, DIFFICULTY_INCREASE_INTERVAL);
    
    // Position bird
    bird.style.top = birdY + 'px';
    bird.style.transform = 'rotate(0deg)';
}

function jump() {
    if (!isGameStarted) {
        startGame();
        return;
    }
    
    if (!isGameOver) {
        birdVelocity = JUMP_STRENGTH;
        bird.style.transform = 'rotate(-20deg)';
        createParticles(bird.offsetLeft, birdY + bird.offsetHeight, 3, '#ffffff');
    }
}

function shootRocket() {
    if (!isGameStarted || isGameOver || rocketCount <= 0) return;
    
    rocketCount--;
    rocketCountDisplayValue.textContent = rocketCount;
    
    const shootMultiple = activePowerUps.multi;
    const rockets2Shoot = shootMultiple ? 3 : 1;
    
    for (let i = 0; i < rockets2Shoot; i++) {
        setTimeout(() => {
            const rocket = document.createElement('div');
            rocket.classList.add('rocket');
            rocket.innerHTML = '<i class="fas fa-rocket"></i>';
            
            // Adjust vertical position for multi-rocket
            const yOffset = shootMultiple ? (i - 1) * 30 : 0;
            
            rocket.style.left = (bird.offsetLeft + bird.offsetWidth) + 'px';
            rocket.style.top = (bird.offsetTop + bird.offsetHeight / 2 + yOffset) + 'px';
            gameContainer.appendChild(rocket);
            
            rockets.push({ 
                element: rocket, 
                x: parseFloat(rocket.style.left),
                width: 10,
                height: 20
            });
            
            createParticles(bird.offsetLeft + bird.offsetWidth, bird.offsetTop + bird.offsetHeight / 2, 5, '#ff6666');
        }, i * 100);
    }
    
    // Add temporary boost when shooting
    clearTimeout(rocketBoostTimeout);
    birdVelocity = 0;
    rocketBoostTimeout = setTimeout(() => { birdVelocity = GRAVITY; }, 150);
}

function spawnPipe() {
    if (isGameOver || !isGameStarted) return;
    
    const gapHeight = gameContainer.offsetHeight * 0.25;
    const minPipeHeight = gameContainer.offsetHeight * 0.083;
    const maxPipeHeight = gameContainer.offsetHeight - gapHeight - minPipeHeight;
    
    const topPipeHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
    const bottomPipeHeight = gameContainer.offsetHeight - gapHeight - topPipeHeight;
    
    const topPipe = document.createElement('div');
    topPipe.classList.add('pipe', 'pipe-top');
    topPipe.style.height = `${topPipeHeight}px`;
    gameContainer.appendChild(topPipe);
    
    const bottomPipe = document.createElement('div');
    bottomPipe.classList.add('pipe', 'pipe-bottom');
    bottomPipe.style.height = `${bottomPipeHeight}px`;
    gameContainer.appendChild(bottomPipe);
    
    pipes.push({ 
        top: topPipe, 
        bottom: bottomPipe, 
        x: gameContainer.offsetWidth,
        width: 60,
        scored: false
    });
}

function spawnEnemy() {
    if (isGameOver || !isGameStarted) return;
    
    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    enemy.innerHTML = '<i class="fas fa-skull"></i>';
    enemy.style.left = gameContainer.offsetWidth + 'px';
    enemy.style.top = (Math.random() * (gameContainer.offsetHeight - 40)) + 'px';
    gameContainer.appendChild(enemy);
    
    enemies.push({ 
        element: enemy, 
        x: parseFloat(enemy.style.left),
        width: 40,
        height: 30
    });
}

function spawnPowerUp() {
    if (isGameOver || !isGameStarted) return;
    
    // Only spawn power-up with a certain probability
    if (Math.random() > POWER_UP_CHANCE) return;
    
    const powerUpType = POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)];
    let iconClass;
    
    switch (powerUpType) {
        case 'shield':
            iconClass = 'fa-shield-alt';
            break;
        case 'slow':
            iconClass = 'fa-snowflake';
            break;
        case 'multi':
            iconClass = 'fa-bomb';
            break;
    }
    
    const powerUp = document.createElement('div');
    powerUp.classList.add('power-up');
    powerUp.innerHTML = `<i class="fas ${iconClass}"></i>`;
    powerUp.style.left = gameContainer.offsetWidth + 'px';
    powerUp.style.top = (Math.random() * (gameContainer.offsetHeight - 40)) + 'px';
    gameContainer.appendChild(powerUp);
    
    powerUps.push({ 
        element: powerUp, 
        x: parseFloat(powerUp.style.left),
        width: 25,
        height: 25,
        type: powerUpType
    });
}

function increaseDifficulty() {
    if (!isGameOver && isGameStarted) {
        pipeSpeed += 0.5;
    }
}

function activatePowerUp(type) {
    // Clear any existing timeout for this power-up
    if (powerUpTimers[type]) {
        clearTimeout(powerUpTimers[type]);
    }
    
    // Set power-up as active
    activePowerUps[type] = true;
    
    // Apply immediate effect
    switch (type) {
        case 'shield':
            bird.style.color = '#00ffff';
            break;
        case 'slow':
            // Slow down everything
            const oldPipeSpeed = pipeSpeed;
            pipeSpeed = pipeSpeed * 0.5;
            powerUpTimers[type] = setTimeout(() => {
                pipeSpeed = oldPipeSpeed;
                activePowerUps[type] = false;
                bird.style.color = '#ffd700';
            }, POWER_UP_DURATION);
            return;
        case 'multi':
            break;
    }
    
    // Set timeout to remove power-up effect
    powerUpTimers[type] = setTimeout(() => {
        activePowerUps[type] = false;
        bird.style.color = '#ffd700';
    }, POWER_UP_DURATION);
}

function checkCollision(rect1, rect2) {
    return (
        rect1.left < rect2.right &&
        rect1.right > rect2.left &&
        rect1.top < rect2.bottom &&
        rect1.bottom > rect2.top
    );
}

function createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.backgroundColor = color;
        gameContainer.appendChild(particle);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        const deltaX = Math.cos(angle) * speed;
        const deltaY = Math.sin(angle) * speed;
        let opacity = 1;
        
        const moveParticle = () => {
            const currentX = parseFloat(particle.style.left);
            const currentY = parseFloat(particle.style.top);
            particle.style.left = (currentX + deltaX) + 'px';
            particle.style.top = (currentY + deltaY) + 'px';
            opacity -= 0.05;
            particle.style.opacity = opacity;
            
            if (opacity <= 0) {
                particle.remove();
            } else {
                requestAnimationFrame(moveParticle);
            }
        };
        
        requestAnimationFrame(moveParticle);
    }
}

function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.classList.add('explosion');
    explosion.style.left = x + 'px';
    explosion.style.top = y + 'px';
    gameContainer.appendChild(explosion);
    
    setTimeout(() => {
        explosion.remove();
    }, 500);
}

function gameLoop() {
    if (isGameOver || !isGameStarted) return;
    
    // Apply appropriate gravity based on gliding state
    if (isGliding) {
        birdVelocity += GLIDE_GRAVITY;
    } else {
        birdVelocity += GRAVITY;
    }
    
    // Rotate bird based on velocity
    if (birdVelocity > 2) {
        bird.style.transform = 'rotate(45deg)';
    } else if (birdVelocity < -2) {
        bird.style.transform = 'rotate(-20deg)';
    } else {
        bird.style.transform = 'rotate(0deg)';
    }
    
    // Update bird position
    birdY += birdVelocity;
    bird.style.top = birdY + 'px';
    
    // Check if bird hits top or bottom of game container
    if (birdY + bird.offsetHeight > gameContainer.offsetHeight || birdY < 0) {
        if (activePowerUps.shield) {
            // Bounce instead of game over
            if (birdY < 0) {
                birdY = 0;
                birdVelocity = Math.abs(birdVelocity) * 0.6;
            } else {
                birdY = gameContainer.offsetHeight - bird.offsetHeight;
                birdVelocity = -Math.abs(birdVelocity) * 0.6;
            }
            bird.style.top = birdY + 'px';
            
            // Remove shield
            activePowerUps.shield = false;
            bird.style.color = '#ffd700';
            if (powerUpTimers.shield) {
                clearTimeout(powerUpTimers.shield);
                powerUpTimers.shield = null;
            }
        } else {
            gameOver();
            return;
        }
    }
    
    // Process rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
        // Move rockets
        rockets[i].x += ROCKET_SPEED;
        rockets[i].element.style.left = rockets[i].x + 'px';
        
        const rocketRect = {
            left: rockets[i].x,
            top: rockets[i].element.offsetTop,
            right: rockets[i].x + rockets[i].element.offsetWidth,
            bottom: rockets[i].element.offsetTop + rockets[i].element.offsetHeight
        };
        
        // Check pipe collisions
        for (let j = pipes.length - 1; j >= 0; j--) {
            const topPipeRect = {
                left: pipes[j].x,
                top: 0,
                right: pipes[j].x + pipes[j].width,
                bottom: pipes[j].top.offsetHeight
            };
            
            const bottomPipeRect = {
                left: pipes[j].x,
                top: gameContainer.offsetHeight - pipes[j].bottom.offsetHeight,
                right: pipes[j].x + pipes[j].width,
                bottom: gameContainer.offsetHeight
            };
            
            if (checkCollision(rocketRect, topPipeRect) || checkCollision(rocketRect, bottomPipeRect)) {
                createExplosion(rockets[i].x, rockets[i].element.offsetTop);
                createParticles(rockets[i].x, rockets[i].element.offsetTop, 10, '#ff6666');
                
                pipes[j].top.remove();
                pipes[j].bottom.remove();
                pipes.splice(j, 1);
                rockets[i].element.remove();
                rockets.splice(i, 1);
                
                // Add points for destroying a pipe
                score += 2;
                scoreToDisplay = score;
                scoreDisplayValue.textContent = scoreToDisplay;
                break;
            }
        }
        
        // Check enemy collisions
        if (rockets[i]) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemyRect = {
                    left: enemies[j].x,
                    top: enemies[j].element.offsetTop,
                    right: enemies[j].x + enemies[j].width,
                    bottom: enemies[j].element.offsetTop + enemies[j].height
                };
                
                if (checkCollision(rocketRect, enemyRect)) {
                    createExplosion(enemies[j].x, enemies[j].element.offsetTop);
                    createParticles(enemies[j].x, enemies[j].element.offsetTop, 10, '#ff6666');
                    
                    enemies[j].element.remove();
                    enemies.splice(j, 1);
                    rockets[i].element.remove();
                    rockets.splice(i, 1);
                    
                    // Add points for shooting an enemy
                    score += 5;
                    scoreToDisplay = score;
                    scoreDisplayValue.textContent = scoreToDisplay;
                    break;
                }
            }
        }
        
        // Remove rockets that go off screen
        if (rockets[i] && rockets[i].x > gameContainer.offsetWidth) {
            rockets[i].element.remove();
            rockets.splice(i, 1);
        }
    }
    
    // Process pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        // Move pipes based on current speed (affected by slow power-up)
        pipes[i].x -= pipeSpeed;
        pipes[i].top.style.left = pipes[i].x + 'px';
        pipes[i].bottom.style.left = pipes[i].x + 'px';
        
        // Check bird collision with pipes
        if (!activePowerUps.shield) {
            const birdRect = {
                left: bird.offsetLeft,
                top: birdY,
                right: bird.offsetLeft + bird.offsetWidth,
                bottom: birdY + bird.offsetHeight
            };
            
            const topPipeRect = {
                left: pipes[i].x,
                top: 0,
                right: pipes[i].x + pipes[i].width,
                bottom: pipes[i].top.offsetHeight
            };
            
            const bottomPipeRect = {
                left: pipes[i].x,
                top: gameContainer.offsetHeight - pipes[i].bottom.offsetHeight,
                right: pipes[i].x + pipes[i].width,
                bottom: gameContainer.offsetHeight
            };
            
            if (checkCollision(birdRect, topPipeRect) || checkCollision(birdRect, bottomPipeRect)) {
                gameOver();
                return;
            }
        }
        
        // Check if pipe is passed
        if (pipes[i].x + pipes[i].width < bird.offsetLeft && !pipes[i].scored) {
            pipes[i].scored = true;
            score++;
            scoreToDisplay = score;
            pipesPassedForRocket++;
            
            if (pipesPassedForRocket >= ROCKETS_PER_PIPES) {
                rocketCount++;
                pipesPassedForRocket = 0;
                createParticles(bird.offsetLeft, birdY, 5, '#ff6666');
            }
            
            scoreDisplayValue.textContent = scoreToDisplay;
            rocketCountDisplayValue.textContent = rocketCount;
        }
        
        // Remove pipes that go off screen
        if (pipes[i].x + pipes[i].width < 0) {
            pipes[i].top.remove();
            pipes[i].bottom.remove();
            pipes.splice(i, 1);
        }
    }
    
    // Process enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        // Move enemies
        enemies[i].x -= (activePowerUps.slow ? ENEMY_SPEED * 0.5 : ENEMY_SPEED);
        enemies[i].element.style.left = enemies[i].x + 'px';
        
        // Check bird collision with enemies
        if (!activePowerUps.shield) {
            const birdRect = {
                left: bird.offsetLeft,
                top: birdY,
                right: bird.offsetLeft + bird.offsetWidth,
                bottom: birdY + bird.offsetHeight
            };
            
            const enemyRect = {
                left: enemies[i].x,
                top: enemies[i].element.offsetTop,
                right: enemies[i].x + enemies[i].width,
                bottom: enemies[i].element.offsetTop + enemies[i].height
            };
            
            if (checkCollision(birdRect, enemyRect)) {
                gameOver();
                return;
            }
        }
        
        // Remove enemies that go off screen
        if (enemies[i].x + enemies[i].width < 0) {
            enemies[i].element.remove();
            enemies.splice(i, 1);
        }
    }
    
    // Process power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        // Move power-ups
        powerUps[i].x -= (activePowerUps.slow ? pipeSpeed * 0.5 : pipeSpeed);
        powerUps[i].element.style.left = powerUps[i].x + 'px';
        
        // Check bird collision with power-ups
        const birdRect = {
            left: bird.offsetLeft,
            top: birdY,
            right: bird.offsetLeft + bird.offsetWidth,
            bottom: birdY + bird.offsetHeight
        };
        
        const powerUpRect = {
            left: powerUps[i].x,
            top: powerUps[i].element.offsetTop,
            right: powerUps[i].x + powerUps[i].width,
            bottom: powerUps[i].element.offsetTop + powerUps[i].height
        };
        
        if (checkCollision(birdRect, powerUpRect)) {
            // Activate power-up
            activatePowerUp(powerUps[i].type);
            createParticles(powerUps[i].x, powerUps[i].element.offsetTop, 15, '#ffcc00');
            
            // Remove power-up
            powerUps[i].element.remove();
            powerUps.splice(i, 1);
        } else if (powerUps[i].x + powerUps[i].width < 0) {
            // Remove power-ups that go off screen
            powerUps[i].element.remove();
            powerUps.splice(i, 1);
        }
    }
}

function gameOver() {
    isGameOver = true;
    isGameStarted = false;
    
    // Clear intervals
    clearInterval(gameLoopInterval);
    clearInterval(pipeSpawnInterval);
    clearInterval(enemySpawnInterval);
    clearInterval(powerUpSpawnInterval);
    clearInterval(difficultyIncreaseInterval);
    clearTimeout(rocketBoostTimeout);
    
    // Clean up power-up timers
    Object.keys(powerUpTimers).forEach(key => {
        if (powerUpTimers[key]) {
            clearTimeout(powerUpTimers[key]);
            powerUpTimers[key] = null;
        }
    });
    
    // Create explosion effect
    createExplosion(bird.offsetLeft, birdY);
    createParticles(bird.offsetLeft, birdY, 20, '#ffd700');
    
    // Update high score
    if (scoreToDisplay > highScore) {
        highScore = scoreToDisplay;
        localStorage.setItem('highScore', highScore);
        highScoreDisplayValue.textContent = highScore;
    }
    
    // Show game over screen
    finalScoreDisplay.textContent = `Final Score: ${scoreToDisplay} | High Score: ${highScore}`;
    gameOverScreen.style.display = "block";
}

// Event Listeners
gameContainer.addEventListener('touchstart', (event) => {
    event.preventDefault();
    
    if (isGameOver) {
        startGame();
        return;
    }
    
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    isGliding = true;
    jump();
});

gameContainer.addEventListener('touchmove', (event) => {
    event.preventDefault();
});

gameContainer.addEventListener('touchend', (event) => {
    event.preventDefault();
    isGliding = false;
    
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 50) {
        shootRocket();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (isGameOver) {
            startGame();
            return;
        }
        jump();
    } else if (event.code === 'KeyX') {
        shootRocket();
    }
});

// Button event listeners
restartButton.addEventListener('click', startGame);
startButton.addEventListener('click', startGame);

// Initialize the game
initGame();
