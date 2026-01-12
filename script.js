const numbers = [...Array(20).keys()].map(i => i + 1).concat(['Bull', 0]);
const scoreDiv = document.getElementById('score');
const buttonsDiv = document.getElementById('buttons');
const historyDiv = document.getElementById('history');
const finishDiv = document.getElementById('finish');
const undoBtn = document.getElementById('undo');
const tabsContainer = document.getElementById('tabs-container');

// Player state management
let players = [
  { id: 1, name: 'Player 1', score: 501, darts: [], multiplier: 1, totalDarts: 0, totalScore: 0 }
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
    multiplier: 1,
    totalDarts: 0,
    totalScore: 0
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
    player.totalDarts++;
    player.totalScore += value;
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
    player.totalDarts--;
    player.totalScore -= lastDart.value;
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

  // Calculate and display 3-dart average using cumulative stats
  const player = getCurrentPlayer();
  if (player.totalDarts > 0) {
    const threeDartAverage = (player.totalScore / player.totalDarts * 3).toFixed(2);

    const avgDiv = document.createElement('div');
    avgDiv.style.marginBottom = '16px';
    avgDiv.style.padding = '10px 14px';
    avgDiv.style.background = 'linear-gradient(145deg, #74b9ff, #0984e3)';
    avgDiv.style.borderRadius = '10px';
    avgDiv.style.fontWeight = 'bold';
    avgDiv.style.fontSize = '18px';
    avgDiv.style.color = '#fff';
    avgDiv.style.boxShadow = '0 3px 8px rgba(0,0,0,0.15)';
    avgDiv.textContent = `3-Dart Average: ${threeDartAverage}`;
    historyDiv.appendChild(avgDiv);
  }

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

// Comprehensive finish table with proper 1-dart, 2-dart, and 3-dart combinations
const finishes = {
  170: ["T20 T20 Bull"],
  169: ["No finish"],
  168: ["No finish"],
  167: ["T20 T19 Bull"],
  164: ["T20 T18 Bull", "T19 T19 Bull"],
  161: ["T20 T17 Bull"],
  160: ["T20 T20 D20"],
  158: ["T20 T20 D19"],
  157: ["T20 T19 D20"],
  156: ["T20 T20 D18"],
  155: ["T20 T19 D19"],
  154: ["T20 T18 D20", "T18 T20 D20"],
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
  137: ["T20 T19 D10", "T19 T20 D10", "T19 D20"],
  136: ["T20 T20 D8"],
  135: ["T20 T17 D12", "Bull T15 D20"],
  134: ["T20 T14 D16", "T14 T20 D16"],
  133: ["T20 T19 D8"],
  132: ["Bull Bull D16", "T20 T16 D12"],
  131: ["T20 T13 D16", "T19 T14 D16"],
  130: ["T20 T18 D8", "T20 Bull", "Bull Bull"],
  129: ["T19 T16 D12"],
  128: ["T18 T14 D16", "T18 Bull"],
  127: ["T20 T17 D8", "T17 D20"],
  126: ["T19 T19 D6"],
  125: ["T18 T19 D8"],
  124: ["T20 T16 D8", "T20 D16"],
  123: ["T19 T16 D9"],
  122: ["T18 T20 D4", "T18 D16"],
  121: ["T20 T11 D14", "T17 Bull"],
  120: ["T20 20 D20", "T20 D20"],
  119: ["T19 10 D16", "T19 Bull"],
  118: ["T20 18 D20", "T18 D20"],
  117: ["T20 17 D20", "T19 D20"],
  116: ["T20 16 D20", "T20 D18"],
  115: ["T20 15 D20", "T19 D19"],
  114: ["T20 14 D20", "T20 D17"],
  113: ["T20 13 D20", "T19 D18"],
  112: ["T20 12 D20", "T20 D16"],
  111: ["T20 11 D20", "T17 D20"],
  110: ["T20 10 D20", "T20 Bull", "Bull D20"],
  109: ["T20 9 D20", "T19 D16"],
  108: ["T20 8 D20", "T20 D14"],
  107: ["T19 10 D20", "T19 Bull", "Bull D18"],
  106: ["T20 6 D20", "T20 D13"],
  105: ["T20 13 D16", "T20 D15", "T15 D20"],
  104: ["T18 18 D16", "T18 Bull", "T20 D12"],
  103: ["T17 12 D20", "T17 D16"],
  102: ["T20 10 D16", "T20 D11"],
  101: ["T17 10 D20", "T17 Bull", "Bull D20"],
  100: ["T20 D20", "T16 D16"],
  99: ["T19 10 D16", "T19 D11"],
  98: ["T20 D19", "T16 D15"],
  97: ["T19 D20", "T15 D16"],
  96: ["T20 D18", "T16 D14"],
  95: ["T19 D19", "T13 D18"],
  94: ["T18 D20", "T14 D16"],
  93: ["T19 D18", "T13 D17"],
  92: ["T20 D16", "T16 D12"],
  91: ["T17 D20", "T13 D16"],
  90: ["T18 D18", "T20 D15"],
  89: ["T19 D16", "T13 D15"],
  88: ["T16 D20", "T20 D14"],
  87: ["T17 D18", "T13 D14"],
  86: ["T18 D16", "T14 D14"],
  85: ["T15 D20", "T19 D14"],
  84: ["T20 D12", "T16 D18"],
  83: ["T17 D16", "T13 D13"],
  82: ["Bull D16", "T14 D20"],
  81: ["T19 D12", "T15 D18"],
  80: ["T20 D10", "T16 D16"],
  79: ["T13 D20", "T19 D11"],
  78: ["T18 D12", "T14 D18"],
  77: ["T19 D10", "T15 D16"],
  76: ["T20 D8", "T16 D14"],
  75: ["T17 D12", "T13 D18"],
  74: ["T14 D16", "T16 D13"],
  73: ["T19 D8", "T15 D14"],
  72: ["T16 D12", "T20 D6"],
  71: ["T13 D16", "T17 D10"],
  70: ["T18 D8", "T10 D20"],
  69: ["T19 D6", "T15 D12"],
  68: ["T20 D4", "T16 D10"],
  67: ["T17 D8", "T9 D20"],
  66: ["T10 D18", "T16 D9"],
  65: ["T19 D4", "T11 D16"],
  64: ["T16 D8", "T14 D11"],
  63: ["T13 D12", "T17 D6"],
  62: ["T10 D16", "T12 D13"],
  61: ["T15 D8", "T11 D14"],
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
  50: ["10 D20", "Bull"],
  49: ["9 D20"],
  48: ["16 D16", "8 D20"],
  47: ["15 D16", "7 D20"],
  46: ["14 D16", "6 D20"],
  45: ["13 D16", "5 D20"],
  44: ["12 D16", "4 D20"],
  43: ["11 D16", "3 D20"],
  42: ["10 D16", "2 D20"],
  41: ["9 D16", "1 D20"],
  40: ["D20", "8 D16"],
  39: ["7 D16"],
  38: ["D19", "6 D16"],
  37: ["5 D16"],
  36: ["D18", "4 D16"],
  35: ["3 D16"],
  34: ["D17", "2 D16"],
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

