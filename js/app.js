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
    game: null,
    score: 0,
    isPlaying: false,
    timer: null,
    gameLoop: null
};

// Referencias al DOM
const screens = {
    topic: document.getElementById('screen-topic'),
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
    screens.gameSelect.classList.add('hidden');
    screens.gameArea.classList.add('hidden');
    document.getElementById('modal-gameover').classList.add('hidden');

    // Mostrar seleccionada
    if (screenName === 'topic') screens.topic.classList.remove('hidden');
    if (screenName === 'gameSelect') screens.gameSelect.classList.remove('hidden');
    if (screenName === 'gameArea') screens.gameArea.classList.remove('hidden');
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

function selectTopic(topic) {
    currentState.topic = topic;

    // Texto bonito para el subtítulo
    const names = { fundamentos: 'Fundamentos', diferencial: 'Cálculo Diferencial', integral: 'Cálculo Integral' };
    document.getElementById('topic-subtitle').innerText = `Tema: ${names[topic]}`;
    displays.topic.innerText = `Tema: ${names[topic]}`;

    // Mostrar high scores visibles en la pantalla de selección
    ['memory', 'bomb', 'race'].forEach(game => {
        const el = document.getElementById(`hs-${game}`);
        if (el) el.innerText = `🏆 Mejor: ${Storage.getHighScore(topic, game)}`;
    });

    showScreen('gameSelect');
}

function goToMenu() {
    stopAllGames();
    displays.infoBar.classList.add('hidden');
    showScreen('topic');
}

function startGame(gameType) {
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
        currentState.game,
        currentState.score
    );
    const best = Storage.getHighScore(currentState.topic, currentState.game);

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
