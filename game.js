function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen();
    }
}

// --- GRAFIKI WEKTOROWE SVG DLA MIKSTUR ---
const buildSVG = (color, path, size) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="vertical-align:middle; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.8));"><rect x="10" y="2" width="4" height="2" fill="#8d6e63" rx="1"/><rect x="10.5" y="4" width="3" height="3" fill="#555"/><path d="${path}" fill="${color}" stroke="#fff" stroke-width="0.5"/><path d="M8 18 L9 13" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/></svg>`;
const hourglassSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f1c40f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.8));"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>`;

const pathFlask = "M9 7 L15 7 L19 19 C19.5 20.5 18 21.5 17 21.5 L7 21.5 C6 21.5 4.5 20.5 5 19 Z";
const pathRound = "M10 7 L14 7 L18 13 C20 17 18 21.5 12 21.5 C6 21.5 4 17 6 13 Z";

const SHOP_ITEMS = [
    // Mikstury leczenia (dwa miejsca u handlarza)
    { id: 'heal_small', name: 'Mała Mikstura Życia', icon: buildSVG('#2ecc71', pathRound, 18), desc: 'Przywraca 40 HP', price: 20, category: 'healing', heal: 40 },
    { id: 'heal_medium', name: 'Średnia Mikstura Życia', icon: buildSVG('#27ae60', pathRound, 22), desc: 'Przywraca 80 HP', price: 35, category: 'healing', heal: 80 },
    { id: 'heal_large', name: 'Duża Mikstura Życia', icon: buildSVG('#16a085', pathRound, 26), desc: 'Przywraca 140 HP', price: 55, category: 'healing', heal: 140 },
    { id: 'heal_regen', name: 'Mikstura Regeneracji', icon: buildSVG('#58d68d', pathFlask, 22), desc: 'Przywraca 20 HP co turę przez 3 tury walki', price: 25, category: 'healing' },

    // Jednorazowe (dwa miejsca u handlarza)
    { id: 'glove', name: 'Rękawica Szulera', icon: '🧤', desc: 'Otrzymujesz 2 dodatkowe odrzuty', price: 20, category: 'consumable' },
    { id: 'dice', name: 'Szczęśliwe Kości x3', icon: '🎲', desc: '3 użycia. Wynik 1 = 0 DMG; 2–6 dodaje wynik × 0,5 do mnożnika obrażeń', price: 40, category: 'consumable' },
    { id: 'pow1', name: 'Mała Miks. Mocy', icon: buildSVG('#e67e22', pathRound, 18), desc: '+10 DMG przez 3 ataki', price: 19, category: 'consumable' },
    { id: 'pow2', name: 'Średnia Miks. Mocy', icon: buildSVG('#e74c3c', pathRound, 22), desc: '+15 DMG przez 3 ataki', price: 30, category: 'consumable' },
    { id: 'pow3', name: 'Duża Miks. Mocy', icon: buildSVG('#9b59b6', pathRound, 26), desc: '+20 DMG przez 3 ataki', price: 42, category: 'consumable' },
    // Zachowane wcześniejsze przedmioty
    { id: 'discard', name: 'Miks. Odrzucenia', icon: buildSVG('#3498db', pathFlask, 20), desc: 'Odnawia 1 wymianę kart', price: 15, category: 'consumable' },
    { id: 'shield_pot', name: 'Eliksir Pancerza', icon: buildSVG('#5dade2', pathRound, 20), desc: 'Natychmiast daje +25 Tarczy', price: 22, category: 'consumable' },
    { id: 'time', name: 'Złoty Zegar', icon: hourglassSVG, desc: 'Opóźnia Zmęczenie o 1 rundę', price: 35, category: 'consumable' },

    // Artefakty (jedno miejsce u handlarza)
    { id: 'lucky_coin', name: 'Szczęśliwa Moneta', icon: '🪙', desc: '10% szans przy każdym ataku na podwojenie mnożnika obrażeń', price: 80, category: 'relic', isRelic: true, badge: '🪙10%' },
    { id: 'karwasz', name: 'Żelazny Karwasz', icon: '🛡️', desc: '+10 Tarczy do każdej wystawionej Tarczy', price: 75, category: 'relic', isRelic: true, badge: '🛡️+10' },
    { id: 'iron_signet', name: 'Żelazny Sygnet', icon: '💍', desc: 'Atak Parą lub Dwiema Parami daje +5 Tarczy', price: 65, category: 'relic', isRelic: true, badge: '💍+5' },
    { id: 'blood_amulet', name: 'Krwawy Amulet', icon: '🩸', desc: 'Po zagraniu Fulla odzyskujesz 15 HP', price: 99, category: 'relic', isRelic: true, badge: '🩸+15' },
    { id: 'gambler_blade', name: 'Ostrze Hazardzisty', icon: '🗡️', desc: 'Wysoka Karta zadaje +30% obrażeń', price: 60, category: 'relic', isRelic: true, badge: '🗡️+30%' },
    { id: 'fortune_crystal', name: 'Kryształ Fortuny', icon: '💎', desc: 'Strit i Kolor zadają +10% obrażeń', price: 85, category: 'relic', isRelic: true, badge: '💎+10%' },
    { id: 'guardian_heart', name: 'Serce Strażnika', icon: '❤️‍🔥', desc: 'Na początku każdej walki otrzymujesz +20 Tarczy', price: 70, category: 'relic', isRelic: true, badge: '❤️‍🔥+20' },
    { id: 'phoenix_ash', name: 'Popiół Feniksa', icon: '🔥', desc: 'Raz na walkę, gdy HP spadnie poniżej 25%, odzyskujesz 50 HP', price: 110, category: 'relic', isRelic: true, badge: '🔥+50' },
    { id: 'triple_seal', name: 'Pieczęć Trójki', icon: '🔱', desc: 'Trójka zadaje +20% obrażeń', price: 70, category: 'relic', isRelic: true, badge: '🔱+20%' }
];

const REGULAR_ENEMIES = [
    { id: 'thug', name: 'Nożownik z Zaułka', traitName: 'Brak cechy', desc: 'Zwykły portowy zabijaka' },
    { id: 'sailor', name: 'Pijany Marynarz', traitName: 'Brak cechy', desc: 'Szuka zaczepki przy kuflu' },
    { id: 'smuggler', name: 'Przemytnik z Doków', traitName: 'Brak cechy', desc: 'Pilnuje trefnego towaru' }
];

const ELITE_ENEMIES = [
    { id: 'shield_15', name: 'Tarczownik z Portu', traitName: 'Tarcza', desc: 'Blokuje 15% otrzymywanych obrażeń z ataku' },
    { id: 'block_high', name: 'Szuler z Doków', traitName: 'Blok', desc: 'Co 3. rundę blokuje Twoją najwyższą kartę na ręce (🔒)' },
    { id: 'weaken_10', name: 'Rębajło Karczemny', traitName: 'Osłabienie', desc: 'Zmniejsza zadawane przez Ciebie obrażenia o 10%' },
    { id: 'insistent', name: 'Zbir z Zaułka', traitName: 'Natarczywy', desc: 'Obniża startową liczbę odrzuceń o 2' },
    { id: 'iron_guard', name: 'Strażnik Popiołów', traitName: 'Żelazna Garda', desc: 'Zaczyna każdą rundę z tarczą +15 🛡' }
];

const CALION_BOSSES = [
    { id: 'boss_kael', name: 'Kael Dravos „Barbarzyńca”', traitName: 'Szał', desc: 'Po utracie >150 HP wpada w Szał i zadaje +10% obrażeń do końca walki' },
    { id: 'boss_corven', name: 'Matthew Corven „Żelazny Dowódca”', traitName: 'Żelazna Obrona', desc: 'Redukuje otrzymywane obrażenia o 15%. Poniżej 50% HP jednorazowo blokuje 100% Twojego następnego ataku' },
    { id: 'boss_varek', name: 'Varek Czysty', traitName: 'Igiełkowy Paraliż', desc: 'W każdej rundzie paraliżuje 1 losową kartę w Twojej ręce (🔒)' },
    { id: 'boss_riwi', name: 'Riven Wistlow „Riwi”', traitName: 'Obcięcie Palca', desc: 'Po Twoim pierwszym ataku odcina Ci palec — limit kart na ręce spada z 8 do 7 do końca walki' },
    { id: 'boss_flinch', name: 'Dorian Flinch „Mr. Fox”', traitName: 'Pijawka Krwi', desc: 'Co 2. rundę po ataku leczy się o 50% zadanych Ci w HP obrażeń (pełny blok tarczą zapobiega leczeniu)' },
    { id: 'boss_farron', name: 'Farron Lockhide „Fogborn”', traitName: 'Błyskawiczna Kontra', desc: 'Gdy zagrasz Wysoką Kartę lub Parę w ataku, natychmiast strzela z pistoletu za 15 DMG' },
    { id: 'boss_daren', name: 'Daren Velk', traitName: 'Zatruty Sztylet', desc: 'Każdy jego atak nakłada +1 ładunek Trucizny (5 DMG co rundę za każdy ładunek, omija tarczę)' },
    { id: 'boss_lokar', name: 'Lokar', traitName: 'Szał Bojowy', desc: 'Gdy jego HP spadnie poniżej 30%, wyprowadza podwójny atak w swojej turze' }
];

const suits = [{ s: '♠', c: 'black' }, { s: '♥', c: 'red' }, { s: '♦', c: 'red' }, { s: '♣', c: 'black' }];
const ranks = ['A','K','Q','J','10','9','8','7','6','5','4','3','2'];
const valMap = { '2':2, '3':3, '4':4, '5':5, '6':6, '7':7, '8':8, '9':9, '10':10, 'J':10, 'Q':10, 'K':10, 'A':10 };
const rankOrder = new Map(ranks.map((rank, index) => [rank, index]));
const HAND_SIZE = 8, MAX_INV = 3, MAX_DISCARDS = 5;
const HAND_WIN_BONUS = { 'Poker': 5, 'Kareta': 3, 'Full': 3, 'Kolor': 2, 'Strit': 1, 'Trójka': 1 };

let deck = [], discardPile = [], hand = [], selectedCards = [];
let discardsLeft = MAX_DISCARDS, currentDamage = 0, coins = 0;
let currentFightBonus = 0, pendingDiceRoll = 0;
let rewardedHandsThisFight = new Set();
let inventory = [];
let relics = {};
let devShopOffers = null;
let currentEnemyTrait = null;
let lockedCardId = null;
let activeBuff = { dmg: 0, turns: 0 };
let gameOver = true, animateNextRender = true, shopReturnsToMenu = false, handResolutionPending = false;
let confirmItemIdx = -1, pendingBuyItemIdx = -1;
let runStartedAt = 0, runFinishedAt = 0;

let runStats = { enemiesDefeated: 0, totalDamage: 0, discards: 0, bestHandName: "-", bestHandDmg: 0, coinsEarned: 0, bossesDefeated: 0 };

const DUEL = {
    START_HP: 750,
    ZBIR_BASE_HP: 500,
    ELITE_BASE_HP: 750,
    BOSS_BASE_HP: 900,
    ACT_HP_STEP: 125,
    POST_FIGHT_HEAL: 150,
    LEVEL_UP_HP: 100,
    ENEMY_HAND: 8,
    CAP_PCT: 0.20,
    FATIGUE_ROUND: 10,
    FATIGUE_MULT: 1.25,
    SHIELD_MAX_CARDS: 3,
    SHIELD_MULT: 2,
    PLAY_LIMIT: 8,
    KARWASZ_BONUS: 10,     POISON_DMG: 5
};
let shieldCards = [];

let mapRun = {
    active: false,
    act: 1,
    playerHp: DUEL.START_HP,
    playerMaxHp: DUEL.START_HP,
    level: 1,
    xp: 0,
    xpNext: 100,
    boss: null,
    nodes: [],
    currentNodeId: 0,
    visitedNodes: new Set()
};

function newDuelState() {
    return {
        active: false, phase: 'attack', token: 0, round: 1, streak: 0,
        playerHp: DUEL.START_HP, playerMaxHp: DUEL.START_HP,
        enemyHp: DUEL.ZBIR_BASE_HP, enemyMaxHp: DUEL.ZBIR_BASE_HP,
        playerShield: 0, enemyShield: 0, fatigueRound: DUEL.FATIGUE_ROUND, fatigueShown: false,
        handLimit: HAND_SIZE, poisonStacks: 0, regenTurns: 0, phoenixUsed: false,
        corvenBlockArmed: false, corvenBlockTriggered: false, lokarFrenzyUsed: false, kaelEnraged: false,
        enemyCards: [], stats: { dealt: 0, taken: 0, blocked: 0, bestName: '-', bestDmg: 0 }
    };
}
let duel = newDuelState();

const HAND_RULES = {
    poker: { name: 'Poker', baseChips: 100, mult: 8 },
    fourKind: { name: 'Kareta', baseChips: 60, mult: 7 },
    fullHouse: { name: 'Full', baseChips: 40, mult: 4 },
    flush: { name: 'Kolor', baseChips: 35, mult: 4 },
    straight: { name: 'Strit', baseChips: 30, mult: 4 },
    threeKind: { name: 'Trójka', baseChips: 30, mult: 3 },
    twoPair: { name: 'Dwie Pary', baseChips: 20, mult: 2 },
    pair: { name: 'Para', baseChips: 10, mult: 2 },
    highCard: { name: 'Wysoka Karta', baseChips: 5, mult: 1 }
};

