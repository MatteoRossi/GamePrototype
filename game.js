const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const endScreen = document.getElementById('endScreen');
const endMessage = document.getElementById('endMessage');

const player = { x: 400, y: 500, width: 50, height: 50, speed: 5 };
const serviceCuts = [];
const positiveProgress = [];
const keys = {};
let touchX, touchY;
let isTouching = false;

let score = 50; // Starts in the middle of the bar (0 to 100 scale)
const maxScore = 100;
const minScore = 0;
let gameInterval;
let serviceCutInterval;
let positiveProgressInterval;

document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);

function handleTouchStart(e) {
    const touch = e.touches[0];
    touchX = touch.clientX;
    touchY = touch.clientY;
    isTouching = true;
}

function handleTouchMove(e) {
    if (!isTouching) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchX;
    const dy = touch.clientY - touchY;
    player.x += dx;
    player.y += dy;
    touchX = touch.clientX;
    touchY = touch.clientY;
}

function handleTouchEnd() {
    isTouching = false;
}

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

function createServiceCut() {
    const x = Math.random() * canvas.width;
    const text = serviceCutPromises[Math.floor(Math.random() * serviceCutPromises.length)];
    serviceCuts.push({ x, y: 0, width: 30, height: 30, speed: 3, text });
}

function createPositiveProgress() {
    const x = Math.random() * canvas.width;
    const text = positiveProgresses[Math.floor(Math.random() * positiveProgresses.length)];
    positiveProgress.push({ x, y: 0, width: 30, height: 30, speed: 2, text });
}

function update() {
    if (keys['ArrowUp']) player.y -= player.speed;
    if (keys['ArrowDown']) player.y += player.speed;
    if (keys['ArrowLeft']) player.x -= player.speed;
    if (keys['ArrowRight']) player.x += player.speed;

    serviceCuts.forEach((cut, index) => {
        cut.y += cut.speed;
        if (cut.y > canvas.height) serviceCuts.splice(index, 1);
        if (isColliding(player, cut)) {
            score -= 5;
            if (score < minScore) {
                score = minScore;
                endGame('Cutting taxes for the rich');
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
                endGame('Delivering services to Canadians');
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

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'black';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    serviceCuts.forEach(cut => {
        ctx.fillStyle = 'blue';
        ctx.fillRect(cut.x, cut.y, cut.width, cut.height);
        ctx.fillStyle = 'black';
        ctx.fillText(cut.text, cut.x, cut.y);
    });

    positiveProgress.forEach(progress => {
        ctx.fillStyle = 'red';
        ctx.fillRect(progress.x, progress.y, progress.width, progress.height);
        ctx.fillStyle = 'black';
        ctx.fillText(progress.text, progress.x, progress.y);
    });

    // Draw score bar
    ctx.fillStyle = 'black';
    ctx.fillRect(10, 50, 780, 20);

    ctx.fillStyle = score > 50 ? 'red' : 'blue';
    ctx.fillRect(10, 50, score * 7.8, 20);

    ctx.fillStyle = 'black';
    ctx.drawImage(trudeauImg, 0, 0, 50, 50);
    ctx.drawImage(poilievreImg, 750, 0, 50, 50);
    ctx.fillText('Delivering services to Canadians', 10, 90);
    ctx.fillText('Cutting taxes for the rich', 600, 90);
}

function endGame(message) {
    clearInterval(gameInterval);
    clearInterval(serviceCutInterval);
    clearInterval(positiveProgressInterval);
    endMessage.innerText = `Game Over! You reached: ${message}`;
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
    gameInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
    serviceCutInterval = setInterval(createServiceCut, 1000);
    positiveProgressInterval = setInterval(createPositiveProgress, 2000);
}

startGame();
