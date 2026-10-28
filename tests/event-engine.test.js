'use strict';

// Odizolowane testy silnika: node --test tests/event-engine.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { EventEngine } = require('../src/events/eventEngine');
const { EventRegistry } = require('../src/events/eventRegistry');

const paths = ['story/event_30.json','story/event_31.json','story/event_40.json',
    'story/event_41.json','story/event_42.json','story/event_75.json',
    'story/event_76.json','random/event_10.json'];
function definitions() {
    return paths.map(name => JSON.parse(fs.readFileSync(
        path.join(__dirname, '../data/events', name), 'utf8'
    )));
}
function memoryStorage() {
    const map = new Map();
    return {
        getItem(key) { return map.has(key) ? map.get(key) : null; },
        setItem(key, value) { map.set(key, value); }
    };
}
function engine(events = definitions(), options = {}) {
    return new EventEngine({ events, rng: () => 0, ...options });
}
function only(...ids) { return definitions().filter(item => ids.includes(item.id)); }

test('wszystkie odnośniki zdarzeń są poprawne, a dublety ID są blokowane', () => {
    const r = new EventRegistry(definitions());
    assert.equal(r.validateLinks(), true);
    assert.throws(() => r.register(definitions()[0]), /Duplikat/);
});

test('nowa wyprawa losuje start, wysyła komunikat i wymusza kontynuację na następnym ?', () => {
    const e = engine(only('event_30','event_31'));
    e.startRun();
    const start = e.enterQuestionMark({floor: 5});
    assert.equal(start.event.id, 'event_30');
    const chosen = e.choose('help');
    assert.equal(chosen.notifications[0].message, 'Rozpoczęcie wątku fabularnego');
    assert.deepEqual(chosen.effects, [{type:'hp',amount:-10}]);
    assert.equal(e.enterQuestionMark({floor: 6}).event.id, 'event_31');
    e.choose('rescue');
    assert.equal(e.getState().global.flags.event_31, 1);
    assert.equal(e.getState().run.activeStories.old_merchant_rescue, undefined);
});

test('trwały wynik 1 odblokowuje tylko losowy event_75, nie jako kontynuację', () => {
    const store = memoryStorage();
    const e = engine(definitions(), {storage:store});
    e.startRun();
    // Nie trzeba polegać na losowaniu pierwszego pytajnika, aby ustawić stan:
    const minimal = engine(only('event_30','event_31'), {storage:store});
    minimal.startRun();
    minimal.enterQuestionMark();
    minimal.choose('help');
    minimal.enterQuestionMark({floor: 9});
    minimal.choose('rescue');
    const after = engine(only('event_75','event_76'), {storage:store});
    after.startRun();
    const event = after.enterQuestionMark({floor: 100});
    assert.equal(event.source,'random');
    assert.equal(event.event.id, 'event_75');
    after.choose('accept');
    assert.equal(after.enterQuestionMark({floor: 101}).event.id, 'event_76');
    after.choose('take');
    assert.equal(after.getState().global.flags.event_76,1);
    assert.ok(after.getState().global.completedStories.includes('merchant_return'));
    const next = engine(only('event_75','event_76'), {storage:store});
    next.startRun();
    assert.equal(next.enterQuestionMark().type, 'empty');
    assert.equal(e.getState().global.flags.event_31, undefined); // odrębny obiekt, bez automatycznego odświeżania
});

test('wynik 2 blokuje powrót kupca i cały wątek ratunkowy w kolejnych RUNach', () => {
    const store = memoryStorage();
    const e = engine(only('event_30','event_31','event_75','event_76'), {storage:store});
    e.startRun();
    assert.equal(e.enterQuestionMark().event.id,'event_30');
    e.choose('help');
    e.enterQuestionMark();
    e.choose('death');
    assert.equal(e.getState().global.flags.event_31,2);
    e.endRun();
    e.startRun();
    assert.equal(e.enterQuestionMark().type,'empty');
    const reload = engine(only('event_30','event_31','event_75','event_76'), {storage:store});
    reload.startRun();
    assert.equal(reload.enterQuestionMark().type,'empty');
});

test('dwa oczekujące wątki mają 50/50, potem pozostały 100%', () => {
    let random=0;
    const e=engine(only('event_30','event_31','event_40','event_41','event_42'),{rng:()=>random});
    e.startRun();
    random=0; assert.equal(e.enterQuestionMark().event.id,'event_30'); e.choose('help');
    // Drugi start fabularny symulujemy przez dopisanie na etapie testu:
    e.run.activeStories.lost_lantern={nextEventId:'event_41',title:'Zgaszona latarnia'};
    random=0.75;
    assert.equal(e.enterQuestionMark({floor:12}).event.id,'event_41');
    e.choose('finish');
    assert.equal(e.enterQuestionMark({floor:13}).event.id,'event_31');
    e.choose('rescue');
    assert.equal(Object.keys(e.getState().run.activeStories).length,0);
});

