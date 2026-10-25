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
    stats: document.getElementById('screen-stats'),
    ranking: document.getElementById('screen-ranking')
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
    ['topic', 'subtopic', 'gameSelect', 'gameArea', 'stats', 'ranking'].forEach(s => {
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
        if (el) el.innerText = `🏆 Mejor: ${getBestScore(currentState.topic, subtopicKey, game, currentState.difficulty)}`;
    });

    showScreen('gameSelect');
}

function updateDifficulty() {
    const diffSelect = document.getElementById('difficulty-select');
    if (diffSelect) {
        currentState.difficulty = diffSelect.value;
        const el = document.getElementById(`hs-race`);
        if (el) el.innerText = `🏆 Mejor: ${getBestScore(currentState.topic, currentState.subtopic, 'race', currentState.difficulty)}`;
    }
}

/** Mejor puntuación entre la local y la de la nube (si hay sesión) */
function getBestScore(topic, subtopic, game, difficulty) {
    return Math.max(
        Storage.getHighScore(topic, subtopic, game, difficulty),
        Cloud.getBest(topic, subtopic, game, difficulty)
    );
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
    const best = getBestScore(currentState.topic, currentState.subtopic, currentState.game, currentState.difficulty);
    saveToCloud(win);

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

function saveToCloud(win) {
    const status = document.getElementById('go-cloud');
    if (!Cloud.enabled) {
        status.innerText = '';
        return;
    }
    if (!Cloud.isLoggedIn) {
        status.innerText = '👤 Inicia sesión para guardar tus récords en la nube y aparecer en el ranking.';
        return;
    }
    status.innerText = '☁️ Guardando en la nube...';
    Cloud.recordResult({
        topic: currentState.topic,
        subtopic: currentState.subtopic,
        game: currentState.game,
        difficulty: currentState.game === 'race' ? currentState.difficulty : 'Normal',
        score: currentState.score,
        won: win
    }).then(res => {
        status.innerText = res
            ? (res.is_new_record ? '☁️ ¡Nuevo récord guardado en la nube!' : '☁️ Partida guardada en la nube')
            : '📴 Sin conexión: se subirá cuando vuelva el internet';
    });
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
async function showStats() {
    const container = document.getElementById('stats-container');
    container.innerHTML = '';

    // Combinar récords locales con los de la nube (se queda el mayor)
    const merged = {};
    const addRecord = r => {
        const key = Storage.recordKey(r.topic, r.subtopic, r.game, r.difficulty);
        if (!merged[key] || r.score > merged[key].score) merged[key] = r;
    };
    Storage.getRecords().forEach(addRecord);
    if (Cloud.isLoggedIn) {
        container.innerHTML = '<p class="text-center text-gray-400 mt-10">☁️ Cargando récords...</p>';
        showScreen('stats');
        const cloudRecords = await Cloud.loadMyScores();
        cloudRecords.forEach(r => addRecord({ ...r, score: r.best_score, date: r.updated_at }));
        container.innerHTML = '';
    }
    const records = Object.values(merged);

    if (records.length === 0) {
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
    
    for (const r of records) {
        if (!grouped[r.topic]) continue;
        let subName = 'Todos los temas';
        if (r.subtopic !== 'todos') {
            const subInfo = subtemas[r.topic].find(s => s.key === r.subtopic);
            if (subInfo) subName = subInfo.nombre;
        }

        grouped[r.topic].push({
            subtopic: subName,
            game: games[r.game] || r.game,
            score: r.score,
            date: new Date(r.date).toLocaleDateString(),
            difficulty: r.difficulty
        });
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

async function clearStats() {
    const where = Cloud.isLoggedIn ? ' (en este dispositivo y en la nube)' : '';
    if (confirm(`¿Estás seguro de que deseas borrar todos tus récords${where}? Esta acción no se puede deshacer.`)) {
        Storage.clearAll();
        await Cloud.clearMyScores();
        showStats(); // Refrescar vista
    }
}

// ------------------------------------------
// 5. CUENTAS (SUPABASE)
// ------------------------------------------
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/** Se llama desde Cloud cada vez que cambia la sesión */
function onAuthChanged() {
    const btn = document.getElementById('auth-btn');
    btn.classList.toggle('hidden', !Cloud.enabled);
    document.getElementById('ranking-btn').classList.toggle('hidden', !Cloud.enabled);
    btn.innerText = Cloud.isLoggedIn
        ? `👤 ${Cloud.profile ? Cloud.profile.username : 'Mi cuenta'}`
        : '👤 Entrar';

    // Refrescar los "Mejor:" si el usuario está en la selección de juego
    if (currentState.topic && !screens.gameSelect.classList.contains('hidden')) {
        selectSubtopic(currentState.subtopic);
    }
}

function openAuthModal() {
    const modal = document.getElementById('modal-auth');
    const loggedIn = Cloud.isLoggedIn;
    document.getElementById('auth-forms').classList.toggle('hidden', loggedIn);
    document.getElementById('auth-account').classList.toggle('hidden', !loggedIn);
    document.getElementById('auth-error').innerText = '';
    if (loggedIn) {
        const p = Cloud.profile || {};
        document.getElementById('account-name').innerText = p.username || Cloud.user.email;
        document.getElementById('account-email').innerText = Cloud.user.email;
        document.getElementById('account-stats').innerText =
            `Partidas jugadas: ${p.total_games_played || 0} · Victorias: ${p.total_wins || 0}`;
    } else {
        setAuthMode('login');
    }
    modal.classList.remove('hidden');
}

function closeAuthModal() {
    document.getElementById('modal-auth').classList.add('hidden');
}

let authMode = 'login';
function setAuthMode(mode) {
    authMode = mode;
    const isRegister = mode === 'register';
    document.getElementById('auth-username-row').classList.toggle('hidden', !isRegister);
    document.getElementById('auth-submit').innerText = isRegister ? 'Crear cuenta' : 'Entrar';
    document.getElementById('tab-login').classList.toggle('auth-tab-active', !isRegister);
    document.getElementById('tab-register').classList.toggle('auth-tab-active', isRegister);
    document.getElementById('auth-error').innerText = '';
}

async function submitAuth(event) {
    event.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const username = document.getElementById('auth-username').value.trim();
    const errorEl = document.getElementById('auth-error');
    const submit = document.getElementById('auth-submit');

    if (authMode === 'register' && !/^[\w.\-ñÑáéíóúÁÉÍÓÚ]{3,20}$/.test(username)) {
        errorEl.innerText = 'El nombre de jugador debe tener 3 a 20 caracteres (letras, números, _ . -).';
        return;
    }

    submit.disabled = true;
    errorEl.innerText = '';
    try {
        if (authMode === 'register') {
            const { needsConfirmation } = await Cloud.signUp(email, password, username);
            if (needsConfirmation) {
                errorEl.innerText = '📧 Revisa tu correo para confirmar la cuenta y después inicia sesión.';
                setTimeout(() => setAuthMode('login'), 4000);
                return;
            }
        } else {
            await Cloud.signIn(email, password);
        }
        closeAuthModal();
    } catch (err) {
        errorEl.innerText = translateAuthError(err.message);
    } finally {
        submit.disabled = false;
    }
}

function translateAuthError(message) {
    if (/invalid login credentials/i.test(message)) return 'Correo o contraseña incorrectos.';
    if (/email not confirmed/i.test(message)) return 'Primero confirma tu correo (revisa tu bandeja de entrada).';
    if (/already registered/i.test(message)) return 'Ese correo ya tiene una cuenta. Inicia sesión.';
    if (/at least 6 characters/i.test(message)) return 'La contraseña debe tener al menos 6 caracteres.';
    if (/failed to fetch/i.test(message)) return 'Sin conexión a internet.';
    return message;
}

async function logout() {
    await Cloud.signOut();
    closeAuthModal();
}

// ------------------------------------------
// 6. RANKING GLOBAL
// ------------------------------------------
function showRanking() {
    const topicSel = document.getElementById('rank-topic');
    if (currentState.topic) topicSel.value = currentState.topic;
    fillRankingSubtopics();
    if (currentState.subtopic) document.getElementById('rank-subtopic').value = currentState.subtopic;
    showScreen('ranking');
    loadRanking();
}

function fillRankingSubtopics() {
    const topic = document.getElementById('rank-topic').value;
    const sel = document.getElementById('rank-subtopic');
    sel.innerHTML = '<option value="todos">Todos los temas</option>' +
        subtemas[topic].map(s => `<option value="${s.key}">${s.nombre}</option>`).join('');
}

function onRankingTopicChange() {
    fillRankingSubtopics();
    loadRanking();
}

async function loadRanking() {
    const topic = document.getElementById('rank-topic').value;
    const subtopic = document.getElementById('rank-subtopic').value;
    const game = document.getElementById('rank-game').value;
    const diffSel = document.getElementById('rank-difficulty');
    diffSel.disabled = game !== 'race';
    const difficulty = game === 'race' ? diffSel.value : 'Normal';
    const list = document.getElementById('ranking-list');

    list.innerHTML = '<p class="text-center text-gray-400 mt-10">☁️ Cargando ranking...</p>';
    try {
        const rows = await Cloud.fetchLeaderboard(topic, subtopic, game, difficulty);
        if (rows.length === 0) {
            list.innerHTML = '<p class="text-center text-gray-400 mt-10">Nadie ha jugado esta combinación todavía. ¡Sé el primero!</p>';
            return;
        }
        const medals = ['🥇', '🥈', '🥉'];
        list.innerHTML = rows.map((row, i) => {
            const isMe = Cloud.isLoggedIn && row.user_id === Cloud.user.id;
            const name = row.profiles ? row.profiles.username : 'Anónimo';
            return `
                <div class="flex justify-between items-center p-3 rounded-lg border ${isMe ? 'bg-yellow-900/40 border-yellow-500' : 'bg-gray-700 border-gray-600'}">
                    <div class="flex items-center gap-3">
                        <span class="w-8 text-center font-bold text-lg">${medals[i] || i + 1}</span>
                        <span class="font-bold">${escapeHtml(name)}${isMe ? ' <span class="text-xs text-yellow-300">(tú)</span>' : ''}</span>
                    </div>
                    <span class="text-xl font-bold text-green-400">${row.best_score}</span>
                </div>`;
        }).join('');
    } catch (err) {
        list.innerHTML = `<p class="text-center text-red-400 mt-10">No se pudo cargar el ranking: ${escapeHtml(translateAuthError(err.message))}</p>`;
    }
}

Cloud.init();
onAuthChanged();
