const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = canvas.width;
const H = canvas.height;

const FLOOR = 540;

let mode = "cpu";
let gameRunning = false;
let timer = 60;
let timerInterval;
let round = 1;

const keys = {};

document.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;

    if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
    ) {
        e.preventDefault();
    }
});

document.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

/* =========================
   PANTALLAS
========================= */

const menu = document.getElementById("menu");
const instructions = document.getElementById("instructions");
const gameScreen = document.getElementById("gameScreen");
const result = document.getElementById("result");

function showScreen(screen) {

    document.querySelectorAll(".screen").forEach(s => {
        s.classList.remove("active");
    });

    screen.classList.add("active");
}

document.getElementById("cpuBtn").onclick = () => {
    mode = "cpu";
    startGame();
};

document.getElementById("pvpBtn").onclick = () => {
    mode = "pvp";
    startGame();
};

document.getElementById("instructionsBtn").onclick = () => {
    showScreen(instructions);
};

document.querySelector(".backBtn").onclick = () => {
    showScreen(menu);
};

document.getElementById("quitBtn").onclick = () => {
    gameRunning = false;
    clearInterval(timerInterval);
    showScreen(menu);
};

document.getElementById("menuBtn").onclick = () => {
    showScreen(menu);
};

document.getElementById("rematchBtn").onclick = () => {
    startGame();
};

/* =========================
   JUGADOR
========================= */

class Fighter {

    constructor(x, color, name, player) {

        this.x = x;
        this.y = FLOOR;

        this.vx = 0;
        this.vy = 0;

        this.width = 65;
        this.height = 120;

        this.color = color;
        this.name = name;
        this.player = player;

        this.hp = 100;
        this.ki = 25;

        this.maxHP = 100;
        this.maxKI = 100;

        this.direction = player === 1 ? 1 : -1;

        this.grounded = true;

        this.attacking = false;
        this.attackType = "";
        this.attackTimer = 0;

        this.cooldown = 0;

        this.transformed = false;

        this.combo = 0;
        this.comboTimer = 0;

        this.stun = 0;
    }

    reset(x) {

        this.x = x;
        this.y = FLOOR;

        this.vx = 0;
        this.vy = 0;

        this.hp = 100;
        this.ki = 25;

        this.grounded = true;

        this.attacking = false;
        this.attackTimer = 0;

        this.cooldown = 0;

        this.transformed = false;

        this.combo = 0;
        this.stun = 0;
    }

    update(opponent) {

        if (this.cooldown > 0)
            this.cooldown--;

        if (this.stun > 0) {
            this.stun--;
            return;
        }

        this.comboTimer--;

        if (this.comboTimer <= 0)
            this.combo = 0;

        this.ki += .025;

        if (this.ki > 100)
            this.ki = 100;

        if (this.attackTimer > 0) {

            this.attackTimer--;

            if (this.attackTimer === 8) {
                this.hitOpponent(opponent);
            }

        } else {

            this.handleMovement(opponent);

        }

        this.vy += .8;

        this.x += this.vx;
        this.y += this.vy;

        this.vx *= .78;

        if (this.y >= FLOOR) {
            this.y = FLOOR;
            this.vy = 0;
            this.grounded = true;
        }

        this.x = Math.max(50, Math.min(W - 50, this.x));

        if (Math.abs(opponent.x - this.x) > 100) {

            this.direction =
                opponent.x > this.x ? 1 : -1;

        }
    }

