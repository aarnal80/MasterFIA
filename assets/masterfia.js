const promptText = [
  'Actúa como moderador de un seminario filosófico sobre la Apología de Sócrates y La muerte de Iván Ilich.',
  '',
  'Mi interpretación de la vida de Iván Ilich es:',
  '[PEGA AQUÍ 150–250 PALABRAS]',
  '',
  'Mi tesis provisional sobre la vida examinada es:',
  '[PEGA AQUÍ TU TESIS]',
  '',
  'Haz una sola pregunta cada vez. No escribas el ensayo ni me des una interpretación modelo.',
  '',
  '1. Pídeme una escena concreta de la novela.',
  '2. Pregunta qué entiende Sócrates por examen y qué evidencia textual tengo.',
  '3. Distingue falta de reflexión, autoengaño, cobardía, conformidad social y mala fortuna.',
  '4. Presenta la mejor objeción: muchas vidas valiosas se sostienen en amor, hábito, acción o tradición sin examen filosófico explícito.',
  '5. Pregunta si examinarse garantiza vivir bien o solo hace visible una incoherencia.',
  '6. Pídeme que revise, limite o defienda mi tesis.',
  '',
  'Después de 10–12 intercambios, solicita mi conclusión de 120–180 palabras y evalúala por claridad, apoyo textual, calidad de la objeción y revisión intelectual. No inventes citas.'
].join('\n');

const storageKey = 'masterfia:modulo1';
const fields = ['diagnostic', 'video-notes', 'argument-map', 'tolstoi-notes', 'dialogue-reflection', 'final-essay', 'ai-declaration'];
let state = {};
try { state = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { state = {}; }

function saveField(id, value) {
  state[id] = value;
  localStorage.setItem(storageKey, JSON.stringify(state));
  updateProgress();
}

function updateProgress() {
  const evidence = [
    Boolean((state.diagnostic || '').trim()),
    Boolean((state['video-notes'] || '').trim()),
    Boolean((state['argument-map'] || '').trim()),
    Boolean((state['tolstoi-notes'] || '').trim()),
    Boolean((state['dialogue-reflection'] || '').trim() && state.chatEvidence)
  ];
  const completed = evidence.filter(Boolean).length;
  const bar = document.querySelector('#progress-bar');
  const label = document.querySelector('#progress-label');
  if (bar) bar.style.width = `${completed * 20}%`;
  if (label) label.textContent = `${completed} de 5 evidencias`;
}

function makeQuiz() {
  const mount = document.querySelector('#quiz');
  if (!mount) return;
  const questions = [
    ['q1', '¿Qué descubre Sócrates al examinar a quienes pasan por sabios?', [['a', 'Que poseen una sabiduría completa'], ['b', 'Que confunden saber algo con saberlo todo'], ['c', 'Que la poesía es siempre falsa']]],
    ['q2', 'Para Sócrates, cuidar de uno mismo exige sobre todo:', [['a', 'Aumentar la reputación pública'], ['b', 'Preocuparse por la virtud y las razones'], ['c', 'Evitar toda conversación']]],
    ['q3', '¿Cuál es una objeción legítima a la tesis de la vida examinada?', [['a', 'La filosofía no tiene historia'], ['b', 'Sócrates no escribió libros'], ['c', 'Una vida puede sostener bienes valiosos sin examen filosófico explícito']]],
    ['q4', 'La novela de Tolstói sirve en este módulo principalmente para:', [['a', 'Probar que la enfermedad es un castigo'], ['b', 'Observar la distancia entre éxito social y vida asumida'], ['c', 'Sustituir la argumentación por emociones']]],
    ['q5', 'Una buena objeción filosófica debe:', [['a', 'Atacar la premisa más importante con razones'], ['b', 'Repetir la tesis contraria'], ['c', 'Apelar a la mayoría']]]
  ];
  mount.innerHTML = '<p class="quiz-title">Comprobación breve (5 preguntas)</p>' + questions.map(([id, text, options]) => `<fieldset><legend>${text}</legend>${options.map(([value, label]) => `<label class="quiz-option"><input type="radio" name="${id}" value="${value}"> ${label}</label>`).join('')}</fieldset>`).join('');
  mount.querySelectorAll('input').forEach(input => input.addEventListener('change', () => saveField(input.name, input.value)));
}

function hydrate() {
  fields.forEach(id => {
    const element = document.getElementById(id);
    if (!element) return;
    if (typeof state[id] === 'string') element.value = state[id];
    element.addEventListener('input', () => saveField(id, element.value));
  });
  const evidenceCheck = document.getElementById('chat-evidence');
  if (evidenceCheck) {
    evidenceCheck.checked = Boolean(state.chatEvidence);
    evidenceCheck.addEventListener('change', () => { state.chatEvidence = evidenceCheck.checked; localStorage.setItem(storageKey, JSON.stringify(state)); updateProgress(); });
  }
  const prompt = document.getElementById('prompt-text');
  if (prompt) prompt.textContent = promptText;
  const copyButton = document.getElementById('copy-prompt');
  if (copyButton) copyButton.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(promptText); copyButton.textContent = 'Copiado ✓'; }
    catch { copyButton.textContent = 'Selecciona y copia el texto'; }
    setTimeout(() => { copyButton.textContent = 'Copiar prompt'; }, 2200);
  });
  makeQuiz();
  updateProgress();
}

function validateModule() {
  const result = document.getElementById('validation-result');
  const answers = ['q1', 'q2', 'q3', 'q4', 'q5'];
  const correct = ['b', 'b', 'c', 'b', 'a'];
  const score = answers.reduce((total, id, index) => total + (document.querySelector(`input[name="${id}"]:checked`)?.value === correct[index] ? 1 : 0), 0);
  const reflection = (state['dialogue-reflection'] || '').trim();
  const essay = (state['final-essay'] || '').trim();
  const evidence = Boolean(state.chatEvidence);
  if (score >= 4 && reflection.length >= 80 && essay.length >= 300 && evidence) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    const code = `FIA1-PILOTO-${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    state.passed = true;
    state.pilotCode = code;
    localStorage.setItem(storageKey, JSON.stringify(state));
    result.className = 'validation-result success';
    result.innerHTML = `<strong>Módulo 1 validado en modo piloto.</strong><br>Resultado: ${score}/5 · Código local: <code>${code}</code><br><small>Este código no es todavía una certificación ni un bloqueo seguro: solo demuestra el flujo de prueba en este navegador.</small>`;
  } else {
    const missing = [];
    if (score < 4) missing.push(`test (${score}/5; necesitas al menos 4)`);
    if (reflection.length < 80) missing.push('reflexión del diálogo (80 caracteres)');
    if (essay.length < 300) missing.push('tesis/esquema final (300 caracteres)');
    if (!evidence) missing.push('marcar que conservas la conversación');
    result.className = 'validation-result retry';
    result.textContent = `Aún no está listo. Revisa: ${missing.join(', ')}.`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  hydrate();
  const validate = document.getElementById('validate-button');
  if (validate) validate.addEventListener('click', validateModule);
});
