'use strict';

function applyActions(actions, draftRun, draftGlobal, event, notifications, effects) {
    for (const action of actions) {
        if (action.type === 'startStory') {
            if (draftRun.activeStories[action.storyId] ||
                draftRun.completedStories.includes(action.storyId) ||
                draftGlobal.completedStories.includes(action.storyId)) {
                throw new Error('Wątek jest już aktywny lub ukończony: ' + action.storyId);
            }
            draftRun.activeStories[action.storyId] = {
                nextEventId: action.nextEventId,
                title: action.title || event.name
            };
            notifications.push({ type: 'story-started', storyId: action.storyId,
                title: action.title || event.name, message: 'Rozpoczęcie wątku fabularnego' });
        } else if (action.type === 'advanceStory') {
            if (!draftRun.activeStories[action.storyId]) throw new Error('Nieaktywny wątek: ' + action.storyId);
            draftRun.activeStories[action.storyId].nextEventId = action.nextEventId;
            notifications.push({ type: 'story-advanced', storyId: action.storyId });
        } else if (action.type === 'finishStory') {
            if (!draftRun.activeStories[action.storyId]) throw new Error('Nieaktywny wątek: ' + action.storyId);
            delete draftRun.activeStories[action.storyId];
            if (!draftRun.completedStories.includes(action.storyId)) draftRun.completedStories.push(action.storyId);
            if (action.permanent && !draftGlobal.completedStories.includes(action.storyId)) {
                draftGlobal.completedStories.push(action.storyId);
            }
            if (action.flagKey !== undefined) draftGlobal.flags[action.flagKey] = action.flagValue;
            notifications.push({ type: 'story-finished', storyId: action.storyId, permanent: action.permanent });
        } else if (action.type === 'setFlag') {
            draftGlobal.flags[action.key] = action.value;
        } else if (action.type === 'setRunFlag') {
            draftRun.runFlags[action.key] = action.value;
        } else if (action.type === 'effect') {
            // Nie zmienia HP/monet/ekwipunku, dopóki gra nie podłączy adaptera.
            effects.push(JSON.parse(JSON.stringify(action.effect)));
        } else {
            throw new Error('Nieobsługiwana akcja: ' + action.type);
        }
    }
}
module.exports = { applyActions };
