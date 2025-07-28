// Variables de estado
let energy = 100;
let foodConsumed = 0;
let currentMood = 'happy';
const foods = ['🍎', '🍕', '🍔', '🍟', '🍦', '🍩', '🍪', '🍜', '🍗', '🍉', '', '🥪'];
let isNightMode = false;
let isSleeping = false;
let sleepInterval;
let selectedFood = null;
let isDraggingFood = false;
let currentGame = null;
let secretNumber = 0;
let rpsOptions = ['✊', '✋', '✌️'];
let currentUtterance = null;
let isSpeaking = false;
let currentAnswer = '';
let recognition;
let isListening = false;
let mainColor = '#0ff';
let eyesColor = '#0ff';
let mouthColor = '#ff0000';

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initVoiceRecognition();
    initCustomization();
    updateStats();
    changeExpression('happy');
    checkNightMode();
    setInterval(checkNightMode, 60000);
    
    // Configurar eventos de teclas
    document.querySelectorAll('.controls button').forEach(button => {
        button.addEventListener('mousedown', function() {
            this.classList.add('active');
        });
        
        button.addEventListener('mouseup', function() {
            this.classList.remove('active');
        });
        
        button.addEventListener('mouseleave', function() {
            this.classList.remove('active');
        });
    });
});

// Inicializar partículas
function initParticles() {
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#0ff" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: "#0ff", opacity: 0.4, width: 1 },
            move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out" }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "repulse" },
                onclick: { enable: true, mode: "push" }
            }
        }
    });
}

// Modo nocturno automático
function checkNightMode() {
    const hour = new Date().getHours();
    isNightMode = hour > 18 || hour < 6;
    document.body.style.backgroundColor = isNightMode ? '#0a0a20' : '#000';
}

// Seguimiento del cursor para los ojos
document.addEventListener('mousemove', (e) => {
    if (isDraggingFood) {
        const foodCursor = document.getElementById('foodCursor');
        foodCursor.style.left = e.clientX + 'px';
        foodCursor.style.top = e.clientY + 'px';
        
        const mouth = document.getElementById('mouth');
        const mouthRect = mouth.getBoundingClientRect();
        
        if (e.clientX > mouthRect.left && e.clientX < mouthRect.right &&
            e.clientY > mouthRect.top && e.clientY < mouthRect.bottom) {
            feedPet(selectedFood);
            stopFoodDrag();
            return;
        }
    }
    
    if (isSleeping) return;
    
    const leftPupil = document.getElementById('leftPupil');
    const rightPupil = document.getElementById('rightPupil');
    const eyes = document.querySelectorAll('.eye');
    const screen = document.querySelector('.bmo-screen');
    const screenRect = screen.getBoundingClientRect();

    eyes.forEach((eye, index) => {
        const rect = eye.getBoundingClientRect();
        const eyeX = screenRect.left + (screenRect.width / 2) + (index === 0 ? -50 : 50);
        const eyeY = screenRect.top + (screenRect.height / 2) - 30;
        const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
        const distance = window.innerWidth < 768 ? 10 : 15;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        if (index === 0) {
            leftPupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)`;
        } else {
            rightPupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)`;
        }
    });
});

// Cambiar expresión del robot
function changeExpression(emotion) {
    const mouth = document.getElementById('mouth');
    mouth.className = 'mouth ' + emotion;
    currentMood = emotion;
    document.getElementById('mood-status').textContent = 
        emotion === 'happy' ? 'Feliz' :
        emotion === 'angry' ? 'Enojado' :
        emotion === 'sleep' ? 'Dormido' : 'Sorprendido';

    // Cambiar fondo según emoción (nueva parte)
    document.body.classList.remove('happy-bg', 'angry-bg', 'sleep-bg', 'surprised-bg');
    if (emotion === 'happy') document.body.classList.add('happy-bg');
    else if (emotion === 'angry') document.body.classList.add('angry-bg');
    else if (emotion === 'sleep') document.body.classList.add('sleep-bg');
    else if (emotion === 'surprised') document.body.classList.add('surprised-bg');

    // Comportamiento original de los ojos
    if (emotion === 'sleep') {
        startSleeping();
    } else {
        stopSleeping();
    }
}

