/* ==========================================================
   SZULERNIA CALIONU - SILNIK PvE (v0.2.6)
   ========================================================== */

const SUITS = [
  { name: 'pik', symbol: '♠', red: false },
  { name: 'kier', symbol: '♥', red: true },
  { name: 'karo', symbol: '♦', red: true },
  { name: 'trefl', symbol: '♣', red: false }
];

const RANKS = [
  { val: 14, name: 'A', score: 11 },
  { val: 13, name: 'K', score: 10 },
  { val: 12, name: 'Q', score: 10 },
  { val: 11, name: 'J', score: 10 },
  { val: 10, name: '10', score: 10 },
  { val: 9, name: '9', score: 9 },
  { val: 8, name: '8', score: 8 },
  { val: 7, name: '7', score: 7 },
  { val: 6, name: '6', score: 6 },
  { val: 5, name: '5', score: 5 },
  { val: 4, name: '4', score: 4 },
  { val: 3, name: '3', score: 3 },
  { val: 2, name: '2', score: 2 }
];

// Stan gracza w trakcie wyprawy
let player = {
  hp: 750,
  maxHp: 750,
  gold: 25,
  exp: 0,
  expNext: 100,
  lvl: 1,
  shield: 0
};

// Stan aktualnego pojedynku
let duel = {
  active: false,
  phase: 'attack', // 'attack' lub 'shield'
  discardsLeft: 5,
  deck: [],
  hand: [],
  attackCards: [],
  shieldCards: [],
  enemy: {
    name: 'Zbir z Szulerni',
    hp: 500,
    maxHp: 500,
    shield: 0,
    baseDmg: 70
  }
};

let currentMapNode = null;

/* ----------------------------------------------------------
   ZARZĄDZANIE EKRANAMI
   ---------------------------------------------------------- */
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

/* ----------------------------------------------------------
   WYPRAWA I MAPA
   ---------------------------------------------------------- */
function startNewExpedition() {
  player.hp = 750;
  player.maxHp = 750;
  player.gold = 25;
  player.exp = 0;
  player.lvl = 1;
  player.expNext = 100;
  
  updateMapStats();
  buildSampleMap();
  showScreen('screen-map');
}

function updateMapStats() {
  document.getElementById('map-hp').textContent = player.hp;
  document.getElementById('map-max-hp').textContent = player.maxHp;
  document.getElementById('map-gold').textContent = player.gold;
  document.getElementById('map-exp').textContent = player.exp;
  document.getElementById('map-exp-next').textContent = player.expNext;
  document.getElementById('map-lvl').textContent = player.lvl;
}

function buildSampleMap() {
  const container = document.getElementById('map-nodes-container');
  container.innerHTML = '';
  
  // Prosta ścieżka demonstracyjna: Piętro 1, 2, Boss
  const sampleNodes = [
    { id: 1, type: 'combat', label: '⚔️', x: 50, y: 700, target: true },
    { id: 2, type: 'shop', label: '🪙', x: 30, y: 500, target: false },
    { id: 3, type: 'combat', label: '⚔️', x: 70, y: 500, target: false },
    { id: 4, type: 'boss', label: '👑', x: 50, y: 300, target: false }
  ];

  sampleNodes.forEach(node => {
    const el = document.createElement('div');
    el.className = `map-node ${node.target ? 'active-target' : ''}`;
    el.style.left = node.x + '%';
    el.style.top = node.y + 'px';
    el.textContent = node.label;
    el.onclick = () => onNodeClicked(node);
    container.appendChild(el);
  });
}

function onNodeClicked(node) {
  currentMapNode = node;
  if (node.type === 'combat' || node.type === 'boss') {
    startCombat(node.type === 'boss');
  } else if (node.type === 'shop') {
    document.getElementById('modal-shop').style.display = 'flex';
  }
}

/* ----------------------------------------------------------
   MECHANIKA TALII I KART
   ---------------------------------------------------------- */
function generateDeck() {
  const deck = [];
  let id = 1;
  SUITS.forEach(s => {
    RANKS.forEach(r => {
      deck.push({ id: id++, suit: s.name, symbol: s.symbol, red: s.red, rank: r.val, name: r.name, score: r.score });
    });
  });
  return deck.sort(() => Math.random() - 0.5);
}

function startCombat(isBoss) {
  duel.active = true;
  duel.phase = 'attack';
  duel.discardsLeft = 5;
  duel.attackCards = [];
  duel.shieldCards = [];
  player.shield = 0;

  if (isBoss) {
    duel.enemy = { name: '👑 Kapitan Leoryk', hp: 1200, maxHp: 1200, shield: 0, baseDmg: 120 };
  } else {
    duel.enemy = { name: 'Zbir z Szulerni', hp: 550, maxHp: 550, shield: 0, baseDmg: 65 };
  }

  duel.deck = generateDeck();
  duel.hand = duel.deck.splice(0, 8);
  duel.hand.sort((a, b) => b.rank - a.rank);

  updateCombatUI();
  renderHand();
  showScreen('screen-combat');
}

