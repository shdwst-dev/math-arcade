const STORAGE_KEY = 'mathArcade_scores';

const Storage = {
    /** Obtiene todas las puntuaciones guardadas */
    getAll() {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    },

    /** Guarda una puntuación si es la más alta para ese tema+subtema+juego+dificultad */
    saveIfHighScore(topic, subtopic, game, score, difficulty = 'Normal') {
        const scores = this.getAll();
        const diffStr = game === 'race' ? `_${difficulty}` : '';
        const key = `${topic}_${subtopic || 'todos'}_${game}${diffStr}`;
        if (!scores[key] || score > scores[key].score) {
            scores[key] = {
                score: score,
                date: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
            return true; // Nuevo récord
        }
        return false;
    },

    /** Obtiene la puntuación más alta para un tema+subtema+juego */
    getHighScore(topic, subtopic, game, difficulty = 'Normal') {
        const scores = this.getAll();
        const diffStr = game === 'race' ? `_${difficulty}` : '';
        const key = `${topic}_${subtopic || 'todos'}_${game}${diffStr}`;
        return scores[key] ? scores[key].score : 0;
    },

    /** Limpia todas las puntuaciones */
    clearAll() {
        localStorage.removeItem(STORAGE_KEY);
    }
};