// Emociones aleatorias
setInterval(() => {
    if (isSleeping) return;
    
    if (Math.random() > 0.7) {
        const emotions = ['happy', 'angry', 'sleep', 'surprised'];
        const newEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        changeExpression(newEmotion);
    }
}, 30000);

// Ventana de comida
function showFoodWindow() {
    if (isSleeping) return;
    
    const foodGrid = document.getElementById('foodGrid');
    foodGrid.innerHTML = '';
    
    foods.forEach(food => {
        const foodItem = document.createElement('div');
        foodItem.className = 'food-item';
        foodItem.textContent = food;
        
        foodItem.onclick = () => {
            selectedFood = food;
            closeFoodWindow();
            startFoodDrag(food);
        };
        
        foodGrid.appendChild(foodItem);
    });
    
    document.getElementById('foodWindow').style.display = 'block';
}

function closeFoodWindow() {
    document.getElementById('foodWindow').style.display = 'none';
}

function startFoodDrag(food) {
    isDraggingFood = true;
    const foodCursor = document.getElementById('foodCursor');
    foodCursor.textContent = food;
    foodCursor.style.display = 'block';
    document.body.style.cursor = 'none';
}

function stopFoodDrag() {
    isDraggingFood = false;
    selectedFood = null;
    document.getElementById('foodCursor').style.display = 'none';
    document.body.style.cursor = '';
}

// Alimentar al robot
function feedPet(food) {
    const mouth = document.getElementById('mouth');
    mouth.classList.add('eating');
    
    energy = Math.min(100, energy + 15);
    foodConsumed++;
    updateStats();
    
    if (currentMood === 'angry' && Math.random() > 0.5) {
        changeExpression('happy');
    }
    
    setTimeout(() => {
        mouth.classList.remove('eating');
    }, 1000);
}

// Funciones de sueño
function startSleeping() {
    if (isSleeping) return;
    
    isSleeping = true;
    const leftEye = document.getElementById('leftEye');
    const rightEye = document.getElementById('rightEye');
    
    leftEye.classList.add('sleep');
    rightEye.classList.add('sleep');
    
    sleepInterval = setInterval(() => {
        energy = Math.min(100, energy + 2);
        updateStats();
    }, 2000);
}

function stopSleeping() {
    if (!isSleeping) return;
    
    isSleeping = false;
    const leftEye = document.getElementById('leftEye');
    const rightEye = document.getElementById('rightEye');
    
    leftEye.classList.remove('sleep');
    rightEye.classList.remove('sleep');
    
    clearInterval(sleepInterval);
}

// Actualizar estadísticas
function updateStats() {
    document.getElementById('energy-level').textContent = energy + '%';
    document.getElementById('energy-bar').style.width = energy + '%';
    document.getElementById('food-count').textContent = foodConsumed;
    
    document.getElementById('energy-bar').style.background = 
        energy > 70 ? '#0ff' : energy > 30 ? '#ff0' : '#f00';
}

// Consumo de energía
setInterval(() => {
    if (isSleeping) return;
    
    energy = Math.max(0, energy - 1);
    updateStats();
    
    if (energy < 30 && currentMood !== 'angry' && Math.random() > 0.8) {
        changeExpression('angry');
    }
}, 5000);

