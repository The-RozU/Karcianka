/* Kalon v0.4.25: autentyczne kroki i szybkie dźwięki trafień (CC0). */
(function (global) {
    'use strict';

    // Niechciane efekty pozostają wyłączone, a ich pliki zachowane w repozytorium.
    const DISABLED_SOUNDS = Object.freeze([
        'ui_confirm', 'coin_gain', 'exp_gain', 'level_up',
        'training_start', 'quest_start', 'quest_complete'
    ]);
    const SOUND_FILES = Object.freeze({
        ui_click: ['ui_click'],
        ui_back: ['ui_back'],
        ui_open: ['ui_open'],
        ui_error: ['ui_error'],
        equip_item: ['equip_item'],
        card_paper: ['card_paper_1', 'card_paper_2'],
        maze_step: ['step_stone_1.ogg', 'step_stone_2.ogg'],
        hit_enemy: ['hit_enemy_1.ogg', 'hit_enemy_2.ogg', 'hit_enemy_3.ogg'],
        hit_player: ['hit_player_1.ogg', 'hit_player_2.ogg', 'hit_player_3.ogg']
    });
    const FOOTSTEP_STYLES = Object.freeze({
        stone: ['step_stone_1.ogg', 'step_stone_2.ogg'],
        wood: ['step_wood_1.ogg', 'step_wood_2.ogg'],
        soft: ['step_soft_1.ogg', 'step_soft_2.ogg']
    });
    const SOUND_NAMES = Object.freeze(Object.keys(SOUND_FILES));
    // Mnożniki względem istniejącej głównej głośności (np. 35% → papier 10,5%).
    const SOUND_GAINS = Object.freeze({
        card_paper: 0.30, maze_step: 0.22,
        hit_enemy: 0.46, hit_player: 0.42
    });
    const STORAGE_KEY = 'kalon.audio.v1';
    const LIMIT = 6;
    // 3 szybkie ciosy mogą wystąpić co 40–70 ms i korzystają z osobnych nagrań.
    const COOLDOWNS = Object.freeze({ ui_click: 45, card_paper: 40, maze_step: 135, hit_enemy: 30, hit_player: 30 });
    const active = new Set();
    const lastPlayed = new Map();
    const variantIndex = new Map();
    const audioElements = new Map();
    const htmlPlayback = new Map();
    const decodedBuffers = new Map();
    let audioContext = null;
    let enabled = true;
    let volume = 0.35;
    let footstepStyle = 'stone';

    try {
        const saved = JSON.parse(global.localStorage.getItem(STORAGE_KEY) || 'null');
        if (saved && typeof saved.enabled === 'boolean') enabled = saved.enabled;
        if (saved && Number.isFinite(saved.volume)) volume = Math.min(1, Math.max(0, saved.volume));
        if (saved && Object.prototype.hasOwnProperty.call(FOOTSTEP_STYLES, saved.footstepStyle)) {
            footstepStyle = saved.footstepStyle;
        }
    } catch (_) { /* Gra działa również bez localStorage. */ }

    function persist() {
        try { global.localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled, volume, footstepStyle })); }
        catch (_) {}
    }

    function effectiveVolume(name) {
        return volume * (SOUND_GAINS[name] || 1);
    }

    function filesFor(name) {
        if (name === 'maze_step') return FOOTSTEP_STYLES[footstepStyle];
        return Object.prototype.hasOwnProperty.call(SOUND_FILES, name) ? SOUND_FILES[name] : null;
    }
    function fileUrl(file) {
        return 'assets/audio/' + file + (file.endsWith('.ogg') ? '' : '.wav');
    }

    // Przygotuj HTMLAudio raz, zamiast tworzyć nowy odtwarzacz przy każdym kliknięciu.
    // Na urządzeniach z Web Audio użyj już zdekodowanych buforów, bez opóźnień pobierania.
    function preloadSounds() {
        const files = [...new Set([...Object.values(SOUND_FILES).flat(), ...Object.values(FOOTSTEP_STYLES).flat()])];
        if (typeof global.Audio === 'function') {
            for (const file of files) {
                try {
                    const clip = new global.Audio(fileUrl(file));
                    clip.preload = 'auto';
                    if (typeof clip.load === 'function') clip.load();
                    audioElements.set(file, clip);
                } catch (_) {}
            }
        }

        const AudioContextCtor = global.AudioContext || global.webkitAudioContext;
        if (typeof AudioContextCtor !== 'function' || typeof global.fetch !== 'function') return;
        try {
            audioContext = new AudioContextCtor({ latencyHint: 'interactive' });
        } catch (_) { return; }

        // Dekodowanie odbywa się w tle PRZED pierwszym wyborem karty lub ruchem.
        // Nie odtwarzamy nic po zakończeniu ładowania: spóźnione efekty są gorsze od ciszy.
        for (const file of files) {
            const url = fileUrl(file);
            try {
                Promise.resolve(global.fetch(url))
                    .then(response => {
                        if (!response.ok) throw new Error('Audio HTTP ' + response.status);
                        return response.arrayBuffer();
                    })
                    .then(data => audioContext.decodeAudioData(data))
                    .then(buffer => { if (buffer) decodedBuffers.set(file, buffer); })
                    .catch(() => {});
            } catch (_) {}
        }
    }

    function resumeAudio() {
        if (!enabled || !audioContext || audioContext.state !== 'suspended') return;
        try {
            const task = audioContext.resume();
            if (task && typeof task.catch === 'function') task.catch(() => {});
        } catch (_) {}
    }

    function playWebAudio(file, name) {
        if (!audioContext || audioContext.state !== 'running' || !decodedBuffers.has(file)) return false;
        try {
            const source = audioContext.createBufferSource();
            source.buffer = decodedBuffers.get(file);
            const gain = audioContext.createGain();
            gain.gain.value = effectiveVolume(name);
            source.connect(gain);
            gain.connect(audioContext.destination);
            const entry = {
                stop() { try { source.stop(); } catch (_) {} },
                setVolume() { gain.gain.value = effectiveVolume(name); }
            };
            active.add(entry);
            source.onended = () => active.delete(entry);
            source.start(0);
            return true;
        } catch (_) { return false; }
    }

    function playHtmlAudio(file, name) {
        const clip = audioElements.get(file);
        if (!clip) return false;
        try {
            // Przerywając ten sam wariant, zwolnij jego poprzedni kanał.
            const previous = htmlPlayback.get(file);
            if (previous) active.delete(previous);
            // Ten sam odtwarzacz i plik pozostają rozgrzane w pamięci.
            clip.pause();
            clip.currentTime = 0;
            clip.volume = effectiveVolume(name);
            const entry = {
                stop() { try { clip.pause(); clip.currentTime = 0; } catch (_) {} },
                setVolume() { clip.volume = effectiveVolume(name); }
            };
            active.add(entry);
            htmlPlayback.set(file, entry);
            const cleanup = () => {
                active.delete(entry);
                if (htmlPlayback.get(file) === entry) htmlPlayback.delete(file);
            };
            clip.addEventListener('ended', cleanup, { once: true });
            clip.addEventListener('error', cleanup, { once: true });
            const task = clip.play();
            if (task && typeof task.catch === 'function') task.catch(cleanup);
            return true;
        } catch (_) { return false; }
    }

    function play(name) {
        const files = filesFor(name);
        if (!enabled || volume <= 0 || !files || active.size >= LIMIT) return false;
        const now = Date.now();
        if (now - (lastPlayed.get(name) || 0) < (COOLDOWNS[name] || 45)) return false;
        const index = variantIndex.get(name) || 0;
        const file = files[index % files.length];

        // Obie ścieżki startują synchronicznie. Nigdy nie odpalamy efektu z opóźnionego Promise.
        const started = playWebAudio(file, name) || playHtmlAudio(file, name);
        if (started) {
            lastPlayed.set(name, now);
            variantIndex.set(name, index + 1);
        }
        return started;
    }

    function syncSettings() {
        const checkbox = document.getElementById('audioEnabled');
        const slider = document.getElementById('audioVolume');
        const label = document.getElementById('audioVolumeValue');
        const style = document.getElementById('footstepStyle');
        const header = document.getElementById('soundSettingsBtn');
        if (checkbox) checkbox.checked = enabled;
        if (slider) slider.value = String(Math.round(volume * 100));
        if (label) label.textContent = Math.round(volume * 100) + '%';
        if (style) style.value = footstepStyle;
        if (header) {
            header.textContent = enabled && volume > 0 ? '🔊 Dźwięki' : '🔇 Dźwięki';
            header.setAttribute('aria-label', 'Ustawienia dźwięku');
        }
    }
    function setEnabled(value) {
        enabled = Boolean(value); persist(); syncSettings();
        if (!enabled) {
            for (const entry of active) entry.stop();
            active.clear();
            htmlPlayback.clear();
        }
    }
    function setVolume(value) {
        volume = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : volume;
        for (const entry of active) entry.setVolume();
        persist(); syncSettings();
    }
    function setFootstepStyle(value) {
        if (!Object.prototype.hasOwnProperty.call(FOOTSTEP_STYLES, value)) return false;
        footstepStyle = value;
        variantIndex.set('maze_step', 0);
        lastPlayed.delete('maze_step');
        persist();
        syncSettings();
        return true;
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

    if (typeof document !== 'undefined') {
        // Na telefonie pointerdown wybudza silnik audio, zanim pojawi się zdarzenie click.
        document.addEventListener('pointerdown', resumeAudio, { capture: true, passive: true });
        document.addEventListener('keydown', resumeAudio, { capture: true });
        document.addEventListener('click', function (event) {
            const button = event.target && event.target.closest ? event.target.closest('button') : null;
            if (!button || button.disabled || (button.classList && button.classList.contains('maze-tile'))) return;
            if (button.id === 'soundSettingsBtn' || button.closest('#audioSettingsModal')) return;
            play('ui_click');
        });
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncSettings);
        else syncSettings();
    }

    preloadSounds();
    global.KalonAudio = Object.freeze({
        play, setEnabled, setVolume, setFootstepStyle, openSettings, closeSettings, previewSelected,
        getSettings: () => ({ enabled, volume, footstepStyle }),
        names: SOUND_NAMES, disabledNames: DISABLED_SOUNDS, footstepStyles: Object.keys(FOOTSTEP_STYLES)
    });
})(window);
