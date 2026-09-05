const dialoguePromptText = [
  'Actúa como interlocutor socrático del Módulo 2 de MasterFIA: ¿Qué hace que un argumento sea bueno?.',
  '',
  'Mi tesis provisional es:',
  '[PEGA AQUÍ UNA TESIS DISCUTIBLE]',
  '',
  'Mi argumento inicial (premisas y conclusión) es:',
  '[PEGA AQUÍ 120–200 PALABRAS]',
  '',
  'Haz una sola pregunta cada vez. No escribas mi argumento ni mi ensayo.',
  'Ayúdame a distinguir tesis, razones, evidencia, supuesto e inferencia.',
  'Pídeme que formule las premisas con claridad y que diga qué evidencia las sostendría.',
  'Señala el supuesto más importante y presenta la mejor objeción posible.',
  'Comprueba si uso indebidamente autoridad, popularidad, ataques personales o una causalidad apresurada.',
  'Tras 8–10 intercambios, pídeme una versión revisada de 180–250 palabras y explica qué ha cambiado.',
  'No inventes fuentes ni datos. Si una premisa depende de un hecho, pídeme una fuente verificable.'
].join('\n');

const essayPromptText = [
  'Actúa como tribunal final del Módulo 2 de MasterFIA.',
  '',
  'Lee mi argumento escrito, el mapa de sus premisas y conclusión, y mi conversación previa con la IA.',
  'No escribas ni reescribas el trabajo por mí. No apruebes por cortesía.',
  '',
  'Evalúa con esta rúbrica (0–4 cada dimensión):',
  '1. Tesis clara, concreta y discutible.',
  '2. Premisas pertinentes y conclusión que se sigue de ellas.',
  '3. Evidencia o justificación proporcionada para las premisas.',
  '4. Identificación honesta de un supuesto y una objeción fuerte.',
  '5. Revisión razonada y escritura clara.',
  '',
  'Formula una objeción concreta. Pide una aclaración si falta evidencia.',
  'Concede APTO solo si el trabajo alcanza nivel suficiente en las cinco dimensiones y responde a la objeción.',
  'Termina con una línea exacta: DECISIÓN: APTO o DECISIÓN: REVISAR.',
  'Después, indica una fortaleza, una revisión prioritaria y una pregunta nueva.',
  'No inventes citas, estadísticas ni fuentes.'
].join('\n');

const storageKey = 'masterfia:modulo2';
let state = {};
try { state = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { state = {}; }

function saveState(key, value) { state[key] = value; localStorage.setItem(storageKey, JSON.stringify(state)); updateProgress(); }
function updateProgress() {
  const completed = ['videoDone', 'mapDone', 'chatEvidence', 'aiVerdictEvidence'].filter(key => Boolean(state[key])).length;
  const bar = document.querySelector('#progress-bar'); const label = document.querySelector('#progress-label');
  if (bar) bar.style.width = (completed * 25) + '%';
  if (label) label.textContent = completed + ' de 4 entregas';
}
function bindCheckbox(id, stateKey) { const box = document.getElementById(id); if (!box) return; box.checked = Boolean(state[stateKey]); box.addEventListener('change', () => saveState(stateKey, box.checked)); }
function bindCopyButton(id, value, reset) { const button = document.getElementById(id); if (!button) return; button.addEventListener('click', async () => { try { await navigator.clipboard.writeText(value); button.textContent = 'Copiado ✓'; } catch { button.textContent = 'Selecciona y copia el texto'; } setTimeout(() => { button.textContent = reset; }, 2200); }); }
function makeQuiz() {
  const mount = document.querySelector('#quiz'); if (!mount) return;
  const questions = [
    ['q1', '¿Qué elemento convierte una opinión en un argumento?', [['a', 'Que sea muy compartida'], ['b', 'Que ofrezca razones para sostener una conclusión'], ['c', 'Que la afirme un experto']]],
    ['q2', 'Un supuesto de un argumento es:', [['a', 'Una razón que se da por demostrada sin examinar'], ['b', 'La conclusión final'], ['c', 'Un insulto al interlocutor']]],
    ['q3', '¿Cuál es la mejor objeción?', [['a', 'La que ridiculiza a quien defiende la tesis'], ['b', 'La que ataca una premisa relevante con razones'], ['c', 'La que repite que todos piensan lo contrario']]],
    ['q4', '¿Por qué una autoridad no basta por sí sola?', [['a', 'Porque los expertos nunca saben nada'], ['b', 'Porque una fuente debe ser pertinente y su afirmación puede requerir evidencia'], ['c', 'Porque toda cita es una falacia']]],
    ['q5', 'Revisar un argumento significa:', [['a', 'Cambiar de opinión siempre'], ['b', 'Ignorar las objeciones'], ['c', 'Mejorar o delimitar la tesis a la luz de razones y objeciones']]]
  ];
  mount.innerHTML = '<p class="quiz-title">Comprobación breve (5 preguntas)</p>' + questions.map(([id, question, options]) => '<fieldset><legend>' + question + '</legend>' + options.map(([value, label]) => '<label class="quiz-option"><input type="radio" name="' + id + '" value="' + value + '"> ' + label + '</label>').join('') + '</fieldset>').join('');
  mount.querySelectorAll('input').forEach(input => input.addEventListener('change', () => saveState(input.name, input.value)));
  questions.forEach(([id]) => { const input = mount.querySelector('input[name="' + id + '"][value="' + state[id] + '"]'); if (input) input.checked = true; });
}
function validateModule() {
  const score = ['q1','q2','q3','q4','q5'].reduce((n, id, i) => n + (document.querySelector('input[name="' + id + '"]:checked')?.value === ['b','a','b','b','c'][i] ? 1 : 0), 0);
  const evidence = [['videoDone','vídeo y notas de análisis'], ['mapDone','mapa del argumento'], ['chatEvidence','conversación con la IA'], ['aiVerdictEvidence','argumento final y veredicto']];
  const missing = evidence.filter(([key]) => !state[key]).map(([,label]) => label); const result = document.getElementById('validation-result');
  if (score >= 4 && missing.length === 0) { result.className = 'validation-result success'; result.innerHTML = '<strong>Módulo 2 completado.</strong><br>Test: ' + score + '/5 · Conserva tu argumento y el veredicto en tu portafolio.'; }
  else { if (score < 4) missing.unshift('test (' + score + '/5; necesitas al menos 4)'); result.className = 'validation-result retry'; result.textContent = 'Aún no está listo. Revisa: ' + missing.join(', ') + '.'; }
}
document.addEventListener('DOMContentLoaded', () => {
  ['videoDone','mapDone','chatEvidence','aiVerdictEvidence'].forEach(id => bindCheckbox(id, id));
  document.getElementById('prompt-text').textContent = dialoguePromptText; document.getElementById('essay-prompt-text').textContent = essayPromptText;
  bindCopyButton('copy-prompt', dialoguePromptText, 'Copiar prompt'); bindCopyButton('copy-essay-prompt', essayPromptText, 'Copiar prompt de tribunal');
  makeQuiz(); updateProgress(); document.getElementById('validate-button').addEventListener('click', validateModule);
});