function toggleModal(id, show) {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? 'flex' : 'none';
}

const HAPTIC_PATTERNS = {
    tap: 12,
    discard: 28,
    hit: [40, 24, 55],
    poker: [60, 30, 110],
    defeat: [80, 45, 80, 45, 220]
};

function playHaptic(type) {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
    try { navigator.vibrate(HAPTIC_PATTERNS[type] || 0); } catch (_) {}
}

function showFloatingText(msg, color, leftPercent, topPercent, fontSize="22px") {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.style.left = leftPercent;
    el.style.top = topPercent;
    el.style.color = color;
    el.style.fontSize = fontSize;
    el.innerHTML = msg;
    document.querySelector('.tavern-table').appendChild(el);
    setTimeout(() => el.remove(), 1800);
}

function pickRandomEnemyTrait() {
    return ELITE_ENEMIES[Math.floor(Math.random() * ELITE_ENEMIES.length)];
}

function pickRandomCalionBoss() {
    return CALION_BOSSES[Math.floor(Math.random() * CALION_BOSSES.length)];
}

function currentHandLimit() {
    return duel.active ? duel.handLimit : HAND_SIZE;
}

function updateLockedCard(reroll = false) {
    if (!reroll && lockedCardId && hand.some(card => card.id === lockedCardId)) return;
    lockedCardId = null;
    if (!currentEnemyTrait || hand.length === 0) return;

    if (currentEnemyTrait.id === 'block_high' && duel.round % 3 === 0) {
        const sorted = [...hand].sort((a, b) => rankOrder.get(a.rank) - rankOrder.get(b.rank));
        lockedCardId = sorted[0].id;
    } else if (currentEnemyTrait.id === 'boss_varek') {
        const randomCard = hand[Math.floor(Math.random() * hand.length)];
        lockedCardId = randomCard.id;
    }

    if (lockedCardId) {
        selectedCards = selectedCards.filter(id => id !== lockedCardId);
        shieldCards = shieldCards.filter(id => id !== lockedCardId);
    }
}

function openLobbySection(section) {
    const sections = {
        quests: {
            title: 'Zadania',
            html: '<p>Wypatruj dodatkowych wyzwań za Gwiazdki.</p><ul><li>Przykład: zagraj Full trzy razy.</li><li>Nagrody i aktywne zadania pojawią się w dalszym etapie.</li></ul>'
        },
        skills: {
            title: 'Umiejętności',
            html: '<p>Planowane pasywne ulepszenia kupowane za Gwiazdki:</p><ul><li>Atak i zarobek</li><li>Więcej slotów ekwipunku i odrzutów</li><li>Ulepszenia wybranych figur</li></ul><p>Rozwój umiejętności nie jest jeszcze aktywny.</p>'
        },
        achievements: {
            title: 'Osiągnięcia',
            html: '<p>Planowane cele wypraw:</p><ul><li>Pierwsza Krew — pokonaj pierwszego przeciwnika</li><li>Król Karciarzy — zagraj Pokera</li><li>Szuler — wygraj 10 walk</li><li>Pierwszy Boss — pokonaj pierwszego Bossa</li></ul>'
        }
    };
    const title = document.getElementById('lobbySectionTitle');
    const content = document.getElementById('lobbySectionContent');
    if (section === 'stats') {
        title.innerText = 'Statystyki wyprawy';
        const duration = runStartedAt ? formatDuration((runFinishedAt || Date.now()) - runStartedAt) : '—';
        content.innerHTML = `<p>Wyniki ostatniej wyprawy w tej sesji:</p><ul><li>Poziom postaci (Mapa): ${mapRun.level} (${mapRun.xp}/${mapRun.xpNext} EXP)</li><li>Pokonani przeciwnicy: ${runStats.enemiesDefeated}</li><li>Pokonani bossowie: ${runStats.bossesDefeated}</li><li>Zdobyte monety: ${runStats.coinsEarned}</li><li>Łączne obrażenia: ${runStats.totalDamage}</li><li>Największy cios: ${runStats.bestHandDmg} DMG (${runStats.bestHandName})</li><li>Odrzucone karty: ${runStats.discards}</li><li>Czas: ${duration}</li></ul>`;
    } else {
        title.innerText = sections[section].title;
        content.innerHTML = sections[section].html;
    }
    toggleModal('lobbySectionModal', true);
}

function createDeck() {
    let cards = [];
    for (const suit of suits) for (const rank of ranks) cards.push({ rank, suit: suit.s, color: suit.c, val: valMap[rank], id: `${suit.s}-${rank}` });
    return cards;
}

function shuffle(cards) {
    for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
    return cards;
}

function drawCards(count) {
    if (deck.length < count && discardPile.length > 0) { deck = deck.concat(shuffle(discardPile)); discardPile = []; }
    return deck.splice(0, count);
}

function initGame() {
    handResolutionPending = false;
    deck = shuffle(createDeck());
    discardPile = [];
    hand = deck.splice(0, currentHandLimit());
    selectedCards = []; shieldCards = [];
    duel.phase = 'attack';
    currentDamage = 0; animateNextRender = true;
    hand.sort((a, b) => rankOrder.get(a.rank) - rankOrder.get(b.rank));
    updateLockedCard();
    evaluateHand(); updateUI();
}

function toggleCard(id) {
    if (gameOver || handResolutionPending || !duel.active) return;
    if (id === lockedCardId) {
        playHaptic('discard');
        document.getElementById('log').innerText = '🔒 Ta karta jest sparaliżowana / zablokowana w tej rundzie!';
        return;
    }
    playHaptic('tap');
    if (duel.phase === 'attack') {
        if (selectedCards.includes(id)) selectedCards = selectedCards.filter(c => c !== id);
        else if (selectedCards.length < 5) selectedCards.push(id);
    } else if (duel.phase === 'shield') {
        if (selectedCards.includes(id)) return;
        if (shieldCards.includes(id)) shieldCards = shieldCards.filter(c => c !== id);
        else if (shieldCards.length < DUEL.SHIELD_MAX_CARDS) shieldCards.push(id);
    }
    evaluateHand(); updateUI();
}

function scoreCards(cards) {
    if (!cards || cards.length === 0) return null;

    let ranksCount = {}; let suitsCount = {};
    cards.forEach(c => { ranksCount[c.rank] = (ranksCount[c.rank] || 0) + 1; suitsCount[c.suit] = (suitsCount[c.suit] || 0) + 1; });
    let rankEntries = Object.entries(ranksCount).map(([r, c]) => ({rank: r, count: c, val: valMap[r]}));
    rankEntries.sort((a, b) => b.count - a.count || rankOrder.get(a.rank) - rankOrder.get(b.rank));

    let isFlush = cards.length === 5 && Object.values(suitsCount).some(c => c === 5);
    let isStraight = false;
    if (cards.length === 5) {
        const rankInd = cards.map(c => ranks.indexOf(c.rank)).sort((a,b) => a-b);
        isStraight = rankInd.every((rank, idx) => idx === 0 || rank === rankInd[idx - 1] + 1);
        if (!isStraight && rankInd.join(',') === '0,9,10,11,12') isStraight = true;
    }

    let rule = HAND_RULES.highCard; let scoringCards = [];

    if (isStraight && isFlush) { rule = HAND_RULES.poker; scoringCards = cards; }
    else if (rankEntries[0].count === 4) { rule = HAND_RULES.fourKind; scoringCards = cards.filter(c => c.rank === rankEntries[0].rank); }
    else if (rankEntries[0].count === 3 && (rankEntries[1] && rankEntries[1].count >= 2)) { rule = HAND_RULES.fullHouse; scoringCards = cards; }
    else if (isFlush) { rule = HAND_RULES.flush; scoringCards = cards; }
    else if (isStraight) { rule = HAND_RULES.straight; scoringCards = cards; }
    else if (rankEntries[0].count === 3) { rule = HAND_RULES.threeKind; scoringCards = cards.filter(c => c.rank === rankEntries[0].rank); }
    else if (rankEntries[0].count === 2 && (rankEntries[1] && rankEntries[1].count >= 2)) { rule = HAND_RULES.twoPair; scoringCards = cards.filter(c => c.rank === rankEntries[0].rank || c.rank === rankEntries[1].rank); }
    else if (rankEntries[0].count === 2) { rule = HAND_RULES.pair; scoringCards = cards.filter(c => c.rank === rankEntries[0].rank); }
    else { rule = HAND_RULES.highCard; scoringCards = [cards.reduce((best, card) => rankOrder.get(card.rank) < rankOrder.get(best.rank) ? card : best)]; }

    const sum = scoringCards.reduce((tot, card) => tot + card.val, 0);
    return { rule, scoringCards, sum };
}

function evaluateShieldCards(cards, includePlayerRelics = true) {
    if (!cards || cards.length === 0) {
        return { total: 0, name: 'Brak tarczy', formula: '0 🛡' };
    }
    const sc = scoreCards(cards);
    const karwaszBonus = (includePlayerRelics && relics.karwasz) ? DUEL.KARWASZ_BONUS : 0;
    const karwaszText = karwaszBonus > 0 ? ` + ${karwaszBonus} (Karwasz)` : '';

    if (sc.rule.name === 'Trójka') {
        const base = (sc.rule.baseChips + sc.sum) * sc.rule.mult;
        const total = base + karwaszBonus;
        return { total, name: 'Trójka w Tarczy', formula: `(${sc.rule.baseChips} + ${sc.sum}) x ${sc.rule.mult}${karwaszText} = +${total} 🛡` };
    }
    if (sc.rule.name === 'Para') {
        const pairShield = (sc.rule.baseChips + sc.sum) * sc.rule.mult;
        const extraCards = cards.filter(c => !sc.scoringCards.includes(c));
        const extraSum = extraCards.reduce((t, c) => t + c.val, 0) * DUEL.SHIELD_MULT;
        const total = pairShield + extraSum + karwaszBonus;
        const extraText = extraSum > 0 ? ` + ${extraSum} (dod. karta)` : '';
        return { total, name: 'Para w Tarczy', formula: `(${sc.rule.baseChips} + ${sc.sum}) x ${sc.rule.mult}${extraText}${karwaszText} = +${total} 🛡` };
    }

    const rawSum = cards.reduce((t, c) => t + c.val, 0);
    const base = rawSum * DUEL.SHIELD_MULT;
    const total = base + karwaszBonus;
    return { total, name: 'Tarcza (Wysokie Karty)', formula: `${rawSum} x ${DUEL.SHIELD_MULT}${karwaszText} = +${total} 🛡` };
}

function playerRelicDamageMultiplier(handName) {
    let bonus = 0;
    if (handName === 'Wysoka Karta' && relics.gambler_blade) bonus += 0.30;
    if ((handName === 'Strit' || handName === 'Kolor') && relics.fortune_crystal) bonus += 0.10;
    if (handName === 'Trójka' && relics.triple_seal) bonus += 0.20;
    return 1 + bonus;
}

function healPlayerBy(amount) {
    const before = duel.playerHp;
    duel.playerHp = Math.min(duel.playerMaxHp, duel.playerHp + amount);
    if (mapRun.active) mapRun.playerHp = duel.playerHp;
    return duel.playerHp - before;
}

function triggerPhoenixIfNeeded() {
    if (!relics.phoenix_ash || duel.phoenixUsed || !duel.active) return;
    if (duel.playerHp <= 0 || duel.playerHp >= duel.playerMaxHp * 0.25) return;
    duel.phoenixUsed = true;
    const healed = healPlayerBy(50);
    showFloatingText(`🔥 Feniks +${healed} HP`, '#2ecc71', '17%', '72%', '21px');
}

function computeAttackDamage(rule, sum, opts = {}) {
    const potionBonus = opts.potionBonus || 0;
    const dice = opts.dice || 0;
    const luckyMult = opts.luckyProc ? 2 : 1;
    let finalMultiplier = rule.mult;
    if (dice === 1) finalMultiplier = 0;
    else if (dice > 1) finalMultiplier += dice * 0.5;
    finalMultiplier *= luckyMult;

    const relicMult = opts.applyPlayerRelics ? playerRelicDamageMultiplier(rule.name) : 1;
    let damage = dice === 1 ? 0 : ((rule.baseChips + sum) * finalMultiplier + potionBonus) * relicMult;

    if (opts.applyEnemyTrait && currentEnemyTrait) {
        if (currentEnemyTrait.id === 'weaken_10') { damage = Math.floor(damage * 0.90); }
        else if (currentEnemyTrait.id === 'shield_15' || currentEnemyTrait.id === 'boss_corven') { damage = Math.floor(damage * 0.85); }
    }
    return { damage, finalMultiplier, potionBonus, relicMult };
}

