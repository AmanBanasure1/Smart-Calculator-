let currentInput = '0';
let calculationLog = [];
let currentMode = 'standard';

const mainScreen = document.getElementById('main-screen');
const historyScreen = document.getElementById('history-screen');
const aiExplanation = document.getElementById('ai-explanation');

// Mode Switcher Logic
function setMode(mode) {
    currentMode = mode;
    document.getElementById('mode-standard').className = mode === 'standard' ? 'flex-1 py-1.5 px-2 rounded-lg bg-blue-600 font-medium transition' : 'flex-1 py-1.5 px-2 rounded-lg hover:bg-slate-700 text-slate-300 font-medium transition';
    document.getElementById('mode-ai').className = mode === 'ai' ? 'flex-1 py-1.5 px-2 rounded-lg bg-blue-600 font-medium transition' : 'flex-1 py-1.5 px-2 rounded-lg hover:bg-slate-700 text-slate-300 font-medium transition';
    document.getElementById('mode-history').className = mode === 'history' ? 'flex-1 py-1.5 px-2 rounded-lg bg-blue-600 font-medium transition' : 'flex-1 py-1.5 px-2 rounded-lg hover:bg-slate-700 text-slate-300 font-medium transition';

    if (mode === 'history') {
        document.getElementById('view-calculator').classList.add('hidden');
        document.getElementById('view-history').classList.remove('hidden');
        renderHistoryLog();
    } else {
        document.getElementById('view-calculator').classList.remove('hidden');
        document.getElementById('view-history').classList.add('hidden');
    }
}

// Calculator Basic Keypad Functions
function appendValue(val) {
    if (currentInput === '0' && val !== '.') {
        currentInput = val;
    } else {
        currentInput += val;
    }
    updateScreen();
}

function clearAll() {
    currentInput = '0';
    historyScreen.textContent = '';
    aiExplanation.classList.add('hidden');
    aiExplanation.textContent = '';
    updateScreen();
}

function updateScreen() {
    mainScreen.textContent = currentInput;
}

// Standard Evaluation & Error Correction
function calculateResult() {
    try {
        let sanitized = currentInput.replace(/×/g, '*').replace(/÷/g, '/');
        // Smart Error Correction: Check trailing operators
        if (/[\+\-\*\/\.]$/.test(sanitized)) {
            sanitized = sanitized.slice(0, -1);
        }
        let result = eval(sanitized);
        if (isNaN(result) || !isFinite(result)) throw new Error("Invalid");

        let logEntry = `${currentInput} = ${result}`;
        addToHistory(logEntry, "Standard calculation");

        historyScreen.textContent = currentInput + ' =';
        currentInput = String(result);
        updateScreen();
        aiExplanation.classList.add('hidden');
    } catch (error) {
        mainScreen.textContent = 'Syntax Error';
        aiExplanation.textContent = '💡 AI Suggestion: Check brackets or missing numbers.';
        aiExplanation.classList.remove('hidden');
        currentInput = '0';
    }
}

// AI Natural Language & Word Problem Parser
function handleAIQuery() {
    const query = document.getElementById('ai-input').value.trim();
    if (!query) return;

    mainScreen.textContent = 'Thinking...';
    aiExplanation.classList.add('hidden');

    setTimeout(() => {
        let result = processNaturalLanguage(query);
        if (result) {
            historyScreen.textContent = query;
            mainScreen.textContent = result.answer;
            aiExplanation.textContent = `✨ AI Solver: ${result.explanation}`;
            aiExplanation.classList.remove('hidden');
            addToHistory(`${query} ➔ ${result.answer}`, result.explanation);
            currentInput = String(result.rawAnswer || result.answer);
        } else {
            mainScreen.textContent = 'Error';
            aiExplanation.textContent = '💡 Try queries like: "450 + 18% GST" or "split 1200 among 4".';
            aiExplanation.classList.remove('hidden');
        }
    }, 600);
}

// Client-side Rule-based AI Engine for Smart Queries
function processNaturalLanguage(text) {
    let lower = text.toLowerCase();

    // 1. Percentage / GST calculation (e.g., "450 + 18% GST" or "1000 ka 15% kitna")
    if (lower.includes('gst') || lower.includes('%')) {
        let numbers = text.match(/[\d\.]+/g);
        if (numbers && numbers.length >= 2) {
            let base = parseFloat(numbers[0]);
            let pct = parseFloat(numbers[1]);
            let val = base + (base * pct) / 100;
            return {
                answer: val.toFixed(2),
                rawAnswer: val,
                explanation: `Added ${pct}% tax/percentage to ${base}.`
            };
        }
    }

    // 2. Bill Split calculation (e.g., "split 1200 among 4" or "1500 ko 3 logo mein bato")
    if (lower.includes('split') || lower.includes('bato') || lower.includes('among')) {
        let numbers = text.match(/[\d\.]+/g);
        if (numbers && numbers.length >= 2) {
            let total = parseFloat(numbers[0]);
            let persons = parseFloat(numbers[1]);
            if (persons > 0) {
                let perPerson = total / persons;
                return {
                    answer: perPerson.toFixed(2),
                    rawAnswer: perPerson,
                    explanation: `Total ${total} split equally among ${persons} people.`
                };
            }
        }
    }

    // 3. Simple Unit Converter (e.g., "5 meter to feet" -> 1 meter = 3.28084 feet)
    if (lower.includes('meter') && (lower.includes('feet') || lower.includes('foot'))) {
        let numbers = text.match(/[\d\.]+/g);
        if (numbers && numbers.length >= 1) {
            let meters = parseFloat(numbers[0]);
            let feet = meters * 3.28084;
            return {
                answer: feet.toFixed(2) + ' ft',
                rawAnswer: feet,
                explanation: `${meters} meters converted to feet.`
            };
        }
    }

    // Fallback safe eval if it looks like a math expression
    try {
        let cleanExpr = text.replace(/[a-zA-Z]/g, '').trim();
        if (cleanExpr.length > 0) {
            let res = eval(cleanExpr);
            return {
                answer: res,
                rawAnswer: res,
                explanation: `Direct evaluated expression.`
            };
        }
    } catch (e) {}

    return null;
}

// History & Insights Logger
function addToHistory(expression, context) {
    calculationLog.unshift({ expression, context, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    if (calculationLog.length > 20) calculationLog.pop();
}

function renderHistoryLog() {
    const container = document.getElementById('history-log-container');
    if (calculationLog.length === 0) {
        container.innerHTML = `<p class="text-slate-500 text-center py-10">No calculations recorded yet.</p>`;
        return;
    }
    container.innerHTML = calculationLog.map(item => `
        <div class="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            <div class="flex justify-between text-xs font-mono text-green-400 font-bold">
                <span>${item.expression}</span>
                <span class="text-[10px] text-slate-500">${item.time}</span>
            </div>
            <div class="text-[11px] text-slate-400 mt-0.5">${item.context}</div>
        </div>
    `).join('');
}

function clearHistoryLog() {
    calculationLog = [];
    renderHistoryLog();
}

// Optional Web Speech API Voice Integration stub
function toggleVoice() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech recognition is not supported on this browser/device.');
        return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    
    document.getElementById('mic-status').textContent = 'Listening... 🔴';
    recognition.onresult = function(event) {
        const speechToText = event.results[0][0].transcript;
        document.getElementById('ai-input').value = speechToText;
        document.getElementById('mic-status').textContent = '🎙️ Voice';
        handleAIQuery();
    };
    recognition.onerror = function() {
        document.getElementById('mic-status').textContent = '🎙️ Voice';
    };
    recognition.start();
}
