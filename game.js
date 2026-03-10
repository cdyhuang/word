/**
 * Reading comprehension game: guess the missing word from NYT-style lead sentences.
 * Up to 5 sentences (same word missing); win by guessing correctly.
 * After each guess, shows the story source: name, date, first paragraph (keyword hidden until guessed), link.
 */

const STATS_KEY = 'leadword-game-stats';

let allPuzzles = [];
let currentPuzzle = null;
let sentenceIndex = 0;
let gameOver = false;
let currentDifficulty = null;
let currentSection = 'any';

const difficultyPickerEl = document.getElementById('difficulty-picker');
const gamePlayEl = document.getElementById('game-play');
const sentenceEl = document.getElementById('sentence');
const guessInput = document.getElementById('guess');
const submitBtn = document.getElementById('submit');
const messageEl = document.getElementById('message');
const sentenceCountEl = document.getElementById('sentence-count');
const newGameBtn = document.getElementById('new-game');
const storySourceEl = document.getElementById('story-source');
const storyNameEl = document.getElementById('story-name');
const storyDateEl = document.getElementById('story-date');
const storyParagraphEl = document.getElementById('story-paragraph');
const storyLinkEl = document.getElementById('story-link');
const statsChartEl = document.getElementById('stats-chart');
const statsBarsEl = document.getElementById('stats-bars');
const statsSummaryEl = document.getElementById('stats-summary');

async function loadPuzzles() {
  const [base, extra, more] = await Promise.all([
    fetch('data/puzzles.json').then((r) => r.json()),
    fetch('data/puzzles-extra.json').then((r) => r.json()).catch(() => []),
    fetch('data/puzzles-more.json').then((r) => r.json()).catch(() => [])
  ]);
  allPuzzles = [...base, ...extra, ...more];
}

function getClues(puzzle) {
  if (puzzle.clues) return puzzle.clues;
  return (puzzle.sentences || []).map((s) => ({ sentence: s, source: null }));
}

function getMaxClues(difficulty) {
  return difficulty === 'hard' ? 3 : 5;
}

function getEffectiveClues() {
  if (!currentPuzzle) return [];
  const all = getClues(currentPuzzle);
  const max = getMaxClues(currentDifficulty);
  return all.slice(0, max);
}

function getPuzzlesForDifficulty(difficulty) {
  return allPuzzles.filter((p) => (p.difficulty || 'medium') === difficulty);
}

function getPuzzlesForSection(puzzles, section) {
  if (!section || section === 'any') return puzzles;
  return puzzles.filter((p) => (p.section || '').toLowerCase() === section.toLowerCase());
}

function pickRandomPuzzle(difficulty, section) {
  let puzzles = getPuzzlesForDifficulty(difficulty);
  puzzles = getPuzzlesForSection(puzzles, section);
  if (puzzles.length === 0) return null;
  const index = Math.floor(Math.random() * puzzles.length);
  return { ...puzzles[index] };
}

function showDifficultyPicker() {
  difficultyPickerEl.classList.remove('hidden');
  gamePlayEl.classList.add('hidden');
}

function showGamePlay() {
  difficultyPickerEl.classList.add('hidden');
  gamePlayEl.classList.remove('hidden');
}

function startNewGame() {
  showDifficultyPicker();
}

function startGameWithDifficulty(difficulty) {
  currentDifficulty = difficulty;
  currentSection = document.querySelector('.btn-section.active')?.getAttribute('data-section') || 'any';
  currentPuzzle = pickRandomPuzzle(difficulty, currentSection);
  if (!currentPuzzle) {
    if (gamePlayEl.classList.contains('hidden')) {
      const pickerMsg = document.createElement('p');
      pickerMsg.className = 'message hint';
      pickerMsg.id = 'picker-message';
      pickerMsg.textContent = currentSection === 'any' ? 'No puzzles available for this difficulty.' : `No puzzles for "${currentSection}" at this difficulty. Try another section or Any.`;
      const existing = document.getElementById('picker-message');
      if (existing) existing.remove();
      difficultyPickerEl.appendChild(pickerMsg);
    }
    return;
  }
  const pickerMsg = document.getElementById('picker-message');
  if (pickerMsg) pickerMsg.remove();
  sentenceIndex = 0;
  gameOver = false;
  guessInput.value = '';
  guessInput.disabled = false;
  submitBtn.disabled = false;
  messageEl.textContent = '';
  messageEl.className = '';
  storySourceEl.classList.add('hidden');
  newGameBtn.classList.add('hidden');
  statsChartEl.classList.add('hidden');
  showGamePlay();
  render();
  guessInput.focus();
}

function redactWord(text, word) {
  if (!text || !word) return text;
  const re = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
  return text.replace(re, '_____');
}

function showStorySource(source, hideKeyword, wordToHide) {
  if (!source) return;
  const redact = hideKeyword && wordToHide;
  storyNameEl.textContent = redact ? redactWord(source.name, wordToHide) : source.name;
  storyDateEl.textContent = source.date;
  storyParagraphEl.textContent = redact ? redactWord(source.firstParagraph, wordToHide) : source.firstParagraph;
  storyLinkEl.href = source.url;
  storyLinkEl.textContent = 'Read the full story →';
  storySourceEl.classList.remove('hidden');
}