    handleMovement(opponent) {

        if (this.player === 1) {

            if (keys["a"])
                this.vx = -5;

            if (keys["d"])
                this.vx = 5;

            if (keys["w"] && this.grounded) {
                this.vy = -15;
                this.grounded = false;
            }

            if (keys["j"])
                this.basicAttack(opponent);

            if (keys["k"])
                this.kick(opponent);

            if (keys["l"])
                this.kiBlast(opponent);

            if (keys["u"])
                this.special(opponent);

            if (keys["i"])
                this.transform();

            if (keys["o"])
                this.ultimate(opponent);

        } else {

            if (mode === "pvp") {

                if (keys["arrowleft"])
                    this.vx = -5;

                if (keys["arrowright"])
                    this.vx = 5;

                if (keys["arrowup"] && this.grounded) {
                    this.vy = -15;
                    this.grounded = false;
                }

                if (keys["1"])
                    this.basicAttack(opponent);

                if (keys["2"])
                    this.kick(opponent);

                if (keys["3"])
                    this.kiBlast(opponent);

                if (keys["4"])
                    this.special(opponent);

                if (keys["5"])
                    this.transform();

                if (keys["6"])
                    this.ultimate(opponent);

            } else {

                this.cpu(opponent);

            }
        }
    }

    cpu(opponent) {

        const distance = opponent.x - this.x;
        const abs = Math.abs(distance);

        this.direction = distance > 0 ? 1 : -1;

        if (this.stun > 0)
            return;

        if (abs > 180) {

            this.vx = this.direction * 3.2;

        } else {

            this.vx = 0;

            const random = Math.random();

            if (abs < 110 && this.cooldown <= 0) {

                if (this.ki > 70 && random < .03) {
                    this.special(opponent);
                }

                else if (random < .05) {
                    this.basicAttack(opponent);
                }

                else if (random < .08) {
                    this.kick(opponent);
                }

            }

            if (this.ki > 50 && random < .008) {
                this.kiBlast(opponent);
            }

            if (!this.transformed && this.ki > 80 && random < .004) {
                this.transform();
            }

            if (this.ki >= 100 && random < .002) {
                this.ultimate(opponent);
            }
        }

        if (Math.random() < .005 && this.grounded) {

            this.vy = -14;
            this.grounded = false;

        }
    }

    basicAttack(opponent) {

        if (this.cooldown > 0)
            return;

        this.attacking = true;
        this.attackType = "punch";
        this.attackTimer = 14;
        this.cooldown = 20;

        playSound(220, .08);
    }

    kick(opponent) {

        if (this.cooldown > 0)
            return;

        this.attacking = true;
        this.attackType = "kick";
        this.attackTimer = 17;
        this.cooldown = 25;

        playSound(150, .1);
    }

    kiBlast(opponent) {

        if (this.cooldown > 0 || this.ki < 15)
            return;

        this.ki -= 15;

        projectiles.push(
            new Projectile(
                this.x + this.direction * 50,
                this.y - 65,
                this.direction,
                this
            )
        );

        this.cooldown = 25;

        playSound(500, .15);
    }

    special(opponent) {

        if (this.cooldown > 0 || this.ki < 35)
            return;

        this.ki -= 35;

        this.attacking = true;
        this.attackType = "special";
        this.attackTimer = 30;
        this.cooldown = 55;

        effects.push(
            new EnergyWave(this)
        );

        playSound(90, .4);
    }

    ultimate(opponent) {

        if (this.cooldown > 0 || this.ki < 100)
            return;

        this.ki = 0;

        this.attacking = true;
        this.attackType = "ultimate";
        this.attackTimer = 55;
        this.cooldown = 100;

        effects.push(
            new UltimateBeam(this)
        );

        playSound(50, .8);
    }

    transform() {

        if (this.transformed || this.ki < 70)
            return;

        this.ki -= 70;

        this.transformed = true;

        this.hp += 20;

        if (this.hp > 100)
            this.hp = 100;

        effects.push(
            new TransformationEffect(this)
        );

        playSound(700, .7);
    }