function evaluateHand() {
    let active = hand.filter(c => selectedCards.includes(c.id));
    let attackRule = null;
    if (active.length === 0) {
        currentDamage = 0;
    } else {
        const { rule, sum } = scoreCards(active);
        attackRule = rule;
        const calc = computeAttackDamage(rule, sum, { potionBonus: activeBuff.turns > 0 ? activeBuff.dmg : 0, dice: pendingDiceRoll, applyEnemyTrait: true, applyPlayerRelics: true });
        currentDamage = calc.damage;

        if (duel.phase === 'attack') {
            document.getElementById('evalName').innerText = rule.name;
            if (pendingDiceRoll === 1) {
                document.getElementById('evalDmg').innerHTML = `🎲 Wyrzucono 1 — <span class="color-mult">x 0</span> = 0 DMG`;
                return;
            }
            if (duel.corvenBlockArmed) {
                document.getElementById('evalDmg').innerHTML = `🛡️ <b>Żelazna Obrona Corvena</b> zablokuje ten atak (0 DMG)! Poświęć słaby układ!`;
                return;
            }
            const potionText = calc.potionBonus > 0 ? ` + <span class="color-buff">${calc.potionBonus}</span>` : '';
            const relicText = calc.relicMult > 1 ? ` <span class="color-buff">× ${calc.relicMult.toFixed(2)} (artefakt)</span>` : '';
            const diceText = pendingDiceRoll > 1 ? ` <span class="color-buff">(+${(pendingDiceRoll * 0.5).toFixed(1)} za 🎲 ${pendingDiceRoll})</span>` : '';
            const hasReduction = currentEnemyTrait && (currentEnemyTrait.id === 'weaken_10' || currentEnemyTrait.id === 'shield_15' || currentEnemyTrait.id === 'boss_corven');
            const traitModText = hasReduction ? ` <span style="color:#f39c12">(${currentEnemyTrait.id === 'weaken_10' ? '-10%' : '-15%'} ${currentEnemyTrait.traitName})</span>` : '';
            document.getElementById('evalDmg').innerHTML = `(<span class="color-chips">${rule.baseChips}</span> + ${sum}) <span class="color-mult">x ${calc.finalMultiplier}</span>${diceText}${potionText}${relicText}${traitModText} = ${currentDamage} DMG`;
            return;
        }
    }

    if (duel.phase === 'shield') {
        const shieldHand = hand.filter(c => shieldCards.includes(c.id));
        const shEval = evaluateShieldCards(shieldHand, true);
        document.getElementById('evalName').innerText = shieldHand.length > 0 ? `${shEval.name} (${shieldHand.length}/3)` : `Wybierz tarczę (0/3)`;
        const effectiveDmg = duel.corvenBlockArmed ? 0 : Math.floor(currentDamage * fatigueMult());
        const atkSummary = active.length > 0 ? `⚔ ${attackRule.name} (${effectiveDmg} DMG)` : `⚔ Pominięty (0 DMG)`;
        document.getElementById('evalDmg').innerHTML = `${atkSummary} · <span class="color-chips">🛡 ${shEval.formula}</span>`;
        return;
    }

    document.getElementById('evalName').innerText = "Etap 1/2: Wybierz atak";
    document.getElementById('evalDmg').innerText = `Zadane Obrażenia: 0 (możesz kliknąć „Atak”, by pominąć)`;
}

function restartAnimation(element, className, removeClasses = []) {
    element.classList.remove(className, ...removeClasses);
    void element.offsetWidth;
    element.classList.add(className);
}

function playMotion(element, frames, duration, fallbackClass, removeClasses = []) {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof element.animate === 'function') {
        return element.animate(frames, { duration: reduceMotion ? Math.max(280, duration * 0.45) : duration, easing: 'ease-out' });
    }
    restartAnimation(element, fallbackClass, removeClasses);
    return null;
}

function animateScreenShake(table, strong = false) {
    const distance = strong ? 12 : 8;
    playMotion(table, [
        { transform: 'translate(0,0)' }, { transform: `translate(${-distance}px,3px)`, offset: 0.18 },
        { transform: `translate(${distance}px,-3px)`, offset: 0.36 }, { transform: `translate(${-distance + 2}px,-2px)`, offset: 0.54 },
        { transform: `translate(${distance - 2}px,2px)`, offset: 0.72 }, { transform: 'translate(0,0)' }
    ], 760, 'screen-shake', ['color-flash-red', 'color-flash-black']);
}

function animateEnemyHits(enemy, count) {
    const distance = count === 4 ? 11 : 9;
    const hitFrames = [{ transform: 'translateX(0) scale(1)', filter: 'brightness(1)' }];
    for (let hit = 0; hit < count; hit++) {
        const sign = hit % 2 === 0 ? -1 : 1;
        const start = 0.05 + hit * (0.84 / count);
        hitFrames.push({ transform: `translateX(${sign * distance}px) scale(1.18)`, filter: 'brightness(1.8)', textShadow: '0 0 12px rgba(255,80,50,.9)', offset: start });
        hitFrames.push({ transform: 'translateX(0) scale(1)', filter: 'brightness(1)', textShadow: 'none', offset: start + 0.09 });
    }
    hitFrames.push({ transform: 'translateX(0) scale(1)', filter: 'brightness(1)', textShadow: 'none' });
    playMotion(enemy, hitFrames, count === 4 ? 1300 : 1100, count === 4 ? 'enemy-four-hit' : 'enemy-three-hit', ['hit', 'enemy-four-hit', 'enemy-three-hit']);
}

function animateColorFlash(table, color) {
    const flash = document.createElement('div');
    flash.setAttribute('aria-hidden', 'true');
    Object.assign(flash.style, { position: 'absolute', top: '0', right: '0', bottom: '0', left: '0', zIndex: '60', pointerEvents: 'none' });
    flash.style.background = color === 'red' ? 'radial-gradient(ellipse,rgba(255,35,35,.48),rgba(130,0,0,.22) 55%,transparent 78%)' : 'radial-gradient(ellipse,rgba(230,235,245,.30),rgba(8,12,20,.58) 58%,rgba(0,0,0,.18))';
    if (color === 'black') flash.style.boxShadow = 'inset 0 0 45px rgba(230,235,245,.3)';
    table.appendChild(flash);
    if (typeof flash.animate === 'function') {
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const animation = flash.animate([{ opacity: 0 }, { opacity: 1, offset: 0.16 }, { opacity: 0 }], { duration: reduceMotion ? 450 : 950, easing: 'ease-out' });
        animation.onfinish = () => flash.remove();
    } else {
        flash.classList.add('animation-flash', color === 'red' ? 'color-flash-red' : 'color-flash-black'); setTimeout(() => flash.remove(), 1000);
    }
}

function setHandResolutionPending(pending) {
    handResolutionPending = pending;
    const handDiv = document.getElementById('hand');
    handDiv.style.pointerEvents = pending ? 'none' : '';
    handDiv.setAttribute('aria-busy', String(pending));
    refreshButtons();
}

function refreshButtons() {
    const btnPlay = document.getElementById('btnPlay');
    const btnDiscard = document.getElementById('btnDiscard');
    const btnSurrender = document.getElementById('btnSurrender');

    if (duel.phase === 'attack') {
        btnPlay.innerText = '⚔ Atak'; btnPlay.classList.remove('shield-phase'); btnPlay.disabled = gameOver || handResolutionPending;
        btnDiscard.innerText = 'Odrzuć'; btnDiscard.disabled = gameOver || handResolutionPending || selectedCards.length === 0 || selectedCards.length > 5 || discardsLeft <= 0;
    } else {
        btnPlay.innerText = '🛡 Tarcza'; btnPlay.classList.add('shield-phase'); btnPlay.disabled = gameOver || handResolutionPending;
        btnDiscard.innerText = '↩ Cofnij atak'; btnDiscard.disabled = gameOver || handResolutionPending;
    }
    btnSurrender.innerText = '🏳️ Porzuć'; btnSurrender.disabled = gameOver || handResolutionPending;
}

function animateStraightCards(cards, onComplete) {
    const cardElements = cards.map(card => Array.from(document.querySelectorAll('#hand .card')).find(el => el.dataset.cardId === card.id)).filter(Boolean);
    if (cardElements.length === 0) { onComplete(); return; }

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduceMotion ? 340 : 420;
    const stagger = reduceMotion ? 180 : 230;
    let finished = 0; let completed = false;
    const finishCard = () => { finished++; if (!completed && finished === cardElements.length) { completed = true; onComplete(); } };

    cardElements.forEach((card, index) => {
        card.classList.remove('dealing'); card.style.zIndex = String(20 + index); card.style.willChange = 'transform, opacity';
        const startTransform = getComputedStyle(card).transform; const delay = index * stagger;
        if (typeof card.animate === 'function') {
            const animation = card.animate([ { opacity: 1, transform: startTransform }, { opacity: .12, transform: 'translateY(-95px) scale(.96)' } ], { duration, delay, easing: 'cubic-bezier(.2,.7,.25,1)', fill: 'forwards' });
            animation.onfinish = finishCard; animation.oncancel = finishCard;
        } else {
            card.style.transition = `transform ${duration}ms cubic-bezier(.2,.7,.25,1) ${delay}ms, opacity ${duration}ms ease ${delay}ms`;
            requestAnimationFrame(() => { card.style.transform = 'translateY(-95px) scale(.96)'; card.style.opacity = '.12'; });
            setTimeout(finishCard, delay + duration + 80);
        }
    });
}

function animateEnemyHpChange() {
    const hp = document.getElementById('ui-enemy-hp');
    if (!hp) return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof hp.animate === 'function') {
        hp.animate([
            { transform: 'scale(1)', color: 'inherit', textShadow: 'none' },
            { transform: 'scale(1.55)', color: '#fff', textShadow: '0 0 12px rgba(231,76,60,.95), 0 0 24px rgba(231,76,60,.65)', offset: .22 },
            { transform: 'scale(1.3)', color: '#ffb0a8', textShadow: '0 0 10px rgba(231,76,60,.8)', offset: .5 },
            { transform: 'scale(1)', color: 'inherit', textShadow: 'none' }
        ], { duration: reduceMotion ? 500 : 950, easing: 'cubic-bezier(.2,.75,.25,1)' });
    } else {
        restartAnimation(hp, 'hp-damage-pulse');
    }
}

function animateCardsFlyingToEnemy(playedCards, table, enemyStatus) {
    if (!table || !enemyStatus || !playedCards.length) return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = enemyStatus.getBoundingClientRect();
    const targetX = target.left + target.width / 2;
    const targetY = target.top + target.height / 2;
    const cardElements = playedCards.map(card => Array.from(document.querySelectorAll('#hand .card')).find(el => el.dataset.cardId === card.id)).filter(Boolean);
    cardElements.forEach((cardEl, index) => {
        const rect = cardEl.getBoundingClientRect();
        const clone = cardEl.cloneNode(true);
        clone.removeAttribute('id');
        clone.setAttribute('aria-hidden', 'true');
        Object.assign(clone.style, {
            position: 'fixed', left: rect.left + 'px', top: rect.top + 'px',
            width: rect.width + 'px', height: rect.height + 'px', margin: '0',
            zIndex: '9999', pointerEvents: 'none', transformOrigin: 'center center'
        });
        document.body.appendChild(clone);
        const dx = targetX - (rect.left + rect.width / 2);
        const dy = targetY - (rect.top + rect.height / 2);
        if (typeof clone.animate === 'function') {
            const animation = clone.animate([
                { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1, filter: 'brightness(1)' },
                { transform: `translate(${dx * .55}px,${dy * .55}px) scale(.72) rotate(${index % 2 ? 12 : -12}deg)`, opacity: 1, filter: 'brightness(1.6)', offset: .68 },
                { transform: `translate(${dx}px,${dy}px) scale(.22) rotate(${index % 2 ? 24 : -24}deg)`, opacity: 0, filter: 'brightness(2)' }
            ], { duration: reduceMotion ? 260 : 560, delay: reduceMotion ? index * 45 : index * 110, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'forwards' });
            animation.onfinish = () => clone.remove();
            animation.oncancel = () => clone.remove();
        } else {
            clone.style.transition = 'transform 560ms ease, opacity 560ms ease';
            requestAnimationFrame(() => { clone.style.transform = `translate(${dx}px,${dy}px) scale(.22) rotate(20deg)`; clone.style.opacity = '0'; });
            setTimeout(() => clone.remove(), 650 + index * 110);
        }
    });
}

function animateKaretaExecution(enemyStatus, table) {
    if (!enemyStatus || !table) return;
    const rect = enemyStatus.getBoundingClientRect();
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const effect = document.createElement('div');
    effect.className = 'kareta-execution';
    effect.setAttribute('aria-hidden', 'true');
    Object.assign(effect.style, {
        position: 'fixed', left: (rect.left + rect.width / 2) + 'px',
        top: (rect.top + rect.height / 2) + 'px',
        width: Math.max(110, rect.width * 1.35) + 'px',
        height: Math.max(74, rect.height * 2.1) + 'px',
        zIndex: '9998', pointerEvents: 'none'
    });
    effect.innerHTML = '<span class="kareta-slash kareta-slash-a"></span><span class="kareta-slash kareta-slash-b"></span>';
    document.body.appendChild(effect);
    if (typeof effect.animate === 'function') {
        const animation = effect.animate([
            { opacity: 0, transform: 'translate(-50%,-50%) scale(.5)' },
            { opacity: 1, transform: 'translate(-50%,-50%) scale(1.12)', offset: .28 },
            { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: .58 },
            { opacity: 0, transform: 'translate(-50%,-50%) scale(1.12)' }
        ], { duration: reduceMotion ? 380 : 760, easing: 'cubic-bezier(.2,.75,.25,1)' });
        animation.onfinish = () => effect.remove();
        animation.oncancel = () => effect.remove();
    } else {
        effect.classList.add('kareta-execution-fallback');
        setTimeout(() => effect.remove(), 800);
    }
    animateEnemyHits(enemyStatus, 4);
    animateScreenShake(table, true);
}

