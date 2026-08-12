const dataFundamentos = [
// Ecuaciones básicas
                { subtema: "ecuaciones_1", q: "2x = 10", a: "x = 5", distractors: ["x=2", "x=10", "x=0"] },
                { subtema: "ecuaciones_1", q: "x + 5 = 20", a: "x = 15", distractors: ["x=25", "x=5", "x=10"] },
                { subtema: "ecuaciones_1", q: "5x - 5 = 0", a: "x = 1", distractors: ["x=0", "x=5", "x=-1"] },
                { subtema: "ecuaciones_1", q: "10 / 2", a: "5", distractors: ["20", "2", "10"] },
                
                // Exponentes
                { subtema: "ecuaciones_1", q: "3^2", a: "9", distractors: ["6", "3", "27"] },
                { subtema: "ecuaciones_1", q: "2^5", a: "32", distractors: ["10", "25", "16"] },
                { subtema: "ecuaciones_1", q: "5^3", a: "125", distractors: ["15", "125", "100"] },
                { subtema: "ecuaciones_1", q: "10^2", a: "100", distractors: ["20", "102", "1000"] },
                { subtema: "ecuaciones_1", q: "2^{-2}", a: "\\frac{1}{4}", distractors: ["-4", "\\frac{1}{2}", "-\\frac{1}{4}"] },
                { subtema: "ecuaciones_1", q: "x^2 \\cdot x^3", a: "x^5", distractors: ["x^6", "x^2", "x^{-1}"] },
                { subtema: "ecuaciones_1", q: "\\frac{x^5}{x^2}", a: "x^3", distractors: ["x^7", "x^2", "x^{-3}"] },
                { subtema: "ecuaciones_1", q: "(x^2)^3", a: "x^6", distractors: ["x^5", "x^9", "x^3"] },
                
                // Raíces
                { subtema: "ecuaciones_1", q: "\\sqrt{16}", a: "4", distractors: ["8", "2", "6"] },
                { subtema: "ecuaciones_1", q: "\\sqrt{25}", a: "5", distractors: ["10", "3", "25"] },
                { subtema: "ecuaciones_1", q: "\\sqrt[3]{8}", a: "2", distractors: ["3", "4", "8"] },
                { subtema: "ecuaciones_1", q: "\\sqrt{x^4}", a: "x^2", distractors: ["x", "x^3", "x^8"] },
                
                // Productos Notables - Binomio al cuadrado
                { subtema: "productos_notables", q: "(a+b)^2", a: "a^2 + 2ab + b^2", distractors: ["a^2 + b^2", "a^2 - 2ab + b^2", "a^2 + ab + b^2"] },
                { subtema: "productos_notables", q: "(x+3)^2", a: "x^2 + 6x + 9", distractors: ["x^2 + 9", "x^2 + 3x + 9", "x^2 - 6x + 9"] },
                { subtema: "productos_notables", q: "(2x-1)^2", a: "4x^2 - 4x + 1", distractors: ["4x^2 - 1", "4x^2 + 4x + 1", "2x^2 - 4x + 1"] },
                
                // Productos Notables - Diferencia de cuadrados
                { subtema: "productos_notables", q: "(a+b)(a-b)", a: "a^2 - b^2", distractors: ["a^2 + b^2", "a^2 - 2ab + b^2", "a^2 + 2ab - b^2"] },
                { subtema: "productos_notables", q: "(x+5)(x-5)", a: "x^2 - 25", distractors: ["x^2 - 10x + 25", "x^2 + 25", "x^2 - 10"] },
                { subtema: "productos_notables", q: "(3x+2)(3x-2)", a: "9x^2 - 4", distractors: ["9x^2 - 4x + 4", "9x^2 + 4", "9x^2 - 12x + 4"] },
                
                // Productos Notables - Binomio al cubo
                { subtema: "productos_notables", q: "(a+b)^3", a: "a^3 + 3a^2b + 3ab^2 + b^3", distractors: ["a^3 + b^3", "a^3 + 3ab + b^3", "a^3 - 3a^2b + 3ab^2 - b^3"] },
                { subtema: "productos_notables", q: "(x+2)^3", a: "x^3 + 6x^2 + 12x + 8", distractors: ["x^3 + 8", "x^3 + 6x + 8", "x^3 - 6x^2 + 12x - 8"] },
                
                // Factorización - Factor común
                { subtema: "factorizacion", q: "2x^2 + 4x", a: "2x(x + 2)", distractors: ["2x(x + 4)", "2(x^2 + 2x)", "x(2x + 4)"] },
                { subtema: "factorizacion", q: "3a^3 + 6a^2", a: "3a^2(a + 2)", distractors: ["3a(a^2 + 2a)", "3a^2(a + 2a)", "a^2(3a + 6)"] },
                { subtema: "factorizacion", q: "x^3 - 2x^2", a: "x^2(x - 2)", distractors: ["x(x^2 - 2)", "x^2(x - 1)", "x(x - 2)"] },
                
                // Factorización - Trinomio cuadrado perfecto
                { subtema: "factorizacion", q: "x^2 + 6x + 9", a: "(x + 3)^2", distractors: ["(x + 3)(x - 3)", "(x + 6)^2", "x(x + 9)"] },
                { subtema: "factorizacion", q: "x^2 - 10x + 25", a: "(x - 5)^2", distractors: ["(x - 5)(x + 5)", "(x - 10)^2", "(x - 2)^2"] },
                { subtema: "factorizacion", q: "4x^2 + 4x + 1", a: "(2x + 1)^2", distractors: ["(4x + 1)^2", "(2x + 1)(2x - 1)", "(2x)^2 + 1"] },
                
                // Factorización - Diferencia de cuadrados
                { subtema: "factorizacion", q: "x^2 - 9", a: "(x + 3)(x - 3)", distractors: ["(x - 3)^2", "(x - 9)(x + 1)", "x(x - 9)"] },
                { subtema: "factorizacion", q: "4x^2 - 16", a: "4(x + 2)(x - 2)", distractors: ["(2x - 4)^2", "(4x + 4)(x - 4)", "(2x + 4)(2x - 4)"] },
                { subtema: "factorizacion", q: "25 - a^2", a: "(5 + a)(5 - a)", distractors: ["(5 - a)^2", "(25 - a)(1 + a)", "5(5 - a)"] },
                
                // Factorización - Trinomio de la forma x² + bx + c
                { subtema: "factorizacion", q: "x^2 + 5x + 6", a: "(x + 2)(x + 3)", distractors: ["(x + 1)(x + 6)", "(x + 5)(x + 1)", "(x + 2)(x - 3)"] },
                { subtema: "factorizacion", q: "x^2 - 7x + 12", a: "(x - 3)(x - 4)", distractors: ["(x - 2)(x - 6)", "(x - 3)(x + 4)", "(x - 7)(x + 1)"] },
                { subtema: "factorizacion", q: "x^2 + x - 20", a: "(x + 5)(x - 4)", distractors: ["(x - 5)(x + 4)", "(x + 10)(x - 2)", "(x + 1)(x - 20)"] },
                
                // Matrices - Suma
                { subtema: "matrices", q: "\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix} + \\begin{pmatrix} 1 & 1 \\\\ 1 & 1 \\end{pmatrix}", a: "\\begin{pmatrix} 2 & 3 \\\\ 4 & 5 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 0 & 1 \\\\ 2 & 3 \\end{pmatrix}", "\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}", "\\begin{pmatrix} 2 & 4 \\\\ 6 & 8 \\end{pmatrix}"] },
                { subtema: "matrices", q: "\\begin{pmatrix} 5 & 2 \\\\ 1 & 3 \\end{pmatrix} + \\begin{pmatrix} 1 & 2 \\\\ 3 & 1 \\end{pmatrix}", a: "\\begin{pmatrix} 6 & 4 \\\\ 4 & 4 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 4 & 0 \\\\ -2 & 2 \\end{pmatrix}", "\\begin{pmatrix} 5 & 4 \\\\ 4 & 3 \\end{pmatrix}", "\\begin{pmatrix} 6 & 2 \\\\ 4 & 4 \\end{pmatrix}"] },
                { subtema: "matrices", q: "\\begin{pmatrix} 0 & 3 \\\\ 2 & 1 \\end{pmatrix} + \\begin{pmatrix} 2 & 0 \\\\ 1 & 4 \\end{pmatrix}", a: "\\begin{pmatrix} 2 & 3 \\\\ 3 & 5 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 2 & 3 \\\\ 2 & 3 \\end{pmatrix}", "\\begin{pmatrix} 0 & 0 \\\\ 0 & 0 \\end{pmatrix}", "\\begin{pmatrix} 2 & 0 \\\\ 3 & 4 \\end{pmatrix}"] },
                
                // Matrices - Resta
                { subtema: "matrices", q: "\\begin{pmatrix} 5 & 4 \\\\ 2 & 3 \\end{pmatrix} - \\begin{pmatrix} 1 & 1 \\\\ 1 & 1 \\end{pmatrix}", a: "\\begin{pmatrix} 4 & 3 \\\\ 1 & 2 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 6 & 5 \\\\ 3 & 4 \\end{pmatrix}", "\\begin{pmatrix} 4 & 4 \\\\ 1 & 3 \\end{pmatrix}", "\\begin{pmatrix} 4 & 3 \\\\ 1 & 1 \\end{pmatrix}"] },
                { subtema: "matrices", q: "\\begin{pmatrix} 8 & 6 \\\\ 5 & 7 \\end{pmatrix} - \\begin{pmatrix} 3 & 2 \\\\ 1 & 4 \\end{pmatrix}", a: "\\begin{pmatrix} 5 & 4 \\\\ 4 & 3 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 11 & 8 \\\\ 6 & 11 \\end{pmatrix}", "\\begin{pmatrix} 5 & 4 \\\\ 6 & 3 \\end{pmatrix}", "\\begin{pmatrix} 5 & 8 \\\\ 4 & 3 \\end{pmatrix}"] },
                { subtema: "matrices", q: "\\begin{pmatrix} 10 & 5 \\\\ 3 & 8 \\end{pmatrix} - \\begin{pmatrix} 10 & 5 \\\\ 3 & 8 \\end{pmatrix}", a: "\\begin{pmatrix} 0 & 0 \\\\ 0 & 0 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 1 & 1 \\\\ 1 & 1 \\end{pmatrix}", "\\begin{pmatrix} 20 & 10 \\\\ 6 & 16 \\end{pmatrix}", "\\begin{pmatrix} 10 & 5 \\\\ 3 & 8 \\end{pmatrix}"] },
                
                // Matrices - Multiplicación por escalar
                { subtema: "matrices", q: "2 \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}", a: "\\begin{pmatrix} 2 & 4 \\\\ 6 & 8 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}", "\\begin{pmatrix} 3 & 4 \\\\ 5 & 6 \\end{pmatrix}", "\\begin{pmatrix} 2 & 3 \\\\ 4 & 5 \\end{pmatrix}"] },
                { subtema: "matrices", q: "3 \\begin{pmatrix} 2 & 1 \\\\ 0 & 3 \\end{pmatrix}", a: "\\begin{pmatrix} 6 & 3 \\\\ 0 & 9 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 5 & 4 \\\\ 3 & 6 \\end{pmatrix}", "\\begin{pmatrix} 6 & 3 \\\\ 3 & 9 \\end{pmatrix}", "\\begin{pmatrix} 2 & 1 \\\\ 0 & 3 \\end{pmatrix}"] },
                { subtema: "matrices", q: "-1 \\begin{pmatrix} 4 & -2 \\\\ 1 & 5 \\end{pmatrix}", a: "\\begin{pmatrix} -4 & 2 \\\\ -1 & -5 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 4 & -2 \\\\ 1 & 5 \\end{pmatrix}", "\\begin{pmatrix} -4 & -2 \\\\ -1 & -5 \\end{pmatrix}", "\\begin{pmatrix} 3 & -3 \\\\ 0 & 4 \\end{pmatrix}"] },
                { subtema: "matrices", q: "0 \\begin{pmatrix} 5 & 7 \\\\ 2 & 9 \\end{pmatrix}", a: "\\begin{pmatrix} 0 & 0 \\\\ 0 & 0 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 5 & 7 \\\\ 2 & 9 \\end{pmatrix}", "\\begin{pmatrix} 1 & 1 \\\\ 1 & 1 \\end{pmatrix}", "\\text{No definida}"] },
                
                // Matrices - Multiplicación de matrices 2x2
                { subtema: "matrices", q: "\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix} \\begin{pmatrix} 2 & 3 \\\\ 4 & 5 \\end{pmatrix}", a: "\\begin{pmatrix} 2 & 3 \\\\ 4 & 5 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}", "\\begin{pmatrix} 3 & 3 \\\\ 4 & 6 \\end{pmatrix}", "\\begin{pmatrix} 2 & 4 \\\\ 3 & 5 \\end{pmatrix}"] },
                { subtema: "matrices", q: "\\begin{pmatrix} 2 & 0 \\\\ 0 & 2 \\end{pmatrix} \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}", a: "\\begin{pmatrix} 2 & 4 \\\\ 6 & 8 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 2 & 2 \\\\ 2 & 2 \\end{pmatrix}", "\\begin{pmatrix} 3 & 4 \\\\ 3 & 6 \\end{pmatrix}", "\\begin{pmatrix} 4 & 8 \\\\ 6 & 8 \\end{pmatrix}"] },
                { subtema: "matrices", q: "\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix} \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}", a: "\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}", "\\begin{pmatrix} 1 & 2 \\\\ 0 & 4 \\end{pmatrix}", "\\begin{pmatrix} 2 & 2 \\\\ 7 & 4 \\end{pmatrix}"] },
                { subtema: "matrices", q: "\\begin{pmatrix} 1 & 2 \\\\ 0 & 1 \\end{pmatrix} \\begin{pmatrix} 1 & 0 \\\\ 2 & 1 \\end{pmatrix}", a: "\\begin{pmatrix} 5 & 2 \\\\ 2 & 1 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 1 & 2 \\\\ 2 & 1 \\end{pmatrix}", "\\begin{pmatrix} 3 & 2 \\\\ 2 & 1 \\end{pmatrix}", "\\begin{pmatrix} 5 & 0 \\\\ 0 & 1 \\end{pmatrix}"] },
                
                // Determinante de matriz 2x2
                { subtema: "matrices", q: "\\det\\begin{pmatrix} 2 & 3 \\\\ 1 & 4 \\end{pmatrix}", a: "5", distractors: ["11", "8", "-5"] },
                { subtema: "matrices", q: "\\det\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}", a: "-2", distractors: ["2", "10", "-10"] },
                { subtema: "matrices", q: "\\det\\begin{pmatrix} 5 & 2 \\\\ 3 & 1 \\end{pmatrix}", a: "-1", distractors: ["1", "8", "15"] },
                { subtema: "matrices", q: "\\det\\begin{pmatrix} 4 & 2 \\\\ 6 & 3 \\end{pmatrix}", a: "0", distractors: ["12", "2", "-12"] },
                { subtema: "matrices", q: "\\det\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}", a: "1", distractors: ["0", "2", "-1"] },
                { subtema: "matrices", q: "\\det\\begin{pmatrix} 3 & 5 \\\\ 2 & 4 \\end{pmatrix}", a: "2", distractors: ["12", "-2", "20"] },
                
                // Matriz transpuesta
                { subtema: "matrices", q: "\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}^T", a: "\\begin{pmatrix} 1 & 3 \\\\ 2 & 4 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}", "\\begin{pmatrix} 4 & 3 \\\\ 2 & 1 \\end{pmatrix}", "\\begin{pmatrix} -1 & -2 \\\\ -3 & -4 \\end{pmatrix}"] },
                { subtema: "matrices", q: "\\begin{pmatrix} 5 & 0 \\\\ 1 & 2 \\end{pmatrix}^T", a: "\\begin{pmatrix} 5 & 1 \\\\ 0 & 2 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 5 & 0 \\\\ 1 & 2 \\end{pmatrix}", "\\begin{pmatrix} 0 & 5 \\\\ 2 & 1 \\end{pmatrix}", "\\begin{pmatrix} 2 & 1 \\\\ 0 & 5 \\end{pmatrix}"] },
                { subtema: "matrices", q: "\\begin{pmatrix} 3 & 3 \\\\ 3 & 3 \\end{pmatrix}^T", a: "\\begin{pmatrix} 3 & 3 \\\\ 3 & 3 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 6 & 6 \\\\ 6 & 6 \\end{pmatrix}", "\\begin{pmatrix} 0 & 0 \\\\ 0 & 0 \\end{pmatrix}", "\\begin{pmatrix} 9 & 9 \\\\ 9 & 9 \\end{pmatrix}"] },
                
                // Matriz inversa (conceptos)
                { subtema: "matrices", q: "\\text{Si } A \\cdot A^{-1} = I", a: "A^{-1} \\text{ es inversa de } A", distractors: ["A^{-1} = 0", "A^{-1} \\text{ es igual a } A", "A^{-1} \\text{ no existe}"] },
                { subtema: "matrices", q: "\\text{Una matriz tiene inversa si:}", a: "\\det(A) \\neq 0", distractors: ["\\det(A) = 0", "A \\text{ es rectangular}", "A = 0"] },
                { subtema: "matrices", q: "\\text{La matriz identidad } I_2 \\text{ es:}", a: "\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 0 & 0 \\\\ 0 & 0 \\end{pmatrix}", "\\begin{pmatrix} 1 & 1 \\\\ 1 & 1 \\end{pmatrix}", "\\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}"] },
                { subtema: "matrices", q: "\\text{La matriz cero } O \\text{ es:}", a: "\\begin{pmatrix} 0 & 0 \\\\ 0 & 0 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 1 & 1 \\\\ 1 & 1 \\end{pmatrix}", "\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}", "\\text{No existe}"] },
                
                // Propiedades de matrices
                { subtema: "matrices", q: "A + B = ?", a: "B + A", distractors: ["A - B", "AB", "BA"] },
                { subtema: "matrices", q: "A + O = ?", a: "A", distractors: ["O", "2A", "A^2"] },
                { subtema: "matrices", q: "A \\cdot I = ?", a: "A", distractors: ["I", "O", "A^{-1}"] },
                { subtema: "matrices", q: "(AB)^T = ?", a: "B^T A^T", distractors: ["A^T B^T", "AB", "BA"] },
                
                // Trigonometría - Triángulo rectángulo
                { subtema: "aplicaciones_fund", q: "\\sin(90°)", a: "1", distractors: ["0", "-1", "\\infty"] },
                { subtema: "aplicaciones_fund", q: "\\cos(0°)", a: "1", distractors: ["0", "-1", "\\infty"] },
                { subtema: "aplicaciones_fund", q: "\\tan(45°)", a: "1", distractors: ["0", "\\sqrt{2}", "\\infty"] },
                { subtema: "aplicaciones_fund", q: "\\sin(30°)", a: "\\frac{1}{2}", distractors: ["\\frac{\\sqrt{3}}{2}", "\\frac{\\sqrt{2}}{2}", "1"] },
                { subtema: "aplicaciones_fund", q: "\\cos(60°)", a: "\\frac{1}{2}", distractors: ["\\frac{\\sqrt{3}}{2}", "\\frac{\\sqrt{2}}{2}", "1"] },
                { subtema: "aplicaciones_fund", q: "\\tan(60°)", a: "\\sqrt{3}", distractors: ["1", "\\frac{\\sqrt{3}}{3}", "\\frac{1}{2}"] },
                { subtema: "aplicaciones_fund", q: "\\sin(45°)", a: "\\frac{\\sqrt{2}}{2}", distractors: ["\\frac{1}{2}", "\\frac{\\sqrt{3}}{2}", "1"] },
                { subtema: "aplicaciones_fund", q: "\\cos(45°)", a: "\\frac{\\sqrt{2}}{2}", distractors: ["\\frac{1}{2}", "\\frac{\\sqrt{3}}{2}", "1"] },
                
                // Trigonometría - Identidades
                { subtema: "aplicaciones_fund", q: "\\sin^2(x) + \\cos^2(x)", a: "1", distractors: ["0", "2", "\\sin(2x)"] },
                { subtema: "aplicaciones_fund", q: "\\tan(x)", a: "\\frac{\\sin(x)}{\\cos(x)}", distractors: ["\\frac{\\cos(x)}{\\sin(x)}", "\\sin(x) + \\cos(x)", "\\sin(x) - \\cos(x)"] },
                
                // Trigonometría - Triángulo oblicuángulo (Ley de senos)
                { subtema: "aplicaciones_fund", q: "\\text{Ley de Senos: } \\frac{a}{\\sin A}", a: "= \\frac{b}{\\sin B} = \\frac{c}{\\sin C}", distractors: ["= \\frac{b}{\\cos B}", "= a + b + c", "= \\pi"] },
                
                // Trigonometría - Ley de cosenos
                { subtema: "aplicaciones_fund", q: "\\text{Ley de Cosenos: } a^2", a: "= b^2 + c^2 - 2bc\\cos(A)", distractors: ["= b^2 + c^2", "= (b+c)^2", "= b^2 + c^2 + 2bc\\cos(A)"] },
                
                // Matriz inversa - Cálculo para 2x2
                { subtema: "matrices", q: "A^{-1} \\text{ de } \\begin{pmatrix} 2 & 0 \\\\ 0 & 2 \\end{pmatrix}", a: "\\begin{pmatrix} \\frac{1}{2} & 0 \\\\ 0 & \\frac{1}{2} \\end{pmatrix}", distractors: ["\\begin{pmatrix} 2 & 0 \\\\ 0 & 2 \\end{pmatrix}", "\\begin{pmatrix} -2 & 0 \\\\ 0 & -2 \\end{pmatrix}", "\\text{No existe}"] },
                { subtema: "matrices", q: "A^{-1} \\text{ de } \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}", a: "\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 0 & 0 \\\\ 0 & 0 \\end{pmatrix}", "\\begin{pmatrix} -1 & 0 \\\\ 0 & -1 \\end{pmatrix}", "\\text{No existe}"] },
                { subtema: "matrices", q: "A^{-1} \\text{ de } \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}", a: "\\begin{pmatrix} -2 & 1 \\\\ \\frac{3}{2} & -\\frac{1}{2} \\end{pmatrix}", distractors: ["\\begin{pmatrix} 4 & -2 \\\\ -3 & 1 \\end{pmatrix}", "\\begin{pmatrix} 1 & -2 \\\\ -3 & 4 \\end{pmatrix}", "\\begin{pmatrix} -1 & -2 \\\\ -3 & -4 \\end{pmatrix}"] },
                { subtema: "matrices", q: "A^{-1} \\text{ de } \\begin{pmatrix} 2 & 1 \\\\ 4 & 3 \\end{pmatrix}", a: "\\begin{pmatrix} \\frac{3}{2} & -\\frac{1}{2} \\\\ -2 & 1 \\end{pmatrix}", distractors: ["\\begin{pmatrix} 3 & -1 \\\\ -4 & 2 \\end{pmatrix}", "\\begin{pmatrix} 2 & 1 \\\\ 4 & 3 \\end{pmatrix}", "\\text{No existe}"] },
                { subtema: "matrices", q: "A^{-1} \\text{ de } \\begin{pmatrix} 2 & 4 \\\\ 1 & 2 \\end{pmatrix}", a: "\\text{No existe (det=0)}", distractors: ["\\begin{pmatrix} 2 & -4 \\\\ -1 & 2 \\end{pmatrix}", "\\begin{pmatrix} \\frac{1}{2} & -2 \\\\ -\\frac{1}{2} & 1 \\end{pmatrix}", "\\begin{pmatrix} 1 & 2 \\\\ \\frac{1}{2} & 1 \\end{pmatrix}"] },
                { subtema: "matrices", q: "\\text{Para calcular } A^{-1} \\text{ de matriz 2x2:}", a: "\\frac{1}{\\det(A)} \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}", distractors: ["\\frac{1}{\\det(A)} \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}", "\\begin{pmatrix} -a & -b \\\\ -c & -d \\end{pmatrix}", "\\det(A) \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}"] },
                
                // Sistemas de ecuaciones 2x2
                { subtema: "ecuaciones_1", q: "x + y = 5, x - y = 1", a: "x = 3, y = 2", distractors: ["x = 2, y = 3", "x = 1, y = 4", "x = 4, y = 1"] },
                { subtema: "ecuaciones_1", q: "2x + y = 7, x - y = 2", a: "x = 3, y = 1", distractors: ["x = 2, y = 3", "x = 1, y = 5", "x = 4, y = -1"] },
                { subtema: "ecuaciones_1", q: "3x + 2y = 12, x + y = 5", a: "x = 2, y = 3", distractors: ["x = 3, y = 2", "x = 4, y = 0", "x = 1, y = 4"] },
                { subtema: "ecuaciones_1", q: "x + 2y = 8, 2x - y = 1", a: "x = 2, y = 3", distractors: ["x = 3, y = 2", "x = 1, y = 3", "x = 4, y = 2"] },
                { subtema: "ecuaciones_1", q: "4x + y = 9, x - y = 1", a: "x = 2, y = 1", distractors: ["x = 1, y = 2", "x = 3, y = -3", "x = 2, y = -1"] },
                
                // Regla de Cramer - Sistemas 2x2
                { subtema: "matrices", q: "\\text{Cramer: } x = \\frac{D_x}{D} \\text{, donde } D \\text{ es:}", a: "\\text{Determinante de coeficientes}", distractors: ["\\text{Suma de coeficientes}", "\\text{Producto de variables}", "\\text{Término independiente}"] },
                { subtema: "matrices", q: "\\text{Sistema: } 2x+y=5, x+3y=6 \\text{. Det } D=", a: "5", distractors: ["1", "-5", "11"] },
                { subtema: "matrices", q: "\\text{En Cramer, si } D=0:", a: "\\text{Sistema sin solución única}", distractors: ["\\text{Solución única existe}", "x = 0, y = 0", "\\text{Infinitas soluciones}"] },
                { subtema: "matrices", q: "\\text{Sistema por Cramer: } x+y=3, x-y=1", a: "x = 2, y = 1", distractors: ["x = 1, y = 2", "x = 3, y = 0", "x = 0, y = 3"] },
                { subtema: "matrices", q: "\\text{Cramer: } 2x+3y=8, x+2y=5 \\text{. Det } D=", a: "1", distractors: ["5", "-1", "0"] },
                { subtema: "matrices", q: "\\text{Cramer: } 3x+2y=13, 2x+y=8. \\text{ Solución:}", a: "x = 3, y = 2", distractors: ["x = 2, y = 3", "x = 4, y = 1", "x = 1, y = 5"] },
                
                // Gauss-Jordan - Proceso y conceptos
                { subtema: "matrices", q: "\\text{Gauss-Jordan busca llegar a:}", a: "\\text{Forma escalonada reducida}", distractors: ["\\text{Forma triangular}", "\\text{Determinante}", "\\text{Matriz inversa}"] },
                { subtema: "matrices", q: "\\text{Operación elemental válida:}", a: "\\text{Sumar múltiplo de fila a otra}", distractors: ["\\text{Borrar una fila}", "\\text{Cambiar signos aleatorios}", "\\text{Multiplicar filas diferentes}"] },
                { subtema: "matrices", q: "\\text{En Gauss-Jordan, pivote debe ser:}", a: "1", distractors: ["0", "\\text{Cualquier número}", "-1"] },
                { subtema: "matrices", q: "\\text{Sistema con fila } [0 0 | 5]:", a: "\\text{Inconsistente}", distractors: ["\\text{Consistente}", "\\text{Infinitas soluciones}", "x = 5"] },
                { subtema: "matrices", q: "\\text{Sistema con fila } [0 0 | 0]:", a: "\\text{Variable libre posible}", distractors: ["\\text{No tiene solución}", "\\text{Solución única}", "\\text{Error}"] },
                { subtema: "matrices", q: "\\left[\\begin{array}{cc|c} 1 & 0 & 3 \\\\ 0 & 1 & 2 \\end{array}\\right]", a: "x = 3, y = 2", distractors: ["x = 2, y = 3", "x = 0, y = 0", "x = 1, y = 1"] },
                { subtema: "matrices", q: "\\text{Gauss-Jordan: Paso final tiene:}", a: "\\text{Diagonal con 1s}", distractors: ["\\text{Ceros arriba}", "\\text{Números grandes}", "\\text{Determinante}"] },
                { subtema: "matrices", q: "\\left[\\begin{array}{cc|c} 1 & 2 & 5 \\\\ 0 & 1 & 1 \\end{array}\\right] \\rightarrow \\text{Forma reducida:}", a: "\\left[\\begin{array}{cc|c} 1 & 0 & 3 \\\\ 0 & 1 & 1 \\end{array}\\right]", distractors: ["\\left[\\begin{array}{cc|c} 1 & 2 & 5 \\\\ 0 & 1 & 1 \\end{array}\\right]", "\\left[\\begin{array}{cc|c} 0 & 0 & 0 \\\\ 0 & 0 & 0 \\end{array}\\right]", "\\left[\\begin{array}{cc|c} 1 & 1 & 4 \\\\ 0 & 1 & 1 \\end{array}\\right]"] },
                
                // Eliminación Gaussiana - Proceso
                { subtema: "matrices", q: "\\text{En eliminación gaussiana, el objetivo es:}", a: "\\text{Llevar a forma triangular}", distractors: ["\\text{Multiplicar por 0}", "\\text{Invertir matriz}", "\\text{Calcular determinante}"] },
                { subtema: "matrices", q: "\\text{Forma triangular superior:}", a: "\\text{Ceros bajo diagonal}", distractors: ["\\text{Ceros sobre diagonal}", "\\text{Ceros en diagonal}", "\\text{Todos ceros}"] },
                { subtema: "matrices", q: "\\text{Después de Gauss, para hallar } x:", a: "\\text{Sustitución hacia atrás}", distractors: ["\\text{Sustitución hacia adelante}", "\\text{Cramer}", "\\text{Nueva eliminación}"] },
                { subtema: "matrices", q: "\\left[\\begin{array}{cc|c} 2 & 4 & 6 \\\\ 1 & 2 & 3 \\end{array}\\right]", a: "\\text{Infinitas soluciones}", distractors: ["\\text{Solución única}", "\\text{Sin solución}", "x = 1, y = 1"] },
                { subtema: "matrices", q: "\\text{Operación: } F_2 - 2F_1 \\text{ elimina:}", a: "\\text{Coef. de } x \\text{ en } F_2", distractors: ["\\text{Toda la fila 2}", "\\text{Coef. de } y \\text{ en } F_1", "\\text{Términos independientes}"] },
                { subtema: "matrices", q: "\\left[\\begin{array}{cc|c} 1 & 2 & 5 \\\\ 0 & 3 & 6 \\end{array}\\right] \\text{. Solución:}", a: "x = 1, y = 2", distractors: ["x = 2, y = 1", "x = 5, y = 6", "x = 3, y = 2"] },
                
                // Sistemas 3x3 básicos
                { subtema: "matrices", q: "x+y+z=6, x=2, y=1 \\text{. Entonces } z=", a: "3", distractors: ["6", "2", "1"] },
                { subtema: "matrices", q: "\\text{Sistema } 3x3 \\text{ puede tener:}", a: "\\text{0, 1 o infinitas soluciones}", distractors: ["\\text{Solo 1 solución}", "\\text{Siempre 3 soluciones}", "\\text{Solo 2 soluciones}"] },
{ subtema: "ecuaciones_2", q: "x^2 = 4", a: "x = \pm 2", distractors: ["x = 2", "x = 4", "x = -2"] },
{ subtema: "ecuaciones_3", q: "x^3 = 8", a: "x = 2", distractors: ["x = \pm 2", "x = 4", "x = 8"] },
{ subtema: "desigualdades", q: "2x > 4", a: "x > 2", distractors: ["x < 2", "x = 2", "x > 4"] },
                { subtema: "matrices", q: "2x+y+z=8, x=2, z=1 \\text{. Entonces } y=", a: "3", distractors: ["2", "8", "5"] }
];
