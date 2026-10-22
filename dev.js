/* ===================== TRYB DEWELOPERSKI (dev.js) =====================
   Włączanie: 5x szybko stuknij tytuł "Pod Złamaną Kotwicą" w lobby
   albo otwórz grę z dopiskiem ?dev=1 na końcu adresu.
   Żeby WYŁĄCZYĆ na stałe: usuń z index.html linijkę <script src="dev.js"></script>
======================================================================= */
(function () {
    let panel = null, toggleBtn = null, enabled = false;

    const FIGURES = {
        'Poker':        ['♠-9', '♠-8', '♠-7', '♠-6', '♠-5'],
        'Kareta':       ['♠-8', '♥-8', '♦-8', '♣-8'],
        'Full':         ['♠-K', '♥-K', '♦-K', '♠-7', '♥-7'],
        'Kolor':        ['♥-A', '♥-J', '♥-8', '♥-5', '♥-2'],
        'Strit':        ['♠-Q', '♥-J', '♦-10', '♣-9', '♠-8'],
        'Trójka':       ['♠-10', '♥-10', '♦-10'],
        'Dwie Pary':    ['♠-J', '♥-J', '♠-5', '♥-5'],
        'Para':         ['♠-9', '♥-9'],
        'Wysoka Karta': ['♠-A']
    };

    function msg(text) {
        const log = document.getElementById('log');
        if (log) log.innerText = '🛠 ' + text;
    }

    function refreshAll() {
        updateUI();
        const shop = document.getElementById('shopModal');
        if (shop && shop.style.display === 'flex') renderShop();
    }

    function addCoins(n) {
        coins += n;
        refreshAll();
        msg('Dodano ' + n + ' monet. Masz: ' + coins);
        updateCounters();
    }

    function addItem(id) {
        const item = SHOP_ITEMS.find(i => i.id === id);
        if (!item) return;
        if (item.isRelic) {
            relics[id] = true;
        } else if (id === 'dice' && inventory.find(i => i.id === 'dice')) {
            inventory.find(i => i.id === 'dice').charges += 3;
        } else if (inventory.length < MAX_INV) {
            inventory.push(makeInventoryItem(item));
        } else {
            alert('Plecak pełny (3/3). Użyj albo wyrzuć któryś przedmiot.');
            return;
        }
        refreshAll();
        msg('Dodano: ' + item.name);
    }

    function ensureRun() {
        if (!mapRun.active || !duel.active) {
            const keepCoins = coins;
            startDuelRun();
            toggleModal('mapModal', false);
            coins = keepCoins;
        }
    }

    function startFight(kind, enemyId) {
        ensureRun();
        let list = kind === 'boss' ? CALION_BOSSES : (kind === 'elite' ? ELITE_ENEMIES : REGULAR_ENEMIES);
        const enemy = list.find(e => e.id === enemyId);
        if (!enemy) return;
        const bonus = (mapRun.act - 1) * DUEL.ACT_HP_STEP;
        const base = kind === 'boss' ? DUEL.BOSS_BASE_HP : (kind === 'elite' ? DUEL.ELITE_BASE_HP : DUEL.ZBIR_BASE_HP);
        const xp = kind === 'boss' ? 250 : (kind === 'elite' ? 110 : 50);
        const devId = 9000 + Math.floor(Math.random() * 900);
        const node = { id: devId, x: -50, y: -50, type: kind === 'boss' ? 'boss' : (kind === 'elite' ? 'elite' : 'fight'),
            icon: '🛠', title: enemy.name, hp: base + bonus, xp, enemy, targets: [], cleared: false, isDev: true };
        window.__devPrevNodeId = mapRun.nodes.some(n => n.isDev) ? window.__devPrevNodeId : mapRun.currentNodeId;
        mapRun.nodes = mapRun.nodes.filter(n => !n.isDev);
        mapRun.nodes.push(node);
        mapRun.currentNodeId = devId;
        toggleModal('mapModal', false);
        toggleModal('duelResultModal', false);
        startDuelFromMapNode(node);
        closePanel();
    }

    function forceFigure(name) {
        if (!duel.active || gameOver) { alert('Najpierw rozpocznij walkę (sekcja "Wywołaj walkę").'); return; }
        const ids = FIGURES[name];
        const full = createDeck();
        const forced = ids.map(id => full.find(c => c.id === id)).filter(Boolean);
        const idSet = new Set(forced.map(c => c.id));
        hand = hand.filter(c => !idSet.has(c.id));
        deck = deck.filter(c => !idSet.has(c.id));
        discardPile = discardPile.filter(c => !idSet.has(c.id));
        const limit = currentHandLimit();
        while (hand.length + forced.length > limit) discardPile.push(hand.pop());
        hand = hand.concat(forced);
        while (hand.length < limit) {
            const extra = drawCards(1);
            if (!extra.length) break;
            hand = hand.concat(extra);
        }
        hand.sort((a, b) => rankOrder.get(a.rank) - rankOrder.get(b.rank));
        duel.phase = 'attack';
        shieldCards = [];
        selectedCards = forced.map(c => c.id);
        animateNextRender = true;
        updateLockedCard();
        evaluateHand();
        updateUI();
        msg('Masz na ręce: ' + name + '. Karty są już zaznaczone — kliknij "Atak".');
        closePanel();
    }

    function killEnemy() {
        if (!duel.active || gameOver) { alert('Nie ma trwającej walki.'); return; }
        duel.enemyHp = 0;
        updateUI();
        duelEnd(true);
        closePanel();
    }

    function healPlayer() {
        if (!mapRun.active) { alert('Najpierw rozpocznij wyprawę.'); return; }
        mapRun.playerHp = mapRun.playerMaxHp;
        duel.playerHp = mapRun.playerMaxHp;
        refreshAll();
        msg('HP uzupełnione.');
    }

    function extraDiscards() {
        discardsLeft += 5;
        refreshAll();
        msg('+5 odrzutów. Masz: ' + discardsLeft);
    }

    function jumpToFatigue() {
        if (!duel.active || gameOver) { alert('Nie ma trwającej walki.'); return; }
        duel.round = duel.fatigueRound;
        duel.fatigueShown = true;
        refreshAll();
        msg('Skok do rundy ' + duel.round + ' (Zmęczenie aktywne).');
    }

    function openShop() {
        renderShop();
        const btn = document.getElementById('shopProceedBtn');
        btn.innerText = 'Zamknij (dev)';
        btn.onclick = function () { toggleModal('shopModal', false); };
        document.getElementById('shopLeaveDuelBtn').style.display = 'none';
        toggleModal('shopModal', true);
        closePanel();
    }

    function previewAnim(name) {
        const ids = FIGURES[name] || FIGURES['Kolor'];
        const full = createDeck();
        const cards = ids.map(id => full.find(c => c.id === id)).filter(Boolean);
        closePanel();
        setTimeout(function () { runHandAnimation(name, cards); }, 250);
    }

    function updateCounters() {
        const el = document.getElementById('devCoins');
        if (el) el.innerText = coins;
    }

    function closePanel() { if (panel) panel.style.display = 'none'; }
    function togglePanel() {
        if (!panel) return;
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        updateCounters();
    }

    function btn(label, fn, color) {
        const b = document.createElement('button');
        b.textContent = label;
        b.style.cssText = 'margin:2px;padding:6px 8px;font-size:12px;border-radius:6px;border:1px solid #b38743;background:' + (color || '#2a1c11') + ';color:#e8ddc7;cursor:pointer;';
        b.onclick = fn;
        return b;
    }

    function section(title) {
        const h = document.createElement('div');
        h.textContent = title;
        h.style.cssText = 'margin:8px 0 3px;color:#f1c40f;font-weight:bold;font-size:12px;border-bottom:1px solid rgba(179,135,67,.4);';
        return h;
    }

    function buildPanel() {
        panel = document.createElement('div');
        panel.style.cssText = 'position:fixed;top:6px;right:6px;width:min(94vw,380px);max-height:92vh;overflow-y:auto;z-index:400;background:rgba(10,6,3,.96);border:2px solid #f1c40f;border-radius:10px;padding:8px 10px;color:#e8ddc7;font:12px system-ui,sans-serif;display:none;';

        const head = document.createElement('div');
        head.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';
        head.innerHTML = '<b style="color:#f1c40f;font-size:14px">🛠 Tryb deweloperski</b><span>🪙 <b id="devCoins">0</b></span>';
        panel.appendChild(head);
        panel.appendChild(btn('✖ Zamknij panel', closePanel, '#5a1f1a'));

        panel.appendChild(section('Monety'));
        [50, 100, 500].forEach(n => panel.appendChild(btn('+' + n + ' 🪙', () => addCoins(n))));

        panel.appendChild(section('Wywołaj walkę (rozpoczyna nową wyprawę, jeśli trzeba)'));
        const lists = [['Zbiry', 'fight', REGULAR_ENEMIES], ['Elity', 'elite', ELITE_ENEMIES], ['Bossowie', 'boss', CALION_BOSSES]];
        lists.forEach(function (entry) {
            const label = document.createElement('div');
            label.textContent = entry[0] + ':';
            label.style.cssText = 'margin-top:4px;color:#b9ad92;';
            panel.appendChild(label);
            entry[2].forEach(function (e) {
                const short = e.name.replace(/[„”"].*?[„”"]/g, '').trim();
                panel.appendChild(btn(short, () => startFight(entry[1], e.id)));
            });
        });

        panel.appendChild(section('Wymuś figurę na ręce (w trakcie walki)'));
        Object.keys(FIGURES).forEach(name => panel.appendChild(btn(name, () => forceFigure(name))));

        panel.appendChild(section('Podgląd animacji (bez walki)'));
        ['Poker', 'Kareta', 'Full', 'Kolor', 'Trójka'].forEach(name => panel.appendChild(btn('▶ ' + name, () => previewAnim(name), '#1f3323')));

        panel.appendChild(section('Przedmioty i relikty (za darmo)'));
        SHOP_ITEMS.forEach(item => panel.appendChild(btn(item.name, () => addItem(item.id), item.isRelic ? '#4a3a12' : '#2a1c11')));

        panel.appendChild(section('Inne'));
        panel.appendChild(btn('❤ Pełne HP', healPlayer));
        panel.appendChild(btn('+5 odrzutów', extraDiscards));
        panel.appendChild(btn('⏩ Runda 10 (Zmęczenie)', jumpToFatigue));
        panel.appendChild(btn('💀 Zabij wroga', killEnemy, '#5a1f1a'));
        panel.appendChild(btn('🪙 Otwórz sklep', openShop));

        document.body.appendChild(panel);

        toggleBtn = document.createElement('button');
        toggleBtn.textContent = '🛠';
        toggleBtn.style.cssText = 'position:fixed;left:6px;bottom:6px;z-index:390;width:38px;height:38px;border-radius:50%;border:2px solid #f1c40f;background:rgba(10,6,3,.9);color:#f1c40f;font-size:18px;cursor:pointer;';
        toggleBtn.onclick = togglePanel;
        document.body.appendChild(toggleBtn);
    }

    function enableDev() {
        if (enabled) return;
        enabled = true;
        buildPanel();
        panel.style.display = 'block';
        updateCounters();
    }

    // Po wygranej dev-walce wróć na poprzednie pole mapy (żeby nie utknąć na polu testowym)
    const originalContinue = window.continueToMapAfterDuel;
    window.continueToMapAfterDuel = function () {
        const dev = mapRun.nodes.find(n => n.id === mapRun.currentNodeId && n.isDev);
        if (dev) {
            mapRun.currentNodeId = (window.__devPrevNodeId !== undefined) ? window.__devPrevNodeId : 0;
            mapRun.nodes = mapRun.nodes.filter(n => !n.isDev);
        }
        originalContinue();
    };

    // Aktywacja: ?dev=1 lub 5 stuknięć w tytuł w lobby
    if (/[?&]dev=1/.test(location.search)) {
        window.addEventListener('load', enableDev);
    }
    let taps = 0, lastTap = 0;
    document.addEventListener('click', function (e) {
        const t = e.target.closest ? e.target.closest('.lobby-title') : null;
        if (!t) return;
        const now = Date.now();
        taps = (now - lastTap < 1500) ? taps + 1 : 1;
        lastTap = now;
        if (taps >= 5) { taps = 0; enableDev(); }
    });
})();