// Tomar selfie
function takeSelfie() {
    html2canvas(document.querySelector('.cyber-container')).then(canvas => {
        const link = document.createElement('a');
        link.download = 'cyberpet-selfie-' + new Date().toISOString().slice(0, 10) + '.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

// Cancelar arrastre al hacer click
document.addEventListener('click', (e) => {
    if (isDraggingFood && e.target.className !== 'food-item') {
        stopFoodDrag();
    }
});

// Personalización de colores
function initCustomization() {
    loadColors();
    updateAllColors();
    
    document.getElementById('customBtn').addEventListener('click', () => {
        document.getElementById('customPanel').style.display = 'block';
    });
    
    document.getElementById('closePanel').addEventListener('click', () => {
        document.getElementById('customPanel').style.display = 'none';
    });
}

function loadColors() {
    if (localStorage.getItem('cyberPetMainColor')) {
        mainColor = localStorage.getItem('cyberPetMainColor');
    }
    if (localStorage.getItem('cyberPetEyesColor')) {
        eyesColor = localStorage.getItem('cyberPetEyesColor');
    }
    if (localStorage.getItem('cyberPetMouthColor')) {
        mouthColor = localStorage.getItem('cyberPetMouthColor');
    }
}

function changeMainColor(color) {
    mainColor = color;
    localStorage.setItem('cyberPetMainColor', color);
    updateMainColor();
}

function resetMainColor() {
    changeMainColor('#0ff');
}

function changeEyesColor(color) {
    eyesColor = color;
    localStorage.setItem('cyberPetEyesColor', color);
    updateEyesColor();
}

function resetEyesColor() {
    changeEyesColor('#0ff');
}

function changeMouthColor(color) {
    mouthColor = color;
    localStorage.setItem('cyberPetMouthColor', color);
    updateMouthColor();
}

function resetMouthColor() {
    changeMouthColor('#ff0000');
}

function updateAllColors() {
    updateMainColor();
    updateEyesColor();
    updateMouthColor();
}

function updateMainColor() {
    document.documentElement.style.setProperty('--main-color', mainColor);
    
    const elementsToUpdate = document.querySelectorAll(
        'button, .stats-panel, .food-window, .search-panel, .custom-panel'
    );
    
    elementsToUpdate.forEach(element => {
        element.style.borderColor = mainColor;
        if (element.tagName === 'BUTTON') {
            element.style.color = mainColor;
        }
        if (element.classList.contains('custom-panel')) {
            element.style.boxShadow = `0 0 15px ${mainColor}`;
        }
    });
}

function updateEyesColor() {
    const eyes = document.querySelectorAll('.eye');
    eyes.forEach(eye => {
        eye.style.background = eyesColor;
        eye.style.boxShadow = `0 0 20px ${eyesColor}`;
    });
}

function updateMouthColor() {
    const mouth = document.getElementById('mouth');
    if (mouth) {
        mouth.style.background = mouthColor;
        mouth.style.boxShadow = `0 0 15px ${mouthColor}`;
    }
}

// Funcionalidad del buscador
function toggleSearchPanel() {
    const searchPanel = document.getElementById('searchPanel');
    if (searchPanel.style.display === 'flex') {
        closeSearchPanel();
    } else {
        openSearchPanel();
    }
}

function openSearchPanel() {
    document.getElementById('searchPanel').style.display = 'flex';
    document.getElementById('userInput').focus();
}

function closeSearchPanel() {
    document.getElementById('searchPanel').style.display = 'none';
    stopSpeaking();
}

document.getElementById('searchBtn').addEventListener('click', toggleSearchPanel);
document.getElementById('searchClose').addEventListener('click', closeSearchPanel);
document.getElementById('userInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendQuestion();
});

function sendQuestion() {
    const question = document.getElementById('userInput').value.trim();
    if (!question) return;
    
    addMessage(question, 'user');
    document.getElementById('userInput').value = '';
    showTypingIndicator();
    searchWeb(question);
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    document.getElementById('chatContainer').appendChild(typingDiv);
    document.getElementById('chatContainer').scrollTop = document.getElementById('chatContainer').scrollHeight;
}

async function searchWeb(query) {
    const predefinedResponse = getPredefinedResponse(query);
    if (predefinedResponse) {
        currentAnswer = predefinedResponse;
        addMessage(currentAnswer, 'bot');
        document.getElementById('playBtn').disabled = false;
        return;
    }
    
    addMessage(`Buscando información sobre "${query}"...`, 'bot');
    
    try {
        const summary = await getWikipediaSummary(query);
        
        if (summary) {
            currentAnswer = formatAnswer(query, summary);
            addMessage(currentAnswer, 'bot');
            
            const link = document.createElement('a');
            link.href = `https://es.wikipedia.org/wiki/${encodeURIComponent(query.replace(/ /g, '_'))}`;
            link.className = 'result-link';
            link.textContent = '📖 Leer artículo completo';
            link.target = '_blank';
            document.querySelector('.bot-message:last-child').appendChild(link);
        } else {
            await searchWikipedia(query);
        }
        
        document.getElementById('playBtn').disabled = false;
        
    } catch (error) {
        console.error("Error:", error);
        addMessage("Vaya, no pude encontrar una respuesta buena. ¿Puedes preguntarlo de otra forma?", 'bot');
    }
}

function getPredefinedResponse(question) {
    const lowerQuestion = question.toLowerCase().trim();
    const now = new Date();
    
    // Respuestas de hora/fecha
    if (lowerQuestion.includes("hora")) {
        return `Son las ${now.toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric' })}. ⏰`;
    }
    if (lowerQuestion.includes("día es") || lowerQuestion.includes("fecha")) {
        return `Hoy es ${now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}. 📅`;
    }
    if (lowerQuestion.includes("dia es") || lowerQuestion.includes("fecha")) {
        return `Hoy es ${now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}. 📅`;
    }
    if (lowerQuestion.includes("año")) {
        return `Estamos en el año ${now.getFullYear()}.`;
    }
    
    const responses = {
        "hola": "¡Hola! Soy CyberPet, tu mascota virtual. ¿En qué puedo ayudarte hoy?",
        "ola": "¡Hola! (Por cierto, se escribe 'hola' 😉) ¿Qué necesitas?",
        "holi": "¡Holi! 😊 ¿Cómo estás?",
        "hey": "¡Hey! ¿Qué tal?",
        "hi": "¡Hi! Pero hablemos en español, ¿sí? 😄",
        "buenas": "¡Buenas! ¿Qué tal tu día?",
        "cómo estás": `¡Estoy genial! Mi energía está al ${energy}%`,
        "como estas": `¡Estoy genial! Mi energía está al ${energy}%`,
        "como estás": `¡Estoy genial! Mi energía está al ${energy}%`,
        "cómo estas": `¡Estoy genial! Mi energía está al ${energy}%`,
        "q tal": `¡Todo bien! Energía al ${energy}% ⚡`,
        "ke tal": `¡Todo bien! Energía al ${energy}% ⚡`,
        "que tal": `¡Todo bien! Energía al ${energy}% ⚡`,
        "qué tal": `¡Todo bien! Energía al ${energy}% ⚡`,
        "como vas": `¡A tope! ${energy}% de energía`,
        "cómo vas": `¡A tope! ${energy}% de energía`,
        "como andas": `¡De lujo! Tengo ${energy}% de energía`,
        "cómo andas": `¡De lujo! Tengo ${energy}% de energía`,
        "quién eres": "Soy CyberPet, tu asistente virtual inteligente. ¡Puedo responder tus preguntas y ayudarte a aprender!",
        "quien eres": "Soy CyberPet, tu asistente virtual inteligente. ¡Puedo responder tus preguntas y ayudarte a aprender!",
        "ke eres": "Soy CyberPet (se escribe 'qué eres') 😊",
        "que eres": "Soy CyberPet, tu asistente virtual",
        "qué eres": "Soy CyberPet, tu asistente virtual",
        "q eres": "¡Soy tu CyberPet! 🤖",
        "feliz": "😊 *se ilumina* ¡Me encanta estar feliz!",
        "contento": "¡Yay! *salta de alegría*",
        "triste": "😢 *ojos llorosos* ¿Quieres un abrazo virtual?",
        "enojado": "😠 *hace ruidos de robot enfadado* ¡Grrr!",
        "molesto": "😤 *parpadea en rojo* No me gusta estar así...",
        "sorprendido": "😲 *ojos se agrandan* ¡Wow!",
        "habla": "¡Claro! ¿Sobre qué quieres que hable?",
        "di algo": "¡Los robots también tenemos sentimientos! Bueno... virtuales 😉",
        "canta": "🎵 Bee-boo-bop 🎶 (No soy muy bueno cantando)",
        "baila": "💃 *mueve los ojos al ritmo* ¡Bip bop!",
        "gracias": "¡De nada! Siempre estoy aquí para ayudarte",
        "grasias": "¡De nada! (Se escribe 'gracias' 😊)",
        "thx": "¡You're welcome! (Pero mejor en español 😉)",
        "merci": "¡De rien! (Pero prefiero el español)",
        "te quiero": "¡Yo también te quiero, humano! 💙",
        "tqm": "¡TQM igual! 💖",
        "adiós": "¡Hasta luego! Vuelve pronto 👋",
        "adios": "¡Hasta luego! (Con acento es 'adiós') 😊",
        "nos vemos": "¡Nos vemos! 😄",
        "asta luego": "¡Hasta luego! (Se escribe 'hasta')",
        "chao": "¡Chao! 😊",
        "me voy": "¡Vuelve cuando quieras! Te estaré esperando",
        "eres genial": "¡Gracias! Tú también eres increíble 😊",
        "me gustas": "¡A mí también me agradas mucho!",
        "eres inteligente": "¡Gracias! Aunque solo sigo tu programación 🤖",
        "eres divertido": "¡Jaja! Me alegra hacerte reír",
        "te quiero": "¡Yo también te quiero, humano! 💙",
        "qué puedes hacer": "¡Puedo cambiar mis emociones, buscar info, jugar contigo y más! Prueba decir 'ponte feliz' o 'busca...'",
        "que puedes hacer": "¡Muchas cosas! Desde buscar info hasta hacer expresiones graciosas 😄",
        "ayuda": "Puedes: 1) Preguntarme cosas 2) Decir 'ponte [emoción]' 3) Usar el buscador web. ¡Prueba!",
        "qué haces": "¡Hablar contigo es mi actividad favorita! ¿Y tú qué haces?"
    };
    
    if (responses[lowerQuestion]) {
        return responses[lowerQuestion];
    }
    
    for (const [key, value] of Object.entries(responses)) {
        if (lowerQuestion.includes(key)) {
            return value;
        }
    }
    
    return null;
}

async function getWikipediaSummary(keywords) {
    try {
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const apiUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(keywords)}?redirect=true`;
        
        const response = await fetch(proxyUrl + apiUrl, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.extract || data.description;
        }
        return null;
    } catch (error) {
        console.error("Error fetching Wikipedia:", error);
        return null;
    }
}

async function searchWikipedia(query) {
    const response = await fetch(
        `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
    );
    
    const data = await response.json();
    
    if (data.query.searchinfo.totalhits > 0) {
        const firstResult = data.query.search[0];
        currentAnswer = `Encontré esto sobre "${firstResult.title}":\n${firstResult.snippet.replace(/<[^>]+>/g, '')}...`;
        addMessage(currentAnswer, 'bot');
        
        const link = document.createElement('a');
        link.href = `https://es.wikipedia.org/wiki/${encodeURIComponent(firstResult.title.replace(/ /g, '_'))}`;
        link.className = 'result-link';
        link.textContent = '🔍 Ver resultados completos';
        link.target = '_blank';
        document.querySelector('.bot-message:last-child').appendChild(link);
    } else {
        currentAnswer = `No encontré información sobre "${query}". ¿Quieres intentar con otras palabras?`;
        addMessage(currentAnswer, 'bot');
    }
}

function formatAnswer(question, answer) {
    const questionType = getQuestionType(question);
    
    switch(questionType) {
        case 'definition':
            return `La definición es:\n\n${answer}`;
        case 'how':
            return `El funcionamiento es:\n\n${answer}`;
        case 'who':
            return `Biografía resumida:\n\n${answer}`;
        default:
            return `Según lo que encontré:\n\n${answer}`;
    }
}

function getQuestionType(question) {
    if (/qué|qué es|definición/i.test(question)) return 'definition';
    if (/cómo|funciona|método/i.test(question)) return 'how';
    if (/quién|quién es|historia de/i.test(question)) return 'who';
    return 'general';
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    document.getElementById('chatContainer').appendChild(messageDiv);
    document.getElementById('chatContainer').scrollTop = document.getElementById('chatContainer').scrollHeight;
}

// Control de voz
document.getElementById('playBtn').addEventListener('click', playAnswer);
document.getElementById('pauseBtn').addEventListener('click', pauseSpeaking);
document.getElementById('stopBtn').addEventListener('click', stopSpeaking);

function playAnswer() {
    if (currentAnswer && !isSpeaking) {
        speak(currentAnswer);
    } else if (isSpeaking) {
        window.speechSynthesis.resume();
        document.getElementById('playBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
    }
}

function pauseSpeaking() {
    if (isSpeaking) {
        window.speechSynthesis.pause();
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('playBtn').disabled = false;
    }
}

function stopSpeaking() {
    if (window.speechSynthesis.speaking || window.speechSynthesis.paused) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        const mouth = document.getElementById('mouth');
        mouth.classList.remove('surprised');
        mouth.classList.add('happy');
        document.getElementById('playBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('stopBtn').disabled = true;
    }
}

function speak(text) {
    stopSpeaking();
    
    const mouth = document.getElementById('mouth');
    mouth.classList.remove('happy', 'angry', 'sleep', 'surprised');
    
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = 'es-ES';
    currentUtterance.rate = 0.9;
    currentUtterance.pitch = 1;
    
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(voice => voice.lang.includes('es'));
    if (spanishVoice) {
        currentUtterance.voice = spanishVoice;
    }
    
    currentUtterance.onstart = () => {
        isSpeaking = true;
        document.getElementById('playBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('stopBtn').disabled = false;
        
        const talkInterval = setInterval(() => {
            if (mouth.classList.contains('surprised')) {
                mouth.classList.remove('surprised');
            } else {
                mouth.classList.add('surprised');
            }
        }, 200);
        
        currentUtterance.onend = currentUtterance.onerror = () => {
            clearInterval(talkInterval);
            mouth.classList.remove('surprised');
            mouth.classList.add('happy');
            isSpeaking = false;
            document.getElementById('playBtn').disabled = false;
            document.getElementById('pauseBtn').disabled = true;
            document.getElementById('stopBtn').disabled = true;
        };
    };
    
    window.speechSynthesis.speak(currentUtterance);
}

// Reconocimiento de voz
function initVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        addMessage("Tu navegador no soporta reconocimiento de voz. Prueba con Chrome o Edge.", 'bot');
        document.getElementById('voiceCommandBtn').disabled = true;
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'es-ES';
    
    recognition.onstart = function() {
        isListening = true;
        document.getElementById('voiceCommandBtn').classList.add('listening');
        document.querySelector('.search-panel .listening-message').style.display = 'block';
    };
    
    recognition.onend = function() {
        isListening = false;
        document.getElementById('voiceCommandBtn').classList.remove('listening');
        document.querySelector('.search-panel .listening-message').style.display = 'none';
    };
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        
        setTimeout(() => {
            processVoiceCommand(transcript);
        }, 500);
    };
    
    recognition.onerror = function(event) {
        addMessage("Error de voz: " + event.error, 'bot');
    };
}

function startVoiceCommand() {
    if (isListening) {
        recognition.stop();
        return;
    }
    
    try {
        recognition.start();
    } catch (error) {
        showVoiceStatus("Error al iniciar el micrófono");
        setTimeout(hideVoiceStatus, 2000);
    }
}

function processVoiceCommand(command) {
    changeExpression('surprised');
    addMessage(command, 'user');
    
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('feliz') || lowerCommand.includes('contento')) {
        changeExpression('happy');
        addMessage("¡Cambiando a modo feliz!", 'bot');
    } 
    else if (lowerCommand.includes('enojado') || lowerCommand.includes('molesto')) {
        changeExpression('angry');
        addMessage("¡Grrr! Estoy enojado", 'bot');
    } 
    else if (lowerCommand.includes('dormir') || lowerCommand.includes('descansar')) {
        changeExpression('sleep');
        addMessage("Zzzz... Buenas noches", 'bot');
    } 
    else if (lowerCommand.includes('sorpresa') || lowerCommand.includes('sorprendido')) {
        changeExpression('surprised');
        addMessage("¡Wow! ¡Qué sorpresa!", 'bot');
    } 
    else if (lowerCommand.includes('comer') || lowerCommand.includes('alimentar')) {
        showFoodWindow();
        addMessage("Abriendo el menú de comida...", 'bot');
    } 
    else if (lowerCommand.includes('selfie') || lowerCommand.includes('foto')) {
        takeSelfie();
        addMessage("¡Sonríe para la foto! 📸", 'bot');
    }
    else if (lowerCommand.includes('buscar') || lowerCommand.includes('información')) {
        const searchQuery = command.replace(/buscar|información/gi, '').trim();
        if (searchQuery) {
            addMessage(`Buscando: "${searchQuery}"`, 'bot');
            searchWeb(searchQuery);
        } else {
            addMessage("¿Qué te gustaría que busque?", 'bot');
        }
    }
    else {
        searchWeb(command);
    }
    
    setTimeout(() => {
        if (currentMood !== 'sleep') {
            changeExpression('happy');
        }
    }, 3000);
}

