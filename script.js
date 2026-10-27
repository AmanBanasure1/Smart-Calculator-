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

// AI Natural Language & Advanced Smart Utility Parser
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
            aiExplanation.textContent = `✨ Smart Solver: ${result.explanation}`;
            aiExplanation.classList.remove('hidden');
            addToHistory(`${query} ➔ ${result.answer}`, result.explanation);
            currentInput = String(result.rawAnswer !== undefined ? result.rawAnswer : result.answer);
        } else {
            mainScreen.textContent = 'Error';
            aiExplanation.textContent = '💡 Try: "GST", "compound interest on 20000 at 6% for 3 years", "bmi for 70 kg 175 cm", etc.';
            aiExplanation.classList.remove('hidden');
        }
    }, 400);
}

// Comprehensive Client-side Smart Rule Engine
function processNaturalLanguage(text) {
    let lower = text.toLowerCase();
    let numbers = text.match(/[\d\.]+/g);
    let nums = numbers ? numbers.map(Number) : [];

    // 1. GST / Tax Calculation (e.g., "450 + 18% gst")
    if ((lower.includes('gst') || lower.includes('%')) && !lower.includes('discount') && !lower.includes('off') && !lower.includes('tip') && !lower.includes('interest')) {
        if (nums.length >= 2) {
            let base = nums[0];
            let pct = nums[1];
            let val = base + (base * pct) / 100;
            return {
                answer: val.toFixed(2),
                rawAnswer: val,
                explanation: `Added ${pct}% tax/GST to base price ₹${base}.`
            };
        }
    }

    // 2. Discount & Sale Price (e.g., "1200 with 30% discount")
    if (lower.includes('discount') || lower.includes('off')) {
        if (nums.length >= 2) {
            let price = nums[0];
            let discPct = nums[1];
            let discountAmount = (price * discPct) / 100;
            let finalPrice = price - discountAmount;
            return {
                answer: `₹${finalPrice.toFixed(2)}`,
                rawAnswer: finalPrice,
                explanation: `Original: ₹${price}, Discount: ₹${discountAmount.toFixed(2)} (${discPct}% off).`
            };
        }
    }

    // 3. Profit & Loss Solver (e.g., "buys 20 kg at 40 and sells at 50")
    if (lower.includes('buys') && lower.includes('sells')) {
        if (nums.length >= 3) {
            let quantity = nums[0];
            let cpPerKg = nums[1];
            let spPerKg = nums[2];
            let totalCp = quantity * cpPerKg;
            let totalSp = quantity * spPerKg;
            let profitOrLoss = totalSp - totalCp;
            let pct = (Math.abs(profitOrLoss) / totalCp) * 100;
            let status = profitOrLoss >= 0 ? "Profit" : "Loss";
            return {
                answer: `₹${Math.abs(profitOrLoss)} (${status} ${pct.toFixed(1)}%)`,
                rawAnswer: profitOrLoss,
                explanation: `Total CP: ₹${totalCp}, Total SP: ₹${totalSp}. ${status} of ₹${Math.abs(profitOrLoss)} (${pct.toFixed(1)}%).`
            };
        }
    }

    // 4. Bill / Expense Split (e.g., "split 1200 among 4")
    if (lower.includes('split') || lower.includes('bato') || lower.includes('among')) {
        if (nums.length >= 2) {
            let total = nums[0];
            let persons = nums[1];
            if (persons > 0) {
                let perPerson = total / persons;
                return {
                    answer: `₹${perPerson.toFixed(2)} /person`,
                    rawAnswer: perPerson,
                    explanation: `Total ₹${total} split equally among ${persons} people.`
                };
            }
        }
    }

    // 5. Simple Interest (e.g., "interest on 10000 at 5% for 2 years")
    if ((lower.includes('interest') || lower.includes('si') || lower.includes('byaj')) && !lower.includes('compound') && !lower.includes('ci')) {
        if (nums.length >= 3) {
            let principal = nums[0];
            let rate = nums[1];
            let time = nums[2];
            let interest = (principal * rate * time) / 100;
            let totalAmount = principal + interest;
            return {
                answer: `₹${interest.toFixed(2)} (Total: ₹${totalAmount.toFixed(2)})`,
                rawAnswer: interest,
                explanation: `Simple Interest for ${time} yrs @ ${rate}% is ₹${interest.totalAmount} payable.`
            };
        }
    }

    // 6. Compound Interest (e.g., "compound interest on 20000 at 6% for 3 years")
    if (lower.includes('compound') || lower.includes('ci')) {
        if (nums.length >= 3) {
            let p = nums[0];
            let r = nums[1];
            let t = nums[2];
            let amount = p * Math.pow((1 + r / 100), t);
            let ci = amount - p;
            return {
                answer: `₹${ci.toFixed(2)} (Total: ₹${amount.toFixed(2)})`,
                rawAnswer: ci,
                explanation: `Compound Interest on ₹${p} @ ${r}% for ${t} yrs is ₹${ci.toFixed(2)}. Total Amount: ₹${amount.toFixed(2)}.`
            };
        }
    }

    // 7. Loan EMI Estimation (e.g., "emi for 500000 at 9% for 5 years")
    if (lower.includes('emi') || lower.includes('loan')) {
        if (nums.length >= 3) {
            let principal = nums[0];
            let annualRate = nums[1];
            let years = nums[2];
            let monthlyRate = annualRate / (12 * 100);
            let months = years * 12;
            let emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
            let totalPayment = emi * months;
            return {
                answer: `₹${emi.toFixed(2)} /month`,
                rawAnswer: emi,
                explanation: `Monthly EMI for ₹${principal} @ ${annualRate}% for ${years} yrs. Total Payment: ₹${totalPayment.toFixed(2)}.`
            };
        }
    }

    // 8. Speed, Distance & Time (e.g., "speed for 150 km in 3 hours")
    if (lower.includes('speed') || (lower.includes('km') && lower.includes('hour'))) {
        if (nums.length >= 2) {
            let distance = nums[0];
            let time = nums[1];
            if (time > 0) {
                let speed = distance / time;
                return {
                    answer: `${speed.toFixed(2)} km/h`,
                    rawAnswer: speed,
                    explanation: `Covering ${distance} km in ${time} hours gives an average speed of ${speed.toFixed(2)} km/h.`
                };
            }
        }
    }

    // 9. Fuel Cost / Mileage (e.g., "fuel cost for 450 km at 15 km/l with 100 per litre")
    if (lower.includes('fuel') || lower.includes('petrol') || lower.includes('mileage')) {
        if (nums.length >= 3) {
            let distance = nums[0];
            let mileage = nums[1];
            let pricePerLitre = nums[2];
            let litresNeeded = distance / mileage;
            let totalCost = litresNeeded * pricePerLitre;
            return {
                answer: `₹${totalCost.toFixed(2)} (${litresNeeded.toFixed(1)} L)`,
                rawAnswer: totalCost,
                explanation: `For ${distance} km with ${mileage} km/l mileage and ₹${pricePerLitre}/L cost, total fuel required is ${litresNeeded.toFixed(1)}L costing ₹${totalCost.toFixed(2)}.`
            };
        }
    }

    // 10. Tip Calculator (e.g., "tip 10% on 1500")
    if (lower.includes('tip')) {
        if (nums.length >= 2) {
            let bill = nums[0];
            let tipPct = nums[1];
            let tipAmount = (bill * tipPct) / 100;
            let totalBill = bill + tipAmount;
            return {
                answer: `₹${totalBill.toFixed(2)} (Tip: ₹${tipAmount.toFixed(2)})`,
                rawAnswer: totalBill,
                explanation: `Bill: ₹${bill} + Tip (${tipPct}%): ₹${tipAmount.toFixed(2)} = Total ₹${totalBill.toFixed(2)}.`
            };
        }
    }

    // 11. BMI Calculator (e.g., "bmi for 70 kg 175 cm")
    if (lower.includes('bmi')) {
        if (nums.length >= 2) {
            let weight = nums[0];
            let heightCm = nums[1];
            let heightM = heightCm > 3 ? heightCm / 100 : heightCm; // Handle meters or cm
            let bmi = weight / (heightM * heightM);
            let category = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal weight" : bmi < 30 ? "Overweight" : "Obese";
            return {
                answer: `${bmi.toFixed(1)} (${category})`,
                rawAnswer: bmi,
                explanation: `Weight: ${weight}kg, Height: ${heightM}m. BMI is ${bmi.toFixed(1)} (${category}).`
            };
        }
    }

    // 12. Unit Converter (e.g., "5 meter to feet")
    if (lower.includes('meter') && (lower.includes('feet') || lower.includes('foot'))) {
        if (nums.length >= 1) {
            let meters = nums[0];
            let feet = meters * 3.28084;
            return {
                answer: `${feet.toFixed(2)} ft`,
                rawAnswer: feet,
                explanation: `${meters} meters converted to feet.`
            };
        }
    }

    // Fallback safe direct math eval
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

// Optional Web Speech API Voice Integration
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
