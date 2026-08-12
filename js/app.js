// ------------------------------------------
// 1. BASE DE DATOS DE PREGUNTAS
// ------------------------------------------
const database = {
    fundamentos: typeof dataFundamentos !== 'undefined' ? dataFundamentos : [],
    diferencial: typeof dataDiferencial !== 'undefined' ? dataDiferencial : [],
    integral: typeof dataIntegral !== 'undefined' ? dataIntegral : []
};

// ------------------------------------------
// 2. ESTADO GLOBAL
// ------------------------------------------
let currentState = {
    topic: null,
    subtopic: null, // null significa "todos los subtemas"
    game: null,
    score: 0,
    isPlaying: false,
    timer: null,
    gameLoop: null,
    difficulty: 'Normal'
};

// Referencias al DOM
const screens = {
    topic: document.getElementById('screen-topic'),
    subtopic: document.getElementById('screen-subtopic'),
    gameSelect: document.getElementById('screen-game-select'),
    gameArea: document.getElementById('screen-game-area'),
    stats: document.getElementById('screen-stats')
};
const containers = {
    memory: document.getElementById('game-memory'),
    bomb: document.getElementById('game-bomb'),
    race: document.getElementById('game-race')
};
const displays = {
    score: document.getElementById('score-display'),
    topic: document.getElementById('current-topic-display'),
    gameTopic: document.getElementById('game-topic-display'),
    infoBar: document.getElementById('top-bar-info')
};

// ------------------------------------------
// 3. NAVEGACIÓN Y UTILIDADES
// ------------------------------------------
function showScreen(screenName) {
    let currentScreen = null;
    ['topic', 'subtopic', 'gameSelect', 'gameArea', 'stats'].forEach(s => {
        if (screens[s] && !screens[s].classList.contains('hidden')) {
            currentScreen = screens[s];
        }
    });

    document.getElementById('modal-gameover').classList.add('hidden');

    if (currentScreen && currentScreen !== screens[screenName]) {
        currentScreen.classList.remove('screen-enter');
        currentScreen.classList.add('screen-exit');
        setTimeout(() => {
            currentScreen.classList.add('hidden');
            currentScreen.classList.remove('screen-exit');
            if (screens[screenName]) {
                screens[screenName].classList.remove('hidden');
                screens[screenName].classList.add('screen-enter');
            }
        }, 200);
    } else {
        if (screens[screenName]) {
            screens[screenName].classList.remove('hidden');
            screens[screenName].classList.add('screen-enter');
        }
    }
}

function showTutorial(gameType) {
    const tutorialId = `tutorial-${gameType}`;
    const tutorial = document.getElementById(tutorialId);
    if (tutorial) {
        tutorial.classList.remove('hidden');
    }
}

function closeTutorial(gameType) {
    const tutorialId = `tutorial-${gameType}`;
    const tutorial = document.getElementById(tutorialId);
    if (tutorial) {
        tutorial.classList.add('hidden');
    }
}

function showSubtopicScreen(topic) {
    currentState.topic = topic;
    const container = document.getElementById('subtopic-grid');
    container.innerHTML = '';
    
    // Nombres bonitos
    const names = { fundamentos: 'Fundamentos', diferencial: 'Cálculo Diferencial', integral: 'Cálculo Integral' };
    document.getElementById('subtopic-title').innerText = `Sección: ${names[topic]}`;
    
    const topicSubtemas = subtemas[topic] || [];
    topicSubtemas.forEach(sub => {
        // Crear botón para cada subtema
        const btn = document.createElement('button');
        btn.className = 'bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border-2 border-gray-600 transition-all hover:scale-105 flex flex-col items-center justify-center text-center h-full';
        btn.innerHTML = `<div class="text-3xl mb-2">${sub.emoji}</div><h3 class="font-bold text-sm leading-tight">${sub.nombre}</h3>`;
        btn.onclick = () => selectSubtopic(sub.key);
        container.appendChild(btn);
    });
    
    showScreen('subtopic');
}

