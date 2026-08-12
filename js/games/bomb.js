function initBomb() {
    containers.bomb.classList.remove('hidden');
    let timeLeft = 30; // 30 segundos
    let questionsNeeded = 5;
    let currentQIndex = 0;
    const timerEl = document.getElementById('bomb-timer');
    const qEl = document.getElementById('bomb-question');
    const wiresContainer = document.getElementById('bomb-wires');

    function renderTimer() {
        timerEl.innerText = `00:${String(Math.max(timeLeft, 0)).padStart(2, '0')}`;
        timerEl.classList.toggle('text-red-600', timeLeft <= 10);
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
                    timeLeft += 5; // Bonus de tiempo
                    renderTimer();
                    questionsNeeded--;
                    currentQIndex++;
                    // Animación visual de éxito
                    timerEl.classList.remove('bomb-active');
                    void timerEl.offsetWidth; // reset anim
                    loadBombQuestion();
                } else {
                    // Deshabilitar todos los botones para evitar doble clic
                    const allBtns = wiresContainer.querySelectorAll('.wire-btn');
                    allBtns.forEach(b => b.disabled = true);
                    
                    // Resaltar la respuesta correcta
                    const correctBtn = Array.from(allBtns).find(b => b.dataset.correct === "true");
                    if (correctBtn) {
                        correctBtn.classList.remove('bg-red-500', 'bg-blue-500', 'bg-yellow-500');
                        correctBtn.classList.add('bg-green-500', 'border-4', 'border-white', 'scale-110');
                    }

                    timeLeft -= 5; // Penalización
                    timerEl.classList.add('bomb-active');
                    updateScore(-20);
                    renderTimer();
                    
                    setTimeout(() => {
                        if (timeLeft <= 0) {
                            gameOver(false);
                        } else {
                            currentQIndex++;
                            loadBombQuestion();
                        }
                    }, 1500);
                }
            };
            wiresContainer.appendChild(btn);
        });
        refreshMath();
    }

    timerEl.classList.remove('bomb-active', 'text-red-600');
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
