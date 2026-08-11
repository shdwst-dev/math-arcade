function initBomb() {
    containers.bomb.classList.remove('hidden');
    let timeLeft = 30; // 30 segundos
    let questionsNeeded = 5;
    let currentQIndex = 0;
    const timerEl = document.getElementById('bomb-timer');
    const qEl = document.getElementById('bomb-question');
    const wiresContainer = document.getElementById('bomb-wires');

    // Obtener preguntas
    let questions = database[currentState.topic];
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
            btn.onclick = () => {
                if (opt.correct) {
                    updateScore(50);
                    timeLeft += 5; // Bonus de tiempo
                    questionsNeeded--;
                    currentQIndex++;
                    // Animación visual de éxito
                    timerEl.classList.remove('bomb-active');
                    void timerEl.offsetWidth; // reset anim
                    loadBombQuestion();
                } else {
                    timeLeft -= 5; // Penalización
                    timerEl.classList.add('bomb-active');
                    updateScore(-20);
                }
            };
            wiresContainer.appendChild(btn);
        });
        refreshMath();
    }

    loadBombQuestion();

    currentState.timer = setInterval(() => {
        timeLeft--;
        timerEl.innerText = `00:${timeLeft < 10 ? '0' + timeLeft : timeLeft}`;
        if (timeLeft <= 0) {
            gameOver(false);
        }
        if (timeLeft <= 10) timerEl.classList.add('text-red-600');
    }, 1000);
}