test('każdy oczekujący etap ma taki sam udział, także trzeci wątek', () => {
    const defs=[...only('event_30','event_31','event_40','event_41','event_42')];
    defs.push({id:'event_90',name:'Trzeci etap',pool:'continuation',storyId:'third_story',choices:[{id:'ok',text:'ok',actions:[{type:'finishStory',storyId:'third_story',permanent:false}]}]});
    let random=0.8;
    const e=engine(defs,{rng:()=>random});
    e.startRun();
    e.run.activeStories.old_merchant_rescue={nextEventId:'event_31'};
    e.run.activeStories.lost_lantern={nextEventId:'event_41'};
    e.run.activeStories.third_story={nextEventId:'event_90'};
    assert.equal(e.enterQuestionMark().event.id,'event_90'); // >= 2/3
    e.choose('ok');
    random=0.1;
    assert.equal(e.enterQuestionMark().event.id,'event_31');
});

test('RUN resetuje się po śmierci/porzuceniu, a zakończony RUN-only wątek można powtórzyć', () => {
    const e=engine(only('event_40','event_41','event_42'));
    e.startRun();
    assert.equal(e.enterQuestionMark().event.id,'event_40'); e.choose('follow');
    e.enterQuestionMark({floor:12}); e.choose('finish');
    assert.equal(e.getState().run.completedStories.includes('lost_lantern'),true);
    assert.equal(e.enterQuestionMark().type,'empty');
    e.endRun();
    assert.equal(e.getState().run.active,false);
    assert.deepEqual(e.getState().run.completedStories,[]);
    e.startRun();
    assert.equal(e.enterQuestionMark({floor:100}).event.id,'event_40');
});

test('kolejny etap może prowadzić do następnego zamiast kończyć historię', () => {
    const e=engine(only('event_40','event_41','event_42'));
    e.startRun();e.enterQuestionMark();e.choose('follow');
    e.enterQuestionMark();e.choose('extend');
    assert.equal(e.enterQuestionMark().event.id,'event_42');
    const done=e.choose('close');
    assert.deepEqual(done.effects,[{type:'coins',amount:20}]);
});

test('losowe wyniki i wymagania decyzji oraz warunki globalne', () => {
    const simple={
        id:'event_99',name:'Brama',pool:'random',permanence:'global',
        choices:[{id:'pay',text:'Zapłać',conditions:{minCoins:15},outcomes:[
            {weight:1,text:'wygrana',actions:[{type:'setFlag',key:'door',value:1}]},
            {weight:1,text:'porażka',actions:[]}
        ]},{id:'leave',text:'Odejdź',actions:[]}]
    };
    const e=engine([simple],{rng:()=>0});
    e.startRun();
    const event=e.enterQuestionMark({coins:0}).event;
    assert.equal(event.choices.length,1);
    assert.throws(()=>e.choose('pay',{coins:0}),/Niedostępna/);
    e.choose('leave');
    assert.equal(e.enterQuestionMark().type,'empty'); // global permanent
});

test('gdy istnieje aktywny wątek, inne losowe wydarzenia nie wchodzą do puli', () => {
    const e=engine(only('event_30','event_31','event_10'));
    e.startRun();
    e.run.activeStories.old_merchant_rescue={nextEventId:'event_31'};
    assert.equal(e.enterQuestionMark().event.id,'event_31');
});

test('niedostępny magazyn nie może zatwierdzić trwałej decyzji', () => {
    const store={getItem:()=>null,setItem:()=>{throw new Error('Brak miejsca')}};
    const e=engine(only('event_30','event_31'),{storage:store});
    e.startRun();e.enterQuestionMark();e.choose('help');e.enterQuestionMark();
    assert.throws(()=>e.choose('rescue'),/Brak miejsca/);
    assert.equal(e.getState().global.flags.event_31,undefined);
    assert.equal(e.getState().run.currentEvent.id,'event_31');
});

test('wyniki nie mogą modyfikować stanu silnika przez referencję', () => {
    const e=engine(only('event_30','event_31'));
    e.startRun();
    const view=e.enterQuestionMark();view.event.id='hacked';
    assert.equal(e.getState().run.currentEvent.id,'event_30');
    assert.equal(view.event.choices[0].actions,undefined);
});

test('nie da się rozstrzygnąć nieaktywnego wydarzenia ani wejść na dwa pytajniki naraz', () => {
    const e=engine(only('event_30','event_31'));
    assert.throws(()=>e.enterQuestionMark(),/RUN/);
    e.startRun();e.enterQuestionMark();
    assert.throws(()=>e.enterQuestionMark(),/rozstrzygnij/);
    e.choose('ignore');
    assert.throws(()=>e.choose('help'),/Brak aktywnego/);
});