    hitOpponent(opponent) {

        const distance =
            Math.abs(opponent.x - this.x);

        if (distance > 130)
            return;

        let damage = 0;

        if (this.attackType === "punch")
            damage = 5;

        if (this.attackType === "kick")
            damage = 8;

        if (this.attackType === "special")
            damage = 18;

        if (this.attackType === "ultimate")
            damage = 40;

        if (this.transformed)
            damage *= 1.35;

        opponent.hp -= damage;

        opponent.stun = 10;

        this.combo++;
        this.comboTimer = 90;

        this.ki += 5;

        if (this.ki > 100)
            this.ki = 100;

        showDamage(opponent.x, opponent.y - 100, damage);

        playSound(
            this.attackType === "ultimate"
                ? 100
                : 300,
            .12
        );
    }

    draw() {

        const x = Math.floor(this.x);
        const y = Math.floor(this.y);

        ctx.save();

        ctx.translate(x, y);

        if (this.direction === -1)
            ctx.scale(-1, 1);

        /* Aura */

        if (this.transformed) {

            ctx.fillStyle = "rgba(255,220,40,.12)";
            ctx.beginPath();
            ctx.arc(0, -70, 75 + Math.random() * 10, 0, Math.PI * 2);
            ctx.fill();

            for (let i = 0; i < 4; i++) {

                ctx.fillStyle = "#ffe600";

                ctx.fillRect(
                    -30 + Math.random() * 60,
                    -140 - Math.random() * 30,
                    4,
                    15
                );
            }
        }

        /* sombra */

        ctx.fillStyle = "rgba(0,0,0,.4)";
        ctx.beginPath();
        ctx.ellipse(0, 5, 45, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        /* piernas */

        ctx.fillStyle = "#17172a";

        ctx.fillRect(-25, -40, 20, 45);
        ctx.fillRect(5, -40, 20, 45);

        /* botas */

        ctx.fillStyle = "#444";

        ctx.fillRect(-29, -5, 28, 10);
        ctx.fillRect(3, -5, 30, 10);

        /* cuerpo */

        ctx.fillStyle = this.color;

        ctx.fillRect(-28, -105, 56, 65);

        /* cinturón */

        ctx.fillStyle = "#ffcc00";
        ctx.fillRect(-29, -50, 58, 8);

        /* cuello */

        ctx.fillStyle = "#d8946b";
        ctx.fillRect(-10, -120, 20, 18);

        /* cabeza */

        ctx.fillStyle = "#e7a477";
        ctx.fillRect(-25, -145, 50, 40);

        /* cabello */

        ctx.fillStyle =
            this.transformed
                ? "#ffe900"
                : "#111";

        ctx.beginPath();

        ctx.moveTo(-28, -140);

        ctx.lineTo(-40, -165);
        ctx.lineTo(-20, -158);
        ctx.lineTo(-15, -185);
        ctx.lineTo(0, -160);
        ctx.lineTo(15, -187);
        ctx.lineTo(20, -158);
        ctx.lineTo(40, -168);
        ctx.lineTo(27, -140);

        ctx.closePath();

        ctx.fill();

        /* ojos */

        ctx.fillStyle = "#111";

        ctx.fillRect(5, -130, 7, 5);

        /* brazo */

        ctx.fillStyle = this.color;

        if (
            this.attacking &&
            this.attackType !== "ultimate"
        ) {

            ctx.fillRect(
                20,
                -95,
                55,
                18
            );

        } else {

            ctx.fillRect(25, -95, 25, 18);

        }

        /* puño */

        if (this.attacking) {

            ctx.fillStyle = "#e7a477";

            ctx.fillRect(
                this.attackType === "kick"
                    ? 60
                    : 65,
                -95,
                18,
                18
            );
        }

        ctx.restore();
    }
}

/* =========================
   PROYECTILES
========================= */

class Projectile {

    constructor(x, y, direction, owner) {

        this.x = x;
        this.y = y;

        this.direction = direction;

        this.owner = owner;

        this.speed = 10;

        this.life = 100;

        this.size = 13;
    }

