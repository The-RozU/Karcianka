'use strict';

function flagMatches(actual, required) {
    return actual === required;
}
function matchesConditions(conditions = {}, context = {}, globalFlags = {}, runFlags = {}) {
    if (!conditions) return true;
    for (const [name, value] of Object.entries(conditions.requiredFlags || {})) {
        if (!flagMatches(globalFlags[name], value)) return false;
    }
    for (const [name, value] of Object.entries(conditions.forbiddenFlags || {})) {
        if (flagMatches(globalFlags[name], value)) return false;
    }
    for (const [name, value] of Object.entries(conditions.requiredRunFlags || {})) {
        if (!flagMatches(runFlags[name], value)) return false;
    }
    for (const [name, value] of Object.entries(conditions.forbiddenRunFlags || {})) {
        if (flagMatches(runFlags[name], value)) return false;
    }
    if (conditions.minFloor != null && !(context.floor >= conditions.minFloor)) return false;
    if (conditions.maxFloor != null && !(context.floor <= conditions.maxFloor)) return false;
    if (conditions.minCoins != null && !(context.coins >= conditions.minCoins)) return false;
    if (conditions.minHp != null && !(context.hp >= conditions.minHp)) return false;
    if (conditions.hasItems) {
        if (!Array.isArray(context.inventory)) return false;
        const owned = new Set(context.inventory.map(item =>
            typeof item === 'string' ? item : item && item.id
        ));
        if (!conditions.hasItems.every(id => owned.has(id))) return false;
    }
    return true;
}
module.exports = { matchesConditions };
