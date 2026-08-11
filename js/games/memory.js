let flippedCards = [];
let lockedBoard = false;

function initMemory() {
    containers.memory.classList.remove('hidden');
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    flippedCards = [];
    lockedBoard = false;

    // Obtener datos y duplicar para pares
    let questions = database[currentState.topic];
    if (!questions || questions.length === 0) return;
    
    // Seleccionar 6 pares al azar
    questions = [...questions].sort(() => 0.5 - Math.random()).slice(0, 6);

    let cardsData = [];
    questions.forEach((item, index) => {
        // Carta Pregunta
        cardsData.push({ id: index, content: `$$${item.q}$$`, type: 'q' });
        // Carta Respuesta
        cardsData.push({ id: index, content: `$$${item.a}$$`, type: 'a' });
    });

    // Barajar
    cardsData.sort(() => 0.5 - Math.random());

    // Crear HTML
    cardsData.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card h-40';
        cardEl.innerHTML = `
            <div class="card-inner">
                <div class="card-front">?</div>
                <div class="card-back text-xs font-bold text-black bg-white"><span>${card.content}</span></div>
            </div>
        `;
        cardEl.onclick = () => flipCard(cardEl, card.id);
        grid.appendChild(cardEl);
    });
    refreshMath();
}

function flipCard(cardEl, id) {
    if (lockedBoard) return;
    if (cardEl.classList.contains('flipped')) return;

    cardEl.classList.add('flipped');
    flippedCards.push({ el: cardEl, id: id });

    if (flippedCards.length === 2) {
        checkForMatch();
    }
}

function checkForMatch() {
    lockedBoard = true;
    const [card1, card2] = flippedCards;

    if (card1.id === card2.id) {
        // Match
        updateScore(100);
        flippedCards = [];
        lockedBoard = false;
        // Verificar victoria (si todas están flipped)
        const all = document.querySelectorAll('.card');
        const allFlipped = Array.from(all).every(c => c.classList.contains('flipped'));
        if (allFlipped) setTimeout(() => gameOver(true), 500);
    } else {
        // No Match
        updateScore(-10);
        setTimeout(() => {
            card1.el.classList.remove('flipped');
            card2.el.classList.remove('flipped');
            flippedCards = [];
            lockedBoard = false;
        }, 1000);
    }
}