function animateCardsToEnemy(playedCards, enemyStatus, options = {}) {
    if (!enemyStatus || !playedCards.length) return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = enemyStatus.getBoundingClientRect();
    const targetX = target.left + target.width / 2, targetY = target.top + target.height / 2;
    const elements = playedCards.map(card => Array.from(document.querySelectorAll('#hand .card')).find(el => el.dataset.cardId === card.id)).filter(Boolean);
    elements.forEach((source, index) => {
        const rect = source.getBoundingClientRect(), clone = source.cloneNode(true);
        clone.removeAttribute('id'); clone.setAttribute('aria-hidden', 'true');
        Object.assign(clone.style, { position:'fixed', left:rect.left+'px', top:rect.top+'px', width:rect.width+'px', height:rect.height+'px', margin:'0', zIndex:'9999', pointerEvents:'none', transformOrigin:'center center' });
        document.body.appendChild(clone);
        const dx=targetX-(rect.left+rect.width/2), dy=targetY-(rect.top+rect.height/2);
        const delay = (reduceMotion ? index*35 : (options.stagger ?? 95)*index) + (options.groupSplit && index >= 3 ? (options.groupDelay ?? 470) : 0);
        let frames;
        if (options.arc) {
            const direction = index % 2 ? 1 : -1;
            frames = [
                { transform:'translate(0,0) rotate(0deg) scale(1)', opacity:1, offset:0 },
                { transform:`translate(${dx*.45 + direction*48}px,${dy*.35 - 75}px) rotate(${direction*190}deg) scale(.8)`, opacity:1, offset:.55 },
                { transform:`translate(${dx}px,${dy}px) rotate(${direction*390}deg) scale(.22)`, opacity:0, filter:'brightness(2.2)', offset:1 }
            ];
        } else {
            frames = [
                { transform:'translate(0,0) rotate(0deg) scale(1)', opacity:1, filter:'brightness(1)', offset:0 },
                { transform:`translate(${dx*.68}px,${dy*.68}px) rotate(${index%2 ? 10 : -10}deg) scale(.7)`, opacity:1, filter:'brightness(1.7)', offset:.7 },
                { transform:`translate(${dx}px,${dy}px) rotate(${index%2 ? 18 : -18}deg) scale(.18)`, opacity:0, filter:'brightness(2.3)', offset:1 }
            ];
        }
        if (typeof clone.animate === 'function') {
            const animation=clone.animate(frames,{duration:reduceMotion?280:(options.duration??580),delay,easing:'cubic-bezier(.18,.75,.22,1)',fill:'forwards'});
            animation.onfinish=()=>clone.remove(); animation.oncancel=()=>clone.remove();
        } else {
            clone.style.transition=`transform ${reduceMotion?280:(options.duration??580)}ms ease ${delay}ms, opacity ${reduceMotion?280:(options.duration??580)}ms ease ${delay}ms`;
            requestAnimationFrame(()=>{ clone.style.transform=`translate(${dx}px,${dy}px) scale(.2) rotate(20deg)`; clone.style.opacity='0'; });
            setTimeout(()=>clone.remove(),delay+(options.duration??580)+100);
        }
    });
}

function animateFullCombo(cards, enemyStatus, table) {
    if (!cards.length || !enemyStatus) return;
    const counts = cards.reduce((acc, card) => { acc[card.rank] = (acc[card.rank] || 0) + 1; return acc; }, {});
    const tripleRank = Object.keys(counts).find(rank => counts[rank] === 3);
    const ordered = tripleRank ? cards.filter(card => String(card.rank) === tripleRank).concat(cards.filter(card => String(card.rank) !== tripleRank)) : cards;
    // Clone every card before updateUI removes the played hand from the DOM.
    animateCardsToEnemy(ordered, enemyStatus, { stagger:65, duration:520, groupSplit:true, groupDelay:470 });
    setTimeout(() => { animateEnemyHits(enemyStatus, 2); animateScreenShake(table, true); }, 470);
}

function animateColorRibbon(cards, table, enemyStatus, color) {
    if (!table || !enemyStatus) return;
    animateCardsToEnemy(cards, enemyStatus, { stagger:55, duration:680 });
    const rect=enemyStatus.getBoundingClientRect(), ribbon=document.createElement('div');
    ribbon.className='color-ribbon '+(color==='red'?'color-ribbon-red':'color-ribbon-black');
    Object.assign(ribbon.style,{position:'fixed',left:(rect.left+rect.width/2)+'px',top:(rect.top+rect.height/2)+'px',width:Math.max(150,rect.width*1.65)+'px',height:Math.max(60,rect.height*1.2)+'px',zIndex:'9997',pointerEvents:'none'});
    ribbon.setAttribute('aria-hidden','true');
    ribbon.innerHTML='<span></span><span></span><span></span>';
    document.body.appendChild(ribbon);
    if(typeof ribbon.animate==='function'){
        const a=ribbon.animate([{opacity:0,transform:'translate(-50%,-50%) scaleX(.05) rotate(-12deg)'},{opacity:1,transform:'translate(-50%,-50%) scaleX(1.08) rotate(0deg)',offset:.4},{opacity:0,transform:'translate(-50%,-50%) scaleX(1.18) rotate(8deg)'}],{duration:850,easing:'cubic-bezier(.15,.8,.2,1)'});
        a.onfinish=()=>ribbon.remove(); a.oncancel=()=>ribbon.remove();
    } else setTimeout(()=>ribbon.remove(),900);
    animateEnemyHits(enemyStatus,3);
}

function animateCrossPair(cards, enemyStatus, table) {
    if (!cards.length || !enemyStatus) return;
    animateCardsToEnemy(cards, enemyStatus, { stagger:0, duration:620 });
    const rect=enemyStatus.getBoundingClientRect(), cross=document.createElement('div');
    cross.className='two-pair-cross';
    Object.assign(cross.style,{position:'fixed',left:(rect.left+rect.width/2)+'px',top:(rect.top+rect.height/2)+'px',width:Math.max(130,rect.width*1.3)+'px',height:Math.max(90,rect.height*1.7)+'px',zIndex:'9998',pointerEvents:'none'});
    cross.setAttribute('aria-hidden','true');
    cross.innerHTML='<span></span><span></span>';
    document.body.appendChild(cross);
    if(typeof cross.animate==='function'){
        const a=cross.animate([{opacity:0,transform:'translate(-50%,-50%) scale(.45)'},{opacity:1,transform:'translate(-50%,-50%) scale(1.08)',offset:.4},{opacity:0,transform:'translate(-50%,-50%) scale(1.2)'}],{duration:680,easing:'ease-out'});
        a.onfinish=()=>cross.remove(); a.oncancel=()=>cross.remove();
    } else setTimeout(()=>cross.remove(),700);
    animateEnemyHits(enemyStatus,2); animateScreenShake(table);
}

function animatePairStrike(cards, enemyStatus) {
    animateCardsToEnemy(cards, enemyStatus, { stagger:190, duration:410 });
    if (enemyStatus) animateEnemyHits(enemyStatus,2);
}

