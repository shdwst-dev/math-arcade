function initBomb() {
    containers.bomb.classList.remove('hidden');
    const BOMB_START_TIME = 90; // segundos iniciales
    const BOMB_BONUS = 8;       // segundos que se ganan al acertar
    const BOMB_PENALTY = 4;     // segundos que se pierden al fallar
    let timeLeft = BOMB_START_TIME;
    let questionsNeeded = 5;
    let currentQIndex = 0;
    const timerEl = document.getElementById('bomb-timer');
    const qEl = document.getElementById('bomb-question');
    const wiresContainer = document.getElementById('bomb-wires');
    const bombAlert = document.getElementById('bomb-alert');

    function showBombAlert(type, message) {
        if (!bombAlert) return;
        bombAlert.classList.remove('hidden', 'bomb-toast-success', 'bomb-toast-error');
        bombAlert.classList.add(type === 'success' ? 'bomb-toast-success' : 'bomb-toast-error');
        bombAlert.textContent = message;
        bombAlert.style.opacity = '1';
        clearTimeout(showBombAlert.timeoutId);
        showBombAlert.timeoutId = setTimeout(() => {
            bombAlert.style.opacity = '0';
            setTimeout(() => bombAlert.classList.add('hidden'), 180);
        }, 2200);
    }

    function renderTimer() {
        const t = Math.max(timeLeft, 0);
        timerEl.innerText = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
        timerEl.classList.toggle('text-red-600', timeLeft <= 15);
        timerEl.classList.toggle('bomb-timer-warning', timeLeft <= 15 && timeLeft > 0);
    }

    // Obtener preguntas
    let questions = getFilteredQuestions();
    if (!questions || questions.length === 0) return;
    questions = [...questions].sort(() => 0.5 - Math.random());

    function loadBombQuestion() {
        if (questionsNeeded <= 0) {
            gameOver(true);
            return;
        }
        if (currentQIndex >= questions.length) currentQIndex = 0; // Loop preguntas

        const q = questions[currentQIndex];
        qEl.innerHTML = `$$${q.q}$$`;

        wiresContainer.innerHTML = '';

        // Generar respuestas (1 correcta + 3 distractores)
        let options = [{ text: q.a, correct: true }];
        q.distractors.forEach(d => options.push({ text: d, correct: false }));
        options.sort(() => 0.5 - Math.random());

        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];

        options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = `${colors[idx]} hover:opacity-80 text-white font-bold py-3 px-2 rounded shadow-lg transition transform hover:scale-105 wire-btn text-xs min-h-14 flex items-center justify-center overflow-x-auto`;
            btn.innerHTML = `<span class="block w-full text-center whitespace-nowrap">$$${opt.text}$$</span>`;
            btn.dataset.correct = opt.correct;
            btn.onclick = () => {
                if (btn.disabled) return;
                
                if (opt.correct) {
                    updateScore(50);
                    timeLeft += BOMB_BONUS; // Bonus de tiempo
                    questionsNeeded--;
                    currentQIndex++;
                    showBombAlert('success', `✅ ¡Correcto!  +50 pts  ·  +${BOMB_BONUS} s`);
                    timerEl.classList.remove('bomb-active', 'bomb-timer-warning');
                    renderTimer();
                    void timerEl.offsetWidth;
                    loadBombQuestion();
                } else {
                    // Deshabilitar todos los botones para evitar doble clic
                    const allBtns = wiresContainer.querySelectorAll('.wire-btn');
                    allBtns.forEach(b => b.disabled = true);
                    
                    // Resaltar la respuesta correcta, pero de forma más amable
                    const correctBtn = Array.from(allBtns).find(b => b.dataset.correct === "true");
                    if (correctBtn) {
                        correctBtn.classList.remove('bg-red-500', 'bg-blue-500', 'bg-yellow-500');
                        correctBtn.classList.add('bg-emerald-500', 'border-4', 'border-white', 'scale-110');
                    }

                    timeLeft -= BOMB_PENALTY;
                    timerEl.classList.add('bomb-active', 'bomb-timer-warning');
                    updateScore(-20);
                    showBombAlert('error', `❌ Incorrecto  -20 pts  ·  -${BOMB_PENALTY} s  ·  La respuesta correcta se marcó en verde`);
                    renderTimer();
                    
                    setTimeout(() => {
                        if (timeLeft <= 0) {
                            gameOver(false);
                        } else {
                            currentQIndex++;
                            loadBombQuestion();
                        }
                    }, 1200);
                }
            };
            wiresContainer.appendChild(btn);
        });
        refreshMath();
    }

    timerEl.classList.remove('bomb-active', 'bomb-timer-warning', 'text-red-600');
    if (bombAlert) {
        bombAlert.classList.add('hidden');
        bombAlert.style.opacity = '0';
    }
    renderTimer();
    loadBombQuestion();

    currentState.timer = setInterval(() => {
        timeLeft--;
        renderTimer();
        if (timeLeft <= 0) {
            gameOver(false);
        }
    }, 1000);
}