function selectSubtopic(subtopicKey) {
    currentState.subtopic = subtopicKey;

    const names = { fundamentos: 'Fundamentos', diferencial: 'Cálculo Diferencial', integral: 'Cálculo Integral' };
    
    let subtitleText = names[currentState.topic];
    if (subtopicKey) {
        const sub = subtemas[currentState.topic].find(s => s.key === subtopicKey);
        if (sub) subtitleText += ` > ${sub.nombre}`;
    } else {
        subtitleText += ` > Todos los Temas`;
    }
    
    document.getElementById('topic-subtitle').innerText = `Tema: ${subtitleText}`;
    displays.topic.innerText = subtitleText;
    displays.gameTopic.innerText = `Tema: ${subtitleText}`;

    displays.gameTopic.innerText = `Tema: ${subtitleText}`;

    // Update difficulty selection if present
    const diffSelect = document.getElementById('difficulty-select');
    if (diffSelect) {
        currentState.difficulty = diffSelect.value;
    }

    // Mostrar high scores visibles en la pantalla de selección
    ['memory', 'bomb', 'race'].forEach(game => {
        const el = document.getElementById(`hs-${game}`);
        if (el) el.innerText = `🏆 Mejor: ${Storage.getHighScore(currentState.topic, subtopicKey, game, currentState.difficulty)}`;
    });

    showScreen('gameSelect');
}

function updateDifficulty() {
    const diffSelect = document.getElementById('difficulty-select');
    if (diffSelect) {
        currentState.difficulty = diffSelect.value;
        const el = document.getElementById(`hs-race`);
        if (el) el.innerText = `🏆 Mejor: ${Storage.getHighScore(currentState.topic, currentState.subtopic, 'race', currentState.difficulty)}`;
    }
}

function goToMenu() {
    stopAllGames();
    displays.infoBar.classList.add('hidden');
    showScreen('topic');
}

function getFilteredQuestions() {
    const allQuestions = database[currentState.topic] || [];
    if (!currentState.subtopic) return allQuestions; // "Todos"
    return allQuestions.filter(q => q.subtema === currentState.subtopic);
}

function startGame(gameType) {
    const questions = getFilteredQuestions();
    const minRequired = gameType === 'memory' ? 6 : 3;
    
    if (questions.length < minRequired) {
        showInsufficientModal(gameType, questions.length, minRequired);
        return;
    }

    currentState.game = gameType;
    currentState.score = 0;
    currentState.isPlaying = true;
    updateScore(0);

    showScreen('gameArea');
    displays.infoBar.classList.remove('hidden');

    // Ocultar contenedores de juegos específicos
    Object.values(containers).forEach(c => c.classList.add('hidden'));

    // Iniciar lógica específica (asume que las funciones init* existen globalmente)
    if (gameType === 'memory' && typeof initMemory === 'function') initMemory();
    if (gameType === 'bomb' && typeof initBomb === 'function') initBomb();
    if (gameType === 'race' && typeof initRace === 'function') initRace();
}

function showInsufficientModal(gameType, actual, required) {
    const modal = document.getElementById('modal-insufficient');
    const msg = document.getElementById('insufficient-msg');
    const gameNames = { memory: 'Memorama', bomb: 'Bomba', race: 'Carrera' };
    
    msg.innerHTML = `El juego de <b>${gameNames[gameType]}</b> necesita al menos <b>${required}</b> preguntas.<br><br>Este tema actualmente tiene <b>${actual}</b> preguntas.`;
    modal.classList.remove('hidden');
}

function closeInsufficientModal() {
    document.getElementById('modal-insufficient').classList.add('hidden');
}

function updateScore(pts) {
    currentState.score += pts;
    displays.score.innerText = `Puntos: ${currentState.score}`;
}

function gameOver(win) {
    stopAllGames();
    const modal = document.getElementById('modal-gameover');
    const title = document.getElementById('go-title');
    const msg = document.getElementById('go-message');

    // Guardar puntuación (persistencia)
    const isRecord = Storage.saveIfHighScore(
        currentState.topic,
        currentState.subtopic,
        currentState.game,
        currentState.score,
        currentState.difficulty
    );
    const best = Storage.getHighScore(currentState.topic, currentState.subtopic, currentState.game, currentState.difficulty);

    modal.classList.remove('hidden');
    title.innerHTML = win ? "🎉 ¡VICTORIA! 🎉" : "💀 GAME OVER 💀";
    title.className = win ? "text-3xl font-bold mb-4 pixel-font text-green-400" : "text-3xl font-bold mb-4 pixel-font text-red-400";
    
    msg.innerHTML = `Puntuación Final: ${currentState.score}<br>
        <span class="text-sm text-yellow-300 mt-2 inline-block ${isRecord ? 'new-record font-bold text-base text-yellow-400' : ''}">
            🏆 Mejor: ${best} ${isRecord ? '¡NUEVO RÉCORD!' : ''}
        </span>`;

    // Limpiar confetti previo si existe
    document.querySelectorAll('.confetti').forEach(e => e.remove());
    
    if (win) {
        // Generar confetti
        const colors = ['#fce18a', '#ff726d', '#b48def', '#f4306d'];
        for (let i = 0; i < 60; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }
    }
}

