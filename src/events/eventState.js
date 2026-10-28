'use strict';

const STORAGE_VERSION = 1;
const DEFAULT_KEY = 'calion_story_progress_v1';

function copy(value) { return JSON.parse(JSON.stringify(value)); }
function emptyPersistent() {
    return { version: STORAGE_VERSION, flags: {}, completedEvents: [], completedStories: [] };
}
function emptyRun() {
    return {
        active: false, visitedQuestions: 0, seenEvents: [],
        completedStories: [], activeStories: {}, runFlags: {}, currentEvent: null
    };
}
function normalizePersistent(raw) {
    if (!raw || raw.version !== STORAGE_VERSION) return emptyPersistent();
    const data = emptyPersistent();
    if (raw.flags && typeof raw.flags === 'object' && !Array.isArray(raw.flags)) {
        for (const [key, value] of Object.entries(raw.flags)) {
            if (/^[a-zA-Z][\w:.-]*$/.test(key) && Number.isSafeInteger(value) && value >= 0) {
                Object.defineProperty(data.flags, key, { value, writable: true, enumerable: true, configurable: true });
            }
        }
    }
    for (const field of ['completedEvents', 'completedStories']) {
        if (Array.isArray(raw[field])) {
            data[field] = [...new Set(raw[field].filter(value =>
                typeof value === 'string' && /^[a-zA-Z][\w-]*$/.test(value)
            ))];
        }
    }
    return data;
}
function loadPersistent(storage, key = DEFAULT_KEY) {
    if (!storage) return emptyPersistent();
    const raw = storage.getItem(key);
    if (!raw) return emptyPersistent();
    try { return normalizePersistent(JSON.parse(raw)); }
    catch (error) { throw new Error('Niepoprawny zapis fabularny: ' + error.message); }
}
function savePersistent(storage, value, key = DEFAULT_KEY) {
    if (!storage) return false; // stan nadal obowiązuje w pamięci obiektu
    storage.setItem(key, JSON.stringify(value));
    return true;
}
module.exports = { DEFAULT_KEY, copy, emptyPersistent, emptyRun, loadPersistent, savePersistent };