    update() {

        this.x += this.direction * this.speed;

        this.life--;

        const opponent =
            this.owner === player1
                ? player2
                : player1;

        if (
            Math.abs(this.x - opponent.x) < 55 &&
            Math.abs(this.y - (opponent.y - 70)) < 80
        ) {

            opponent.hp -= 10;

            opponent.stun = 8;

            showDamage(
                opponent.x,
                opponent.y - 100,
                10
            );

            this.life = 0;

            playSound(350, .1);
        }
    }

    draw() {

        ctx.save();

        ctx.shadowBlur = 25;
        ctx.shadowColor = "#00bfff";

        ctx.fillStyle = "#6dfcff";

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }
}

/* =========================
   EFECTOS
========================= */

class EnergyWave {

    constructor(owner) {

        this.owner = owner;
        this.life = 30;
    }

    update() {

        this.life--;

        const opponent =
            this.owner === player1
                ? player2
                : player1;

        const distance =
            Math.abs(this.owner.x - opponent.x);

        if (
            this.life === 20 &&
            distance < 260
        ) {

            opponent.hp -=
                this.owner.transformed
                    ? 26
                    : 18;

            opponent.stun = 20;

            showDamage(
                opponent.x,
                opponent.y - 100,
                18
            );
        }
    }

    draw() {

        const x =
            this.owner.x +
            this.owner.direction * 50;

        ctx.save();

        ctx.shadowBlur = 35;
        ctx.shadowColor = "#00eaff";

        ctx.fillStyle = "#4fffff";

        ctx.fillRect(
            x,
            this.owner.y - 105,
            this.owner.direction * 250,
            45
        );

        ctx.fillStyle = "white";

        ctx.fillRect(
            x,
            this.owner.y - 98,
            this.owner.direction * 230,
            20
        );

        ctx.restore();
    }
}

class UltimateBeam {

    constructor(owner) {

        this.owner = owner;
        this.life = 55;
    }

    update() {

        this.life--;

        const opponent =
            this.owner === player1
                ? player2
                : player1;

        if (
            this.life === 30 ||
            this.life === 15
        ) {

            if (
                Math.abs(
                    this.owner.x -
                    opponent.x
                ) < 500
            ) {

                opponent.hp -= 20;

                opponent.stun = 20;

                showDamage(
                    opponent.x,
                    opponent.y - 110,
                    20
                );
            }
        }
    }

    draw() {

        const start =
            this.owner.x +
            this.owner.direction * 35;

        ctx.save();

        ctx.shadowBlur = 50;
        ctx.shadowColor = "#ff00ff";

        ctx.fillStyle = "#ff55ff";

        ctx.fillRect(
            start,
            this.owner.y - 115,
            this.owner.direction * 600,
            100
        );

        ctx.fillStyle = "white";

        ctx.fillRect(
            start,
            this.owner.y - 95,
            this.owner.direction * 600,
            55
        );

        ctx.restore();
    }
}

class TransformationEffect {

    constructor(owner) {

        this.owner = owner;
        this.life = 70;
    }

    update() {
        this.life--;
    }

    draw() {

        ctx.save();

        ctx.globalAlpha =
            this.life / 70;

        ctx.strokeStyle = "#ffe600";
        ctx.lineWidth = 8;

        ctx.beginPath();

        ctx.arc(
            this.owner.x,
            this.owner.y - 80,
            80 - this.life,
            0,
            Math.PI * 2
        );

        ctx.stroke();

        ctx.restore();
    }
}

/* =========================
   DAÑO
========================= */

let damageTexts = [];

function showDamage(x, y, damage) {

    damageTexts.push({
        x,
        y,
        damage,
        life: 40
    });
}

function updateDamageTexts() {

    damageTexts.forEach(d => {

        d.y -= 1;
        d.life--;

    });

    damageTexts =
        damageTexts.filter(
            d => d.life > 0
        );
}

function drawDamageTexts() {

    ctx.font = "bold 25px Arial";
    ctx.textAlign = "center";

    damageTexts.forEach(d => {

        ctx.fillStyle = "#ffe600";

        ctx.fillText(
            "-" + Math.round(d.damage),
            d.x,
            d.y
        );
    });

    ctx.textAlign = "left";
}

/* =========================
   ARENA
========================= */

function drawArena() {

    /* cielo */

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            H
        );

