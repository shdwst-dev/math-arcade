const STORAGE_KEY = 'mathArcade_scores';

const Storage = {
    /** Obtiene todas las puntuaciones guardadas */
    getAll() {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    },

    /** Guarda una puntuación si es la más alta para ese tema+subtema+juego */
    saveIfHighScore(topic, subtopic, game, score) {
        const scores = this.getAll();
        const key = `${topic}_${subtopic || 'todos'}_${game}`;
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
    getHighScore(topic, subtopic, game) {
        const scores = this.getAll();
        const key = `${topic}_${subtopic || 'todos'}_${game}`;
        return scores[key] ? scores[key].score : 0;
    },

    /** Limpia todas las puntuaciones */
    clearAll() {
        localStorage.removeItem(STORAGE_KEY);
    }
};
