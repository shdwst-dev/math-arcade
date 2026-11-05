// ------------------------------------------
// BACKEND EN LA NUBE (SUPABASE)
// ------------------------------------------
// Cuentas de alumno, récords sincronizados y ranking global.
// Si no hay credenciales en config.js o no hay internet, la app sigue
// funcionando solo con localStorage (Storage).
const PENDING_KEY = 'mathArcade_pending';

const Cloud = {
    client: null,
    user: null,
    profile: null,
    myScores: {}, // { recordKey: best_score } del usuario en la nube
    flushing: false,

    get enabled() { return this.client !== null; },
    get isLoggedIn() { return this.user !== null; },

    init() {
        const cfg = typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null;
        if (!window.supabase || !cfg || !cfg.url || cfg.url.includes('TU-PROYECTO')) {
            console.info('Supabase no configurado: modo solo local.');
            return;
        }
        this.client = window.supabase.createClient(cfg.url, cfg.anonKey);

        this.client.auth.onAuthStateChange((event, session) => {
            const newUser = session ? session.user : null;
            const sameUser = !!(newUser && this.user && newUser.id === this.user.id);
            this.user = newUser;
            // Renovar el token o reenfocar la pestaña no cambia de usuario:
            // no hace falta recargar perfil ni récords (evita bucles de eventos)
            if (event === 'TOKEN_REFRESHED' || (event === 'SIGNED_IN' && sameUser)) return;
            // Supabase recomienda no hacer llamadas async dentro del callback
            setTimeout(() => this.afterAuthChange(), 0);
        });

        window.addEventListener('online', () => this.flushPending());
    },

    authRun: 0,

    async afterAuthChange() {
        // Si la sesión cambia mientras se espera la red, solo la última ejecución cuenta
        const runId = ++this.authRun;
        const user = this.user;
        this.profile = null;
        this.myScores = {};
        try {
            if (user) {
                const { data } = await this.client
                    .from('profiles')
                    .select('username, total_games_played, total_wins')
                    .eq('id', user.id)
                    .maybeSingle();
                if (runId !== this.authRun) return;
                this.profile = data;
                await this.flushPending();
                if (runId !== this.authRun) return;
                await this.loadMyScores();
            }
        } catch (err) {
            console.error('Error al cargar la cuenta:', err);
        } finally {
            // Siempre refrescar la interfaz, aunque algo falle por el camino
            if (runId === this.authRun && typeof onAuthChanged === 'function') onAuthChanged();
        }
    },

    // ---------- Autenticación ----------
    async signUp(email, password, username) {
        const { data, error } = await this.client.auth.signUp({
            email,
            password,
            options: { data: { username, full_name: username } }
        });
        if (error) throw error;
        // Si el proyecto exige confirmar el correo, no hay sesión todavía
        return { needsConfirmation: !data.session };
    },

    async signIn(email, password) {
        const { error } = await this.client.auth.signInWithPassword({ email, password });
        if (error) throw error;
    },

    async signOut() {
        await this.client.auth.signOut();
    },

    // ---------- Partidas y récords ----------
    /** Guarda la partida en la nube. Devuelve { is_new_record, best_score } o null. */
    async recordResult(result) {
        if (!this.isLoggedIn) return null;
        try {
            const data = await this.callRecordRpc(result);
            this.rememberBest(result, data.best_score);
            return data;
        } catch (err) {
            // Solo se reintentan fallos de red; los errores de validación se descartan
            if (!navigator.onLine || !err.code) {
                console.warn('Sin conexión, la partida se subirá después:', err.message);
                this.queue(result);
            } else {
                console.error('Error al guardar en la nube:', err.message);
            }
            return null;
        }
    },

    async callRecordRpc(r) {
        const { data, error } = await this.client.rpc('record_game_result', {
            p_topic: r.topic,
            p_subtopic: r.subtopic || 'todos',
            p_game: r.game,
            p_difficulty: r.difficulty,
            p_score: r.score,
            p_won: r.won
        });
        if (error) throw error;
        return data;
    },

    rememberBest(r, best) {
        const key = Storage.recordKey(r.topic, r.subtopic, r.game, r.difficulty);
        this.myScores[key] = Math.max(this.myScores[key] || 0, best);
    },

    queue(result) {
        const pending = this.readPending();
        pending.push({ ...result, userId: this.user.id });
        localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    },

    readPending() {
        try {
            return JSON.parse(localStorage.getItem(PENDING_KEY)) || [];
        } catch {
            return [];
        }
    },

    /** Sube las partidas que quedaron pendientes por falta de conexión (solo las del usuario actual). */
    async flushPending() {
        if (!this.isLoggedIn || this.flushing || !navigator.onLine) return;
        this.flushing = true;
        const userId = this.user.id;
        const remaining = [];
        for (const r of this.readPending()) {
            if (r.userId !== userId) {
                remaining.push(r);
                continue;
            }
            try {
                const data = await this.callRecordRpc(r);
                this.rememberBest(r, data.best_score);
            } catch (err) {
                if (!err.code) remaining.push(r);
            }
        }
        localStorage.setItem(PENDING_KEY, JSON.stringify(remaining));
        this.flushing = false;
    },

    async loadMyScores() {
        const user = this.user;
        if (!user) return [];
        const { data, error } = await this.client
            .from('high_scores')
            .select('topic, subtopic, game, difficulty, best_score, updated_at')
            .eq('user_id', user.id);
        if (error) {
            console.error(error.message);
            return [];
        }
        this.myScores = {};
        data.forEach(r => this.rememberBest(r, r.best_score));
        return data;
    },

    getBest(topic, subtopic, game, difficulty) {
        return this.myScores[Storage.recordKey(topic, subtopic, game, difficulty)] || 0;
    },

    async clearMyScores() {
        if (!this.isLoggedIn) return;
        await this.client.from('high_scores').delete().eq('user_id', this.user.id);
        await this.client.from('game_history').delete().eq('user_id', this.user.id);
        this.myScores = {};
    },

    // ---------- Ranking global ----------
    async fetchLeaderboard(topic, subtopic, game, difficulty, limit = 10) {
        const { data, error } = await this.client
            .from('high_scores')
            .select('best_score, updated_at, user_id, profiles(username)')
            .eq('topic', topic)
            .eq('subtopic', subtopic || 'todos')
            .eq('game', game)
            .eq('difficulty', difficulty)
            .order('best_score', { ascending: false })
            .order('updated_at', { ascending: true })
            .limit(limit);
        if (error) throw error;
        return data;
    }
};
