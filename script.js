const numbers = [...Array(20).keys()].map(i => i + 1).concat(['Bull', 0]);
const scoreDiv = document.getElementById('score');
const buttonsDiv = document.getElementById('buttons');
const historyDiv = document.getElementById('history');
const finishDiv = document.getElementById('finish');
const undoBtn = document.getElementById('undo');
const tabsContainer = document.getElementById('tabs-container');

// Player state management
let players = [
  { id: 1, name: 'Player 1', score: 501, darts: [], multiplier: 1 }
];
let currentPlayerId = 1;
let nextPlayerId = 2;

function getCurrentPlayer() {
  return players.find(p => p.id === currentPlayerId);
}

function updateUndoButton() {
  const player = getCurrentPlayer();
  undoBtn.disabled = player.darts.length === 0;
}

function renderTabs() {
  tabsContainer.innerHTML = '';
  players.forEach(player => {
    const tab = document.createElement('button');
    tab.className = 'player-tab' + (player.id === currentPlayerId ? ' active' : '');
    tab.innerHTML = player.name;

    if (players.length > 1) {
      const removeBtn = document.createElement('span');
      removeBtn.className = 'remove-player';
      removeBtn.innerHTML = '×';
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        removePlayer(player.id);
      };
      tab.appendChild(removeBtn);
    }

    tab.onclick = () => switchPlayer(player.id);
    tabsContainer.appendChild(tab);
  });

  // Only show add button if less than 2 players
  if (players.length < 2) {
    const addBtn = document.createElement('button');
    addBtn.className = 'add-player-btn';
    addBtn.textContent = '+ Add';
    addBtn.onclick = addPlayer;
    tabsContainer.appendChild(addBtn);
  }
}

function addPlayer() {
  const playerNum = nextPlayerId;
  players.push({
    id: nextPlayerId,
    name: `Player ${nextPlayerId}`,
    score: 501,
    darts: [],
    multiplier: 1
  });
  nextPlayerId++;
  renderTabs();
}

function removePlayer(playerId) {
  if (players.length === 1) return;
  const index = players.findIndex(p => p.id === playerId);
  players.splice(index, 1);
  if (currentPlayerId === playerId) {
    currentPlayerId = players[0].id;
    loadPlayer();
  }
  renderTabs();
}

function switchPlayer(playerId) {
  if (currentPlayerId === playerId) return;
  saveCurrentPlayer();
  currentPlayerId = playerId;
  loadPlayer();
  renderTabs();
}

function saveCurrentPlayer() {
  const player = getCurrentPlayer();
  if (!player) return;
  player.multiplier = multiplier;
}

function loadPlayer() {
  const player = getCurrentPlayer();
  if (!player) return;
  score = player.score;
  darts = player.darts;
  multiplier = player.multiplier;

  scoreDiv.textContent = score;
  setMultiplier(multiplier);
  renderHistory();
  renderFinish(score);
  updateUndoButton();
}

let score = 501;
let multiplier = 1;
let darts = [];

function getScoreValue(val) {
  if (val === 'Bull') return 50 * multiplier;
  return Number(val) * multiplier;
}

function getDartDisplay(val, mul) {
  if (val === 'Bull') return mul > 1 ? `${mul}x Bull` : 'Bull';
  if (val === 0) return 'Miss';
  if (mul === 1) return val;
  if (mul === 2) return `D${val}`;
  if (mul === 3) return `T${val}`;
  return val;
}

function updateScore(val) {
  const player = getCurrentPlayer();
  const value = getScoreValue(val);
  if (player.score - value >= 0) {
    player.score -= value;
    player.darts.push({
      label: val,
      value: value,
      multiplier: multiplier,
      display: getDartDisplay(val, multiplier)
    });
    score = player.score;
    darts = player.darts;
    scoreDiv.textContent = score;
    renderHistory();
    renderFinish(score);
    updateUndoButton();
  } else {
    renderFinish(player.score);
  }
  setMultiplier(1);
}

function setMultiplier(mul) {
  multiplier = mul;
  document.getElementById('single').classList.toggle('selected', mul === 1);
  document.getElementById('double').classList.toggle('selected', mul === 2);
  document.getElementById('triple').classList.toggle('selected', mul === 3);
}

document.getElementById('single').onclick = () => setMultiplier(1);
document.getElementById('double').onclick = () => setMultiplier(2);
document.getElementById('triple').onclick = () => setMultiplier(3);