function renderHand() {
  const handEl = document.getElementById('player-hand');
  handEl.innerHTML = '';

  duel.hand.forEach(card => {
    const cEl = document.createElement('div');
    const isAtt = duel.attackCards.includes(card.id);
    const isShd = duel.shieldCards.includes(card.id);

    cEl.className = `card ${card.red ? 'red' : ''} ${isAtt ? 'selected-attack' : ''} ${isShd ? 'selected-shield' : ''}`;
    cEl.innerHTML = `
      <span class="card-val">${card.name}</span>
      <span class="card-suit">${card.symbol}</span>
    `;
    cEl.onclick = () => toggleCardSelection(card.id);
    handEl.appendChild(cEl);
  });

  evaluateCurrentSelection();
}

function toggleCardSelection(id) {
  if (duel.phase === 'attack') {
    if (duel.attackCards.includes(id)) {
      duel.attackCards = duel.attackCards.filter(c => c !== id);
    } else if (duel.attackCards.length < 5) {
      duel.attackCards.push(id);
    }
  } else if (duel.phase === 'shield') {
    if (duel.attackCards.includes(id)) return; // Karta zużyta na atak
    if (duel.shieldCards.includes(id)) {
      duel.shieldCards = duel.shieldCards.filter(c => c !== id);
    } else if (duel.shieldCards.length < 3) {
      duel.shieldCards.push(id);
    }
  }
  renderHand();
}

/* ----------------------------------------------------------
   OCENA UKŁADU POKEROWEGO
   ---------------------------------------------------------- */
function evaluateCurrentSelection() {
  const banner = document.getElementById('hand-rating-banner');
  const targetIds = (duel.phase === 'attack') ? duel.attackCards : duel.shieldCards;
  const cards = duel.hand.filter(c => targetIds.includes(c.id));

  if (cards.length === 0) {
    banner.textContent = (duel.phase === 'attack') ? 'Wybierz do 5 kart ataku' : 'Wybierz do 3 kart na pancerz';
    return;
  }

  const res = scorePokerHand(cards);
  banner.textContent = `${res.name} (x${res.mult} Mult | +${res.chips} Pkt)`;
}

function scorePokerHand(cards) {
  // Prosty ewaluator figur
  const counts = {};
  cards.forEach(c => counts[c.rank] = (counts[c.rank] || 0) + 1);
  const qty = Object.values(counts).sort((a,b) => b - a);

  let chips = cards.reduce((s, c) => s + c.score, 0);

  if (qty[0] === 4) return { name: 'Kareta', mult: 7, chips };
  if (qty[0] === 3 && qty[1] === 2) return { name: 'Full', mult: 5, chips };
  if (qty[0] === 3) return { name: 'Trójka', mult: 3, chips };
  if (qty[0] === 2 && qty[1] === 2) return { name: 'Dwie Pary', mult: 2, chips };
  if (qty[0] === 2) return { name: 'Para', mult: 1.5, chips };
  return { name: 'Wysoka Karta', mult: 1, chips };
}

/* ----------------------------------------------------------
   AKCJE PODCZAS POJEDYNKU
   ---------------------------------------------------------- */
function onPrimaryCombatAction() {
  const btn = document.getElementById('btn-action-primary');

  if (duel.phase === 'attack') {
    if (duel.attackCards.length === 0) return;
    duel.phase = 'shield';
    btn.textContent = 'ZATWIERDŹ TURĘ';
    btn.className = 'btn btn-large btn-gold';
    document.getElementById('combat-phase-badge').textContent = 'FAZA TARCZY';
    document.getElementById('combat-phase-badge').style.background = '#3498db';
    renderHand();
  } else if (duel.phase === 'shield') {
    resolveFullCombatRound();
  }
}

function onSecondaryCombatAction() {
  if (duel.phase === 'shield') {
    // Cofnij do ataku
    duel.phase = 'attack';
    duel.shieldCards = [];
    document.getElementById('btn-action-primary').textContent = 'ZATWIERDŹ ATAK';
    document.getElementById('combat-phase-badge').textContent = 'FAZA ATAKU';
    document.getElementById('combat-phase-badge').style.background = '#e2872d';
    renderHand();
    return;
  }

  // Wymiana (Discard)
  if (duel.discardsLeft <= 0 || duel.attackCards.length === 0) return;
  duel.discardsLeft--;
  duel.hand = duel.hand.filter(c => !duel.attackCards.includes(c.id));
  
  const toDraw = 8 - duel.hand.length;
  if (duel.deck.length < toDraw) duel.deck = generateDeck();
  duel.hand.push(...duel.deck.splice(0, toDraw));
  duel.hand.sort((a, b) => b.rank - a.rank);

  duel.attackCards = [];
  updateCombatUI();
  renderHand();
}