function hideStorySource() {
  storySourceEl.classList.add('hidden');
}

function render() {
  if (!currentPuzzle) return;

  const clues = getEffectiveClues();
  const clue = clues[sentenceIndex];
  if (!clue) return;

  sentenceEl.textContent = clue.sentence;
  const kind = clue.type === 'headline' ? 'Headline' : 'Lead';
  sentenceCountEl.textContent = `${kind} ${sentenceIndex + 1} of ${clues.length}`;
}

function showResult(won, message) {
  gameOver = true;
  guessInput.disabled = true;
  submitBtn.disabled = true;
  messageEl.textContent = message;
  messageEl.className = won ? 'message success' : 'message fail';
  newGameBtn.classList.remove('hidden');
}

function normalize(s) {
  return s.trim().toLowerCase();
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const d = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= m; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }
  return d[m][n];
}

function isCloseEnough(guess, answer) {
  if (guess === answer) return true;
  const len = Math.max(guess.length, answer.length);
  const maxEdits = len <= 4 ? 1 : len <= 7 ? 2 : 3;
  return levenshtein(guess, answer) <= maxEdits;
}

function checkGuess() {
  if (!currentPuzzle || gameOver) return;

  const guess = normalize(guessInput.value);
  const answer = normalize(currentPuzzle.word);
  const clues = getEffectiveClues();
  const currentClue = clues[sentenceIndex];

  if (guess === '') {
    messageEl.textContent = 'Enter a word to guess.';
    messageEl.className = 'message hint';
    return;
  }

  const guessedCorrectly = isCloseEnough(guess, answer);
  if (currentClue.source) {
    showStorySource(currentClue.source, !guessedCorrectly, currentPuzzle.word);
  }

  if (guessedCorrectly) {
    recordGameResult(true, sentenceIndex + 1);
    showStatsChart();
    showResult(true, `Correct! The word was "${currentPuzzle.word}".`);
    return;
  }

  sentenceIndex++;
  if (sentenceIndex >= clues.length) {
    recordGameResult(false, 0);
    showStatsChart();
    showResult(
      false,
      `Out of sentences. The word was "${currentPuzzle.word}".`
    );
    return;
  }

  messageEl.textContent =
    "Not quite. Here's another sentence with the same missing word.";
  messageEl.className = 'message hint';
  guessInput.value = '';
  render();
  guessInput.focus();
}

function getStoredStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStats(results) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(results));
  } catch (_) {}
}

function recordGameResult(won, guesses) {
  const stats = getStoredStats();
  stats.push({ won, guesses: won ? guesses : 0 });
  saveStats(stats);
}

function getStatsBuckets() {
  const stats = getStoredStats();
  const buckets = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, lost: 0 };
  stats.forEach((r) => {
    if (r.won) buckets[Math.min(r.guesses, 5)] = (buckets[r.guesses] || 0) + 1;
    else buckets.lost += 1;
  });
  return buckets;
}

function showStatsChart() {
  const buckets = getStatsBuckets();
  const total = Object.values(buckets).reduce((a, b) => a + b, 0);
  if (total === 0) {
    statsChartEl.classList.add('hidden');
    return;
  }
  statsChartEl.classList.remove('hidden');
  const maxCount = Math.max(...Object.values(buckets), 1);
  const labels = { 1: '1 guess', 2: '2 guesses', 3: '3 guesses', 4: '4 guesses', 5: '5 guesses', lost: 'Lost' };
  statsBarsEl.innerHTML = [1, 2, 3, 4, 5, 'lost'].map((key) => {
    const count = buckets[key] || 0;
    const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
    return `<div class="stats-row"><span class="stats-label">${labels[key]}</span><div class="stats-bar-wrap"><div class="stats-bar" style="width:${pct}%" aria-label="${count} games"></div></div><span class="stats-count">${count}</span></div>`;
  }).join('');
  const wins = [1, 2, 3, 4, 5].reduce((a, g) => a + buckets[g], 0);
  statsSummaryEl.textContent = total === 1
    ? '1 game played.'
    : `${total} games played. ${wins} won, ${buckets.lost} lost.`;
}

function resetStats() {
  try {
    localStorage.removeItem(STATS_KEY);
  } catch (_) {}
  showStatsChart();
}

function init() {
  loadPuzzles().then(() => {
    submitBtn.addEventListener('click', checkGuess);
    guessInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkGuess();
    });
    newGameBtn.addEventListener('click', startNewGame);
    document.querySelectorAll('.btn-diff').forEach((btn) => {
      btn.addEventListener('click', () => {
        startGameWithDifficulty(btn.getAttribute('data-difficulty'));
      });
    });
    document.querySelectorAll('.btn-section').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-section').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    const resetStatsBtn = document.getElementById('reset-stats');
    if (resetStatsBtn) resetStatsBtn.addEventListener('click', resetStats);
    showDifficultyPicker();
  });
}

document.addEventListener('DOMContentLoaded', init);
