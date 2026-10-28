'use strict';

const IDENTIFIER = /^[a-zA-Z][\w-]*$/;
const ACTIONS = new Set(['startStory', 'advanceStory', 'finishStory', 'setFlag', 'setRunFlag', 'effect']);
function assertId(id, label) {
    if (typeof id !== 'string' || !IDENTIFIER.test(id)) throw new Error('Niepoprawne ' + label + ': ' + String(id));
}
function validateAction(action, eventId) {
    if (!action || typeof action !== 'object' || !ACTIONS.has(action.type)) {
        throw new Error('Nieznana akcja w ' + eventId);
    }
    if (['startStory', 'advanceStory', 'finishStory'].includes(action.type)) {
        assertId(action.storyId, 'storyId');
    }
    if (['startStory', 'advanceStory'].includes(action.type)) {
        assertId(action.nextEventId, 'nextEventId');
    }
    if (action.type === 'setFlag' || action.type === 'setRunFlag') {
        if (typeof action.key !== 'string' || !/^[a-zA-Z][\w:.-]*$/.test(action.key)) {
            throw new Error('Niepoprawny klucz flagi w ' + eventId);
        }
        if (!Number.isSafeInteger(action.value) || action.value < 0) {
            throw new Error('Flaga wymaga liczby całkowitej >= 0 w ' + eventId);
        }
    }
    if (action.type === 'finishStory') {
        if (typeof action.permanent !== 'boolean') throw new Error('finishStory wymaga permanent w ' + eventId);
        if (action.flagKey !== undefined) {
            if (!/^[a-zA-Z][\w:.-]*$/.test(action.flagKey) ||
                !Number.isSafeInteger(action.flagValue) || action.flagValue < 0 || !action.permanent) {
                throw new Error('Niepoprawna trwała flaga finishStory w ' + eventId);
            }
        }
    }
    if (action.type === 'effect') {
        if (!action.effect || typeof action.effect.type !== 'string') {
            throw new Error('Akcja effect wymaga opisu efektu w ' + eventId);
        }
    }
}
function checkActions(actions, eventId) {
    if (actions === undefined) return;
    if (!Array.isArray(actions)) throw new Error('actions muszą być tablicą w ' + eventId);
    actions.forEach(action => validateAction(action, eventId));
}
class EventRegistry {
    constructor(events = []) {
        this.events = new Map();
        events.forEach(event => this.register(event));
    }
    register(event) {
        if (!event || typeof event !== 'object') throw new Error('Wydarzenie musi być obiektem');
        assertId(event.id, 'event.id');
        if (this.events.has(event.id)) throw new Error('Duplikat wydarzenia: ' + event.id);
        if (typeof event.name !== 'string' || !event.name.trim()) throw new Error('Brak nazwy wydarzenia: ' + event.id);
        if (!['random', 'continuation'].includes(event.pool)) throw new Error('Niepoprawna pula: ' + event.id);
        if (event.storyId !== undefined) assertId(event.storyId, 'storyId');
        if (event.pool === 'continuation' && !event.storyId) throw new Error('Kontynuacja wymaga storyId: ' + event.id);
        if (event.repeat !== undefined && !['once-per-run', 'repeatable'].includes(event.repeat)) {
            throw new Error('Niepoprawne repeat: ' + event.id);
        }
        if (event.permanence !== undefined && !['run', 'global'].includes(event.permanence)) {
            throw new Error('Niepoprawne permanence: ' + event.id);
        }
        if (event.weight !== undefined && !(Number.isFinite(event.weight) && event.weight > 0)) {
            throw new Error('Niepoprawna waga: ' + event.id);
        }
        if (!Array.isArray(event.choices) || event.choices.length === 0) throw new Error('Brak decyzji: ' + event.id);
        const ids = new Set();
        for (const choice of event.choices) {
            assertId(choice.id, 'choice.id');
            if (ids.has(choice.id)) throw new Error('Duplikat decyzji: ' + event.id + ':' + choice.id);
            ids.add(choice.id);
            if (typeof choice.text !== 'string') throw new Error('Brak tekstu decyzji: ' + event.id);
            checkActions(choice.actions, event.id);
            if (choice.outcomes !== undefined) {
                if (!Array.isArray(choice.outcomes) || choice.outcomes.length === 0) throw new Error('Puste outcomes w ' + event.id);
                for (const outcome of choice.outcomes) {
                    if (!(Number.isFinite(outcome.weight) && outcome.weight > 0)) {
                        throw new Error('Niepoprawna waga wyniku w ' + event.id);
                    }
                    checkActions(outcome.actions, event.id);
                }
            }
        }
        this.events.set(event.id, JSON.parse(JSON.stringify(event)));
        return this;
    }
    get(id) {
        const event = this.events.get(id);
        return event && JSON.parse(JSON.stringify(event));
    }
    list() { return [...this.events.values()].map(event => JSON.parse(JSON.stringify(event))); }
    validateLinks() {
        for (const event of this.events.values()) {
            for (const choice of event.choices) {
                const actions = [...(choice.actions || []), ...(choice.outcomes || []).flatMap(result => result.actions || [])];
                for (const action of actions) {
                    if (['startStory', 'advanceStory', 'finishStory'].includes(action.type) &&
                        event.storyId !== action.storyId) {
                        throw new Error('Niezgodny storyId w ' + event.id);
                    }
                    if (['startStory', 'advanceStory'].includes(action.type)) {
                        const next = this.events.get(action.nextEventId);
                        if (!next || next.pool !== 'continuation' || next.storyId !== action.storyId) {
                            throw new Error('Brak poprawnej kontynuacji ' + action.nextEventId + ' w ' + event.id);
                        }
                    }
                }
            }
        }
        return true;
    }
}
module.exports = { EventRegistry };