function resolveFullCombatRound() {
  // 1. Gracz Atakuje
  const atkCards = duel.hand.filter(c => duel.attackCards.includes(c.id));
  const atkEval = scorePokerHand(atkCards);
  const totalDmg = Math.round(atkEval.chips * atkEval.mult);

  duel.enemy.hp = Math.max(0, duel.enemy.hp - totalDmg);

  // 2. Gracz buduje tarczę
  const shdCards = duel.hand.filter(c => duel.shieldCards.includes(c.id));
  const shdEval = scorePokerHand(shdCards);
  player.shield = Math.round(shdEval.chips * shdEval.mult);

  document.getElementById('combat-log').textContent = `Zadałeś ${totalDmg} DMG! Twoja obrona: ${player.shield}`;

  // Sprawdzenie pokonania wroga
  if (duel.enemy.hp <= 0) {
    onEnemyDefeated();
    return;
  }

  // 3. Tura wroga
  setTimeout(() => {
    let enemyAtk = duel.enemy.baseDmg;
    let blocked = Math.min(player.shield, enemyAtk);
    let absorbed = enemyAtk - blocked;

    player.shield -= blocked;
    player.hp = Math.max(0, player.hp - absorbed);

    document.getElementById('combat-log').textContent = `${duel.enemy.name} uderza za ${enemyAtk}! (Zablokowano: ${blocked})`;

    if (player.hp <= 0) {
      alert("Poległeś w szulerni Calionu!");
      showScreen('screen-lobby');
      return;
    }

    // Reset na nową turę
    duel.phase = 'attack';
    duel.attackCards = [];
    duel.shieldCards = [];
    duel.discardsLeft = 5;
    duel.deck = generateDeck();
    duel.hand = duel.deck.splice(0, 8);
    duel.hand.sort((a, b) => b.rank - a.rank);

    document.getElementById('btn-action-primary').textContent = 'ZATWIERDŹ ATAK';
    document.getElementById('combat-phase-badge').textContent = 'FAZA ATAKU';
    document.getElementById('combat-phase-badge').style.background = '#e2872d';

    updateCombatUI();
    renderHand();
  }, 900);

  updateCombatUI();
}

function onEnemyDefeated() {
  player.gold += 15;
  player.exp += 50;
  player.hp = Math.min(player.maxHp, player.hp + 150); // Nagroda: leczenie po walce

  if (player.exp >= player.expNext) {
    player.lvl++;
    player.maxHp += 100;
    player.hp += 100;
    player.exp = 0;
    player.expNext = Math.round(player.expNext * 1.5);
  }

  alert("Zwycięstwo! +15 monet, +50 EXP, wyleczono 150 HP.");
  updateMapStats();
  showScreen('screen-map');
}

function updateCombatUI() {
  document.getElementById('combat-player-hp').textContent = player.hp;
  document.getElementById('combat-player-max-hp').textContent = player.maxHp;
  document.getElementById('combat-player-bar').style.width = (player.hp / player.maxHp * 100) + '%';
  document.getElementById('combat-player-shield').textContent = player.shield;

  document.getElementById('enemy-combat-name').textContent = duel.enemy.name;
  document.getElementById('combat-enemy-hp').textContent = duel.enemy.hp;
  document.getElementById('combat-enemy-max-hp').textContent = duel.enemy.maxHp;
  document.getElementById('combat-enemy-bar').style.width = (duel.enemy.hp / duel.enemy.maxHp * 100) + '%';
  document.getElementById('combat-enemy-shield').textContent = duel.enemy.shield;

  document.getElementById('combat-discards').textContent = duel.discardsLeft;
}

/* ----------------------------------------------------------
   FUNKCJE POMOCNICZE / MODALE
   ---------------------------------------------------------- */
function openScoreCheatSheet() { document.getElementById('modal-scores').style.display = 'flex'; }
function closeScoreCheatSheet() { document.getElementById('modal-scores').style.display = 'none'; }
function closeShopAndBackToMap() {
  document.getElementById('modal-shop').style.display = 'none';
  showScreen('screen-map');
}
function abandonExpedition() {
  if (confirm("Czy na pewno chcesz porzucić wyprawę?")) {
    showScreen('screen-lobby');
  }
}
