'use strict';

const { EventRegistry } = require('./eventRegistry');
const { matchesConditions } = require('./eventConditions');
const { applyActions } = require('./eventActions');
const { DEFAULT_KEY, copy, emptyRun, loadPersistent, savePersistent } = require('./eventState');

function weightedPick(entries, getWeight, rng) {
    const weights = entries.map(getWeight);
    const total = weights.reduce((sum, value) => sum + value, 0);
    if (!(total > 0)) throw new Error('Brak dodatnich wag losowania');
    const number = rng();
    if (!(Number.isFinite(number) && number >= 0 && number < 1)) {
        throw new Error('rng() musi zwracać wartość od 0 do mniej niż 1');
    }
    let threshold = number * total;
    for (let i = 0; i < entries.length; i++) {
        threshold -= weights[i];
        if (threshold < 0) return entries[i];
    }
    return entries[entries.length - 1];
}

class EventEngine {
    constructor({ events = [], storage = null, storageKey = DEFAULT_KEY, rng = Math.random } = {}) {
        this.registry = events instanceof EventRegistry ? events : new EventRegistry(events);
        this.registry.validateLinks();
        this.storage = storage;
        this.storageKey = storageKey;
        this.rng = rng;
        this.global = loadPersistent(storage, storageKey);
        this.run = emptyRun();
    }
    startRun() {
        this.run = emptyRun();
        this.run.active = true;
        return this.getState();
    }
    endRun() {
        this.run = emptyRun(); // śmierć, porzucenie, zakończenie: reset RUN
        return this.getState();
    }
    getState() { return copy({ run: this.run, global: this.global }); }

    eligible(event, context = {}) {
        if (!matchesConditions(event.conditions, context, this.global.flags, this.run.runFlags)) return false;
        if (this.global.completedEvents.includes(event.id)) return false;
        if (event.repeat !== 'repeatable' && this.run.seenEvents.includes(event.id)) return false;
        if (event.storyId && (this.run.activeStories[event.storyId] ||
            this.run.completedStories.includes(event.storyId) ||
            this.global.completedStories.includes(event.storyId))) return false;
        return event.choices.some(choice =>
            matchesConditions(choice.conditions, context, this.global.flags, this.run.runFlags)
        );
    }
    eventView(event, context) {
        const result = copy(event);
        result.choices = result.choices.filter(choice =>
            matchesConditions(choice.conditions, context, this.global.flags, this.run.runFlags)
        );
        // Przygotowanie widoku: logika wyników zostaje po stronie silnika.
        result.choices.forEach(choice => { delete choice.actions; delete choice.outcomes; });
        return result;
    }
    enterQuestionMark(context = {}) {
        if (!this.run.active) throw new Error('Najpierw uruchom RUN');
        if (this.run.currentEvent) throw new Error('Najpierw rozstrzygnij aktualne wydarzenie');
        let event, source;
        const active = Object.entries(this.run.activeStories);
        if (active.length) {
            // Każdy oczekujący wątek ma dokładnie taką samą wagę.
            const [storyId, stage] = weightedPick(active, () => 1, this.rng);
            event = this.registry.get(stage.nextEventId);
            if (!event || event.pool !== 'continuation' || event.storyId !== storyId ||
                !matchesConditions(event.conditions, context, this.global.flags, this.run.runFlags)) {
                throw new Error('Kontynuacja wątku jest niedostępna: ' + storyId);
            }
            source = 'continuation';
        } else {
            const pool = this.registry.list().filter(item =>
                item.pool === 'random' && this.eligible(item, context)
            );
            if (pool.length === 0) {
                this.run.visitedQuestions += 1;
                return { type: 'empty', reason: 'no-eligible-events' };
            }
            event = weightedPick(pool, item => item.weight || 1, this.rng);
            source = 'random';
        }
        const available = this.eventView(event, context);
        if (available.choices.length === 0) throw new Error('Brak dostępnych wyborów: ' + event.id);
        this.run.visitedQuestions += 1;
        this.run.currentEvent = { id: event.id, source, storyId: event.storyId || null };
        return { type: 'event', source, event: available };
    }
    choose(choiceId, context = {}) {
        if (!this.run.active || !this.run.currentEvent) throw new Error('Brak aktywnego wydarzenia');
        const current = this.run.currentEvent;
        const event = this.registry.get(current.id);
        const choice = event.choices.find(item => item.id === choiceId);
        if (!choice || !matchesConditions(choice.conditions, context, this.global.flags, this.run.runFlags)) {
            throw new Error('Niedostępna decyzja: ' + choiceId);
        }
        const outcome = choice.outcomes
            ? weightedPick(choice.outcomes, item => item.weight, this.rng) : null;
        const draftRun = copy(this.run);
        const draftGlobal = copy(this.global);
        const effects = [], notifications = [];
        const actions = [...(choice.actions || []), ...(outcome ? outcome.actions || [] : [])];
        applyActions(actions, draftRun, draftGlobal, event, notifications, effects);
        if (!draftRun.seenEvents.includes(event.id)) draftRun.seenEvents.push(event.id);
        if (event.permanence === 'global' && !draftGlobal.completedEvents.includes(event.id)) {
            draftGlobal.completedEvents.push(event.id);
        }
        draftRun.currentEvent = null;
        // Trwałe zmiany zapisujemy przed zatwierdzeniem stanu w pamięci.
        // Błąd storage przerywa decyzję, nie udając poprawnego zapisu.
        if (JSON.stringify(draftGlobal) !== JSON.stringify(this.global)) {
            savePersistent(this.storage, draftGlobal, this.storageKey);
        }
        this.run = draftRun;
        this.global = draftGlobal;
        return {
            type: 'resolved', eventId: event.id, choiceId: choice.id,
            outcome: outcome ? { text: outcome.text || null } : null,
            notifications, effects,
            persistentSaved: Boolean(this.storage),
            state: this.getState()
        };
    }
}
module.exports = { EventEngine };
