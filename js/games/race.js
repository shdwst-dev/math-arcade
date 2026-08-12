let raceState = {
    lane: 1, // 0: Izq, 1: Centro, 2: Der
    items: [],
    speed: 2,
    spawnRate: 150, // Frames
    frame: 0
};

let RACE_TARGET_SCORE = 500;

function initRace() {
    containers.race.classList.remove('hidden');
    
    raceState.lane = 1;
    raceState.items = [];
    raceState.frame = 0;
    
    // Ajustar dificultad
    if (currentState.difficulty === 'Fácil') {
        raceState.speed = 1.0;
        raceState.spawnRate = 180;
        RACE_TARGET_SCORE = 300;
    } else if (currentState.difficulty === 'Difícil') {
        raceState.speed = 2.5;
        raceState.spawnRate = 100;
        RACE_TARGET_SCORE = 800;
    } else {
        // Normal
        raceState.speed = 1.5;
        raceState.spawnRate = 150;
        RACE_TARGET_SCORE = 500;
    }

    const player = document.getElementById('player-car');
    const container = document.getElementById('race-items-container');
    const qDisplay = document.getElementById('race-question');
    const goalDisplay = document.getElementById('race-goal');

    container.innerHTML = '';
    goalDisplay.innerText = `Meta: ${RACE_TARGET_SCORE} puntos`;
    updateCarPos();

    // Pregunta actual
    let currentQ = getRandomQuestion();
    if (!currentQ) return;
    qDisplay.innerHTML = `$$${currentQ.q}$$`;
    refreshMath();

    function getRandomQuestion() {
        const list = getFilteredQuestions();
        if (!list || list.length === 0) return null;
        return list[Math.floor(Math.random() * list.length)];
    }

    function gameLoop() {
        if (!currentState.isPlaying) return;
        raceState.frame++;

        // Aumentar velocidad gradualmente, máximo 2 veces la velocidad inicial
        const maxSpeed = currentState.difficulty === 'Fácil' ? 2 : (currentState.difficulty === 'Difícil' ? 5 : 3.5);
        if (raceState.speed < maxSpeed) raceState.speed += 0.001;
        
        // Disminuir tiempo de spawn, mínimo la mitad del inicial
        const minSpawnRate = currentState.difficulty === 'Fácil' ? 120 : (currentState.difficulty === 'Difícil' ? 60 : 90);
        if (raceState.spawnRate > minSpawnRate && raceState.frame % 300 === 0) raceState.spawnRate -= 5;
        
        if (currentState.score >= RACE_TARGET_SCORE) {
            gameOver(true);
            return;
        }

        // Generar obstáculo/respuesta
        if (raceState.frame % Math.floor(raceState.spawnRate) === 0) {
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

                    const reachedGoal = currentState.score >= RACE_TARGET_SCORE;
                    item.el.style.backgroundColor = 'green';
                    setTimeout(() => item.el.remove(), 100);
                    raceState.items.splice(i, 1);
                    if (reachedGoal) {
                        gameOver(true);
                        return;
                    }
                    continue;
                } else {
                    updateScore(-20);
                    
                    // Mostrar respuesta correcta en tooltip flotante
                    const tooltip = document.createElement('div');
                    tooltip.className = 'absolute bg-green-600 text-white p-2 rounded z-50 shadow-lg text-xs font-bold opacity-0 transition-opacity duration-300 pointer-events-none transform -translate-x-1/2';
                    tooltip.style.left = (raceState.lane * 33.33 + 16.66) + '%';
                    tooltip.style.top = '380px';
                    tooltip.innerHTML = `✅ $$${currentQ.a}$$`;
                    document.getElementById('game-race').appendChild(tooltip);
                    
                    // Renderizar math y animar entrada
                    refreshMath();
                    setTimeout(() => tooltip.classList.remove('opacity-0'), 10);
                    
                    // Animar salida y remover
                    setTimeout(() => {
                        tooltip.classList.add('opacity-0');
                        setTimeout(() => tooltip.remove(), 300);
                    }, 1500);

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
