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
