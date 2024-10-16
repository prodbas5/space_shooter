const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1280;
canvas.height = 720;

// Игрок
const player = {
    x: canvas.width / 2 - 34.5,
    y: canvas.height - 70,
    width: 69,
    height: 57,
    image: new Image(),
    speed: 8,
    doubleShot: false, // Флаг для двойного выстрела
    speedBoost: false, // Флаг для бонуса скорости
};
player.image.src = 'sprites/ship1.png'; // Изображение игрока

// Фон
const backgroundImage = new Image();
backgroundImage.src = 'sprites/background.png';

// Изображение жизней
const heartImage = new Image();
heartImage.src = 'sprites/heart.png';

// Спрайт врага
const enemyImage = new Image();
enemyImage.src = 'sprites/enemy.png';

// Спрайты бонусов
const bonusDoubleShotImage = new Image();
bonusDoubleShotImage.src = 'sprites/bonus.png'; // Бонус для двойного выстрела

const bonusSpeedImage = new Image();
bonusSpeedImage.src = 'sprites/bonus_speed.png'; // Бонус для увеличения скорости

// Массив для врагов
const enemies = [];
const enemyWidth = 50;
const enemyHeight = 50;
const enemySpeed = 2;

// Массив для бонусов
const bonuses = [];
const bonusWidth = 30;
const bonusHeight = 30;
const bonusSpeed = 2;

// Флаги для отслеживания нажатия клавиш
const keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    shoot: false,
};

// Массив для хранения пуль
const bullets = [];
const bulletSpeed = 7;
let canShoot = true; // Флаг для контроля стрельбы
const shootDelay = 200; // Задержка в миллисекундах

// Переменная для счёта и жизней
let score = 0;
let lives = 3; // Количество жизней

// Функция для отображения счёта
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width - 120, 30);
}

// Функция для отображения жизней
function drawLives() {
    for (let i = 0; i < lives; i++) {
        ctx.drawImage(heartImage, 10 + i * 30, 10, 25, 25);
    }
}

// Функция для отрисовки фона
function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

// Функция для отрисовки игрока
function drawPlayer() {
    ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
}

// Функция для отрисовки врагов
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.drawImage(enemyImage, enemy.x, enemy.y, enemyWidth, enemyHeight);
    });
}

// Функция для отрисовки бонусов
function drawBonuses() {
    bonuses.forEach(bonus => {
        if (bonus.type === 'doubleShot') {
            ctx.drawImage(bonusDoubleShotImage, bonus.x, bonus.y, bonusWidth, bonusHeight);
        } else if (bonus.type === 'speed') {
            ctx.drawImage(bonusSpeedImage, bonus.x, bonus.y, bonusWidth, bonusHeight);
        }
    });
}

// Функция для отрисовки пуль
function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = 'white';
        ctx.fillRect(bullet.x, bullet.y, 5, 10);
    });
}

function movePlayer() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'a') keys.left = true;
        else if (event.key === 'd') keys.right = true;
        else if (event.key === 'w') keys.up = true;
        else if (event.key === 's') keys.down = true;
        else if (event.key === ' ') keys.shoot = true; // Проверка нажатия Space
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === 'a') keys.left = false;
        else if (event.key === 'd') keys.right = false;
        else if (event.key === 'w') keys.up = false;
        else if (event.key === 's') keys.down = false;
        else if (event.key === ' ') keys.shoot = false; // Сброс флага при отпускании
    });
}

function updatePlayerPosition() {
    if (keys.left && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.right && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if (keys.up && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys.down && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }
}

function shoot() {
    if (keys.shoot && canShoot) {
        if (player.doubleShot) {
            // Двойной выстрел (две пули)
            bullets.push({ x: player.x + 10, y: player.y });
            bullets.push({ x: player.x + player.width - 15, y: player.y });
        } else {
            // Обычный выстрел (одна пуля)
            bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y });
        }
        canShoot = false;
        setTimeout(() => {
            canShoot = true;
        }, shootDelay);
    }
}

function updateBullets() {
    bullets.forEach((bullet, bulletIndex) => {
        bullet.y -= bulletSpeed;
        if (bullet.y < 0) {
            bullets.splice(bulletIndex, 1);
        }

        enemies.forEach((enemy, enemyIndex) => {
            if (
                bullet.x < enemy.x + enemyWidth &&
                bullet.x + 5 > enemy.x &&
                bullet.y < enemy.y + enemyHeight &&
                bullet.y + 10 > enemy.y
            ) {
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                score += 10;
            }
        });
    });
}

function spawnEnemy() {
    const enemyX = Math.random() * (canvas.width - enemyWidth);
    const enemy = { x: enemyX, y: 0 };
    enemies.push(enemy);
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.y += enemySpeed;

        // Проверка столкновения с игроком
        if (
            enemy.x < player.x + player.width &&
            enemy.x + enemyWidth > player.x &&
            enemy.y < player.y + player.height &&
            enemy.y + enemyHeight > player.y
        ) {
            enemies.splice(index, 1);
            lives--; // Игрок теряет жизнь при столкновении с врагом
            if (lives === 0) {
                alert("Game Over!"); // Окно с сообщением об окончании игры
                document.location.reload(); // Перезагрузка игры
            }
        }

        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
        }
    });
}

// Функция спавна бонуса
function spawnBonus() {
    const bonusX = Math.random() * (canvas.width - bonusWidth);
    const bonusType = Math.random() < 0.5 ? 'doubleShot' : 'speed'; // Рандомный выбор бонуса
    const bonus = { x: bonusX, y: 0, type: bonusType };
    bonuses.push(bonus);
}

function updateBonuses() {
    bonuses.forEach((bonus, index) => {
        bonus.y += bonusSpeed;

        // Проверка столкновения бонуса с игроком
        if (
            bonus.x < player.x + player.width &&
            bonus.x + bonusWidth > player.x &&
            bonus.y < player.y + player.height &&
            bonus.y + bonusHeight > player.y
        ) {
            bonuses.splice(index, 1);

            if (bonus.type === 'doubleShot') {
                player.doubleShot = true; // Активируем двойной выстрел
                setTimeout(() => {
                    player.doubleShot = false; // Через 10 секунд бонус пропадает
                }, 10000);
            } else if (bonus.type === 'speed') {
                player.speed = 13; // Увеличиваем скорость
                player.speedBoost = true; // Активируем флаг
                setTimeout(() => {
                    player.speed = 10; // Через 10 секунд возвращаем скорость
                    player.speedBoost = false;
                }, 10000);
            }
        }

        if (bonus.y > canvas.height) {
            bonuses.splice(index, 1);
        }
    });
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawPlayer();
    drawEnemies();
    drawBonuses();
    drawBullets();
    drawScore();
    drawLives();

    updatePlayerPosition();
    shoot(); // Вызов функции стрельбы
    updateBullets();
    updateEnemies();
    updateBonuses();

    requestAnimationFrame(gameLoop);
}

// Запуск игры
movePlayer();
setInterval(spawnEnemy, 1000); // Спавн врагов каждые 1 секунды
setInterval(spawnBonus, 30000); // Спавн бонусов каждые 30 секунд
gameLoop();
