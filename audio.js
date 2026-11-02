/* Kalon v0.4.23: dyskretne efekty interfejsu, kart i ruchu po labiryncie. */
(function (global) {
    'use strict';

    // Na razie nie używamy fanfar ani dźwięków nagród. Zachowujemy ich pliki,
    // żeby móc je wymienić bez usuwania wcześniejszych wersji z repozytorium.
    const DISABLED_SOUNDS = Object.freeze([
        'ui_confirm', 'coin_gain', 'exp_gain', 'level_up',
        'training_start', 'quest_start', 'quest_complete'
    ]);

    // Nazwy logiczne mogą mieć kilka krótkich wariantów tego samego efektu.
    const SOUND_FILES = Object.freeze({
        ui_click: ['ui_click'],
        ui_back: ['ui_back'],
        ui_open: ['ui_open'],
        ui_error: ['ui_error'],
        equip_item: ['equip_item'],
        card_paper: ['card_paper_1', 'card_paper_2'],
        maze_step: ['maze_step_1', 'maze_step_2']
    });
    const SOUND_NAMES = Object.freeze(Object.keys(SOUND_FILES));
    const STORAGE_KEY = 'kalon.audio.v1';
    const LIMIT = 4;
    const COOLDOWNS = Object.freeze({ ui_click: 45, card_paper: 40, maze_step: 135 });
    const active = new Set();
    const lastPlayed = new Map();
    const variantIndex = new Map();
    let enabled = true;
    let volume = 0.35;

    try {
        const saved = JSON.parse(global.localStorage.getItem(STORAGE_KEY) || 'null');
        if (saved && typeof saved.enabled === 'boolean') enabled = saved.enabled;
        if (saved && Number.isFinite(saved.volume)) volume = Math.min(1, Math.max(0, saved.volume));
    } catch (_) { /* Brak dostępu do localStorage nie wyłącza efektów. */ }

    function persist() {
        try { global.localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled, volume })); }
        catch (_) {}
    }

    function play(name) {
        const files = Object.prototype.hasOwnProperty.call(SOUND_FILES, name) ? SOUND_FILES[name] : null;
        if (!enabled || volume <= 0 || !files || typeof global.Audio !== 'function') return false;
        const now = Date.now();
        if (now - (lastPlayed.get(name) || 0) < (COOLDOWNS[name] || 45)) return false;
        if (active.size >= LIMIT) return false;
        lastPlayed.set(name, now);
        const n = variantIndex.get(name) || 0;
        variantIndex.set(name, n + 1);

        try {
            const clip = new global.Audio('assets/audio/' + files[n % files.length] + '.wav');
            clip.volume = volume;
            clip.preload = 'auto';
            active.add(clip);
            const cleanup = () => active.delete(clip);
            clip.addEventListener('ended', cleanup, { once: true });
            clip.addEventListener('error', cleanup, { once: true });
            const result = clip.play();
            if (result && typeof result.catch === 'function') result.catch(cleanup);
            return true;
        } catch (_) { return false; }
    }

    function syncSettings() {
        const checkbox = document.getElementById('audioEnabled');
        const slider = document.getElementById('audioVolume');
        const label = document.getElementById('audioVolumeValue');
        const header = document.getElementById('soundSettingsBtn');
        if (checkbox) checkbox.checked = enabled;
        if (slider) slider.value = String(Math.round(volume * 100));
        if (label) label.textContent = Math.round(volume * 100) + '%';
        if (header) {
            header.textContent = enabled && volume > 0 ? '🔊 Dźwięki' : '🔇 Dźwięki';
            header.setAttribute('aria-label', 'Ustawienia dźwięku');
        }
    }

    function setEnabled(value) {
        enabled = Boolean(value); persist(); syncSettings();
        if (!enabled) {
            for (const clip of active) { try { clip.pause(); clip.currentTime = 0; } catch (_) {} }
            active.clear();
        }
    }

    function setVolume(value) {
        volume = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : volume;
        for (const clip of active) clip.volume = volume;
        persist(); syncSettings();
    }

    function openSettings() {
        const modal = document.getElementById('audioSettingsModal');
        if (modal) modal.style.display = 'flex';
        syncSettings();
        play('ui_open');
    }
    function closeSettings() {
        const modal = document.getElementById('audioSettingsModal');
        if (modal) modal.style.display = 'none';
        play('ui_back');
    }
    function previewSelected() {
        const select = document.getElementById('audioPreview');
        if (select) play(select.value);
    }

    // Przycisk daje jedynie krótki, suchy klik. Kafelki mapy mają dźwięk kroku,
    // więc nie odtwarzamy dla nich dodatkowo kliknięcia. Karty nie są buttonami.
    if (typeof document !== 'undefined') {
        document.addEventListener('click', function (event) {
            const button = event.target && event.target.closest ? event.target.closest('button') : null;
            if (!button || button.disabled || (button.classList && button.classList.contains('maze-tile'))) return;
            if (button.id === 'soundSettingsBtn' || button.closest('#audioSettingsModal')) return;
            play('ui_click');
        });
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncSettings);
        else syncSettings();
    }
    global.KalonAudio = Object.freeze({
        play, setEnabled, setVolume, openSettings, closeSettings, previewSelected,
        getSettings: () => ({ enabled, volume }),
        names: SOUND_NAMES, disabledNames: DISABLED_SOUNDS
    });
})(window);