function runHandAnimation(handName, playedCards) {
    const table = document.querySelector('.tavern-table');
    const enemyStatus = document.querySelector('.hp-enemy');
    const scoringCards = scoreCards(playedCards)?.scoringCards || playedCards;
    if (handName === 'Poker') {
        animateCardsToEnemy(playedCards, enemyStatus, { stagger:35, duration:780 });
        animateScreenShake(table, true);
        const banner = document.createElement('div'); banner.className = 'hand-announcement'; banner.textContent = 'POKER!'; table.appendChild(banner);
        if (typeof banner.animate === 'function') {
            const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const animation = banner.animate([ { opacity: 0, transform: 'translate(-50%,-50%) scale(.35) rotate(-8deg)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.22) rotate(2deg)', offset: 0.24 }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1) rotate(0)', offset: 0.68 }, { opacity: 0, transform: 'translate(-50%,-75%) scale(1.08)' } ], { duration: reduceMotion ? 650 : 1600, easing: 'cubic-bezier(.16,.8,.3,1)' });
            animation.onfinish = () => banner.remove();
        } else { setTimeout(() => banner.remove(), 1650); }
    } else if (handName === 'Kareta') { animateKaretaExecution(enemyStatus, table); }
    else if (handName === 'Full') { animateFullCombo(playedCards, enemyStatus, table); }
    else if (handName === 'Kolor') { animateColorRibbon(playedCards, table, enemyStatus, playedCards[0]?.color === 'red' ? 'red' : 'black'); }
    else if (handName === 'Trójka') { animateCardsFlyingToEnemy(scoringCards, table, enemyStatus); }
    else if (handName === 'Dwie Pary') { animateCrossPair(scoringCards, enemyStatus, table); }
    else if (handName === 'Para') { animatePairStrike(scoringCards, enemyStatus); }
    else if (handName === 'Wysoka Karta') { animateCardsToEnemy(scoringCards.slice(0,1), enemyStatus, { arc:true, duration:650, stagger:0 }); }
}

function playHand() { duelPlay(); }

function discardCards() {
    if (gameOver || handResolutionPending || !duel.active) return;
    if (duel.phase === 'shield') {
        playHaptic('tap'); duel.phase = 'attack'; shieldCards = [];
        document.getElementById('log').innerText = 'Cofnięto do wyboru ataku. Możesz zmienić karty lub je odrzucić.';
        evaluateHand(); updateUI(); return;
    }

    if (selectedCards.length === 0 || selectedCards.length > 5 || discardsLeft <= 0) return;
    playHaptic('discard');
    const moved = hand.filter(card => selectedCards.includes(card.id));
    runStats.discards += moved.length;
    hand = hand.filter(card => !selectedCards.includes(card.id));
    discardPile.push(...moved);
    selectedCards = []; shieldCards = []; discardsLeft--;
    document.getElementById('log').innerText = `Odrzucono karty. Zostało wymian: ${discardsLeft}.`;
    drawReplacements();
}

function drawReplacements(rerollLockedCard = false) {
    const limit = currentHandLimit();
    const need = Math.max(0, limit - hand.length);
    if (need > 0) hand = hand.concat(drawCards(need));
    animateNextRender = true;
    hand.sort((a, b) => rankOrder.get(a.rank) - rankOrder.get(b.rank));
    updateLockedCard(rerollLockedCard); evaluateHand(); updateUI();
}

function surrender() {
    if (gameOver || handResolutionPending) return;
    abandonMapRun();
}

function formatDuration(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return hours > 0 ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}` : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function openMapShopNode() {
    shopReturnsToMenu = false;
    renderShop();
    document.getElementById('shopProceedBtn').innerText = 'Wróć na Mapę';
    document.getElementById('shopProceedBtn').onclick = closeShopToMap;
    document.getElementById('shopLeaveDuelBtn').style.display = 'none';
    toggleModal('shopModal', true);
}

function closeShopToMap() {
    toggleModal('shopModal', false);
    openMapModal(false);
}

function leaveDuelFromShop() {
    toggleModal('shopModal', false);
    leaveDuel();
}

function inventoryIcon(item) { return item.id === 'dice' ? `<span>🎲</span><small class="inv-count">${item.charges ?? 3}</small>` : item.icon; }
function makeInventoryItem(item) { return item.id === 'dice' ? { ...item, charges: 3 } : { ...item }; }

function renderRelicsHTML() {
    return SHOP_ITEMS.filter(item => item.isRelic && relics[item.id])
        .map(item => `<span class="relic-badge" title="${item.name}: ${item.desc}">${item.badge || item.icon}</span>`).join('');
}

function drawShopItems(category, count) {
    const pool = SHOP_ITEMS.filter(item => item.category === category && (category !== 'relic' || !relics[item.id]));
    if (category !== 'relic') {
        // Każdy slot jest losowany niezależnie. Dwie takie same mikstury / jednorazówki są dozwolone.
        // Zakup nie usuwa przedmiotu z puli następnych losowań.
        return Array.from({ length: count }, () => ({
            id: pool.length ? pool[Math.floor(Math.random() * pool.length)].id : null,
            sold: false
        }));
    }
    // Artefakty są unikatowe podczas całej wyprawy.
    return Array.from({ length: count }, () => ({
        id: pool.length ? pool[Math.floor(Math.random() * pool.length)].id : null,
        sold: false
    }));
}

function generateShopOffers() {
    return [
        ...drawShopItems('healing', 2),
        ...drawShopItems('consumable', 2),
        ...drawShopItems('relic', 1)
    ];
}

function currentShopNode() {
    return mapRun.nodes.find(node => node.id === mapRun.currentNodeId && node.type === 'shop');
}

function currentShopOffers() {
    const node = currentShopNode();
    if (node) {
        if (!node.shopOffers) node.shopOffers = generateShopOffers();
        return node.shopOffers;
    }
    if (!devShopOffers) devShopOffers = generateShopOffers();
    return devShopOffers;
}

function rerollShop() {
    if (coins < 10) return;
    coins -= 10;
    const node = currentShopNode();
    if (node) node.shopOffers = generateShopOffers();
    else devShopOffers = generateShopOffers();
    pendingBuyItemIdx = -1;
    renderShop(); updateUI();
}

function markShopOfferSold(idx) {
    const offer = currentShopOffers()[idx];
    if (offer) offer.sold = true;
}

function renderShop() {
    document.getElementById('shopCoins').innerText = coins;
    const hpSpan = document.getElementById('shopHpDisplay');
    hpSpan.innerText = mapRun.active ? `❤️ ${mapRun.playerHp}/${mapRun.playerMaxHp} HP` : '';

    const shopInv = document.getElementById('shopInventorySlots'); shopInv.innerHTML = '';
    for (let i = 0; i < MAX_INV; i++) {
        if (i < inventory.length) {
            const item = inventory[i];
            const usableHere = !!(item.heal && mapRun.active);
            shopInv.innerHTML += `<div class="inv-slot" ${usableHere ? `onclick="useItemFromShop(${i})"` : ''} title="${item.name}${usableHere ? ' (Kliknij, aby się uleczyć)' : ' (Użyj podczas walki)'}">${inventoryIcon(item)}</div>`;
        } else { shopInv.innerHTML += '<div class="inv-slot"></div>'; }
    }
    document.getElementById('shopRelicsSlots').innerHTML = renderRelicsHTML() || '<span style="font-size:11px;color:#777">Brak artefaktów</span>';

    const offers = currentShopOffers();
    const container = document.getElementById('shopItemsContainer'); container.innerHTML = '';
    const groups = [
        { title: 'Mikstury leczenia', from: 0, to: 2 },
        { title: 'Przedmioty jednorazowe', from: 2, to: 4 },
        { title: 'Artefakt', from: 4, to: 5 }
    ];
    let visibleCount = 0;
    groups.forEach(group => {
        const visible = [];
        for (let idx = group.from; idx < group.to; idx++) {
            const offer = offers[idx];
            const item = offer && SHOP_ITEMS.find(i => i.id === offer.id);
            // Kupiony przedmiot znika z aktualnej oferty, a posiadany artefakt nie wraca do sklepu.
            if (!offer || offer.sold || !item || (item.isRelic && relics[item.id])) continue;
            visible.push({ item, idx });
        }
        if (!visible.length) return;
        container.innerHTML += `<div class="shop-category-title">${group.title} (${visible.length})</div>`;
        visible.forEach(({ item, idx }) => {
            const canAfford = coins >= item.price;
            container.innerHTML += `
                <div class="shop-item ${item.isRelic ? 'relic' : ''}">
                    <div style="font-size:22px;">${item.icon}</div>
                    <div class="shop-info"><span class="shop-name">${item.name}</span><span class="shop-desc">${item.desc}</span></div>
                    <button class="btn-buy" onclick="buyItem(${idx})" ${canAfford ? '' : 'disabled'}>${item.price} 🪙</button>
                </div>
            `;
            visibleCount++;
        });
    });
    if (!visibleCount) {
        container.innerHTML = '<div class="shop-category-title">Wykupiono całą ofertę. Możesz losować ponownie za 10 🪙.</div>';
    }
    const reroll = document.getElementById('shopRerollBtn');
    if (reroll) reroll.disabled = coins < 10;
}

function useItemFromShop(idx) {
    const item = inventory[idx];
    if (!item || !item.heal || !mapRun.active) return;
    if (mapRun.playerHp >= mapRun.playerMaxHp) { alert('Masz już pełne punkty życia!'); return; }
    inventory.splice(idx, 1);
    const healed = healPlayerBy(item.heal);
    renderShop(); updateUI();
    alert(`Wypito: ${item.name}. Odzyskano ${healed} HP.`);
}

function buyItem(idx) {
    const offer = currentShopOffers()[idx];
    const item = offer && SHOP_ITEMS.find(i => i.id === offer.id);
    if (!item || offer.sold || coins < item.price || (item.isRelic && relics[item.id])) return;
    if (item.isRelic) {
        coins -= item.price; relics[item.id] = true;
        markShopOfferSold(idx); renderShop(); updateUI(); return;
    }
    const diceStack = item.id === 'dice' ? inventory.find(invItem => invItem.id === 'dice') : null;
    if (diceStack) {
        coins -= item.price; diceStack.charges = (diceStack.charges ?? 3) + 3;
        markShopOfferSold(idx); renderShop(); updateUI();
    } else if (inventory.length < MAX_INV) {
        coins -= item.price; inventory.push(makeInventoryItem(item));
        markShopOfferSold(idx); renderShop(); updateUI();
    } else {
        pendingBuyItemIdx = idx; renderReplaceModal(); toggleModal('replaceModal', true);
    }
}

function renderReplaceModal() {
    const container = document.getElementById('replaceItemsContainer'); container.innerHTML = '';
    inventory.forEach((invItem, idx) => {
        container.innerHTML += `
            <div class="shop-item danger">
                <div style="position:relative;font-size:22px; margin-right:8px;">${inventoryIcon(invItem)}</div>
                <div class="shop-info"><span class="shop-name">${invItem.name}</span><span class="shop-desc">${invItem.desc}${invItem.id === 'dice' ? ` Pozostałe użycia: ${invItem.charges}.` : ''}</span></div>
                <button class="btn-buy danger" onclick="confirmReplace(${idx})">Wyrzuć</button>
            </div>
        `;
    });
}

function confirmReplace(invIdx) {
    if (pendingBuyItemIdx === -1 || invIdx < 0 || invIdx >= inventory.length) return;
    const offer = currentShopOffers()[pendingBuyItemIdx];
    const newItem = offer && SHOP_ITEMS.find(i => i.id === offer.id);
    if (newItem && !offer.sold && !newItem.isRelic && coins >= newItem.price) {
        coins -= newItem.price; inventory[invIdx] = makeInventoryItem(newItem);
        markShopOfferSold(pendingBuyItemIdx); pendingBuyItemIdx = -1;
        toggleModal('replaceModal', false); renderShop(); updateUI();
    }
}

function useItem(idx) {
    if (gameOver || handResolutionPending || idx >= inventory.length) return;
    let item = inventory[idx];
    if ((item.id === 'shield_pot' || item.category === 'healing') && !duel.active) { document.getElementById('log').innerText = `${item.name} działa wyłącznie w trakcie wyprawy!`; return; }
    if (item.heal && duel.active && duel.playerHp >= duel.playerMaxHp) { document.getElementById('log').innerText = 'Masz już pełne HP — nie potrzebujesz leczenia.'; return; }
    if (duel.active && item.id === 'time' && isFatigued()) { document.getElementById('log').innerText = 'Zmęczenie już trwa — Złoty Zegar nic by nie dał.'; return; }
    if (item.id === 'heal_regen' && duel.regenTurns > 0) { document.getElementById('log').innerText = 'Regeneracja jest już aktywna.'; return; }
    if (item.id === 'dice' && pendingDiceRoll > 0) { document.getElementById('log').innerText = 'Kość jest już przygotowana — najpierw zagraj atak.'; return; }
    confirmItemIdx = idx;

    let detailsHtml = `
        <div style="font-size:32px; margin-bottom:6px;">${item.icon}</div>
        <strong style="font-size:15px; color:#f1e5cd; display:block;">${item.name}</strong>
        <span style="font-size:12px; color:#b49b78;">${item.desc}</span>
        ${item.id === 'dice' ? `<span style="font-size:12px;color:#f1c40f;display:block;margin-top:4px">Pozostałe użycia: ${item.charges ?? 3}</span>` : ''}
    `;
    document.getElementById('confirmItemDetails').innerHTML = detailsHtml;

    let warningText = "Czy chcesz użyć tego przedmiotu teraz?";
    if (item.id.startsWith('pow') && activeBuff.turns > 0) { warningText = `Masz już aktywny efekt (+${activeBuff.dmg} DMG na ${activeBuff.turns} ataki). Zostanie nadpisany! Czy na pewno?`; }
    document.getElementById('confirmItemWarning').innerText = warningText;
    toggleModal('itemConfirmModal', true);
}

function confirmItemUse(yes) {
    toggleModal('itemConfirmModal', false);
    if (yes && confirmItemIdx !== -1) executeItem(confirmItemIdx);
    confirmItemIdx = -1;
}

function executeItem(idx) {
    if (gameOver || handResolutionPending) return;
    let item = inventory[idx];
    if (!item) return;
    if (item.id !== 'dice') inventory.splice(idx, 1);

    if (item.id === 'discard') { discardsLeft++; showFloatingText('+1 Odrzut', '#3498db', '65%', '35%', '20px'); }
    else if (item.id === 'glove') { discardsLeft += 2; showFloatingText('+2 Odrzuty', '#3498db', '65%', '35%', '20px'); }
    else if (item.heal) {
        const healed = healPlayerBy(item.heal);
        showFloatingText(`+${healed} ❤️`, '#2ecc71', '17%', '72%', '22px');
    }
    else if (item.id === 'heal_regen') { duel.regenTurns = 3; showFloatingText('❤️ Regeneracja ×3', '#2ecc71', '17%', '72%', '20px'); }
    else if (item.id === 'shield_pot') { duel.playerShield += 25; showFloatingText('+25 🛡', '#5dade2', '15%', '35%', '22px'); }
    else if (item.id === 'time') { duel.fatigueRound++; showFloatingText('Zmęczenie +1 runda', '#f1c40f', '25%', '22%', '16px'); }
    else if (item.id === 'pow1') { activeBuff = { dmg: 10, turns: 3 }; showFloatingText('+10 Bazy', '#e74c3c', '65%', '35%', '20px'); }
    else if (item.id === 'pow2') { activeBuff = { dmg: 15, turns: 3 }; showFloatingText('+15 Bazy', '#e74c3c', '65%', '35%', '20px'); }
    else if (item.id === 'pow3') { activeBuff = { dmg: 20, turns: 3 }; showFloatingText('+20 Bazy', '#e74c3c', '65%', '35%', '20px'); }
    else if (item.id === 'dice') {
        pendingDiceRoll = Math.floor(Math.random() * 6) + 1; item.charges = Math.max(0, (item.charges ?? 3) - 1);
        if (item.charges === 0) inventory.splice(idx, 1);
        showFloatingText(`🎲 ${pendingDiceRoll}`, pendingDiceRoll === 1 ? '#e74c3c' : '#f1c40f', '65%', '35%', '24px');
    }

    document.getElementById('log').innerText = `Użyto: ${item.name}!`;
    evaluateHand(); updateUI();
}

function updateUI() {
    const handDiv = document.getElementById('hand'); handDiv.innerHTML = '';
    hand.forEach((card, index) => {
        const isSelected = selectedCards.includes(card.id);
        const isSpentAttack = duel.active && duel.phase === 'shield' && isSelected;
        const isShielded = duel.active && shieldCards.includes(card.id);
        const isLocked = card.id === lockedCardId;
        const cDiv = document.createElement('div');
        cDiv.className = `card ${card.color === 'red' ? 'red' : ''} ${isLocked ? 'locked' : ''} ${isSpentAttack ? 'spent' : (isSelected ? 'selected' : '')} ${isShielded ? 'shielded' : ''} ${animateNextRender ? 'dealing' : ''}`;
        cDiv.dataset.cardId = card.id; cDiv.style.setProperty('--card-index', index);
        cDiv.onclick = () => toggleCard(card.id);
        cDiv.innerHTML = `<div class="card-top"><span>${card.rank}</span><span>${card.suit}</span></div><div class="card-bottom"><span>${card.rank}</span><span>${card.suit}</span></div>`;
        handDiv.appendChild(cDiv);
    });
    animateNextRender = false;

    document.getElementById('ui-fight-bonus').innerText = currentFightBonus;
    document.getElementById('ui-discards').innerText = discardsLeft;
    document.getElementById('ui-coins').innerText = coins;
    document.getElementById('ui-lobby-coins').innerText = coins;

    document.getElementById('ui-level').innerText = `⭐ Poz. ${mapRun.level}`;
    const xpPct = Math.min(100, Math.round((mapRun.xp / mapRun.xpNext) * 100));
    document.getElementById('ui-xp-fill').style.width = `${xpPct}%`;
    document.getElementById('ui-xp-text').innerText = `${mapRun.xp} / ${mapRun.xpNext} EXP`;

const headerName = document.getElementById('header-enemy-name');
    const bossSkillBox = document.getElementById('header-boss-skill');
    const bossSkillName = document.getElementById('header-skill-name');
    const bossSkillDesc = document.getElementById('header-skill-desc');
    const traitBar = document.getElementById('ui-enemy-trait');

    if (currentEnemyTrait && duel.active) {
        const isBoss = currentEnemyTrait.id.startsWith('boss_');
        headerName.innerText = isBoss ? `👑 ${currentEnemyTrait.name}` : `⚔ ${currentEnemyTrait.name}`;

        let extraBadges = '';
        if (duel.corvenBlockArmed) extraBadges += ` [🛡️ Blok 100% Aktywny!]`;
        if (duel.kaelEnraged) extraBadges += ` [🔥 SZAŁ +10% DMG]`;
        if (duel.handLimit < 8) extraBadges += ` [🩸 Limit 7 kart]`;

        if (isBoss) {
            // Jeśli to Boss -> pokaż umiejętność na górze po prawej od nazwy i ukryj stary pasek w lewej kolumnie
            bossSkillBox.style.display = 'block';
            bossSkillName.innerText = `${currentEnemyTrait.traitName}:`;
            bossSkillDesc.innerText = `${currentEnemyTrait.desc}${extraBadges}`;
            traitBar.style.display = 'none';
        } else {
            // Zwykły wróg lub Elita -> ukryj ramkę bossa na górze, zostaw pasek cechy dla Elity po lewej
            bossSkillBox.style.display = 'none';
            if (currentEnemyTrait.traitName !== 'Brak cechy') {
                traitBar.style.display = 'block';
                traitBar.innerHTML = `<i>${currentEnemyTrait.traitName}</i>: ${currentEnemyTrait.desc}`;
            } else {
                traitBar.style.display = 'none';
            }
        }
    } else {
        headerName.innerText = '⚓ Pod Złamaną Kotwicą';
        bossSkillBox.style.display = 'none';
        traitBar.style.display = 'none';
    }

    const buffParts = [];
    if (activeBuff.turns > 0) buffParts.push(`💪 +${activeBuff.dmg} DMG na ${activeBuff.turns} ataki`);
    if (duel.regenTurns > 0) buffParts.push(`❤️ +20 HP przez ${duel.regenTurns} tury`);
    document.getElementById('ui-buff').innerText = buffParts.join(' · ');

    const invSlots = document.getElementById('ui-inventory'); invSlots.innerHTML = '';
    for (let i = 0; i < MAX_INV; i++) {
        if (i < inventory.length) invSlots.innerHTML += `<div class="inv-slot" onclick="useItem(${i})" title="${inventory[i].name}${inventory[i].id === 'dice' ? ` — ${inventory[i].charges} użycia` : ''}">${inventoryIcon(inventory[i])}</div>`;
        else invSlots.innerHTML += `<div class="inv-slot"></div>`;
    }
    document.getElementById('ui-relics').innerHTML = renderRelicsHTML();

    refreshButtons(); applyDuelView();
}

// Generator pięter w osobnym pliku map-generator.js.
function generateActMap(actNumber = 1) {
    return generateFloorMap(actNumber);
}

function gainXp(amount) {
    let leveledUp = 0; mapRun.xp += amount;
    while (mapRun.xp >= mapRun.xpNext) {
        mapRun.xp -= mapRun.xpNext; mapRun.level++; leveledUp++; mapRun.xpNext = mapRun.level * 100;
        mapRun.playerMaxHp += DUEL.LEVEL_UP_HP; mapRun.playerHp = Math.min(mapRun.playerMaxHp, mapRun.playerHp + DUEL.LEVEL_UP_HP);
    }
    duel.playerMaxHp = mapRun.playerMaxHp; duel.playerHp = mapRun.playerHp;
    return leveledUp;
}

function startDuelRun() {
    runStartedAt = Date.now(); runFinishedAt = 0;
    runStats = { enemiesDefeated: 0, totalDamage: 0, discards: 0, bestHandName: "-", bestHandDmg: 0, coinsEarned: 0, bossesDefeated: 0 };
    const generated = generateActMap(1);
    mapRun = {
        active: true, act: 1, playerHp: DUEL.START_HP, playerMaxHp: DUEL.START_HP,
        level: 1, xp: 0, xpNext: 100, boss: generated.boss, nodes: generated.nodes,
        currentNodeId: 0, visitedNodes: new Set([0]),
        mapWidth: generated.mapWidth, mapHeight: generated.mapHeight,
        shortestPathFields: generated.shortestPathFields
    };
    duel = newDuelState(); duel.active = true; duel.playerHp = mapRun.playerHp; duel.playerMaxHp = mapRun.playerMaxHp;
    currentEnemyTrait = null; activeBuff = { dmg: 0, turns: 0 }; pendingDiceRoll = 0; currentFightBonus = 0; rewardedHandsThisFight.clear();
    inventory = []; relics = {}; devShopOffers = null; coins = 0;
    gameOver = true; setHandResolutionPending(false);
    
    toggleModal('mainMenu', false); toggleModal('duelResultModal', false); toggleModal('lobbySectionModal', false);
    const notice = document.getElementById('lobbyNotice');
    if (notice) notice.style.display = 'none';
    document.getElementById('enemyHand').innerHTML = '';
    
    initGame();
    openMapModal(false);
}

function startNextDuelAct() {
    toggleModal('duelResultModal', false);
    mapRun.act++;
    const generated = generateActMap(mapRun.act);
    mapRun.boss = generated.boss;
    mapRun.nodes = generated.nodes;
    mapRun.mapWidth = generated.mapWidth;
    mapRun.mapHeight = generated.mapHeight;
    mapRun.shortestPathFields = generated.shortestPathFields;
    mapRun.currentNodeId = 0;
    mapRun.visitedNodes = new Set([0]);
    openMapModal(false);
    updateUI();
}

function renderDiceyMap(lockMovement) {
    const board = document.getElementById('mapBoard');
    const svg = document.getElementById('svgLayer');
    if (!board || !svg) return;
    
    document.querySelectorAll('.node-plate').forEach(e => e.remove());
    svg.innerHTML = '';

    // Mapa rośnie poziomo wraz z piętrem. Widok można przewijać bez ściskania pól.
    const SVG_W = mapRun.mapWidth || 802;
    const SVG_H = mapRun.mapHeight || 450;
    board.style.width = SVG_W + 'px';
    board.style.height = SVG_H + 'px';
    svg.setAttribute('viewBox', '0 0 ' + SVG_W + ' ' + SVG_H);

    const drawnPairs = new Set();
    const cur = mapRun.nodes.find(n => n.id === mapRun.currentNodeId);
    if (!cur) return;

    // 1. Rysowanie linii połączeń między strefami
    mapRun.nodes.forEach(node => {
        const x1 = node.x;
        const y1 = node.y;

        node.targets.forEach(tid => {
            const pairKey = [Math.min(node.id, tid), Math.max(node.id, tid)].join('-');
            if (!drawnPairs.has(pairKey)) {
                drawnPairs.add(pairKey);
                const target = mapRun.nodes.find(n => n.id === tid);
                if (!target) return;
                const x2 = target.x;
                const y2 = target.y;

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x1); line.setAttribute('y1', y1);
                line.setAttribute('x2', x2); line.setAttribute('y2', y2);

                const isAdjacent = !lockMovement && node.id === cur.id && cur.targets.includes(tid);

                if (isAdjacent) {
                    line.classList.add('active-path');
                } else if (mapRun.visitedNodes.has(node.id) && mapRun.visitedNodes.has(tid)) {
                    line.classList.add('walked-path');
                }
                svg.appendChild(line);
            }
        });
    });

    // 2. Rysowanie okrągłych stref
    mapRun.nodes.forEach(node => {
        const div = document.createElement('div');
        div.className = 'node-plate';
        div.style.left = node.x + 'px';
        div.style.top = node.y + 'px';
        if (node.type === 'event') div.classList.add('mystery-node');
        div.title = node.title;

        const isCurrent = (node.id === mapRun.currentNodeId);
        const isAdjacent = !lockMovement && cur.targets.includes(node.id);

        if (isCurrent) {
            div.classList.add('player-here');
            div.innerHTML = '🧙';
        } else {
            if (mapRun.visitedNodes.has(node.id) || node.cleared) div.classList.add('cleared');
            div.innerHTML = node.icon;

            if (isAdjacent) {
                div.classList.add('available');
                div.onclick = () => selectMapNode(node.id);
            }
        }
        board.appendChild(div);
    });
    const viewport = document.getElementById('mapViewport');
    if (viewport) viewport.scrollLeft = Math.max(0, cur.x - viewport.clientWidth * 0.40);
}

function openMapModal(fromTopButton = false) {
    if (!mapRun.active || !mapRun.nodes || mapRun.nodes.length === 0) {
        const generated = generateActMap(1);
        mapRun.active = true;
        mapRun.boss = generated.boss;
        mapRun.nodes = generated.nodes;
        mapRun.mapWidth = generated.mapWidth;
        mapRun.mapHeight = generated.mapHeight;
        mapRun.shortestPathFields = generated.shortestPathFields;
        mapRun.currentNodeId = 0;
        mapRun.visitedNodes = new Set([0]);
    }

    // Blokujemy ruch na mapie TYLKO wtedy, gdy trwa nierozstrzygnięta walka przy stole
    const combatInProgress = !gameOver && duel.active && duel.enemyHp > 0;
    const lockMovement = fromTopButton && combatInProgress;

    document.getElementById('mapTitle').innerText = `Szlak Calionu · Piętro ${mapRun.act} · ${mapRun.shortestPathFields} pól do bossa`;
    document.getElementById('mapPlayerHp').innerText = `${mapRun.playerHp}/${mapRun.playerMaxHp}`;
    document.getElementById('mapPlayerLvl').innerText = mapRun.level;
    document.getElementById('mapPlayerXp').innerText = `${mapRun.xp}/${mapRun.xpNext} EXP`;
    document.getElementById('mapPlayerCoins').innerText = coins;

    const b = mapRun.boss;
    const bossHpNow = DUEL.BOSS_BASE_HP + (mapRun.act - 1) * DUEL.ACT_HP_STEP;
    document.getElementById('mapBossBanner').innerHTML = `<strong>👑 Boss Piętra ${mapRun.act}: ${b.name} (${bossHpNow} HP)</strong><span>Umiejętność (<i>${b.traitName}</i>): ${b.desc}</span>`;

    document.getElementById('mapClosePeekBtn').style.display = combatInProgress ? 'block' : 'none';
    document.getElementById('mapHintText').innerText = lockMovement
        ? 'Trwa walka — pokonaj wroga przy stole, aby ruszyć dalej!'
        : 'Wybierz złote połączenie. Boczne drogi są dłuższe, ale mogą dawać dodatkowe nagrody. ? = niespodzianka.';

    toggleModal('mapModal', true);
    renderDiceyMap(lockMovement);
}

function selectMapNode(nodeId) {
    if (!mapRun.active || !gameOver) return;
    const current = mapRun.nodes.find(n => n.id === mapRun.currentNodeId);
    const node = mapRun.nodes.find(n => n.id === nodeId);
    if (!current || !node || !current.targets.includes(nodeId)) return;
    mapRun.currentNodeId = nodeId;
    mapRun.visitedNodes.add(nodeId);
    toggleModal('mapModal', false);

    if (node.type === 'chest') {
        node.type = 'empty'; node.icon = '🪵'; node.cleared = true;
        openChestNode();
    } else if (node.type === 'heal') {
        node.type = 'empty'; node.icon = '🪵'; node.cleared = true;
        openHealSpringNode();
    } else if (node.type === 'shop') {
        openMapShopNode();
    } else if (node.type === 'event') {
        openMysteryMapEvent(node);
    } else if (node.type === 'start' || node.type === 'empty') {
        openMapModal(false);
    } else if (node.type === 'fight' || node.type === 'elite' || node.type === 'boss') {
        if (!node.cleared) {
            startDuelFromMapNode(node);
        } else {
            openMapModal(false);
        }
    }
}

// Pierwsza, prosta pula zdarzeń. Docelowo zastąpi ją rozbudowana baza fabularna.
function openMysteryMapEvent(node) {
    const roll = Math.random();
    if (roll < 0.24) {
        node.type = 'shop';
        node.icon = '🪙';
        node.title = 'Wędrowny handlarz';
        openMapShopNode();
        return;
    }

    if (roll < 0.49) {
        const foundCoins = 15 + Math.floor(Math.random() * 21);
        coins += foundCoins;
        runStats.coinsEarned += foundCoins;
        node.type = 'empty'; node.icon = '🪵'; node.cleared = true;
        document.getElementById('chestModalDesc').innerText =
            'Nieznany podróżnik zostawił na szlaku mieszek monet. Dziś szczęście Ci sprzyja.';
        document.getElementById('chestLootSummary').innerHTML =
            '<div><span>Znalezione monety:</span><strong style="color:#f1c40f">+' + foundCoins + ' 🪙</strong></div>';
        updateUI(); toggleModal('chestModal', true);
        return;
    }

    if (roll < 0.74) {
        node.type = 'empty'; node.icon = '🪵'; node.cleared = true;
        const before = mapRun.playerHp;
        mapRun.playerHp = Math.min(mapRun.playerMaxHp, before + 100);
        duel.playerHp = mapRun.playerHp;
        document.getElementById('chestModalDesc').innerText =
            'W przydrożnej kapliczce odnajdujesz wodę o leczniczych właściwościach.';
        document.getElementById('chestLootSummary').innerHTML =
            '<div><span>Odzyskane zdrowie:</span><strong style="color:#2ecc71">+' +
            (mapRun.playerHp - before) + ' ❤️ HP</strong></div>';
        updateUI(); toggleModal('chestModal', true);
        return;
    }

    node.type = 'fight';
    node.icon = '⚔️';
    node.enemy = REGULAR_ENEMIES[Math.floor(Math.random() * REGULAR_ENEMIES.length)];
    node.title = 'Zasadzka: ' + node.enemy.name;
    node.hp = DUEL.ZBIR_BASE_HP + (mapRun.act - 1) * DUEL.ACT_HP_STEP;
    node.xp = 50;
    startDuelFromMapNode(node);
}

function openHealSpringNode() {
    const before = mapRun.playerHp;
    mapRun.playerHp = Math.min(mapRun.playerMaxHp, mapRun.playerHp + 150);
    duel.playerHp = mapRun.playerHp;
    const healed = mapRun.playerHp - before;

    document.getElementById('chestModalDesc').innerText = 'Na końcu ślepego zaułka odnajdujesz ukryte zapasy medyków Calionu!';
    document.getElementById('chestLootSummary').innerHTML =
        `<div><span>Odzyskane zdrowie:</span><strong style="color:#2ecc71">+${healed} ❤️ HP</strong></div>` +
        `<div><span>Twoje aktualne HP:</span><strong style="color:#2ecc71">${mapRun.playerHp} / ${mapRun.playerMaxHp} HP</strong></div>`;
    updateUI();
    toggleModal('chestModal', true);
}

function openChestNode() {
    const foundCoins = 18 + Math.floor(Math.random() * 15);
    coins += foundCoins; runStats.coinsEarned += foundCoins;

    let extraRewardHtml = '';
    // Zamiast wycofanej mikstury +100 HP losujemy jedną z trzech nowych mikstur natychmiastowych.
    const chestPotions = SHOP_ITEMS.filter(item => item.category === 'healing' && item.heal);
    const healItem = chestPotions[Math.floor(Math.random() * chestPotions.length)];
    if (inventory.length < MAX_INV) {
        inventory.push(makeInventoryItem(healItem));
        extraRewardHtml = `<div><span>Dodatkowy przedmiot:</span><strong style="color:#2ecc71">🧪 ${healItem.name} (+${healItem.heal} HP w plecaku)</strong></div>`;
    } else {
        const healed = healPlayerBy(healItem.heal);
        extraRewardHtml = `<div><span>Plecak pełny (natychmiastowe użycie):</span><strong style="color:#2ecc71">+${healed} ❤️ HP</strong></div>`;
    }
    document.getElementById('chestModalDesc').innerText = 'W ślepym zaułku za pokonanym strażnikiem otwierasz okutą skrzynię!';
    document.getElementById('chestLootSummary').innerHTML = `<div><span>Znalezione monety:</span><strong style="color:#f1c40f">+${foundCoins} 🪙</strong></div>` + extraRewardHtml + `<div><span>Twoje aktualne HP:</span><strong style="color:#2ecc71">${mapRun.playerHp} / ${mapRun.playerMaxHp} HP</strong></div>`;
    updateUI(); toggleModal('chestModal', true);
}

function closeChestToMap() { toggleModal('chestModal', false); openMapModal(false); }

function abandonMapRun() {
    if (confirm('Czy na pewno chcesz porzucić wyprawę i wrócić do lobby?')) { toggleModal('mapModal', false); leaveDuel(); }
}

function startDuelFromMapNode(node) {
    const token = duel.token + 1; const prevStreak = duel.streak;
    duel = newDuelState(); duel.token = token; duel.active = true; duel.phase = 'attack'; duel.streak = prevStreak;
    if (relics.guardian_heart) duel.playerShield = 20;
    duel.playerHp = mapRun.playerHp; duel.playerMaxHp = mapRun.playerMaxHp;
    duel.enemyMaxHp = node.hp; duel.enemyHp = node.hp;
    currentEnemyTrait = node.enemy;
    duel.enemyShield = (currentEnemyTrait && currentEnemyTrait.id === 'iron_guard') ? 15 : 0;

    toggleModal('mainMenu', false); toggleModal('duelResultModal', false); toggleModal('fatigueModal', false);
    toggleModal('shopModal', false); toggleModal('lobbySectionModal', false);
    gameOver = false;
    discardsLeft = (currentEnemyTrait && currentEnemyTrait.id === 'insistent') ? Math.max(1, MAX_DISCARDS - 2) : MAX_DISCARDS;
    activeBuff = { dmg: 0, turns: 0 }; pendingDiceRoll = 0; currentFightBonus = 0; rewardedHandsThisFight.clear();
    selectedCards = []; shieldCards = []; setHandResolutionPending(false);
    document.getElementById('enemyHand').innerHTML = '';
    document.getElementById('ui-enemy-label').innerText = node.type === 'boss' ? '👑 BOSS HP:' : (node.type === 'elite' ? '💀 ELITA HP:' : 'Wróg HP:');
    document.getElementById('log').innerText = `Starcie na szlaku: ${currentEnemyTrait.name} (${duel.enemyMaxHp} HP). Wybierz karty na Atak!`;
    initGame();
}

function leaveDuel() {
    duel.token++; duel.active = false; mapRun.active = false; duel.phase = 'attack';
    currentEnemyTrait = null; lockedCardId = null; gameOver = true; runFinishedAt = Date.now();
    selectedCards = []; shieldCards = []; setHandResolutionPending(false);
    toggleModal('duelResultModal', false); toggleModal('fatigueModal', false); toggleModal('mapModal', false);
    toggleModal('chestModal', false); toggleModal('shopModal', false);
    document.getElementById('enemyHand').innerHTML = ''; toggleModal('mainMenu', true); updateUI();
}

function continueToMapAfterDuel() { toggleModal('duelResultModal', false); openMapModal(false); }

function duelEnd(win) {
    gameOver = true; setHandResolutionPending(false); playHaptic(win ? 'poker' : 'defeat');
    const st = duel.stats; const node = mapRun.nodes.find(n => n.id === mapRun.currentNodeId);
    const isBossNode = node && node.type === 'boss';
    let reward = 0; let xpGained = 0; let levelsGained = 0; let healedHp = 0;

    if (win) {
        duel.streak++;
        const baseReward = isBossNode ? (45 + Math.floor(Math.random() * 11)) : (node && node.type === 'elite' ? (22 + Math.floor(Math.random() * 7)) : (12 + Math.floor(Math.random() * 5)));
        reward = baseReward + currentFightBonus; coins += reward;
        runStats.enemiesDefeated++; if (isBossNode) runStats.bossesDefeated++; runStats.coinsEarned += reward;

        mapRun.playerHp = duel.playerHp; const hpBeforeHeal = mapRun.playerHp;
        mapRun.playerHp = Math.min(mapRun.playerMaxHp, mapRun.playerHp + DUEL.POST_FIGHT_HEAL);
        healedHp = mapRun.playerHp - hpBeforeHeal; duel.playerHp = mapRun.playerHp;

        xpGained = node ? (node.xp || 50) : 50; levelsGained = gainXp(xpGained);

        if (node) { node.cleared = true; node.type = 'empty'; node.icon = '🪵'; }

        showFloatingText(`+${reward} 🪙 · +${xpGained} EXP`, '#f1c40f', '30%', '22%', '20px');
    } else { runFinishedAt = Date.now(); }

    document.getElementById('duelResultTitle').innerText = win ? (isBossNode ? `👑 Boss Piętra ${mapRun.act} Pokonany!` : 'Zwycięstwo na Szlaku!') : 'Poległeś na Szlaku...';
    document.getElementById('duelResultTitle').style.color = win ? '#2ecc71' : '#e74c3c';

    let levelUpLine = levelsGained > 0 ? `<div><span>🎉 Awans na Poziom ${mapRun.level}!</span><strong style="color:#f1c40f">+${levelsGained * DUEL.LEVEL_UP_HP} Max HP i leczenie!</strong></div>` : '';
    document.getElementById('duelResultText').innerHTML =
        `<div><span>Przeciwnik:</span><strong style="color:#f39c12">${currentEnemyTrait ? currentEnemyTrait.name : 'Wróg'}</strong></div>` +
        `<div><span>Rundy walki:</span><strong style="color:#fff">${duel.round}</strong></div>` +
        `<div><span>Zadane / Otrzymane DMG:</span><strong style="color:var(--mult)">${st.dealt} / ${st.taken}</strong></div>` +
        `<div><span>Zablokowane tarczą:</span><strong style="color:var(--chips)">${st.blocked} 🛡</strong></div>` +
        (win ? `<div><span>Regeneracja po walce (+150):</span><strong style="color:#2ecc71">+${healedHp} ❤️ (Masz ${mapRun.playerHp}/${mapRun.playerMaxHp} HP)</strong></div>` : '') +
        (win ? `<div><span>Zdobyte doświadczenie:</span><strong style="color:#f1c40f">+${xpGained} EXP (Poz. ${mapRun.level}: ${mapRun.xp}/${mapRun.xpNext})</strong></div>` : '') +
        levelUpLine + `<div><span>Nagroda (układy +${currentFightBonus}):</span><strong style="color:#f1c40f">${win ? `+${reward} 🪙` : '0 🪙'}</strong></div>`;

    document.getElementById('duelMapContinueBtn').style.display = (win && !isBossNode) ? 'block' : 'none';
    document.getElementById('duelNextActBtn').style.display = (win && isBossNode) ? 'block' : 'none';
    document.getElementById('duelRetryBtn').style.display = !win ? 'block' : 'none';

    updateUI(); const token = duel.token;
    setTimeout(() => { if (duel.token === token && duel.active) toggleModal('duelResultModal', true); }, 700);
}

function duelPlay() {
    if (gameOver || handResolutionPending || !duel.active) return;
    if (duel.phase === 'attack') {
        playHaptic('tap'); duel.phase = 'shield'; shieldCards = [];
        document.getElementById('log').innerText = selectedCards.length > 0 ? 'Etap 2/2: Wybierz do 3 kart na Tarczę (Para i Trójka dają mnożnik!).' : 'Pominąłeś atak. Etap 2/2: Wybierz do 3 kart na Tarczę.';
        evaluateHand(); updateUI(); return;
    }

    const attackCards = hand.filter(c => selectedCards.includes(c.id));
    const shieldHand = hand.filter(c => shieldCards.includes(c.id));

    let damage = 0; let handName = null;
    if (attackCards.length) {
        const { rule, sum } = scoreCards(attackCards); handName = rule.name;
        const luckyProc = relics.lucky_coin && Math.random() < 0.10;
        if (luckyProc) showFloatingText('🪙 Szczęście x2!', '#f1c40f', '65%', '35%', '20px');
        damage = Math.floor(computeAttackDamage(rule, sum, { potionBonus: activeBuff.turns > 0 ? activeBuff.dmg : 0, dice: pendingDiceRoll, applyEnemyTrait: true, applyPlayerRelics: true, luckyProc }).damage);
    }

    const go = () => resolveDuelPlayerTurn(damage, handName, attackCards, shieldHand);
    if (handName === 'Strit') {
        setHandResolutionPending(true);
        animateCardsToEnemy(attackCards, document.querySelector('.hp-enemy'), { stagger:115, duration:430 });
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setTimeout(() => { setHandResolutionPending(false); go(); }, (reduceMotion ? 280 : 430) + (attackCards.length - 1) * (reduceMotion ? 35 : 115) + 50);
        return;
    }
    go();
}

function resolveDuelPlayerTurn(damage, handName, attackCards, shieldHand) {
    if (gameOver || !duel.active) return; const fm = fatigueMult();

    if (attackCards.length) {
        playHaptic(handName === 'Poker' ? 'poker' : 'hit'); runHandAnimation(handName, attackCards);
        if (!rewardedHandsThisFight.has(handName)) {
            currentFightBonus += HAND_WIN_BONUS[handName] || 0;
            rewardedHandsThisFight.add(handName);
        }
        if (relics.iron_signet && (handName === 'Para' || handName === 'Dwie Pary')) {
            duel.playerShield += 5;
            showFloatingText('💍 +5 🛡', '#5dade2', '17%', '80%', '18px');
        }
        if (relics.blood_amulet && handName === 'Full') {
            const healed = healPlayerBy(15);
            if (healed) showFloatingText(`🩸 +${healed} HP`, '#2ecc71', '17%', '72%', '18px');
        }
        let incoming = Math.floor(damage * fm);

        if (duel.corvenBlockArmed) { incoming = 0; duel.corvenBlockArmed = false; showFloatingText('🛡️ ZABLOKOWANO 100%', '#5dade2', '30%', '28%', '20px'); }

        const absorbed = Math.min(duel.enemyShield, incoming); const dealt = incoming - absorbed;
        duel.enemyShield = 0; duel.enemyHp = Math.max(0, duel.enemyHp - dealt);
        duel.stats.dealt += dealt;
        if (incoming > duel.stats.bestDmg) { duel.stats.bestDmg = incoming; duel.stats.bestName = handName; }
        if (incoming > runStats.bestHandDmg) { runStats.bestHandDmg = incoming; runStats.bestHandName = handName; }
        runStats.totalDamage += dealt;

        if (absorbed > 0) showFloatingText(`🛡 −${absorbed}`, '#5dade2', '76%', '25%', '18px');
        showFloatingText(`-${dealt}`, '#e74c3c', '76%', '17%', '26px'); pendingDiceRoll = 0;
        if (activeBuff.turns > 0) { activeBuff.turns--; if (activeBuff.turns === 0) activeBuff.dmg = 0; }

        if (currentEnemyTrait && duel.enemyHp > 0) {
            if (currentEnemyTrait.id === 'boss_kael' && !duel.kaelEnraged && (duel.enemyMaxHp - duel.enemyHp) > 150) { duel.kaelEnraged = true; showFloatingText('🔥 SZAŁ KAELA!', '#e67e22', '30%', '30%', '19px'); }
            if (currentEnemyTrait.id === 'boss_corven' && !duel.corvenBlockTriggered && duel.enemyHp <= duel.enemyMaxHp * 0.5) { duel.corvenBlockTriggered = true; duel.corvenBlockArmed = true; showFloatingText('🛡️ TARCZA CORVENA!', '#5dade2', '30%', '30%', '19px'); }
            if (currentEnemyTrait.id === 'boss_riwi' && duel.handLimit === 8) { duel.handLimit = 7; showFloatingText('🩸 OBCIĘCIE PALCA!', '#e74c3c', '65%', '30%', '19px'); }
            if (currentEnemyTrait.id === 'boss_farron' && (handName === 'Wysoka Karta' || handName === 'Para')) {
                duel.playerHp = Math.max(0, duel.playerHp - 15); mapRun.playerHp = duel.playerHp; duel.stats.taken += 15; showFloatingText('🔫 Kontra -15 HP!', '#e74c3c', '15%', '22%', '20px'); triggerPhoenixIfNeeded();
            }
        }
    } else { duel.enemyShield = 0; }

    const shEval = evaluateShieldCards(shieldHand, true); duel.playerShield += shEval.total;
    if (shEval.total > 0) showFloatingText(`+${shEval.total} 🛡`, '#5dade2', '17%', '80%', '20px');

    const usedIds = attackCards.concat(shieldHand).map(c => c.id); const used = hand.filter(c => usedIds.includes(c.id));
    hand = hand.filter(c => !usedIds.includes(c.id)); discardPile.push(...used);
    selectedCards = []; shieldCards = []; duel.phase = 'attack'; evaluateHand();

    if (duel.enemyHp === 0) { updateUI(); if (attackCards.length && damage > 0) animateEnemyHpChange(); duelEnd(true); return; }
    if (duel.playerHp === 0) { updateUI(); if (attackCards.length && damage > 0) animateEnemyHpChange(); duelEnd(false); return; }

    setHandResolutionPending(true); updateUI();
    if (attackCards.length && damage > 0) animateEnemyHpChange();
    duelEnemyTurn(duel.token).catch(err => { console.error(err); setHandResolutionPending(false); });
}

function planEnemyTurn(cards) {
    const n = cards.length; let best = null;
    for (let mask = 1; mask < (1 << n); mask++) {
        const subset = []; for (let i = 0; i < n; i++) if (mask & (1 << i)) subset.push(cards[i]);
        if (subset.length > 5) continue;
        const sc = scoreCards(subset); let damage = Math.floor(computeAttackDamage(sc.rule, sc.sum).damage);
        if (duel.kaelEnraged) damage = Math.floor(damage * 1.10);
        const usedVal = subset.reduce((t, c) => t + c.val, 0);
        if (!best || damage > best.damage || (damage === best.damage && usedVal < best.usedVal)) { best = { attack: subset, rule: sc.rule, damage, usedVal }; }
    }
    const remaining = cards.filter(c => !best.attack.includes(c));
    const maxShieldCount = Math.max(0, Math.min(DUEL.SHIELD_MAX_CARDS, DUEL.PLAY_LIMIT - best.attack.length));
    let bestShield = { cards: [], value: 0, name: 'Brak' }; const m = remaining.length;
    for (let mask = 0; mask < (1 << m); mask++) {
        const sub = []; for (let i = 0; i < m; i++) if (mask & (1 << i)) sub.push(remaining[i]);
        if (sub.length > maxShieldCount) continue;
        const ev = evaluateShieldCards(sub, false); if (ev.total > bestShield.value) { bestShield = { cards: sub, value: ev.total, name: ev.name }; }
    }
    return { attack: best.attack, rule: best.rule, damage: best.damage, shield: bestShield.cards, shieldValue: bestShield.value, shieldName: bestShield.name };
}

function renderEnemyHand(cards) {
    const box = document.getElementById('enemyHand'); box.innerHTML = '';
    cards.forEach((c, i) => { const el = document.createElement('div'); el.className = 'e-card back dealing'; el.dataset.cardId = c.id; el.style.setProperty('--card-index', i); box.appendChild(el); });
}

function revealEnemyCard(card, role) {
    const el = Array.from(document.querySelectorAll('#enemyHand .e-card')).find(e => e.dataset.cardId === card.id); if (!el) return;
    el.className = `e-card open ${card.color === 'red' ? 'red' : ''} ${role} flip`; el.innerHTML = `<span>${card.rank}</span><span>${card.suit}</span>`;
}

function setEnemyNote(text) { document.getElementById('duelEnemyNote').innerText = text; }
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
function motionScale() { return (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 0.5 : 1; }
function duelCap() {
    if (mapRun.active && mapRun.act > 1) return Infinity;
    let baseCap = Math.round(duel.enemyMaxHp * DUEL.CAP_PCT);
    if (duel.kaelEnraged) baseCap = Math.round(baseCap * 1.10);
    return baseCap;
}
function isFatigued() { return duel.round >= duel.fatigueRound; }
function fatigueMult() { return isFatigued() ? DUEL.FATIGUE_MULT : 1; }

async function executeSingleEnemyStrike(token, isSecondStrike = false) {
    const alive = () => duel.active && duel.token === token && !gameOver; const k = motionScale();
    duel.enemyCards = shuffle(createDeck()).slice(0, DUEL.ENEMY_HAND); const plan = planEnemyTurn(duel.enemyCards);
    setEnemyNote(isSecondStrike ? '⚔️ Szał Bojowy Lokara — drugi atak!' : 'Wróg losuje karty…');
    renderEnemyHand(duel.enemyCards); await wait(800 * k); if (!alive()) return false;
    for (const card of plan.attack) { revealEnemyCard(card, 'attack'); await wait(210 * k); if (!alive()) return false; }
    await wait(320 * k); if (!alive()) return false;

    const fm = fatigueMult(); const raw = Math.min(plan.damage, duelCap()); const incoming = Math.floor(raw * fm);
    const absorbed = Math.min(duel.playerShield, incoming); const dealt = incoming - absorbed;
    duel.playerShield = Math.max(0, duel.playerShield - incoming); duel.playerHp = Math.max(0, duel.playerHp - dealt);
    if (mapRun.active) mapRun.playerHp = duel.playerHp;
    duel.stats.taken += dealt; duel.stats.blocked += absorbed;
    triggerPhoenixIfNeeded();

    setEnemyNote(`Wróg gra: ${plan.rule.name} (${incoming} DMG)`);
    if (absorbed > 0) showFloatingText(`🛡 −${absorbed}`, '#5dade2', '17%', '80%', '18px');
    showFloatingText(`-${dealt}`, dealt > 0 ? '#e74c3c' : '#aaaaaa', '17%', '72%', '26px');
    if (dealt > 0) { playHaptic('hit'); animateScreenShake(document.querySelector('.tavern-table')); }
    if (currentEnemyTrait && currentEnemyTrait.id === 'boss_daren') { duel.poisonStacks++; showFloatingText(`☠️ Trucizna +1`, '#2ecc71', '18%', '28%', '17px'); }
    if (currentEnemyTrait && currentEnemyTrait.id === 'boss_flinch' && duel.round % 2 === 0 && dealt > 0) {
        const healAmt = Math.floor(dealt * 0.5); if (healAmt > 0) { duel.enemyHp = Math.min(duel.enemyMaxHp, duel.enemyHp + healAmt); showFloatingText(`🩸 Pijawka +${healAmt} HP`, '#2ecc71', '30%', '26%', '19px'); }
    }
    updateUI(); if (duel.playerHp === 0) { duelEnd(false); return false; }
    await wait(550 * k); if (!alive()) return false;

    for (const card of plan.shield) { revealEnemyCard(card, 'shield'); await wait(180 * k); if (!alive()) return false; }
    const traitGuardBonus = (currentEnemyTrait && currentEnemyTrait.id === 'iron_guard') ? 15 : 0;
    duel.enemyShield = plan.shieldValue + traitGuardBonus;
    if (duel.enemyShield > 0) { setEnemyNote(`Wróg gra: ${plan.rule.name} (${incoming} DMG) · ${plan.shieldName} +${duel.enemyShield} 🛡`); showFloatingText(`+${duel.enemyShield} 🛡`, '#5dade2', '30%', '34%', '20px'); }
    updateUI(); await wait(700 * k); if (!alive()) return false;
    return true;
}

async function duelEnemyTurn(token) {
    const alive = () => duel.active && duel.token === token && !gameOver; const k = motionScale();
    await wait(600 * k); if (!alive()) return;
    const survivedFirst = await executeSingleEnemyStrike(token, false); if (!survivedFirst) return;

    if (currentEnemyTrait && currentEnemyTrait.id === 'boss_lokar' && !duel.lokarFrenzyUsed && duel.enemyHp <= duel.enemyMaxHp * 0.30) {
        duel.lokarFrenzyUsed = true; showFloatingText('⚔️ SZAŁ BOJOWY LOKARA!', '#e67e22', '30%', '30%', '19px');
        await wait(500 * k); if (!alive()) return;
        const survivedSecond = await executeSingleEnemyStrike(token, true); if (!survivedSecond) return;
    }

    if (duel.poisonStacks > 0 && duel.playerHp > 0) {
        const poisonDmg = duel.poisonStacks * DUEL.POISON_DMG; duel.playerHp = Math.max(0, duel.playerHp - poisonDmg);
        if (mapRun.active) mapRun.playerHp = duel.playerHp; duel.stats.taken += poisonDmg;
        showFloatingText(`☠️ -${poisonDmg} HP`, '#2ecc71', '15%', '24%', '20px'); triggerPhoenixIfNeeded(); updateUI();
        if (duel.playerHp === 0) { duelEnd(false); return; } await wait(450 * k); if (!alive()) return;
    }

    if (duel.regenTurns > 0) {
        duel.regenTurns--;
        const healed = healPlayerBy(20);
        if (healed) showFloatingText(`❤️ +${healed} HP (regeneracja)`, '#2ecc71', '17%', '72%', '18px');
    }
    duel.playerShield = 0; duel.round++; duel.phase = 'attack'; duel.enemyCards = [];
    document.getElementById('enemyHand').innerHTML = ''; setEnemyNote('Wróg losuje karty na początku swojego ruchu.');

    let bonusDiscardMsg = '';
    if (duel.round % 5 === 0) { discardsLeft++; showFloatingText('+1 Odrzut (5. runda!)', '#3498db', '65%', '28%', '18px'); bonusDiscardMsg = ' · Otrzymujesz +1 darmowy odrzut!'; }

    document.getElementById('log').innerText = `Runda ${duel.round} — Etap 1/2: Wybierz karty na Atak${bonusDiscardMsg}`;
    setHandResolutionPending(false); drawReplacements(true);
    if (!duel.fatigueShown && duel.round >= duel.fatigueRound) { duel.fatigueShown = true; toggleModal('fatigueModal', true); }
}

function applyDuelView() {
    const on = duel.active; document.body.classList.toggle('duel-mode', on); document.getElementById('duelPanel').style.display = on ? 'block' : 'none';
    document.getElementById('ui-turns-label').innerText = 'Twoje HP:'; document.getElementById('ui-player-hp').innerText = `${duel.playerHp}/${duel.playerMaxHp}`;
    document.getElementById('ui-enemy-hp').innerText = `${duel.enemyHp}/${duel.enemyMaxHp}`;
    if (!on) return; updateDuelPanel();
}

function updateDuelPanel() {
    const fm = fatigueMult(); document.getElementById('duelRound').innerText = `Runda ${duel.round} · ${duel.phase === 'attack' ? 'Etap 1/2: Atak ⚔' : 'Etap 2/2: Tarcza 🛡'}`;
    document.getElementById('duelFatigueTag').style.display = isFatigued() ? 'inline' : 'none';
    const poisonTag = document.getElementById('duelPoisonTag');
    if (duel.poisonStacks > 0) { poisonTag.style.display = 'inline'; poisonTag.innerText = `☠️ Trucizna: ${duel.poisonStacks * DUEL.POISON_DMG} DMG/t.`; } else { poisonTag.style.display = 'none'; }
    document.getElementById('duelPlayerShield').innerText = duel.playerShield; document.getElementById('duelEnemyShield').innerText = duel.enemyShield;

    const hintEl = document.getElementById('duelHint');
    if (duel.phase === 'attack') { hintEl.innerText = `Krok 1/2 (⚔ Atak): Wybierz 0–5 kart (${selectedCards.length}/5) · Co 5. rundę +1 odrzut`; } 
    else { hintEl.innerText = `Krok 2/2 (🛡 Tarcza): Wybierz 0–3 wolnych kart (${shieldCards.length}/3) · Para i Trójka dają mnożnik!`; }

    const lines = []; const attack = hand.filter(c => selectedCards.includes(c.id)); const shield = hand.filter(c => shieldCards.includes(c.id));
    if (attack.length) {
        const incoming = duel.corvenBlockArmed ? 0 : Math.floor(currentDamage * fm); const absorbed = Math.min(duel.enemyShield, incoming);
        const after = Math.max(0, duel.enemyHp - (incoming - absorbed));
        lines.push(`⚔ Atak ${incoming}${duel.corvenBlockArmed ? ' (Zablokowany!)' : ''}${absorbed ? `, tarcza wroga −${absorbed}` : ''} → wróg ${after} HP`);
    } else if (duel.phase === 'shield') { lines.push(`⚔ Atak pominięty (0 DMG)`); }
    const shEval = evaluateShieldCards(shield, true); const totalPreviewShield = duel.playerShield + shEval.total;
    if (shEval.total > 0) lines.push(`🛡 ${shEval.name}: +${shEval.total} (łącznie ${totalPreviewShield} 🛡)`);
    const poisonNow = duel.poisonStacks * DUEL.POISON_DMG;
    let html;
    if (Number.isFinite(duelCap())) {
        const maxIn = Math.floor(duelCap() * fm); const worst = Math.max(0, maxIn - totalPreviewShield) + poisonNow;
        lines.push(`Wróg uderzy za max ${maxIn}${totalPreviewShield ? ` (po tarczy${duel.poisonStacks ? ' i truciźnie' : ''}: ${worst})` : ''}.`);
        html = lines.join('<br>'); if (!gameOver && duel.playerHp <= worst) html += '<br><span class="duel-warn">⚠ Możesz paść w tej rundzie!</span>';
    } else {
        lines.push(`Wróg nie ma limitu obrażeń${poisonNow ? ` · trucizna: −${poisonNow} HP po jego ruchu` : ''}.`);
        html = lines.join('<br>');
    }
    document.getElementById('duelPreview').innerHTML = html;
}

initGame();
