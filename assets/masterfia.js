const dialoguePromptText = [
  'Actúa como interlocutor socrático de un seminario sobre la Apología de Sócrates de Platón.',
  '',
  'He escuchado el audiolibro o he leído la Apología. Esta es mi reconstrucción del argumento:',
  '[PEGA AQUÍ 150–250 PALABRAS]',
  '',
  'Mi tesis provisional sobre la vida examinada es:',
  '[PEGA AQUÍ TU TESIS]',
  '',
  'Haz una sola pregunta cada vez. No escribas un resumen ni mi ensayo.',
  'Pídeme pasajes o escenas concretas y distingue siempre cita, interpretación y contexto.',
  'Examina conmigo qué entiende Sócrates por virtud, cuidado de sí, ignorancia y muerte.',
  'Presenta la mejor objeción: una vida puede tener amor, acción o tradición valiosos sin examen filosófico explícito.',
  'Pregunta si examinarse garantiza vivir bien o solo hace visible una incoherencia.',
  'Después de 8–10 intercambios, pídeme una conclusión de 120–180 palabras y señala qué he tenido que revisar.',
  'No inventes citas. Si no recuerdas un pasaje, dilo y pídeme que lo copie.'
].join('\n');

const essayPromptText = [
  'Actúa como tribunal final del Módulo 1 de MasterFIA.',
  '',
  'Lee mi ensayo sobre la vida examinada, mi discusión de La muerte de Iván Ilich y la conversación socrática previa.',
  'No reescribas el ensayo ni lo apruebes por cortesía.',
  '',
  'Evalúa con esta rúbrica (0–4 cada dimensión):',
  '1. Tesis clara y discutible.',
  '2. Comprensión fiel de la Apología de Sócrates.',
  '3. Razones y supuestos bien conectados.',
  '4. Objeción fuerte y revisión de la propia posición.',
  '5. Uso preciso de una escena de Tolstói y calidad de escritura.',
  '',
  'Haz una objeción concreta y pide una aclaración si falta evidencia.',
  'Concede APTO solo si el trabajo alcanza un nivel suficiente en las cinco dimensiones y responde a la objeción.',
  'Termina con una línea exacta: DECISIÓN: APTO o DECISIÓN: REVISAR.',
  'Después de esa línea, ofrece una fortaleza, una revisión prioritaria y una pregunta nueva.',
  'No inventes citas ni atribuyas al texto lo que no aparece.'
].join('\n');

const storageKey = 'masterfia:modulo1';
let state = {};
try { state = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { state = {}; }

function saveState(key, value) {
  state[key] = value;
  localStorage.setItem(storageKey, JSON.stringify(state));
  updateProgress();
}

function updateProgress() {
  const evidence = [
    Boolean(state.apologiaDone),
    Boolean(state.chatEvidence),
    Boolean(state.tolstoiDone),
    Boolean(state.aiVerdictEvidence)
  ];
  const completed = evidence.filter(Boolean).length;
  const bar = document.querySelector('#progress-bar');
  const label = document.querySelector('#progress-label');
  if (bar) bar.style.width = (completed * 25) + '%';
  if (label) label.textContent = completed + ' de 4 entregas';
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
  const html = questions.map(([id, text, options]) => {
    const optionHtml = options.map(([value, label]) => '<label class="quiz-option"><input type="radio" name="' + id + '" value="' + value + '"> ' + label + '</label>').join('');
    return '<fieldset><legend>' + text + '</legend>' + optionHtml + '</fieldset>';
  }).join('');
  mount.innerHTML = '<p class="quiz-title">Comprobación breve (5 preguntas)</p>' + html;
  mount.querySelectorAll('input').forEach(input => input.addEventListener('change', () => saveState(input.name, input.value)));
  questions.forEach(([id]) => {
    const answer = state[id];
    if (answer) {
      const input = mount.querySelector('input[name="' + id + '"][value="' + answer + '"]');
      if (input) input.checked = true;
    }
  });
}

function bindCheckbox(id, stateKey) {
  const checkbox = document.getElementById(id);
  if (!checkbox) return;
  checkbox.checked = Boolean(state[stateKey]);
  checkbox.addEventListener('change', () => saveState(stateKey, checkbox.checked));
}

function bindCopyButton(buttonId, text) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = 'Copiado ✓';
    } catch {
      button.textContent = 'Selecciona y copia el texto';
    }
    setTimeout(() => { button.textContent = buttonId === 'copy-prompt' ? 'Copiar prompt' : 'Copiar prompt de tribunal'; }, 2200);
  });
}

function hydrate() {
  bindCheckbox('apologia-done', 'apologiaDone');
  bindCheckbox('chat-evidence', 'chatEvidence');
  bindCheckbox('tolstoi-done', 'tolstoiDone');
  bindCheckbox('ai-verdict-evidence', 'aiVerdictEvidence');
  const prompt = document.getElementById('prompt-text');
  if (prompt) prompt.textContent = dialoguePromptText;
  const essayPrompt = document.getElementById('essay-prompt-text');
  if (essayPrompt) essayPrompt.textContent = essayPromptText;
  bindCopyButton('copy-prompt', dialoguePromptText);
  bindCopyButton('copy-essay-prompt', essayPromptText);
  makeQuiz();
  updateProgress();
}

function validateModule() {
  const result = document.getElementById('validation-result');
  const answers = ['q1', 'q2', 'q3', 'q4', 'q5'];
  const correct = ['b', 'b', 'c', 'b', 'a'];
  const score = answers.reduce((total, id, index) => total + (document.querySelector('input[name="' + id + '"]:checked')?.value === correct[index] ? 1 : 0), 0);
  const evidence = [
    ['apologiaDone', 'lectura y mapa argumental de la Apología'],
    ['chatEvidence', 'conversación socrática con la IA'],
    ['tolstoiDone', 'lectura y discusión de Tolstói'],
    ['aiVerdictEvidence', 'ensayo, conversación final y veredicto de la IA']
  ];
  const missing = evidence.filter(([key]) => !state[key]).map(([, label]) => label);
  if (score >= 4 && missing.length === 0) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    const code = 'FIA1-PILOTO-' + Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
    state.passed = true;
    state.pilotCode = code;
    localStorage.setItem(storageKey, JSON.stringify(state));
    result.className = 'validation-result success';
    result.innerHTML = '<strong>Módulo 1 completado.</strong><br>Test: ' + score + '/5 · Código local: <code>' + code + '</code><br><small>Este código solo registra el flujo de prueba en este navegador.</small>';
  } else {
    if (score < 4) missing.unshift('test (' + score + '/5; necesitas al menos 4)');
    result.className = 'validation-result retry';
    result.textContent = 'Aún no está listo. Revisa: ' + missing.join(', ') + '.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  hydrate();
  const validate = document.querySelector('#validate-button');
  if (validate) validate.addEventListener('click', validateModule);
});
