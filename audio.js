/* Kalon v0.4.21: efekty medieval fantasy. Bez zewnętrznych zależności. */
(function (global) {
    'use strict';
    const SOUND_NAMES = Object.freeze([
        'ui_click', 'ui_back', 'ui_open', 'ui_confirm', 'ui_error',
        'coin_gain', 'exp_gain', 'level_up', 'equip_item',
        'training_start', 'quest_start', 'quest_complete'
    ]);
    const SOUND_SET = new Set(SOUND_NAMES);
    const STORAGE_KEY = 'kalon.audio.v1';
    const LIMIT = 4;
    let enabled = true;
    let volume = 0.35;
    const active = new Set();
    const lastPlayed = new Map();

    try {
        const value = JSON.parse(global.localStorage.getItem(STORAGE_KEY) || 'null');
        if (value && typeof value.enabled === 'boolean') enabled = value.enabled;
        if (value && Number.isFinite(value.volume)) volume = Math.min(1, Math.max(0, value.volume));
    } catch (_) { /* Przeglądarki prywatne mogą blokować localStorage. */ }

    function persist() {
        try { global.localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled, volume })); }
        catch (_) {}
    }

    function play(name) {
        if (!enabled || volume === 0 || !SOUND_SET.has(name) || typeof global.Audio !== 'function') return false;
        const now = Date.now();
        if (now - (lastPlayed.get(name) || 0) < (name === 'ui_click' ? 75 : 45)) return false;
        if (active.size >= LIMIT) return false;
        lastPlayed.set(name, now);
        try {
            const sound = new global.Audio('assets/audio/' + name + '.wav');
            sound.volume = volume;
            sound.preload = 'auto';
            active.add(sound);
            const cleanup = () => active.delete(sound);
            sound.addEventListener('ended', cleanup, { once: true });
            sound.addEventListener('error', cleanup, { once: true });
            const result = sound.play();
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
            for (const audio of active) { try { audio.pause(); audio.currentTime = 0; } catch (_) {} }
            active.clear();
        }
    }
    function setVolume(value) {
        volume = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : volume;
        for (const audio of active) audio.volume = volume;
        persist(); syncSettings();
    }
    function openSettings() {
        const modal = document.getElementById('audioSettingsModal');
        if (modal) modal.style.display = 'flex';
        syncSettings(); play('ui_open');
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

    // Zwykłe kliknięcia tylko dla przycisków, bez grania efektów na każdym elemencie labiryntu.
    if (typeof document !== 'undefined') {
        document.addEventListener('click', function (event) {
            const button = event.target && event.target.closest ? event.target.closest('button') : null;
            if (!button || button.disabled || button.id === 'soundSettingsBtn' || button.closest('#audioSettingsModal')) return;
            const label = (button.textContent || '').toLowerCase();
            if (/wróć|anuluj|zamknij|porzuć/.test(label)) play('ui_back');
            else play('ui_click');
        });
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncSettings);
        else syncSettings();
    }
    global.KalonAudio = Object.freeze({ play, setEnabled, setVolume, openSettings, closeSettings, previewSelected, getSettings: () => ({ enabled, volume }), names: SOUND_NAMES });
})(window);
