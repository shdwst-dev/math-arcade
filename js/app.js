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
    gameLoop: null
};

// Referencias al DOM
const screens = {
    topic: document.getElementById('screen-topic'),
    subtopic: document.getElementById('screen-subtopic'),
    gameSelect: document.getElementById('screen-game-select'),
    gameArea: document.getElementById('screen-game-area')
};
const containers = {
    memory: document.getElementById('game-memory'),
    bomb: document.getElementById('game-bomb'),
    race: document.getElementById('game-race')
};
const displays = {
    score: document.getElementById('score-display'),
    topic: document.getElementById('current-topic-display'),
    infoBar: document.getElementById('top-bar-info')
};

// ------------------------------------------
// 3. NAVEGACIÓN Y UTILIDADES
// ------------------------------------------
function showScreen(screenName) {
    // Ocultar todas
    screens.topic.classList.add('hidden');
    screens.subtopic.classList.add('hidden');
    screens.gameSelect.classList.add('hidden');
    screens.gameArea.classList.add('hidden');
    document.getElementById('modal-gameover').classList.add('hidden');

    // Mostrar seleccionada
    if (screens[screenName]) {
        screens[screenName].classList.remove('hidden');
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

    // Mostrar high scores visibles en la pantalla de selección
    ['memory', 'bomb', 'race'].forEach(game => {
        const el = document.getElementById(`hs-${game}`);
        if (el) el.innerText = `🏆 Mejor: ${Storage.getHighScore(currentState.topic, subtopicKey, game)}`;
    });

    showScreen('gameSelect');
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
    if (questions.length === 0) {
        alert("¡Aún no hay preguntas para este subtema!");
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
        currentState.score
    );
    const best = Storage.getHighScore(currentState.topic, currentState.subtopic, currentState.game);

    modal.classList.remove('hidden');
    title.innerText = win ? "¡VICTORIA!" : "GAME OVER";
    title.className = win ? "text-3xl font-bold mb-4 pixel-font text-green-400" : "text-3xl font-bold mb-4 pixel-font text-red-400";
    
    msg.innerHTML = `Puntuación Final: ${currentState.score}<br>
        <span class="text-sm text-yellow-300 mt-2 inline-block">
            🏆 Mejor: ${best} ${isRecord ? '¡NUEVO RÉCORD!' : ''}
        </span>`;
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