function restartGame() {
    startGame(currentState.game);
}

function stopAllGames() {
    currentState.isPlaying = false;
    clearInterval(currentState.timer);
    cancelAnimationFrame(currentState.gameLoop);
}

let mathRefreshTimer = null;
function refreshMath() {
    // Forzar renderizado de MathJax en los nuevos elementos de manera optimizada (debounce)
    clearTimeout(mathRefreshTimer);
    mathRefreshTimer = setTimeout(() => {
        if (window.MathJax) {
            MathJax.typesetPromise();
        }
    }, 50);
}

// ------------------------------------------
// 4. ESTADÍSTICAS
// ------------------------------------------
function showStats() {
    const scores = Storage.getAll();
    const container = document.getElementById('stats-container');
    container.innerHTML = '';
    
    if (Object.keys(scores).length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400 mt-10">No hay récords guardados aún. ¡Juega para empezar!</p>';
        showScreen('stats');
        return;
    }

    const sections = {
        'fundamentos': 'Fundamentos',
        'diferencial': 'Cálculo Diferencial',
        'integral': 'Cálculo Integral'
    };
    const games = {
        'memory': 'Memorama',
        'bomb': 'Bomba',
        'race': 'Carrera'
    };

    // Agrupar por sección
    const grouped = { fundamentos: [], diferencial: [], integral: [] };
    
    for (const [key, data] of Object.entries(scores)) {
        // key = topic_subtopic_game o topic_subtopic_game_difficulty
        const parts = key.split('_');
        if (parts.length >= 3) {
            const topic = parts[0];
            const subtopic = parts[1];
            const game = parts[2];
            const difficulty = parts[3] || 'Normal';
            
            if (grouped[topic]) {
                let subName = 'Todos los temas';
                if (subtopic !== 'todos') {
                    const subInfo = subtemas[topic].find(s => s.key === subtopic);
                    if (subInfo) subName = subInfo.nombre;
                }
                
                grouped[topic].push({
                    subtopic: subName,
                    game: games[game] || game,
                    score: data.score,
                    date: new Date(data.date).toLocaleDateString(),
                    difficulty: difficulty
                });
            }
        }
    }

    // Renderizar
    for (const topic of ['fundamentos', 'diferencial', 'integral']) {
        if (grouped[topic].length > 0) {
            // Ordenar por juego y luego subtema
            grouped[topic].sort((a, b) => a.game.localeCompare(b.game) || a.subtopic.localeCompare(b.subtopic));
            
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'mb-6';
            sectionDiv.innerHTML = `<h3 class="text-xl font-bold text-blue-300 border-b border-gray-600 pb-2 mb-3">${sections[topic]}</h3>`;
            
            const grid = document.createElement('div');
            grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-3';
            
            grouped[topic].forEach(record => {
                const card = document.createElement('div');
                card.className = 'bg-gray-700 p-3 rounded-lg border border-gray-600 flex justify-between items-center';
                card.innerHTML = `
                    <div>
                        <div class="font-bold text-yellow-400">${record.game} <span class="text-xs text-gray-400 font-normal">(${record.difficulty})</span></div>
                        <div class="text-sm text-white">${record.subtopic}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-xl font-bold text-green-400">${record.score}</div>
                        <div class="text-xs text-gray-400">${record.date}</div>
                    </div>
                `;
                grid.appendChild(card);
            });
            
            sectionDiv.appendChild(grid);
            container.appendChild(sectionDiv);
        }
    }
    
    showScreen('stats');
}

function clearStats() {
    if (confirm('¿Estás seguro de que deseas borrar todos tus récords? Esta acción no se puede deshacer.')) {
        Storage.clearAll();
        showStats(); // Refrescar vista
    }
}