numbers.forEach(num => {
  const btn = document.createElement('button');
  btn.className = 'dart-btn';
  btn.textContent = num;
  btn.onclick = () => updateScore(num);
  buttonsDiv.appendChild(btn);
});

document.getElementById('reset').onclick = () => {
  const player = getCurrentPlayer();
  player.score = 501;
  player.darts = [];
  score = 501;
  darts = [];
  scoreDiv.textContent = score;
  setMultiplier(1);
  renderHistory();
  renderFinish(score);
  updateUndoButton();
};

undoBtn.onclick = () => {
  const player = getCurrentPlayer();
  if (player.darts.length > 0) {
    const lastDart = player.darts.pop();
    player.score += lastDart.value;
    score = player.score;
    darts = player.darts;
    scoreDiv.textContent = score;
    renderHistory();
    renderFinish(score);
    updateUndoButton();
  }
};

function renderHistory() {
  historyDiv.innerHTML = '';
  if (darts.length === 0) return;
  for (let i = 0; i < darts.length; i += 3) {
    const turn = darts.slice(i, i + 3);
    const turnDiv = document.createElement('div');
    turnDiv.className = 'turn';
    const turnNum = document.createElement('span');
    turnNum.className = 'turn-number';
    turnNum.textContent = `Turn ${Math.floor(i / 3) + 1}:`;
    turnDiv.appendChild(turnNum);
    turn.forEach(dart => {
      const dartSpan = document.createElement('span');
      dartSpan.className = 'dart-entry';
      dartSpan.textContent = dart.display;
      turnDiv.appendChild(dartSpan);
    });
    // Add turn total
    const turnTotal = turn.reduce((sum, dart) => sum + dart.value, 0);
    const totalSpan = document.createElement('span');
    totalSpan.style.marginLeft = '10px';
    totalSpan.style.fontWeight = 'bold';
    totalSpan.style.color = '#1976d2';
    totalSpan.textContent = `= ${turnTotal}`;
    turnDiv.appendChild(totalSpan);

    historyDiv.appendChild(turnDiv);
  }
}

