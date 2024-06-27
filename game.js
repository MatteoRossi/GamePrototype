const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const endScreen = document.getElementById('endScreen');
const endMessage = document.getElementById('endMessage');

const player = {
    x: 400,
    y: 500,
    width: 50,
    height: 50,
    speed: 5,
    vx: 0,
    vy: 0,
    isJumping: false,
    gravity: 0.5,
    jumpStrength: -10,
    onGround: false
};

const serviceCuts = [];
const positiveProgress = [];
const keys = {};

let score = 50; // Starts in the middle of the bar (0 to 100 scale)
const maxScore = 100;
const minScore = 0;
let gameInterval;
let serviceCutInterval;
let positiveProgressInterval;
let gameStarted = false;

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (!gameStarted && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        startGame();
    }
});
document.addEventListener('keyup', (e) => keys[e.key] = false);


const serviceCutPromises = [
    "Cut funding for public health care and privatize services.",
    "Cancel all climate change initiatives and projects.",
    "Eliminate funding for public education programs.",
    "Reduce pensions and social assistance to balance the budget.",
    "Deregulate industries at the expense of safety and environmental standards.",
    "Ignore scientific research and experts in policy-making.",
    "Cut unemployment benefits and force people back to work.",
    "Dismiss indigenous rights and land claims.",
    "Remove restrictions on corporate political donations."
];

const positiveProgresses = [
    "Invest in public health care and expand services.",
    "Implement and fund climate change initiatives.",
    "Increase funding for public education and scholarships.",
    "Enhance pensions and social assistance programs.",
    "Strengthen regulations for safety and environmental standards.",
    "Support scientific research and expert-led policy-making.",
    "Extend unemployment benefits and support job training programs.",
    "Recognize and uphold indigenous rights and land claims.",
    "Enforce restrictions on corporate political donations."
];

const trudeauImg = new Image();
trudeauImg.src = 'trudeau.png'; // Replace with the actual image path
const poilievreImg = new Image();
poilievreImg.src = 'poilievre.png'; // Replace with the actual image path
const blueBoxImg = new Image();
blueBoxImg.src = 'lids.png'; // Replace with the actual image path
const redBoxImg = new Image();
redBoxImg.src = 'flag.png'; // Replace with the actual image path


function createServiceCut() {
    const x = Math.random() * canvas.width;
    const text = serviceCutPromises[Math.floor(Math.random() * serviceCutPromises.length)];
    serviceCuts.push({ x, y: 0, width: 45, height: 45, speed: 3, text });
}

function createPositiveProgress() {
    const x = Math.random() * canvas.width;
    const text = positiveProgresses[Math.floor(Math.random() * positiveProgresses.length)];
    positiveProgress.push({ x, y: 0, width: 45, height: 45, speed: 2, text });
}

function update() {
    // Horizontal movement
    if (keys['ArrowLeft'] || keys['a']) {
        player.vx = -player.speed;
    } else if (keys['ArrowRight'] || keys['d']) {
        player.vx = player.speed;
    } else {
        player.vx = 0;
    }

    // Jumping
    if ((keys['ArrowUp'] || keys[' ']) && !player.isJumping && player.onGround) {
        player.vy = player.jumpStrength;
        player.isJumping = true;
        player.onGround = false;
    }

    // Apply gravity
    player.vy += player.gravity;
    player.x += player.vx;
    player.y += player.vy;

    // Collision with the ground
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.vy = 0;
        player.isJumping = false;
        player.onGround = true;
    }

    // Keep player within canvas bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    serviceCuts.forEach((cut, index) => {
        cut.y += cut.speed;
        if (cut.y > canvas.height) serviceCuts.splice(index, 1);
        if (isColliding(player, cut)) {
            score -= 5;
            if (score < minScore) {
                score = minScore;
                endGame('Not only do you lose, Canada looses too! Try Again!');
            }
            serviceCuts.splice(index, 1);
        }
    });

    positiveProgress.forEach((progress, index) => {
        progress.y += progress.speed;
        if (progress.y > canvas.height) positiveProgress.splice(index, 1);
        if (isColliding(player, progress)) {
            score += 5;
            if (score > maxScore) {
                score = maxScore;
                endGame('Congratulations! You helped us deliver for Canadians');
            }
            positiveProgress.splice(index, 1);
        }
    });
}

function isColliding(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Press any arrow key to start', canvas.width / 2, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Use arrow keys to move left and right', canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText('Avoid harmful cuts and collect positive progress', canvas.width / 2, canvas.height / 2 + 70);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'black';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    serviceCuts.forEach(cut => {
        ctx.drawImage(blueBoxImg, cut.x, cut.y, cut.width, cut.height); // Draw the blue box image
        ctx.fillStyle = 'black';
        ctx.fillText(cut.text, cut.x, cut.y);
    });

    positiveProgress.forEach(progress => {
        ctx.drawImage(redBoxImg, progress.x, progress.y, progress.width, progress.height);
        ctx.fillStyle = 'black';
        ctx.fillText(progress.text, progress.x, progress.y);
    });

    // Draw score bar
    ctx.fillStyle = 'black';
    ctx.fillRect(200, 50, 780, 20);

    ctx.fillStyle = score > 50 ? 'red' : 'blue';
    ctx.fillRect(200, 50, score * 7.8, 20);

    ctx.fillStyle = 'black';
    ctx.drawImage(poilievreImg, 200, 0, 50, 50);
    ctx.drawImage(trudeauImg, 950, 0, 50, 50);
    ctx.fillText('Deliver services to Canadians', 860, 90);
    ctx.fillText('Cut taxes for the rich', 300, 90);
}

function endGame(message) {
    clearInterval(gameInterval);
    clearInterval(serviceCutInterval);
    clearInterval(positiveProgressInterval);
    endMessage.innerText = `${message}`;
    endScreen.style.display = 'block';
}

function restartGame() {
    score = 50;
    serviceCuts.length = 0;
    positiveProgress.length = 0;
    player.x = 400;
    player.y = 500;
    endScreen.style.display = 'none';
    startGame();
}

function shareGame() {
    const text = `I played Service Slasher and reached ${score > 50 ? 'Delivering services to Canadians' : 'Cutting taxes for the rich'}! Play now and see how you do!`;
    const url = window.location.href;
    navigator.share({
        title: 'Service Slasher Game',
        text,
        url
    });
}

function gameLoop() {
    update();
    draw();
}

function startGame() {
    gameStarted = true;
    gameInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
    serviceCutInterval = setInterval(createServiceCut, 1000);
    positiveProgressInterval = setInterval(createPositiveProgress, 2000);
}

// Ensure the game canvas fits the screen
function resizeCanvas() {
    const aspectRatio = 800 / 600;
    const windowAspectRatio = window.innerWidth / window.innerHeight;
    if (windowAspectRatio > aspectRatio) {
        canvas.height = window.innerHeight;
        canvas.width = window.innerHeight * aspectRatio;
    } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth / aspectRatio;
    }
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - player.height - 10;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        clearInterval(gameInterval);
        clearInterval(serviceCutInterval);
        clearInterval(positiveProgressInterval);
    } else {
        startGame();
    }
});

drawStartScreen();
