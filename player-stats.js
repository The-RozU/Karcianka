(function (root) {
    'use strict';

    // Save only finished runs. No cards, active fight or map state are persisted.
    const KEY = 'calion_player_stats_v1';
    const VERSION = 1;
    const STAT_FIELDS = [
        'totalRuns', 'wonRuns', 'lostRuns', 'abandonedRuns',
        'totalEnemiesDefeated', 'maxEnemiesDefeated', 'maxCoinsEarned',
        'highestFloor', 'totalMysteryEvents', 'maxBossesDefeated'
    ];
    const OUTCOMES = ['win', 'defeat', 'abandoned'];

    function nonnegativeInteger(value) {
        return Number.isSafeInteger(value) && value >= 0 ? value : 0;
    }

    function emptyStats() {
        const stats = { version: VERSION };
        for (const field of STAT_FIELDS) stats[field] = 0;
        stats.lastRun = null;
        return stats;
    }

    function normalizeRun(raw) {
        if (!raw || typeof raw !== 'object' || !OUTCOMES.includes(raw.outcome)) return null;
        return {
            outcome: raw.outcome,
            floor: nonnegativeInteger(raw.floor),
            enemiesDefeated: nonnegativeInteger(raw.enemiesDefeated),
            bossesDefeated: nonnegativeInteger(raw.bossesDefeated),
            coinsEarned: nonnegativeInteger(raw.coinsEarned),
            mysteryEvents: nonnegativeInteger(raw.mysteryEvents),
            durationSeconds: nonnegativeInteger(raw.durationSeconds),
            finishedAt: typeof raw.finishedAt === 'string' && !Number.isNaN(Date.parse(raw.finishedAt))
                ? raw.finishedAt : null
        };
    }

    function getStorage() {
        try { return root.localStorage || null; }
        catch (error) { return null; }
    }

    function load() {
        try {
            const storage = getStorage();
            const raw = storage && storage.getItem(KEY);
            if (!raw) return emptyStats();
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object' || parsed.version !== VERSION) return emptyStats();
            const stats = emptyStats();
            for (const field of STAT_FIELDS) stats[field] = nonnegativeInteger(parsed[field]);
            stats.lastRun = normalizeRun(parsed.lastRun);
            return stats;
        } catch (error) {
            console.warn('Calion: nie udało się odczytać statystyk gracza.', error);
            return emptyStats();
        }
    }

    // Keep session state even if storage is unavailable (e.g. private mode / quota).
    let current = load();
    let lastWriteSucceeded = true;

    function get() {
        return JSON.parse(JSON.stringify(current));
    }

    function record(rawRun) {
        const run = normalizeRun(rawRun);
        if (!run) throw new Error('Nieprawidłowe podsumowanie RUN-u.');
        current.totalRuns += 1;
        if (run.outcome === 'win') current.wonRuns += 1;
        if (run.outcome === 'defeat') current.lostRuns += 1;
        if (run.outcome === 'abandoned') current.abandonedRuns += 1;
        current.totalEnemiesDefeated += run.enemiesDefeated;
        current.maxEnemiesDefeated = Math.max(current.maxEnemiesDefeated, run.enemiesDefeated);
        current.maxCoinsEarned = Math.max(current.maxCoinsEarned, run.coinsEarned);
        current.highestFloor = Math.max(current.highestFloor, run.floor);
        current.totalMysteryEvents += run.mysteryEvents;
        current.maxBossesDefeated = Math.max(current.maxBossesDefeated, run.bossesDefeated);
        current.lastRun = run;

        try {
            const storage = getStorage();
            if (!storage) throw new Error('localStorage niedostępny');
            storage.setItem(KEY, JSON.stringify(current));
            lastWriteSucceeded = true;
        } catch (error) {
            lastWriteSucceeded = false;
            console.warn('Calion: nie udało się zapisać statystyk gracza.', error);
        }
        return lastWriteSucceeded;
    }

    root.CalionPlayerStats = { get, record };
    if (typeof module !== 'undefined' && module.exports) module.exports = { get, record };
})(typeof window !== 'undefined' ? window : globalThis);
