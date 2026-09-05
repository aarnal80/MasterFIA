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
    Boolean(state.tolstoiDone)
  ];
  const completed = evidence.filter(Boolean).length;
  const bar = document.querySelector('#progress-bar');
  const label = document.querySelector('#progress-label');
  if (bar) bar.style.width = (completed * 33.333) + '%';
  if (label) label.textContent = completed + ' de 3 entregas';
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
  const prompt = document.getElementById('prompt-text');
  if (prompt) prompt.textContent = dialoguePromptText;
  bindCopyButton('copy-prompt', dialoguePromptText);
  updateProgress();
}

document.addEventListener('DOMContentLoaded', () => {
  hydrate();
});