// Simple 3-dart finish table (170 and below, common outs)
const finishes = {
  170: ["T20 T20 Bull"],
  167: ["T20 T19 Bull"],
  164: ["T20 T18 Bull"],
  161: ["T20 T17 Bull"],
  160: ["T20 T20 D20"],
  158: ["T20 T20 D19"],
  157: ["T20 T19 D20"],
  156: ["T20 T20 D18"],
  155: ["T20 T19 D19"],
  154: ["T20 T18 D20"],
  153: ["T20 T19 D18"],
  152: ["T20 T20 D16"],
  151: ["T20 T17 D20"],
  150: ["T20 T18 D18"],
  149: ["T20 T19 D16"],
  148: ["T20 T16 D20"],
  147: ["T20 T17 D18"],
  146: ["T20 T18 D16"],
  145: ["T20 T15 D20"],
  144: ["T20 T20 D12"],
  143: ["T20 T17 D16"],
  142: ["T20 T14 D20"],
  141: ["T20 T19 D12"],
  140: ["T20 T16 D16"],
  139: ["T19 T14 D20"],
  138: ["T20 T18 D12"],
  137: ["T20 T19 D10"],
  136: ["T20 T20 D8"],
  135: ["T20 T17 D12", "Bull T15 D20"],
  134: ["T20 T14 D16"],
  133: ["T20 T19 D8"],
  132: ["Bull Bull D16", "T20 T16 D12"],
  131: ["T20 T13 D16"],
  130: ["T20 T18 D8"],
  129: ["T19 T16 D12"],
  128: ["T18 T14 D16"],
  127: ["T20 T17 D8"],
  126: ["T19 T19 D6"],
  125: ["Bull T20 D20"],
  124: ["T20 T16 D8"],
  123: ["T19 T16 D9"],
  122: ["T18 T20 D4"],
  121: ["T20 T11 D14", "Bull T13 D16"],
  120: ["T20 20 D20"],
  119: ["T19 10 D16"],
  118: ["T20 18 D20"],
  117: ["T20 17 D20"],
  116: ["T20 16 D20"],
  115: ["T20 15 D20"],
  114: ["T20 14 D20"],
  113: ["T20 13 D20"],
  112: ["T20 12 D20"],
  111: ["T20 11 D20"],
  110: ["T20 10 D20"],
  109: ["T20 9 D20"],
  108: ["T20 8 D20"],
  107: ["T19 10 D20"],
  106: ["T20 6 D20"],
  105: ["T20 13 D16"],
  104: ["T18 18 D16"],
  103: ["T17 12 D20"],
  102: ["T20 10 D16"],
  101: ["T17 10 D20"],
  100: ["T20 D20"],
  99: ["T19 10 D16"],
  98: ["T20 D19"],
  97: ["T19 D20"],
  96: ["T20 D18"],
  95: ["T19 D19"],
  94: ["T18 D20"],
  93: ["T19 D18"],
  92: ["T20 D16"],
  91: ["T17 D20"],
  90: ["T18 D18"],
  89: ["T19 D16"],
  88: ["T16 D20"],
  87: ["T17 D18"],
  86: ["T18 D16"],
  85: ["T15 D20"],
  84: ["T20 D12"],
  83: ["T17 D16"],
  82: ["Bull D16"],
  81: ["T19 D12"],
  80: ["T20 D10"],
  79: ["T13 D20"],
  78: ["T18 D12"],
  77: ["T19 D10"],
  76: ["T20 D8"],
  75: ["T17 D12"],
  74: ["T14 D16"],
  73: ["T19 D8"],
  72: ["T16 D12"],
  71: ["T13 D16"],
  70: ["T18 D8"],
  69: ["T19 D6"],
  68: ["T20 D4"],
  67: ["T17 D8"],
  66: ["T10 D18"],
  65: ["T19 D4"],
  64: ["T16 D8"],
  63: ["T13 D12"],
  62: ["T10 D16"],
  61: ["T15 D8"],
  60: ["20 D20"],
  59: ["19 D20"],
  58: ["18 D20"],
  57: ["17 D20"],
  56: ["16 D20"],
  55: ["15 D20"],
  54: ["14 D20"],
  53: ["13 D20"],
  52: ["12 D20"],
  51: ["11 D20"],
  50: ["10 D20"],
  49: ["9 D20"],
  48: ["16 D16"],
  47: ["15 D16"],
  46: ["14 D16"],
  45: ["13 D16"],
  44: ["12 D16"],
  43: ["11 D16"],
  42: ["10 D16"],
  41: ["9 D16"],
  40: ["D20"],
  39: ["7 D16"],
  38: ["D19"],
  37: ["5 D16"],
  36: ["D18"],
  35: ["3 D16"],
  34: ["D17"],
  33: ["1 D16"],
  32: ["D16"],
  31: ["15 D8"],
  30: ["D15"],
  29: ["13 D8"],
  28: ["D14"],
  27: ["11 D8"],
  26: ["D13"],
  25: ["9 D8"],
  24: ["D12"],
  23: ["7 D8"],
  22: ["D11"],
  21: ["5 D8"],
  20: ["D10"],
  19: ["3 D8"],
  18: ["D9"],
  17: ["1 D8"],
  16: ["D8"],
  15: ["7 D4"],
  14: ["D7"],
  13: ["5 D4"],
  12: ["D6"],
  11: ["3 D4"],
  10: ["D5"],
  9: ["1 D4"],
  8: ["D4"],
  7: ["3 D2"],
  6: ["D3"],
  5: ["1 D2"],
  4: ["D2"],
  3: ["1 D1"],
  2: ["D1"],
  1: ["No finish"]
};

function renderFinish(score) {
  finishDiv.innerHTML = '';
  const dartsThisTurn = darts.length % 3;
  const dartsLeft = 3 - dartsThisTurn;

  function getPossibleFinishes(score, dartsLeft) {
    if (score > 170 || score < 2) return [];
    const outs = finishes[score];
    if (!outs || outs[0] === "No finish") return [];
    if (dartsLeft === 3) return outs;
    return outs.filter(suggestion => {
      const parts = suggestion.split(' ');
      if (dartsLeft === 2) return parts.length <= 2;
      if (dartsLeft === 1) {
        return parts.length === 1 && (parts[0].startsWith('D') || parts[0] === 'Bull');
      }
      return true;
    });
  }

  const possible = getPossibleFinishes(score, dartsLeft);

  if (possible.length === 0) {
    const noFinish = document.createElement('div');
    noFinish.className = 'no-finish';
    noFinish.textContent = 'No finish';
    finishDiv.appendChild(noFinish);
    return;
  }
  possible.forEach(suggestion => {
    const sugDiv = document.createElement('div');
    sugDiv.className = 'finish-suggestion';
    sugDiv.textContent = suggestion;
    finishDiv.appendChild(sugDiv);
  });
}

// Initial render
renderTabs();
renderFinish(score);
updateUndoButton();

