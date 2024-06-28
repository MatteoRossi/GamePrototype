const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
    x: 50,
    y: 300,
    width: 50,
    height: 50,
    dy: 0,
    gravity: 0.5,
    jumpPower: 15,
    isJumping: false
};

const obstacles = [];
const points = [];
let score = 0;
let gameOver = false;
let gameSpeed = 3;
let frameCount = 0;
let nextObstacleSpawn = getRandomInt(150, 200);
let nextPointSpawn = getRandomInt(250, 300);
let gameStarted = false;

const obstacleImage = new Image();
obstacleImage.src = 'obstacle.png'; // Path to obstacle image

const pointImage = new Image();
pointImage.src = 'point.png'; // Path to point image

const endScreen = document.getElementById('endScreen');
const shareButton = document.getElementById('shareButton');
const restartButton = document.getElementById('restartButton');
const videoEmbed = document.getElementById('videoEmbed');

const videoUrls = [
    'https://www.youtube.com/embed/dQw4w9WgXcQ', // Add more YouTube embed URLs here
    'https://www.youtube.com/embed/another-video',
    'https://www.youtube.com/embed/yet-another-video'
];

shareButton.addEventListener('click', () => {
    const shareData = {
        title: 'Endless Runner Game',
        text: 'I scored ' + score + ' points in the Endless Runner Game!',
        url: window.location.href
    };
    navigator.share(shareData).catch(console.error);
});

restartButton.addEventListener('click', () => {
    location.reload();
});

function resizeCanvas() {
    canvas.width = 800;
    canvas.height = 400;

   //if mobile, make full screen
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    }
}

function drawPlayer() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.drawImage(obstacleImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function drawPoints() {
    points.forEach(point => {
        ctx.drawImage(pointImage, point.x, point.y, point.width, point.height);
    });
}

function handlePlayerMovement() {
    if (player.isJumping) {
        player.dy = -player.jumpPower;
        player.isJumping = false;
    }

    player.dy += player.gravity;
    player.y += player.dy;

    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
    }
}

function handleObstacles() {
    if (frameCount === nextObstacleSpawn) {
        obstacles.push({
            x: canvas.width,
            y: canvas.height - 50,
            width: 50,
            height: 50
        });
        nextObstacleSpawn = frameCount + getRandomInt(150, 200);
    }

    obstacles.forEach((obstacle, index) => {
        obstacle.x -= gameSpeed;
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
        }
        if (collision(player, obstacle)) {
            gameOver = true;
            showEndScreen();
        }
    });
}

function handlePoints() {
    if (frameCount === nextPointSpawn) {
        points.push({
            x: canvas.width,
            y: getRandomInt(canvas.height - 150, canvas.height - 100),
            width: 40,
            height: 40
        });
        nextPointSpawn = frameCount + getRandomInt(250, 300);
    }

    points.forEach((point, index) => {
        point.x -= gameSpeed;
        if (point.x + point.width < 0) {
            points.splice(index, 1);
        }
        if (collision(player, point)) {
            score++;
            points.splice(index, 1);
        }
    });
}

function collision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
}

function gameLoop() {
    if (!gameStarted || gameOver) {
        drawStartScreen();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawObstacles();
    drawPoints();
    drawScore();

    handlePlayerMovement();
    handleObstacles();
    handlePoints();

    frameCount++;
    if (frameCount % 300 === 0) {
        gameSpeed += 0.5; // Increase the speed every 300 frames
    }

    if (frameCount % 200 === 0) {
        nextObstacleSpawn = frameCount + getRandomInt(100, 150); // Spawn more obstacles as time goes on
    }

    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (!gameStarted) {
            gameStarted = true;
            gameLoop();
        } else if (player.y + player.height === canvas.height) {
            player.isJumping = true;
        }
    }
});

canvas.addEventListener('touchstart', (event) => {
    if (!gameStarted) {
        gameStarted = true;
        gameLoop();
    } else if (player.y + player.height === canvas.height) {
        player.isJumping = true;
    }
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function showEndScreen() {
    canvas.style.display = 'none';
    endScreen.style.display = 'block';
    const randomVideoUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)];
    videoEmbed.src = randomVideoUrl;
}

function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Press "Space" to start', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Jump to avoid Pierre\'s worst moments', canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('and collect as many points as you can!', canvas.width / 2, canvas.height / 2 + 50);
}

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
drawStartScreen();
