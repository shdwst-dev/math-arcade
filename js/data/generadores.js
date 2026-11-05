// ------------------------------------------
// GENERADORES DE EJERCICIOS
// ------------------------------------------
// Agregan muchos ejercicios extra a cada subtema. La respuesta correcta se
// calcula con aritmética (no se escribe a mano), así que no hay errores de
// cuentas. Los distractores son errores típicos de alumnos (signos, olvidar
// un factor, etc.). Se ejecuta una vez al cargar la página.
(function () {
    // ---------- Utilidades ----------
    const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
    const nz = (a, b) => { let v; do { v = rnd(a, b); } while (v === 0); return v; };
    const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
    const shuffle = arr => arr.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(p => p[1]);
    const pick = arr => arr[rnd(0, arr.length - 1)];

    /** Polinomio en LaTeX a partir de coeficientes (de mayor a menor grado). */
    function poly(c, v = 'x') {
        let out = '';
        const n = c.length - 1;
        c.forEach((co, i) => {
            if (!co) return;
            const d = n - i;
            const mag = Math.abs(co);
            let t;
            if (d === 0) t = String(mag);
            else t = (mag === 1 ? '' : mag) + (d === 1 ? v : `${v}^{${d}}`);
            if (!out) out = (co < 0 ? '-' : '') + t;
            else out += (co < 0 ? ' - ' : ' + ') + t;
        });
        return out || '0';
    }
    /** Un solo término c·x^n */
    const tstr = (c, n, v = 'x') => poly([c, ...Array(n).fill(0)], v);
    /** (p/q)·rest simplificado, con fracción en LaTeX si hace falta */
    function scaled(p, q, rest) {
        const g = gcd(p, q) || 1;
        p /= g; q /= g;
        if (q < 0) { p = -p; q = -q; }
        if (q === 1) {
            if (p === 1) return rest;
            if (p === -1) return '-' + rest;
            return `${p}${rest}`;
        }
        return `${p < 0 ? '-' : ''}\\frac{${Math.abs(p)}}{${q}}${rest}`;
    }
    function frac(p, q) {
        const g = gcd(p, q) || 1;
        p /= g; q /= g;
        if (q < 0) { p = -p; q = -q; }
        if (q === 1) return String(p);
        return `${p < 0 ? '-' : ''}\\frac{${Math.abs(p)}}{${q}}`;
    }
    const paren = (p, e) => (e === 1 ? `(${p})` : `(${p})^{${e}}`);
    const xp = e => (e === 1 ? 'x' : `x^{${e}}`);
    const fac = a => `(x ${a < 0 ? '-' : '+'} ${Math.abs(a)})`;

    /** Arma la pregunta; devuelve null si no hay 3 distractores distintos a la respuesta. */
    function mk(q, a, cands) {
        const seen = new Set([String(a)]);
        const ds = [];
        for (const c of cands) {
            if (c === undefined || c === null) continue;
            const s = String(c);
            if (!seen.has(s)) { seen.add(s); ds.push(s); }
        }
        if (ds.length < 3) return null;
        return { q, a: String(a), distractors: shuffle(ds).slice(0, 3) };
    }

    function generate(target, subtema, gens, total) {
        const seen = new Set(target.map(x => x.q));
        let added = 0;
        for (let tries = 0; tries < total * 60 && added < total; tries++) {
            const item = pick(gens)();
            if (!item || seen.has(item.q)) continue;
            seen.add(item.q);
            target.push({ subtema, ...item });
            added++;
        }
    }

    // =====================================================
    // FUNDAMENTOS (ÁLGEBRA)
    // =====================================================
    const genFund = {
        ecuaciones_1: [
            () => {
                const a = rnd(2, 9), x = nz(-9, 9), b = nz(-12, 12), c = a * x + b;
                return mk(`${poly([a, b])} = ${c}`, `x = ${x}`,
                    [`x = ${-x}`, `x = ${x + 1}`, `x = ${x - 1}`, `x = ${c - b}`, `x = ${frac(c + b, a)}`]);
            },
            () => {
                const a = rnd(3, 9), c = rnd(1, a - 1), x = nz(-8, 8), b = nz(-10, 10), d = (a - c) * x + b;
                return mk(`${poly([a, b])} = ${poly([c, d])}`, `x = ${x}`,
                    [`x = ${-x}`, `x = ${x + 1}`, `x = ${x - 1}`, `x = ${frac(d - b, a + c)}`]);
            },
            () => {
                // a(x + b) = c  →  x = c/a - b
                const x = nz(-9, 9), b = nz(-8, 8), a = rnd(2, 5), c = a * (x + b);
                return mk(`${a}(${poly([1, b])}) = ${c}`, `x = ${x}`,
                    [`x = ${-x}`, `x = ${x + 2 * b}`, `x = ${x + b}`, `x = ${c - b}`]);
            }
        ],
        ecuaciones_2: [
            () => {
                const r1 = rnd(-7, 7), r2 = rnd(-7, 7);
                if (r1 === r2) return null;
                const rts = (p, q) => `x = ${Math.min(p, q)} \\text{ y } x = ${Math.max(p, q)}`;
                return mk(`${poly([1, -(r1 + r2), r1 * r2])} = 0`, rts(r1, r2),
                    [rts(-r1, -r2), rts(r1, -r2), rts(r1 + 1, r2 + 1), rts(r1 - 1, r2 - 1)]);
            },
            () => {
                const n = rnd(2, 12);
                return mk(`x^2 = ${n * n}`, `x = \\pm ${n}`,
                    [`x = ${n}`, `x = -${n}`, `x = \\pm ${n * n}`, `x = ${n * n}`]);
            },
            () => {
                const k = rnd(2, 5), n = rnd(2, 9);
                return mk(`${k}x^2 = ${k * n * n}`, `x = \\pm ${n}`,
                    [`x = ${n}`, `x = \\pm ${n * n}`, `x = \\pm ${k * n}`, `x = ${k * n}`]);
            }
        ],
        ecuaciones_3: [
            () => {
                const n = nz(-6, 6);
                if (Math.abs(n) < 2) return null;
                return mk(`x^3 = ${n ** 3}`, `x = ${n}`,
                    [`x = ${-n}`, `x = \\pm ${Math.abs(n)}`, `x = ${n * 3}`, `x = ${n * n}`]);
            },
            () => {
                const n = nz(-5, 5), k = rnd(2, 6);
                if (Math.abs(n) < 2) return null;
                return mk(`${k}x^3 = ${k * n ** 3}`, `x = ${n}`,
                    [`x = ${-n}`, `x = ${n ** 3}`, `x = ${k * n}`, `x = \\pm ${Math.abs(n)}`]);
            },
            () => {
                const n = rnd(1, 4), k = rnd(1, 9);
                return mk(`x^3 + ${k} =${n ** 3 + k}`, `x = ${n}`,
                    [`x = ${-n}`, `x = ${n + 1}`, `x = ${n ** 3 + k}`, `x = ${n - 1}`]);
            }
        ],
        desigualdades: [
            () => {
                const ops = ['<', '>', '\\leq', '\\geq'];
                const flip = o => ({ '<': '>', '>': '<', '\\leq': '\\geq', '\\geq': '\\leq' }[o]);
                const a = nz(-7, 7), k = rnd(-8, 8), b = nz(-9, 9), c = a * k + b;
                if (Math.abs(a) < 2) return null;
                const op = pick(ops), op2 = a > 0 ? op : flip(op);
                return mk(`${poly([a, b])} ${op} ${c}`, `x ${op2} ${k}`,
                    [`x ${flip(op2)} ${k}`, `x ${op2} ${-k}`, `x ${flip(op2)} ${-k}`, `x ${op2} ${k + 1}`]);
            },
            () => {
                const a = rnd(2, 6), k = rnd(-6, 8), op = pick(['<', '>', '\\leq', '\\geq']);
                return mk(`\\frac{x}{${a}} ${op} ${k}`, `x ${op} ${a * k}`,
                    [`x ${op} ${k}`, `x ${op} ${frac(k, a)}`, `x ${op} ${-a * k}`, `x ${op} ${k + a}`]);
            }
        ],
        productos_notables: [
            () => {
                const a = nz(-9, 9);
                return mk(`(x ${a < 0 ? '-' : '+'} ${Math.abs(a)})^2`, poly([1, 2 * a, a * a]),
                    [poly([1, 0, a * a]), poly([1, 2 * a, -a * a]), poly([1, a, a * a]), poly([1, -2 * a, a * a])]);
            },
            () => {
                const m = rnd(2, 4), n = nz(-6, 6);
                return mk(`(${poly([m, n])})^2`, poly([m * m, 2 * m * n, n * n]),
                    [poly([m * m, 0, n * n]), poly([m * m, m * n, n * n]), poly([m * m, -2 * m * n, n * n]), poly([m * m, 2 * m * n, -n * n])]);
            },
            () => {
                const a = rnd(2, 12);
                return mk(`(x + ${a})(x - ${a})`, poly([1, 0, -a * a]),
                    [poly([1, 0, a * a]), poly([1, -2 * a, a * a]), poly([1, 2 * a, a * a]), poly([1, 0, -a])]);
            },
            () => {
                const m = rnd(2, 4), n = rnd(1, 7);
                return mk(`(${m}x + ${n})(${m}x - ${n})`, poly([m * m, 0, -n * n]),
                    [poly([m * m, 0, n * n]), poly([m * m, -2 * m * n, n * n]), poly([m, 0, -n * n]), poly([m * m, 0, -n])]);
            },
            () => {
                const a = nz(-9, 9), b = nz(-9, 9);
                if (a === b) return null;
                return mk(`${fac(a)}${fac(b)}`, poly([1, a + b, a * b]),
                    [poly([1, a + b, -a * b]), poly([1, a * b, a + b]), poly([1, -(a + b), a * b]), poly([1, 0, a * b])]);
            },
            () => {
                const m = rnd(2, 6), n = rnd(2, 6), type = rnd(0, 2);
                if (type === 0) return mk(`${xp(m)} \\cdot ${xp(n)}`, xp(m + n), [xp(m * n), xp(Math.abs(m - n) || 1), xp(m + n + 1), xp(m + n - 1)]);
                if (type === 1) return mk(`(${xp(m)})^{${n}}`, xp(m * n), [xp(m + n), xp(m ** 1 + n - 1), xp(m * n + 1), xp(m * n - 1)]);
                if (m === n) return null;
                const hi = Math.max(m, n), lo = Math.min(m, n);
                return mk(`\\frac{${xp(hi)}}{${xp(lo)}}`, xp(hi - lo), [xp(hi + lo), xp(hi * lo), xp(hi - lo + 1), `x^{${lo - hi}}`]);
            }
        ],
        factorizacion: [
            () => {
                const a = nz(-9, 9), b = nz(-9, 9);
                if (a === b || a === -b) return null;
                return mk(poly([1, a + b, a * b]), `${fac(a)}${fac(b)}`,
                    [`${fac(-a)}${fac(-b)}`, `${fac(a)}${fac(-b)}`, `${fac(-a)}${fac(b)}`]);
            },
            () => {
                const k = rnd(2, 9), m = nz(-8, 8), s = x => (x < 0 ? '-' : '+');
                return mk(poly([k, k * m, 0]), `${k}x(x ${s(m)} ${Math.abs(m)})`,
                    [`${k}x(x ${s(-m)} ${Math.abs(m)})`, `${k}x(x ${s(m)} ${k * Math.abs(m)})`, `x(${k}x ${s(m)} ${Math.abs(m)})`]);
            },
            () => {
                const n = rnd(2, 12);
                return mk(poly([1, 0, -n * n]), `(x + ${n})(x - ${n})`,
                    [`(x - ${n})^2`, `(x + ${n})^2`, `(x + ${n * n})(x - ${n * n})`, `(x - ${n * n})(x + 1)`]);
            },
            () => {
                const m = rnd(2, 5), n = rnd(2, 8), mx = `${m}x`;
                return mk(poly([m * m, 0, -n * n]), `(${mx} + ${n})(${mx} - ${n})`,
                    [`(${mx} - ${n})^2`, `(${mx} + ${n})^2`, `(${mx} + ${n * n})(${mx} - ${n * n})`]);
            },
            () => {
                const a = nz(-9, 9);
                return mk(poly([1, 2 * a, a * a]), `(x ${a < 0 ? '-' : '+'} ${Math.abs(a)})^2`,
                    [`(x ${a < 0 ? '+' : '-'} ${Math.abs(a)})^2`, `(x ${a < 0 ? '-' : '+'} ${Math.abs(a)})(x ${a < 0 ? '+' : '-'} ${Math.abs(a)})`,
                        `(x ${a < 0 ? '-' : '+'} ${Math.abs(2 * a)})^2`]);
            }
        ]
    };

    // =====================================================
    // CÁLCULO DIFERENCIAL
    // =====================================================
    const dpoly = c => c.slice(0, -1).map((co, i) => co * (c.length - 1 - i));
    const genDif = {
        derivadas_directas: [
            () => {
                const c = nz(-9, 9), n = rnd(2, 7);
                return mk(`\\frac{d}{dx}(${tstr(c, n)})`, tstr(c * n, n - 1),
                    [tstr(c, n - 1), tstr(n, n - 1), tstr(c * n, n), tstr(c, n + 1), tstr(-c * n, n - 1)]);
            },
            () => {
                const n = rnd(2, 4);
                const orig = [nz(-6, 6), ...Array(n - 1).fill(0), nz(-9, 9), nz(-9, 9)];
                const D = dpoly(orig);
                const bad1 = [...D]; bad1[0] = orig[0];
                return mk(`\\frac{d}{dx}(${poly(orig)})`, poly(D),
                    [poly(bad1), poly([...D, orig[orig.length - 1]]), poly(D.map(v => -v)), poly(orig.slice(0, -1))]);
            },
            () => {
                const k = nz(-7, 7), t = rnd(0, 3);
                if (t === 0) return mk(`\\frac{d}{dx}(${scaled(k, 1, '\\sin x')})`, scaled(k, 1, '\\cos x'),
                    [scaled(-k, 1, '\\cos x'), scaled(k, 1, '\\sin x'), scaled(-k, 1, '\\sin x')]);
                if (t === 1) return mk(`\\frac{d}{dx}(${scaled(k, 1, '\\cos x')})`, scaled(-k, 1, '\\sin x'),
                    [scaled(k, 1, '\\sin x'), scaled(k, 1, '\\cos x'), scaled(-k, 1, '\\cos x')]);
                if (t === 2) return mk(`\\frac{d}{dx}(${scaled(k, 1, 'e^x')})`, scaled(k, 1, 'e^x'),
                    [scaled(k, 1, 'x e^{x-1}'), scaled(k, 1, 'e^{x+1}'), scaled(-k, 1, 'e^x'), scaled(k, 1, 'x e^x')]);
                const kk = Math.abs(k);
                return mk(`\\frac{d}{dx}(${kk} \\ln x)`, `\\frac{${kk}}{x}`,
                    [`${kk}x`, `\\frac{1}{x}`, `-\\frac{${kk}}{x}`, `\\frac{${kk}}{x^2}`]);
            }
        ],
        limites: [
            () => {
                const a = nz(-4, 4), b = rnd(-6, 6), d = rnd(-9, 9), c = rnd(-3, 3);
                const v = a * c * c + b * c + d;
                return mk(`\\lim_{x \\to ${c}} (${poly([a, b, d])})`, v,
                    [v + 1, v - 1, -v, a * c * c, v + d, d]);
            },
            () => {
                const c = nz(-9, 9);
                return mk(`\\lim_{x \\to ${c}} \\frac{x^2 ${c * c < 0 ? '+' : '-'} ${c * c}}{${poly([1, -c])}}`, 2 * c,
                    [0, c, c * c, '\\text{No existe}', -2 * c]);
            },
            () => {
                const a = nz(-6, 6), b = nz(-6, 6);
                if (a === b) return null;
                return mk(`\\lim_{x \\to ${-a}} \\frac{${poly([1, a + b, a * b])}}{${poly([1, a])}}`, b - a,
                    [0, a - b, a + b, '\\text{No existe}', b]);
            },
            () => {
                const k = rnd(2, 9);
                return mk(`\\lim_{x \\to 0} \\frac{\\sin(${k}x)}{x}`, k,
                    [1, 0, frac(1, k), '\\infty']);
            }
        ],
        funciones: [
            () => {
                const a = nz(-3, 3), b = rnd(-5, 5), d = rnd(-8, 8), t = nz(-4, 4);
                const v = a * t * t + b * t + d;
                return mk(`\\text{Si } f(x) = ${poly([a, b, d])} \\text{, entonces } f(${t}) =`, v,
                    [a * t * t - b * t + d, v + 1, -v, v - d, a * t + b + d]);
            },
            () => {
                const a = nz(-4, 4), b = nz(-6, 6), t = nz(-4, 4);
                return mk(`\\text{Si } f(x) = ${poly([a, b])} \\text{ y } g(x) = x^2 \\text{, entonces } (f \\circ g)(${t}) =`, a * t * t + b,
                    [(a * t + b) ** 2, a * t + b, a * t * t - b, a * t * t]);
            },
            () => {
                const c = nz(-9, 9);
                return mk(`\\text{El dominio de } f(x) = \\sqrt{${poly([1, -c])}} \\text{ es:}`, `[${c}, \\infty)`,
                    [`(${c}, \\infty)`, `(-\\infty, ${c}]`, `[${-c}, \\infty)`]);
            },
            () => {
                const c = nz(-9, 9);
                return mk(`\\text{El dominio de } f(x) = \\frac{1}{${poly([1, -c])}} \\text{ es:}`, `(-\\infty, ${c}) \\cup (${c}, \\infty)`,
                    [`(-\\infty, ${c})`, `(${c}, \\infty)`, `(-\\infty, ${-c}) \\cup (${-c}, \\infty)`, '(-\\infty, \\infty)']);
            }
        ],
        limites_infinito: [
            () => {
                const a = nz(-6, 6), d = nz(-6, 6);
                return mk(`\\lim_{x \\to \\infty} \\frac{${poly([a, rnd(-5, 5), rnd(-5, 5)])}}{${poly([d, 0, nz(-9, 9)])}}`, frac(a, d),
                    [frac(d, a), '0', '\\infty', frac(-a, d)]);
            },
            () => {
                const a = nz(-6, 6), c = nz(-6, 6);
                return mk(`\\lim_{x \\to \\infty} \\frac{${poly([a, nz(-9, 9)])}}{${poly([c, 0, nz(-9, 9)])}}`, '0',
                    ['\\infty', frac(a, c), '-\\infty', '1']);
            },
            () => {
                const a = nz(-6, 6), c = nz(-6, 6), ans = a * c > 0 ? '\\infty' : '-\\infty';
                return mk(`\\lim_{x \\to \\infty} \\frac{${poly([a, 0, 0, nz(-9, 9)])}}{${poly([c, nz(-9, 9)])}}`, ans,
                    [a * c > 0 ? '-\\infty' : '\\infty', '0', frac(a, c)]);
            },
            () => {
                const k = nz(-9, 9), n = rnd(1, 4);
                return mk(`\\lim_{x \\to \\infty} \\frac{${k}}{${xp(n)}}`, '0', [String(k), '\\infty', '1', '-\\infty']);
            }
        ],
        metodos_derivadas: [
            () => {
                const a = rnd(2, 5), b = nz(-6, 6), n = rnd(2, 5), p = poly([a, b]);
                return mk(`\\frac{d}{dx}(${p})^{${n}}`, scaled(n * a, 1, paren(p, n - 1)),
                    [scaled(n, 1, paren(p, n - 1)), scaled(n * a, 1, paren(p, n)), scaled(a, 1, paren(p, n - 1)), scaled(n, 1, paren(p, n))]);
            },
            () => {
                const k = nz(-6, 6);
                if (Math.abs(k) < 2) return null;
                const e = `e^{${k}x}`;
                return mk(`\\frac{d}{dx}(${e})`, scaled(k, 1, e),
                    [e, scaled(k, 1, `x e^{${k}x-1}`), scaled(-k, 1, e), scaled(k, 1, 'e^x')]);
            },
            () => {
                const k = rnd(2, 7), t = rnd(0, 1);
                if (t === 0) return mk(`\\frac{d}{dx}(\\sin(${k}x))`, scaled(k, 1, `\\cos(${k}x)`),
                    [`\\cos(${k}x)`, scaled(-k, 1, `\\cos(${k}x)`), scaled(k, 1, `\\sin(${k}x)`), scaled(k, 1, '\\cos x')]);
                return mk(`\\frac{d}{dx}(\\cos(${k}x))`, scaled(-k, 1, `\\sin(${k}x)`),
                    [scaled(k, 1, `\\sin(${k}x)`), `-\\sin(${k}x)`, scaled(k, 1, `\\cos(${k}x)`), scaled(-k, 1, '\\sin x')]);
            },
            () => {
                const n = rnd(2, 4);
                return mk(`\\frac{d}{dx}(${xp(n)}e^x)`, `e^x\\left(${xp(n)} + ${n}${xp(n - 1)}\\right)`,
                    [`${n}${xp(n - 1)}e^x`, `${xp(n)}e^x`, `e^x\\left(${xp(n)} - ${n}${xp(n - 1)}\\right)`]);
            },
            () => {
                const n = rnd(2, 4);
                return mk(`\\frac{d}{dx}(${xp(n)}\\sin x)`, `${n}${xp(n - 1)}\\sin x + ${xp(n)}\\cos x`,
                    [`${n}${xp(n - 1)}\\cos x`, `${n}${xp(n - 1)}\\sin x - ${xp(n)}\\cos x`, `${xp(n - 1)}\\sin x + ${xp(n)}\\cos x`]);
            },
            () => {
                const a = rnd(2, 6), b = nz(-6, 6), p = poly([a, b]);
                return mk(`\\frac{d}{dx}\\ln(${p})`, `\\frac{${a}}{${p}}`,
                    [`\\frac{1}{${p}}`, `\\frac{${a}}{x}`, `${a}\\ln(${p})`, `\\frac{${a}}{(${p})^2}`]);
            }
        ],
        aplicaciones_dif: [
            () => {
                const m = nz(-6, 6), q = rnd(-9, 9);
                return mk(`\\text{El punto crítico de } f(x) = ${poly([1, 2 * m, q])} \\text{ es:}`, `x = ${-m}`,
                    [`x = ${m}`, `x = ${-2 * m}`, `x = ${2 * m}`, `x = ${q}`]);
            },
            () => {
                const b = rnd(-6, 6), t = nz(-4, 4), v = 3 * t * t + b;
                return mk(`\\text{La pendiente de } f(x) = ${poly([1, 0, b, 0])} \\text{ en } x = ${t} \\text{ es:}`, v,
                    [t ** 3 + b * t, 3 * t * t, 3 * t + b, v + 1, v - 2]);
            },
            () => {
                const a = rnd(1, 4), b = rnd(-6, 6), c = rnd(0, 9), t0 = rnd(1, 5), v = 2 * a * t0 + b;
                return mk(`\\text{Si } s(t) = ${poly([a, b, c], 't')} \\text{, la velocidad en } t = ${t0} \\text{ es:}`, v,
                    [a * t0 * t0 + b * t0 + c, 2 * a * t0, a * t0 + b, v + 2]);
            },
            () => {
                const m = rnd(1, 6), q = rnd(-8, 8), c = rnd(0, 9);
                return mk(`\\text{El vértice de } f(x) = ${poly([1, -2 * m, c])} \\text{ está en } x =`, m,
                    [-m, 2 * m, c, m * m]);
            }
        ]
    };

    // =====================================================
    // CÁLCULO INTEGRAL
    // =====================================================
    const C = ' + C';
    const genInt = {
        integrales_directas: [
            () => {
                const n = rnd(1, 6), k = nz(-5, 5), a = k * (n + 1);
                return mk(`\\int ${tstr(a, n)} dx`, tstr(k, n + 1) + C,
                    [tstr(a, n + 1) + C, tstr(k, n) + C, tstr(a * (n + 1), n + 1) + C, tstr(-k, n + 1) + C]);
            },
            () => {
                const k = nz(-7, 7);
                return mk(`\\int ${scaled(k, 1, 'e^x')} dx`, scaled(k, 1, 'e^x') + C,
                    [scaled(-k, 1, 'e^x') + C, scaled(k, 1, 'x e^x') + C, scaled(k, 1, 'e^{x-1}') + C, scaled(k, 1, 'e^x')]);
            },
            () => {
                const k = rnd(2, 9);
                return mk(`\\int \\frac{${k}}{x} dx`, `${k}\\ln|x|${C}`,
                    [`\\frac{${k}}{x^2}${C}`, `-${k}\\ln|x|${C}`, `${k}x\\ln|x|${C}`, `\\frac{${k}}{x}${C}`]);
            },
            () => {
                const m = nz(-4, 4), n = nz(-4, 4), c = nz(-9, 9);
                return mk(`\\int (${poly([3 * m, 2 * n, c])}) dx`, poly([m, n, c, 0]) + C,
                    [poly([3 * m, 2 * n, c, 0]) + C, poly([m, n, c]) + C, poly([m, n, 2 * c, 0]) + C, poly([m, n, c, 0])]);
            }
        ],
        integrales_evaluadas: [
            () => {
                const n = rnd(1, 3), m = nz(-3, 3), k = m * (n + 1), lo = rnd(0, 2), hi = lo + rnd(1, 3);
                const v = m * (hi ** (n + 1) - lo ** (n + 1));
                return mk(`\\int_{${lo}}^{${hi}} ${tstr(k, n)} dx`, v,
                    [k * (hi ** (n + 1) - lo ** (n + 1)), m * (hi ** n - lo ** n), -v, v + m, v + 1]);
            },
            () => {
                const c = nz(-9, 9), lo = rnd(-3, 2), hi = lo + rnd(1, 5), v = c * (hi - lo);
                return mk(`\\int_{${lo}}^{${hi}} ${c} dx`, v, [c * hi, c * lo, -v, v + c, c]);
            },
            () => {
                const b = rnd(1, 4), c = rnd(1, 6), m = rnd(1, 3), v = m * b * b * b + c * b;
                // ∫0^b (3m x^2 + c) dx = m b^3 + c b
                return mk(`\\int_{0}^{${b}} (${poly([3 * m, 0, c])}) dx`, v,
                    [3 * m * b * b + c, m * b * b + c * b, v + c, 3 * m * b ** 3 + c * b]);
            }
        ],
        integrales_trig: [
            () => {
                const k = nz(-7, 7), s = rnd(0, 1);
                if (s === 0) return mk(`\\int ${scaled(k, 1, '\\sin x')} dx`, scaled(-k, 1, '\\cos x') + C,
                    [scaled(k, 1, '\\cos x') + C, scaled(k, 1, '\\sin x') + C, scaled(-k, 1, '\\sin x') + C]);
                return mk(`\\int ${scaled(k, 1, '\\cos x')} dx`, scaled(k, 1, '\\sin x') + C,
                    [scaled(-k, 1, '\\sin x') + C, scaled(k, 1, '\\cos x') + C, scaled(-k, 1, '\\cos x') + C]);
            },
            () => {
                const k = rnd(2, 8);
                return mk(`\\int \\sin(${k}x) dx`, scaled(-1, k, `\\cos(${k}x)`) + C,
                    [scaled(1, k, `\\cos(${k}x)`) + C, scaled(-k, 1, `\\cos(${k}x)`) + C, `-\\cos(${k}x)${C}`, scaled(1, k, `\\sin(${k}x)`) + C]);
            },
            () => {
                const k = rnd(2, 8);
                return mk(`\\int \\cos(${k}x) dx`, scaled(1, k, `\\sin(${k}x)`) + C,
                    [scaled(-1, k, `\\sin(${k}x)`) + C, scaled(k, 1, `\\sin(${k}x)`) + C, `\\sin(${k}x)${C}`, scaled(1, k, `\\cos(${k}x)`) + C]);
            },
            () => {
                const k = nz(-6, 6);
                return mk(`\\int ${scaled(k, 1, '\\sec^2 x')} dx`, scaled(k, 1, '\\tan x') + C,
                    [scaled(k, 1, '\\sec x') + C, scaled(-k, 1, '\\tan x') + C, scaled(k, 1, '\\cot x') + C]);
            }
        ],
        cambio_variable: [
            () => {
                const a = rnd(2, 5), b = nz(-5, 5), n = rnd(2, 5), p = poly([a, b]);
                return mk(`\\int (${p})^{${n}} dx`, `\\frac{(${p})^{${n + 1}}}{${a * (n + 1)}}${C}`,
                    [`\\frac{(${p})^{${n + 1}}}{${n + 1}}${C}`, `(${p})^{${n + 1}}${C}`, `\\frac{(${p})^{${n}}}{${a * n}}${C}`, `${n}(${p})^{${n - 1}}${C}`]);
            },
            () => {
                const k = rnd(2, 7);
                return mk(`\\int e^{${k}x} dx`, scaled(1, k, `e^{${k}x}`) + C,
                    [`e^{${k}x}${C}`, scaled(k, 1, `e^{${k}x}`) + C, scaled(1, k, 'e^x') + C, scaled(-1, k, `e^{${k}x}`) + C]);
            },
            () => {
                const c = nz(-5, 5), n = rnd(2, 5), p = poly([1, 0, c]);
                return mk(`\\int 2x(${p})^{${n}} dx`, `\\frac{(${p})^{${n + 1}}}{${n + 1}}${C}`,
                    [`(${p})^{${n + 1}}${C}`, `\\frac{(${p})^{${n + 1}}}{${2 * (n + 1)}}${C}`, `\\frac{(${p})^{${n}}}{${n}}${C}`]);
            },
            () => {
                const n = rnd(2, 5);
                return mk(`\\int \\cos x \\sin^{${n}} x dx`, `\\frac{\\sin^{${n + 1}} x}{${n + 1}}${C}`,
                    [`\\sin^{${n + 1}} x${C}`, `\\frac{\\sin^{${n + 1}} x}{${n}}${C}`, `\\frac{\\cos^{${n + 1}} x}{${n + 1}}${C}`]);
            }
        ],
        por_partes: [
            () => {
                const k = rnd(2, 6), t = rnd(0, 2);
                if (t === 0) return mk(`\\int ${k}x e^x dx`, `${k}(x e^x - e^x)${C}`,
                    [`${k}x e^x${C}`, `${k}(e^x - x e^x)${C}`, `${k}\\frac{x^2}{2}e^x${C}`]);
                if (t === 1) return mk(`\\int ${k}x \\sin x dx`, `${k}(\\sin x - x\\cos x)${C}`,
                    [`${k}(x\\cos x - \\sin x)${C}`, `${k}(x\\sin x + \\cos x)${C}`, `-${k}x\\cos x${C}`]);
                return mk(`\\int ${k}x \\cos x dx`, `${k}(x\\sin x + \\cos x)${C}`,
                    [`${k}(x\\sin x - \\cos x)${C}`, `${k}(\\sin x - x\\cos x)${C}`, `${k}x\\sin x${C}`]);
            },
            () => pick([
                mk('\\int x \\sin x dx', `\\sin x - x\\cos x${C}`, [`x\\cos x - \\sin x${C}`, `x\\sin x + \\cos x${C}`, `-x\\sin x + \\cos x${C}`]),
                mk('\\int x \\cos x dx', `x\\sin x + \\cos x${C}`, [`x\\sin x - \\cos x${C}`, `-x\\sin x + \\cos x${C}`, `x\\cos x - \\sin x${C}`]),
                mk('\\int x^2 e^x dx', `e^x(x^2 - 2x + 2)${C}`, [`e^x(x^2 + 2x + 2)${C}`, `e^x(x^2 - 2x)${C}`, `x^2 e^x${C}`]),
                mk('\\int x \\ln x dx', `\\frac{x^2}{2}\\ln|x| - \\frac{x^2}{4}${C}`, [`\\frac{x^2}{2}\\ln|x| - \\frac{x^2}{2}${C}`, `\\frac{x^2}{2}\\ln|x| + \\frac{x^2}{4}${C}`, `x\\ln|x| - x${C}`]),
                mk('\\int x^2 \\ln x dx', `\\frac{x^3}{3}\\ln|x| - \\frac{x^3}{9}${C}`, [`\\frac{x^3}{3}\\ln|x| - \\frac{x^3}{3}${C}`, `\\frac{x^3}{3}\\ln|x| + \\frac{x^3}{9}${C}`, `x^2\\ln|x| - x^2${C}`]),
                mk('\\int x e^{2x} dx', `\\frac{e^{2x}}{4}(2x - 1)${C}`, [`\\frac{e^{2x}}{2}(x - 1)${C}`, `\\frac{e^{2x}}{4}(2x + 1)${C}`, `e^{2x}(x - 1)${C}`]),
                mk('\\int x e^{-x} dx', `-e^{-x}(x + 1)${C}`, [`e^{-x}(x + 1)${C}`, `-e^{-x}(x - 1)${C}`, `-x e^{-x}${C}`]),
                mk('\\int e^x \\sin x dx', `\\frac{e^x(\\sin x - \\cos x)}{2}${C}`, [`\\frac{e^x(\\sin x + \\cos x)}{2}${C}`, `e^x(\\sin x - \\cos x)${C}`, `\\frac{e^x \\cos x}{2}${C}`])
            ])
        ],
        fracciones_parciales: [
            () => {
                const a = rnd(0, 4), d = rnd(1, 3), b = a + d;
                const pa = poly([1, a]), pb = poly([1, b]);
                const L = p => `\\ln|${p}|`;
                return mk(`\\int \\frac{1}{(${pa})(${pb})} dx`, `${scaled(1, d, L(pa))} - ${scaled(1, d, L(pb))}${C}`,
                    [`${scaled(1, d, L(pb))} - ${scaled(1, d, L(pa))}${C}`, `${scaled(1, d, L(pa))} + ${scaled(1, d, L(pb))}${C}`,
                        `${scaled(1, d, `\\ln|(${pa})(${pb})|`)}${C}`, `\\frac{1}{(${pa})(${pb})}${C}`]);
            },
            () => {
                const A = nz(-4, 4), B = nz(-4, 4), r1 = nz(-4, 4), r2 = nz(-4, 4);
                if (r1 === r2) return null;
                const num = poly([A + B, -(A * r2 + B * r1)]);
                const p1 = poly([1, -r1]), p2 = poly([1, -r2]);
                const L1 = `\\ln|${p1}|`, L2 = `\\ln|${p2}|`;
                const build = (a, b) => `${scaled(a, 1, L1)} ${b < 0 ? '-' : '+'} ${scaled(Math.abs(b), 1, L2)}${C}`;
                return mk(`\\int \\frac{${num}}{(${p1})(${p2})} dx`, build(A, B),
                    [build(B, A), build(-A, -B), build(A, -B), build(-A, B)]);
            }
        ],
        sumas_riemann: [
            () => {
                const n = rnd(4, 10);
                return mk(`\\sum_{i=1}^{${n}} i`, n * (n + 1) / 2,
                    [n * (n + 1), n * n, n * (n + 1) / 2 + n, n * (n - 1) / 2]);
            },
            () => {
                const n = rnd(3, 8);
                return mk(`\\sum_{i=1}^{${n}} i^2`, n * (n + 1) * (2 * n + 1) / 6,
                    [(n * (n + 1) / 2) ** 2, n * (n + 1) * (2 * n + 1) / 3, n ** 3, n * (n + 1) / 2]);
            },
            () => {
                const n = rnd(4, 12), c = rnd(2, 9);
                return mk(`\\sum_{i=1}^{${n}} ${c}`, n * c, [c, n + c, n * c + n, c ** 2]);
            },
            () => {
                const L = rnd(3, 7), t = rnd(0, 1);
                if (t === 0) return mk(`\\text{Suma de Riemann derecha de } f(x) = x \\text{ en } [0, ${L}] \\text{ con } ${L} \\text{ subintervalos}`, L * (L + 1) / 2,
                    [L * (L - 1) / 2, frac(L * L, 2), L * L, L * (L + 1)]);
                return mk(`\\text{Suma de Riemann izquierda de } f(x) = x \\text{ en } [0, ${L}] \\text{ con } ${L} \\text{ subintervalos}`, L * (L - 1) / 2,
                    [L * (L + 1) / 2, frac(L * L, 2), L * L, L * (L - 1)]);
            }
        ],
        aplicaciones_int: [
            () => {
                const m = 2 * rnd(1, 5), b = rnd(2, 6), v = (m / 2) * b * b;
                return mk(`\\text{Área bajo } f(x) = ${m}x \\text{ de } x=0 \\text{ a } x=${b}`, v,
                    [m * b * b, (m / 2) * b, m * b, v + b]);
            },
            () => {
                const k = rnd(1, 4), b = rnd(2, 4), v = k * b ** 3;
                return mk(`\\text{Área bajo } f(x) = ${3 * k}x^2 \\text{ de } x=0 \\text{ a } x=${b}`, v,
                    [3 * k * b ** 3, k * b * b, 3 * k * b * b, v + k]);
            },
            () => {
                const k = rnd(1, 5), T = rnd(2, 6), v = k * T * T;
                return mk(`\\text{Si } v(t) = ${2 * k}t \\text{, la distancia recorrida de } t=0 \\text{ a } t=${T} \\text{ es:}`, v,
                    [2 * k * T * T, k * T, 2 * k * T, v + T]);
            },
            () => {
                const c = rnd(2, 9), lo = rnd(0, 3), hi = lo + rnd(2, 6), v = c * (hi - lo);
                return mk(`\\text{Área bajo } f(x) = ${c} \\text{ de } x=${lo} \\text{ a } x=${hi}`, v,
                    [c * hi, c * (hi + lo), c, v + c]);
            }
        ]
    };

    // =====================================================
    // CANTIDAD A GENERAR POR SUBTEMA
    // =====================================================
    function fill(target, gensBySubtema, counts, fallback) {
        if (!Array.isArray(target)) return;
        Object.keys(gensBySubtema).forEach(s => {
            generate(target, s, gensBySubtema[s].map(g => () => g()), counts[s] || fallback);
        });
    }

    fill(typeof dataFundamentos !== 'undefined' ? dataFundamentos : null, genFund,
        { ecuaciones_1: 40, ecuaciones_2: 40, ecuaciones_3: 40, desigualdades: 40, productos_notables: 45, factorizacion: 45 }, 40);
    fill(typeof dataDiferencial !== 'undefined' ? dataDiferencial : null, genDif,
        { derivadas_directas: 40, limites: 35, funciones: 35, limites_infinito: 30, metodos_derivadas: 35, aplicaciones_dif: 30 }, 30);
    fill(typeof dataIntegral !== 'undefined' ? dataIntegral : null, genInt,
        { integrales_directas: 40, integrales_evaluadas: 35, integrales_trig: 30, cambio_variable: 30, por_partes: 25, fracciones_parciales: 30, sumas_riemann: 25, aplicaciones_int: 25 }, 30);
})();
