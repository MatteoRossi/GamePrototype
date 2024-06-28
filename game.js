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

// merge obstacles and videoUrls into a single map so that every obstacle has a video and title
const obstacleImages = [];
for (let i = 1; i <= 5; i++) {
    const img = new Image();
    img.src = `obstacle_${i}.png`; // Path to obstacle images named "obstacle_1.png", "obstacle_2.png", etc.
    obstacleImages.push(img);
}
const pointImage = new Image();
pointImage.src = 'point.png'; // Path to point image

const playerImage = new Image();
playerImage.src = 'player.png'; // Path to player image

const endScreen = document.getElementById('endScreen');
const shareButton = document.getElementById('shareButton');
const restartButton = document.getElementById('restartButton');
const videoEmbed = document.getElementById('videoEmbed');

// create a map with description for each video url
const videoMap = new Map([
    ['https://www.youtube.com/embed/OoU3DVjh1SM', 'Used misogynistic acronym in Youtube tags'],
    ['https://www.youtube.com/embed/-DgxeMkTWwI', 'Qualified for his pension at 31'],
    ['https://www.youtube.com/embed/K_q9yP-bRiY', 'Posed with someone wearing a `straight pride` shirt'],
    ["https://www.youtube.com/embed/bOcgEZCeUCI", "Spoke at the Frontier Centre that denies Residential Schools"],  
    ["https://www.youtube.com/embed/Bim3a1Spzhw", "Voted against same-sex marriage"],
]);

const mergedMap = new Map([...obstacles, ...videoMap]);
console.log(mergedMap);

shareButton.addEventListener('click', () => {
    const shareData = {
        title: '20 Years of Pierre Poilievre',
        text: 'I reached ' + score +'. Can you beat the high score?',
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
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
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
    if (frameCount >= nextObstacleSpawn) {
        const randomImage = obstacleImages[Math.floor(Math.random() * obstacleImages.length)];
        obstacles.push({
            x: canvas.width,
            y: canvas.height - 50,
            width: 50,
            height: 50,
            image: randomImage
        });

        //spawn the next obstacle with a random interval and the interval can decrease as framecount goes up
        const minSpawnInterval = Math.max(0, 150 - Math.floor(frameCount / 400) - Math.floor(gameSpeed * 15));
        const maxSpawnInterval = Math.max(100, 250 - Math.floor(frameCount / 400) - Math.floor(gameSpeed * 15));
        nextObstacleSpawn = frameCount + getRandomInt(minSpawnInterval, maxSpawnInterval);    
        console.log('Min Spawn Interval: ' + minSpawnInterval, 'Max Spawn Interval: ' + maxSpawnInterval, 'Actual Spawn Interval: ' + (frameCount-nextObstacleSpawn));
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
            width: 25,
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
    ctx.font = '30px Arial';
    ctx.textAlign = 'left';
    ctx.drawImage(pointImage, 35, 5, 25, 40);
    ctx.fillText(" x " + score, 65, 35);} 

function drawDebugInfo() {
    ctx.fillStyle = 'red';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Frame Count: ${frameCount}`, 65, 60);
    ctx.fillText(`Next Obstacle Spawn: ${nextObstacleSpawn}`, 65, 80);

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
    //drawDebugInfo();

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

function getRandomVideo() {
    const keys = Array.from(videoMap.keys());
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return {
        url: randomKey,
        title: videoMap.get(randomKey)
    };
}

function showEndScreen() {
    canvas.style.display = 'none';
    endScreen.style.display = 'block';

    // insert the score
    document.getElementById('score').textContent = score;
     
    //select a random key/value pair from videoUrls map
    const randomVideo = getRandomVideo();
    videoEmbed.src = randomVideo.url;
    document.getElementById('moment').textContent = randomVideo.title;

}

function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('20 YEARS OF PP', canvas.width / 2, canvas.height / 2 - 50);
    //if mobile
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        ctx.fillText('Tap to start', canvas.width / 2, canvas.height / 2);
    } else {
        ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2);
    }
    ctx.font = '20px Arial';
    ctx.fillText('Jump to avoid Pierre\'s worst moments', canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText('and collect as many points as you can!', canvas.width / 2, canvas.height / 2 + 65);
}

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
drawStartScreen();
