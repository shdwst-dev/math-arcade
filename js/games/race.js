let raceState = {
    lane: 1, // 0: Izq, 1: Centro, 2: Der
    items: [],
    speed: 2,
    spawnRate: 150, // Frames
    frame: 0
};

function initRace() {
    containers.race.classList.remove('hidden');
    const player = document.getElementById('player-car');
    const container = document.getElementById('race-items-container');
    const qDisplay = document.getElementById('race-question');

    container.innerHTML = '';
    raceState.lane = 1;
    raceState.items = [];
    raceState.frame = 0;
    raceState.speed = 1.5; // Velocidad inicial lenta
    updateCarPos();

    // Pregunta actual
    let currentQ = getRandomQuestion();
    if (!currentQ) return;
    qDisplay.innerHTML = `$$${currentQ.q}$$`;
    refreshMath();

    function getRandomQuestion() {
        const list = database[currentState.topic];
        if (!list || list.length === 0) return null;
        return list[Math.floor(Math.random() * list.length)];
    }

    function gameLoop() {
        if (!currentState.isPlaying) return;
        raceState.frame++;

        // Generar obstáculo/respuesta
        if (raceState.frame % raceState.spawnRate === 0) {
            const MAX_ITEMS = 8;
            if (raceState.items.length < MAX_ITEMS) {
                const isCorrect = Math.random() > 0.6; // 40% chance de que sea la respuesta correcta
                const lane = Math.floor(Math.random() * 3);

                const item = document.createElement('div');
                item.className = 'absolute w-1/3 flex justify-center items-center text-xs font-bold text-white p-1 rounded falling-item';
                item.style.left = (lane * 33.33) + '%';
                item.style.top = '-50px';

                // Contenido
                const content = isCorrect ? currentQ.a : currentQ.distractors[Math.floor(Math.random() * currentQ.distractors.length)];
                item.innerHTML = `<span class="bg-gray-700 px-1 py-1 rounded text-xs max-w-full overflow-hidden">$$${content}$$</span>`;

                container.appendChild(item);
                raceState.items.push({ el: item, lane: lane, y: -50, isCorrect: isCorrect, value: content });
                refreshMath();
            }
        }

        // Iteración inversa: al eliminar, no se afectan índices anteriores
        for (let i = raceState.items.length - 1; i >= 0; i--) {
            const item = raceState.items[i];
            item.y += raceState.speed;
            item.el.style.top = item.y + 'px';

            // Colisión (Altura contenedor ~500px. Coche en bottom 4 aprox 450px)
            if (item.y > 420 && item.y < 480 && item.lane === raceState.lane) {
                if (item.isCorrect) {
                    updateScore(50);
                    raceState.speed += 0.1; // Aumentar dificultad
                    // Nueva pregunta
                    currentQ = getRandomQuestion();
                    qDisplay.innerHTML = `$$${currentQ.q}$$`;
                    refreshMath();
                } else {
                    updateScore(-20);
                    if (currentState.score < -100) gameOver(false);
                }
                
                // Efecto visual simple y remover
                item.el.style.backgroundColor = item.isCorrect ? 'green' : 'red';
                setTimeout(() => item.el.remove(), 100);
                raceState.items.splice(i, 1);
                continue;
            }

            // Limpiar items pasados
            if (item.y > 520) {
                item.el.remove();
                raceState.items.splice(i, 1);
            }
        }

        currentState.gameLoop = requestAnimationFrame(gameLoop);
    }

    gameLoop();
}

function updateCarPos() {
    const player = document.getElementById('player-car');
    player.style.left = (raceState.lane * 33.33) + '%';
}

function moveCar(dir) {
    if (currentState.game !== 'race') return;
    raceState.lane += dir;
    if (raceState.lane < 0) raceState.lane = 0;
    if (raceState.lane > 2) raceState.lane = 2;
    updateCarPos();
}

// Teclado
document.addEventListener('keydown', (e) => {
    if (currentState.game === 'race') {
        if (e.key === 'ArrowLeft') moveCar(-1);
        if (e.key === 'ArrowRight') moveCar(1);
    }
});