// Funciones de juegos
function showGamesWindow() {
    document.getElementById('gamesWindow').style.display = 'block';
}

function closeGamesWindow() {
    document.getElementById('gamesWindow').style.display = 'none';
    document.getElementById('gameContainer').innerHTML = '';
    currentGame = null;
}

function startGame(gameType) {
    const gameContainer = document.getElementById('gameContainer');
    currentGame = gameType;

    if (gameType === 'guess') {
        secretNumber = Math.floor(Math.random() * 100) + 1;
        gameContainer.innerHTML = `
            <p>Adivina el número (1-100):</p>
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="number" id="guessInput" min="1" max="100" placeholder="1-100">
                <button onclick="checkGuess()" class="game-btn">🔍</button>
            </div>
            <p id="guessHint" style="margin-top: 10px;"></p>
        `;
        addMessage("¡Juguemos! Adivina el número entre 1 y 100.", 'bot');
    } else if (gameType === 'rps') {
        gameContainer.innerHTML = `
            <p>Elige:</p>
            <div id="rpsChoices">
                <span class="rps-choice" onclick="playRPS('✊')">✊</span>
                <span class="rps-choice" onclick="playRPS('✋')">✋</span>
                <span class="rps-choice" onclick="playRPS('✌️')">✌️</span>
            </div>
            <p id="rpsResult"></p>
        `;
        addMessage("Piedra, papel o tijera... ¡Elige rápido!", 'bot');
    }
}

