let currentInput = '0';
let calculationLog = [];
let currentMode = 'standard';

const mainScreen = document.getElementById('main-screen');
const historyScreen = document.getElementById('history-screen');
const aiExplanation = document.getElementById('ai-explanation');

// Toggle Settings Modal
function toggleSettings() {
    const box = document.getElementById('api-settings-box');
    box.classList.toggle('hidden');
    const savedKey = localStorage.getItem('groq_api_key') || '';
    document.getElementById('api-key-input').value = savedKey;
}

function saveApiKey() {
    const key = document.getElementById('api-key-input').value.trim();
    if (!key) {
        alert('Please enter a valid API key.');
        return;
    }
    localStorage.setItem('groq_api_key', key);
    alert('API Key saved successfully!');
    toggleSettings();
}

// Mode Switcher Logic
function setMode(mode) {
    currentMode = mode;
    document.getElementById('mode-standard').className = mode === 'standard' ? 'flex-1 py-1 px-2 rounded-md bg-blue-600 font-medium transition' : 'flex-1 py-1 px-2 rounded-md hover:bg-slate-700 text-slate-300 font-medium transition';
    document.getElementById('mode-ai').className = mode === 'ai' ? 'flex-1 py-1 px-2 rounded-md bg-blue-600 font-medium transition' : 'flex-1 py-1 px-2 rounded-md hover:bg-slate-700 text-slate-300 font-medium transition';
    document.getElementById('mode-history').className = mode === 'history' ? 'flex-1 py-1 px-2 rounded-md bg-blue-600 font-medium transition' : 'flex-1 py-1 px-2 rounded-md hover:bg-slate-700 text-slate-300 font-medium transition';

    if (mode === 'history') {
        document.getElementById('view-calculator').classList.add('hidden');
        document.getElementById('view-history').classList.remove('hidden');
        renderHistoryLog();
    } else {
        document.getElementById('view-calculator').classList.remove('hidden');
        document.getElementById('view-history').classList.add('hidden');
    }
}

// Basic Calculator Keypad Functions
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

// Standard Evaluation
function calculateResult() {
    try {
        let sanitized = currentInput.replace(/×/g, '*').replace(/÷/g, '/');
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
        currentInput = '0';
    }
}

// REAL GEMINI API INTEGRATION
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            })


    const apiKey = localStorage.getItem('groq_api_key');
    if (!apiKey) {
        alert('Please click on "⚙️ API Key" at the top right and enter your Groq API key first!');
        toggleSettings();
        return;
    }

    mainScreen.textContent = 'Thinking...';
    aiExplanation.classList.add('hidden');

    try {
        const prompt = `You are a smart calculator assistant. Solve this problem/query: "${query}". 
        Return your response strictly in this JSON format without markdown ticks if possible, or plain text:
        {"answer": "final concise value or result", "explanation": "short step-by-step reasoning"}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message);
        }

        const rawText = data.candidates[0].content.parts[0].text;
        
        // Clean up markdown code blocks if Gemini returns them
        const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        let parsed = JSON.parse(cleanedJson);

        historyScreen.textContent = query;
        mainScreen.textContent = parsed.answer;
        aiExplanation.textContent = `✨ Gemini AI: ${parsed.explanation}`;
        aiExplanation.classList.remove('hidden');

        addToHistory(`${query} ➔ ${parsed.answer}`, parsed.explanation);
        currentInput = String(parsed.answer);

    } catch (error) {
        mainScreen.textContent = 'Error';
        aiExplanation.textContent = `💡 Error: ${error.message || 'Check your API key or internet connection.'}`;
        aiExplanation.classList.remove('hidden');
    }
}

// History Logger
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

// Voice Integration
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
