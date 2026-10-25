const STORAGE_KEY = 'mathArcade_scores';

// Las llaves guardadas tienen forma topic_subtopic_game[_difficulty]; como los
// subtemas contienen guiones bajos (p. ej. productos_notables) se parsean con regex.
const KEY_PATTERN = /^(fundamentos|diferencial|integral)_(.+)_(memory|bomb|race)(?:_(.+))?$/;

const Storage = {
    /** Obtiene todas las puntuaciones guardadas */
    getAll() {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    },

    /** Devuelve los récords como lista de objetos { topic, subtopic, game, difficulty, score, date } */
    getRecords() {
        const records = [];
        for (const [key, data] of Object.entries(this.getAll())) {
            const m = key.match(KEY_PATTERN);
            if (!m) continue;
            records.push({
                topic: m[1],
                subtopic: m[2],
                game: m[3],
                difficulty: m[4] || 'Normal',
                score: data.score,
                date: data.date
            });
        }
        return records;
    },

    /** Llave normalizada para comparar récords locales y de la nube */
    recordKey(topic, subtopic, game, difficulty) {
        return `${topic}|${subtopic || 'todos'}|${game}|${game === 'race' ? difficulty : 'Normal'}`;
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