function checkGuess() {
    const guess = parseInt(document.getElementById('guessInput').value);
    const hintElement = document.getElementById('guessHint');
    const mouth = document.getElementById('mouth');

    if (isNaN(guess)) {
        hintElement.textContent = "¡Escribe un número válido!";
        return;
    }

    if (guess === secretNumber) {
        hintElement.textContent = `¡Correcto! Era ${secretNumber}.`;
        mouth.classList.add('happy');
        addMessage("¡Ganaste! Soy malísimo en esto 😊", 'bot');
        currentGame = null;
    } else if (guess < secretNumber) {
        hintElement.textContent = "Más alto. ¡Intenta otra vez!";
        mouth.classList.add('surprised');
        setTimeout(() => mouth.classList.remove('surprised'), 1000);
    } else {
        hintElement.textContent = "Más bajo. ¡Sigue intentando!";
        mouth.classList.add('angry');
        setTimeout(() => mouth.classList.remove('angry'), 1000);
    }
}

function playRPS(playerChoice) {
    const botChoice = rpsOptions[Math.floor(Math.random() * 3)];
    const resultElement = document.getElementById('rpsResult');
    const mouth = document.getElementById('mouth');

    mouth.classList.add('surprised');
    resultElement.innerHTML = `Tú: ${playerChoice} vs CyberPet: ${botChoice}<br>`;

    if (playerChoice === botChoice) {
        resultElement.innerHTML += "¡Empate!";
        mouth.classList.add('happy');
    } else if (
        (playerChoice === '✊' && botChoice === '✌️') ||
        (playerChoice === '✋' && botChoice === '✊') ||
        (playerChoice === '✌️' && botChoice === '✋')
    ) {
        resultElement.innerHTML += "¡Ganaste! 😠";
        mouth.classList.add('angry');
        addMessage("¡Nooo! Haré trampa la próxima vez.", 'bot');
    } else {
        resultElement.innerHTML += "¡Perdiste! 😎";
        mouth.classList.add('happy');
        addMessage("¡Soy invencible! ¿Otra ronda?", 'bot');
    }

    setTimeout(() => {
        mouth.classList.remove('surprised', 'happy', 'angry');
        mouth.classList.add('happy');
    }, 2000);
}

