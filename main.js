document.addEventListener('DOMContentLoaded', function () {
    console.log('Calculator script loaded successfully');

    const display = document.getElementById('display');
    const history = document.getElementById('history');
    const angleModeToggle = document.getElementById('angle-mode');
    const collapseBtn = document.getElementById('collapse-btn');
    const invBtn = document.getElementById('inv-btn');
    const advancedFunctions = document.getElementById('advanced-functions');
    const trigNormal = document.querySelectorAll('.trig-normal');
    const trigInverse = document.querySelectorAll('.trig-inverse');

    let angleMode = 'deg';
    let isInvActive = false;

    /* ------------------------------
       Math.js Configuration
    ------------------------------ */
    math.config({
        number: 'number',
        precision: 14
    });

    /* ------------------------------
       Custom Math Functions
    ------------------------------ */
    math.import({
        factorial: function (n) {
            if (n < 0) return NaN;
            if (!Number.isInteger(n)) return math.gamma(n + 1);
            if (n === 0 || n === 1) return 1;

            let result = 1;
            for (let i = 2; i <= n; i++) {
                result *= i;
                if (!isFinite(result)) break;
            }
            return result;
        },

        nthRoot: function (x, n) {
            if (n === 0) return NaN;
            if (n % 2 === 0 && x < 0) return NaN;
            return Math.sign(x) * Math.pow(Math.abs(x), 1 / n);
        }
    }, { override: true });

    /* ------------------------------
       Angle Mode Toggle
    ------------------------------ */
    angleModeToggle.addEventListener('change', function () {
        angleMode = this.checked ? 'rad' : 'deg';
    });

    /* ------------------------------
       Collapse Advanced Functions
    ------------------------------ */
    collapseBtn.addEventListener('click', function () {
        advancedFunctions.classList.toggle('collapsed');
        this.classList.toggle('active');
    });

    /* ------------------------------
       INV Button Toggle
    ------------------------------ */
    invBtn.addEventListener('click', function () {
        isInvActive = !isInvActive;
        this.classList.toggle('active');

        trigNormal.forEach(btn => {
            btn.style.display = isInvActive ? 'none' : 'block';
        });

        trigInverse.forEach(btn => {
            btn.style.display = isInvActive ? 'block' : 'none';
        });
    });

    /* ------------------------------
       Button Click Handling
    ------------------------------ */
    document.addEventListener('click', function (event) {
        const target = event.target;

        if (target.classList.contains('btn')) {
            const action = target.dataset.action;
            const op = target.dataset.op;

            if (action) {
                handleAction(action);
            } else if (op) {
                appendToDisplay(op);
            }
        }
    });

    /* ------------------------------
       Keyboard Support
    ------------------------------ */
    document.addEventListener('keydown', function (event) {
        const key = event.key;

        if (/^[0-9.]$/.test(key)) {
            appendToDisplay(key);
        } else if (key === 'Enter') {
            calculate();
        } else if (key === 'Backspace') {
            handleBackspace();
        } else if (key === 'Escape') {
            clearDisplay();
        } else if (['+', '-', '*', '/', '(', ')', '^', '%'].includes(key)) {
            appendToDisplay(key);
        }
    });

    /* ------------------------------
       Action Handlers
    ------------------------------ */
    function handleAction(action) {
        switch (action) {
            case 'clear':
                clearDisplay();
                break;
            case 'backspace':
                handleBackspace();
                break;
            case 'calculate':
                calculate();
                break;
        }
    }

    function clearDisplay() {
        display.value = '';
        history.textContent = '';
    }

    function handleBackspace() {
        display.value = display.value.slice(0, -1);
    }

    /* ------------------------------
       Add Input to Display
    ------------------------------ */
    function appendToDisplay(value) {
        switch (value) {
            case 'pi':
                display.value += 'π';
                break;
            case '^':
                display.value += '^';
                break;
            case 'nthRoot(':
                display.value += 'nthRoot(';
                break;
            case '^2':
                display.value += '^2';
                break;
            case '10^':
                display.value += '10^';
                break;
            default:
                display.value += value;
        }
    }

    /* ------------------------------
       Calculation Logic
    ------------------------------ */
    function calculate() {
        if (!display.value) return;

        try {
            const expression = display.value;
            let processedExpression = preprocessExpression(expression);
            const result = evaluate(processedExpression);

            history.textContent = formatExpression(expression);
            display.value = formatResult(result);

        } catch (error) {
            display.value = 'Error';
            setTimeout(() => {
                if (display.value === 'Error') display.value = '';
            }, 1500);
        }
    }

    /* ------------------------------
       Expression Processing
    ------------------------------ */
    function preprocessExpression(expression) {
        let processed = expression
            .replace(/π/g, 'pi')
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/(\d+)\s*\^\s*(\d+)/g, '$1^$2')
            .replace(/10\^/g, '10^')
            .replace(/e\^/g, 'e^');

        if (angleMode === 'deg') {
            processed = convertDegreesToRadians(processed);
        }

        processed = processed.replace(/(\d+(?:\.\d+)?)\s*%/g, (_, number) => {
            return `(${number}/100)`;
        });

        return processed;
    }

    /* ------------------------------
       Degree → Radian Conversion
    ------------------------------ */
    function convertDegreesToRadians(expression) {
        return expression
            .replace(/sin\(([^)]+)\)/g, 'sin(($1) * pi/180)')
            .replace(/cos\(([^)]+)\)/g, 'cos(($1) * pi/180)')
            .replace(/tan\(([^)]+)\)/g, 'tan(($1) * pi/180)')
            .replace(/asin\(([^)]+)\)/g, 'asin($1) * 180/pi')
            .replace(/acos\(([^)]+)\)/g, 'acos($1) * 180/pi')
            .replace(/atan\(([^)]+)\)/g, 'atan($1) * 180/pi');
    }

    /* ------------------------------
       Safe Evaluation
    ------------------------------ */
    function evaluate(expression) {
        validateInverseTrigFunctions(expression);
        return math.evaluate(expression);
    }

    /* ------------------------------
       Domain Validation for asin/acos
    ------------------------------ */
    function validateInverseTrigFunctions(expression) {
        const asinPattern = /asin\s*\(\s*([^)]+)\s*\)/g;
        const acosPattern = /acos\s*\(\s*([^)]+)\s*\)/g;

        let match;

        while ((match = asinPattern.exec(expression)) !== null) {
            const arg = math.evaluate(match[1]);
            if (Math.abs(arg) > 1) {
                throw new Error('Domain error: sin⁻¹ input must be between -1 and 1');
            }
        }

        while ((match = acosPattern.exec(expression)) !== null) {
            const arg = math.evaluate(match[1]);
            if (Math.abs(arg) > 1) {
                throw new Error('Domain error: cos⁻¹ input must be between -1 and 1');
            }
        }
    }

    /* ------------------------------
       Format Expression for History
    ------------------------------ */
    function formatExpression(expression) {
        return expression
            .replace(/\*/g, '×')
            .replace(/\//g, '÷');
    }

    /* ------------------------------
       Format Result for Display
    ------------------------------ */
    function formatResult(result) {
        if (typeof result !== 'number') return result.toString();
        if (!isFinite(result)) return result.toString();

        if (Math.abs(result) > 1e10 || (Math.abs(result) < 1e-10 && result !== 0)) {
            return result.toExponential(6);
        }

        const rounded = parseFloat(result.toFixed(10));
        if (Number.isInteger(rounded)) return rounded.toString();

        return rounded.toString()
            .replace(/(\.\d*?)0+$/, '$1')
            .replace(/\.$/, '');
    }
});