    gradient.addColorStop(
        0,
        "#090b2e"
    );

    gradient.addColorStop(
        .6,
        "#2b1947"
    );

    gradient.addColorStop(
        1,
        "#08080d"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    /* estrellas */

    ctx.fillStyle = "#fff";

    for (let i = 0; i < 70; i++) {

        const x =
            (i * 173) % W;

        const y =
            (i * 71) % 350;

        ctx.fillRect(
            x,
            y,
            2,
            2
        );
    }

    /* luna */

    ctx.fillStyle =
        "rgba(255,255,220,.8)";

    ctx.beginPath();

    ctx.arc(
        950,
        150,
        70,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /* montañas */

    ctx.fillStyle = "#17162d";

    ctx.beginPath();

    ctx.moveTo(0, FLOOR);

    ctx.lineTo(150, 370);
    ctx.lineTo(300, FLOOR);

    ctx.lineTo(500, 350);
    ctx.lineTo(700, FLOOR);

    ctx.lineTo(900, 360);
    ctx.lineTo(1200, FLOOR);

    ctx.closePath();

    ctx.fill();

    /* suelo */

    ctx.fillStyle = "#30303d";

    ctx.fillRect(
        0,
        FLOOR,
        W,
        H - FLOOR
    );

    /* líneas del suelo */

    ctx.strokeStyle = "#454555";
    ctx.lineWidth = 3;

    for (
        let x = -W;
        x < W * 2;
        x += 80
    ) {

        ctx.beginPath();

        ctx.moveTo(
            W / 2,
            FLOOR
        );

        ctx.lineTo(
            x,
            H
        );

        ctx.stroke();
    }

    ctx.strokeStyle = "#ff9d00";

    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.moveTo(
        0,
        FLOOR
    );

    ctx.lineTo(
        W,
        FLOOR
    );

    ctx.stroke();
}

/* =========================
   JUGADORES
========================= */

let player1;
let player2;

let projectiles = [];
let effects = [];

/* =========================
   INICIAR
========================= */

function startGame() {

    showScreen(gameScreen);

    player1 =
        new Fighter(
            330,
            "#1685ff",
            "PLAYER 1",
            1
        );

    player2 =
        new Fighter(
            870,
            "#ff3030",
            mode === "cpu"
                ? "CPU"
                : "PLAYER 2",
            2
        );

    timer = 60;

    round = 1;

    projectiles = [];
    effects = [];
    damageTexts = [];

    gameRunning = true;

    document.getElementById("p2Name").textContent =
        mode === "cpu"
            ? "CPU"
            : "PLAYER 2";

    document.getElementById("message").textContent =
        "ROUND 1";

    setTimeout(() => {

        if (gameRunning)
            document.getElementById("message").textContent =
                "FIGHT!";

    }, 1200);

    setTimeout(() => {

        document.getElementById("message").textContent = "";

    }, 2200);

    startTimer();

    requestAnimationFrame(gameLoop);
}

/* =========================
   TIMER
========================= */

function startTimer() {

    clearInterval(timerInterval);

    timerInterval =
        setInterval(() => {

            if (!gameRunning)
                return;

            timer--;

            document.getElementById("timer")
                .textContent = timer;

            if (timer <= 0) {

                clearInterval(timerInterval);

                endRound(
                    player1.hp >= player2.hp
                        ? player1
                        : player2
                );
            }

        }, 1000);
}

/* =========================
   GAME LOOP
========================= */

function gameLoop() {

    if (!gameRunning)
        return;

    update();

    draw();

    requestAnimationFrame(gameLoop);
}

/* =========================
   UPDATE
========================= */

function update() {

    player1.update(player2);
    player2.update(player1);

    projectiles.forEach(p => p.update());

    projectiles =
        projectiles.filter(
            p =>
                p.life > 0 &&
                p.x > -100 &&
                p.x < W + 100
        );

    effects.forEach(e => e.update());

    effects =
        effects.filter(
            e => e.life > 0
        );

    updateDamageTexts();

    updateHUD();

    if (player1.hp <= 0)
        endRound(player2);

    if (player2.hp <= 0)
        endRound(player1);
}

/* =========================
   DRAW
========================= */

function draw() {

    drawArena();

    effects.forEach(e => e.draw());

    projectiles.forEach(p => p.draw());

    player1.draw();
    player2.draw();

    drawDamageTexts();
}

/* =========================
   HUD
========================= */

function updateHUD() {

    document.getElementById("p1HP")
        .style.width =
        Math.max(
            0,
            player1.hp
        ) + "%";

    document.getElementById("p2HP")
        .style.width =
        Math.max(
            0,
            player2.hp
        ) + "%";

    document.getElementById("p1KI")
        .style.width =
        player1.ki + "%";

    document.getElementById("p2KI")
        .style.width =
        player2.ki + "%";

    document.getElementById("p1Form")
        .textContent =
        player1.transformed
            ? "⚡ SUPER WARRIOR"
            : "WARRIOR";

    document.getElementById("p2Form")
        .textContent =
        player2.transformed
            ? "⚡ SUPER WARRIOR"
            : "WARRIOR";

    document.getElementById("combo1")
        .textContent =
        player1.combo > 1
            ? player1.combo + " HIT COMBO!"
            : "";

    document.getElementById("combo2")
        .textContent =
        player2.combo > 1
            ? player2.combo + " HIT COMBO!"
            : "";
}

/* =========================
   RONDA
========================= */

let roundWins1 = 0;
let roundWins2 = 0;

function endRound(winner) {

    if (!gameRunning)
        return;

    gameRunning = false;

    clearInterval(timerInterval);

    if (winner === player1)
        roundWins1++;
    else
        roundWins2++;

    document.getElementById(
        winner === player1
            ? "p1Round1"
            : "p2Round1"
    ).classList.add("active");

    if (
        roundWins1 >= 2 ||
        roundWins2 >= 2
    ) {

        setTimeout(() => {

            showResult(
                winner === player1
                    ? "PLAYER 1"
                    : mode === "cpu"
                        ? "CPU"
                        : "PLAYER 2"
            );

        }, 1000);

        return;
    }

    setTimeout(() => {

        round++;

        player1.reset(330);
        player2.reset(870);

        timer = 60;

        document.getElementById("timer")
            .textContent = timer;

        document.getElementById("message")
            .textContent =
            "ROUND " + round;

        gameRunning = true;

        setTimeout(() => {

            document.getElementById("message")
                .textContent = "FIGHT!";

        }, 1000);

        setTimeout(() => {

            document.getElementById("message")
                .textContent = "";

        }, 1900);

        startTimer();

        requestAnimationFrame(gameLoop);

    }, 1800);
}

/* =========================
   RESULTADO
========================= */

function showResult(winner) {

    document.getElementById(
        "resultTitle"
    ).textContent =
        winner === "CPU"
            ? "DERROTA"
            : "VICTORIA";

    document.getElementById(
        "resultCharacter"
    ).textContent =
        winner;

    document.getElementById(
        "resultText"
    ).textContent =
        winner === "CPU"
            ? "La CPU dominó la arena."
            : "¡Has demostrado ser el guerrero más fuerte!";

    showScreen(result);
}

/* =========================
   SONIDO
========================= */

let audioContext;

function playSound(freq, duration) {

    try {

        if (!audioContext)
            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        oscillator.frequency.value =
            freq;

        oscillator.type = "square";

        gain.gain.setValueAtTime(
            .08,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            .001,
            audioContext.currentTime + duration
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime +
            duration
        );

    } catch (error) {

        console.log(
            "Audio no disponible"
        );
    }
}