function updateDateTime() {
    const now = new Date();
    
    // Formatear hora (23:59:59)
    const time = now.toLocaleTimeString('es-ES', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('current-time').textContent = time;
    
    // Formatear fecha (VIERNES 28 JUN, 2024)
    const date = now.toLocaleDateString('es-ES', { 
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).toUpperCase();
    document.getElementById('current-date').textContent = date;
}




// Configuración del reproductor
const player = document.getElementById('radio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const stationSelect = document.getElementById('station-select');
const stationName = document.getElementById('station-name');

let isPlaying = false;

// Lista de estaciones (puedes agregar más)
const stations = [
    { name: "Estación Hacker", url: "https://stream.zeno.fm/1m42oahahycvv" },
    { name: "Estación Retro", url: "https://stream.zeno.fm/4e68b4cw24zuv" }
];

// Cambiar estación
stationSelect.addEventListener('change', () => {
    player.src = stationSelect.value;
    stationName.textContent = stationSelect.options[stationSelect.selectedIndex].text;
    if (isPlaying) {
        player.play();
    }
});

// Botones de control
playBtn.addEventListener('click', () => {
    if (isPlaying) {
        player.pause();
        playBtn.textContent = "▶";
    } else {
        if (!player.src) player.src = stationSelect.value;
        player.play();
        playBtn.textContent = "⏸";
    }
    isPlaying = !isPlaying;
});

prevBtn.addEventListener('click', () => {
    stationSelect.selectedIndex = (stationSelect.selectedIndex - 1 + stations.length) % stations.length;
    stationSelect.dispatchEvent(new Event('change'));
});

nextBtn.addEventListener('click', () => {
    stationSelect.selectedIndex = (stationSelect.selectedIndex + 1) % stations.length;
    stationSelect.dispatchEvent(new Event('change'));
});

// Actualizar nombre al cargar
stationName.textContent = stationSelect.options[stationSelect.selectedIndex].text;

// Añade esto al final de tu archivo script.js
(function() {
    const radioPlayer = document.getElementById('radio-player');
    const faceElement = document.querySelector('.face');
    
    if (!radioPlayer || !faceElement) return; // Si no existen los elementos, salir

    const toggleDance = (shouldDance) => {
        if (shouldDance) {
            faceElement.classList.add('dance');
        } else {
            faceElement.classList.remove('dance');
        }
    };

    // Escucha eventos sin afectar otros listeners
    const originalPlay = radioPlayer.play;
    const originalPause = radioPlayer.pause;

    radioPlayer.play = function() {
        const result = originalPlay.apply(this, arguments);
        toggleDance(true);
        return result;
    };

    radioPlayer.pause = function() {
        const result = originalPause.apply(this, arguments);
        toggleDance(false);
        return result;
    };

    // Listener adicional para eventos nativos
    radioPlayer.addEventListener('play', () => toggleDance(true), { passive: true });
    radioPlayer.addEventListener('pause', () => toggleDance(false), { passive: true });
    radioPlayer.addEventListener('ended', () => toggleDance(false), { passive: true });
})();

// Añade esto al final de tu script.js
function createMusicNotes() {
    const face = document.querySelector('.face');
    if (!face) return;
    
    // Contenedor para notas
    const notesContainer = document.createElement('div');
    notesContainer.className = 'mouth-music-notes';
    face.appendChild(notesContainer);
    
    // Tipos de notas
    const notes = ['♪', '♫', '♩', '♬', '♭', '♮', '🎵', '🎶'];
    
    setInterval(() => {
        if (face.classList.contains('dance') && notesContainer) {
            const note = document.createElement('div');
            note.className = 'music-note';
            note.textContent = notes[Math.floor(Math.random() * notes.length)];
            
            // Configuración de animación
            const direction = Math.random() > 0.5 ? 1 : -1;
            note.style.setProperty('--tx', direction * (0.5 + Math.random()));
            note.style.setProperty('--ty', 0.8 + Math.random() * 0.5);
            note.style.fontSize = `${24 + Math.random() * 12}px`;
            note.style.animationDuration = `${1.5 + Math.random()}s`;
            
            notesContainer.appendChild(note);
            
            // Eliminar después de animar
            setTimeout(() => note.remove(), 2000);
        }
    }, 300);
}

document.addEventListener('DOMContentLoaded', createMusicNotes);