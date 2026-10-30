# Silnik wydarzeń Calion (prototyp, NIE PODŁĄCZONY DO GRY)

**Stan:** oddzielna biblioteka CommonJS w `src/events/` + przykładowe dane JSON. Nic z tej biblioteki nie jest ładowane przez `index.html`, `game.js` ani `maze-generator.js`. Nie istnieje jeszcze UI wydarzeń.

## Podstawowe reguły

1. Wydarzenie losowane jest **dopiero przy wejściu na pole `?`**. Sam generator mapy nie przydziela event ID.
2. Aktywne kontynuacje mają bezwzględny priorytet: 1 wątek = 100%, 2 = 50% / 50%, 3 = 1/3 itd. Każdy wątek oczekuje na jeden następny event ID; nie ma potrzeby zmiany mapy.
3. Przejście między piętrami niczego nie resetuje. Kontynuacja czeka na **kolejny odwiedzony pytajnik**, nawet na innym piętrze.
4. `endRun()` usuwa aktywne i ukończone wątki RUN, widziane w nim wydarzenia oraz flagi RUN. `startRun()` zaczyna czysty RUN. Trwałe decyzje pozostają.
5. Ukończony wątek nie zacznie się drugi raz w tym samym RUN-ie. Jeśli `finishStory.permanent=true`, nie zacznie się także w następnych wyprawach.
6. `event_31=1` oznacza uratowanego handlarza, `event_31=2` jego śmierć. Oba finały trwale kończą wątek ratunku. Tylko wartość 1 dopuszcza **losowe** `event_75`, nie dodaje go do kolejki kontynuacji.
7. `repeat=once-per-run` jest domyślne dla pojedynczych eventów. `repeat=repeatable` umożliwia ponowne losowanie zwykłego zdarzenia w tym samym RUN-ie. `permanence=global` blokuje ID danego eventu już na zawsze po rozstrzygnięciu.
8. W przyszłości widoczne osiągnięcia mogą bazować na trwałych flagach, ale interfejs osiągnięć nie należy do tego silnika.

## Pliki

- `eventEngine.js`: losowanie, przebieg i API.
- `eventRegistry.js`: rejestr, kontrola unikatowych ID, walidacja odnośników.
- `eventConditions.js`: sprawdzanie flag, piętra, HP, monet i przedmiotów.
- `eventActions.js`: akcje na stanie fabularnym i komunikaty do UI.
- `eventState.js`: izolacja RUN/GLOBAL, opcjonalny adapter `storage`.
- `data/events/story/event_30.json` itd.: **fikcyjne, robocze przykłady**, które można swobodnie wymienić. Grafiki wskazuje pole `image` (obecnie `null`); docelowo pliki w `assets/events/`.

## API (tylko na potrzeby testów/projektowania)

```js
const { EventEngine } = require('./src/events/eventEngine');
const events = [require('./data/events/story/event_30.json'),
                require('./data/events/story/event_31.json')];
const engine = new EventEngine({ events, rng: Math.random, storage: null });
engine.startRun();
const scene = engine.enterQuestionMark({ floor: 7, hp: 100, coins: 30, inventory: [] });
// scene = {type:'event', source:'random'|'continuation', event:{id,...,choices:[...]}}
const result = engine.choose('help', { floor: 7, hp: 100, coins: 30, inventory: [] });
// result.notifications może zawierać {type:'story-started',message:'Rozpoczęcie wątku fabularnego',title:...}
// result.effects zawiera opis zamierzonych zmian HP/monet itp., ale ich NIE wykonuje.
engine.getState(); // kopia {run,global}
engine.endRun(); // death/abandon/win: reset tylko RUN
```

Silnik nie manipuluje DOM-em, HP, monetami ani ekwipunkiem. Zwraca tylko `effects` i `notifications`; przyszły adapter gry ma je zastosować / wyświetlić. Implementacja efektów i wspólnej transakcji gra+fabuła pozostaje na etap podłączania.

## Trwałość

Do trwałego zapisu przekaż obiekt zgodny z `localStorage` (`getItem`, `setItem`). Klucz: `calion_story_progress_v1`. Można przekazać `window.localStorage` **dopiero przy integracji**. Bez `storage` trwałe flagi utrzymują się między kolejnymi RUN-ami tylko wewnątrz tego samego obiektu, ale nie między odświeżeniami strony. Błąd zapisu trwałej decyzji przerwie jej rozstrzygnięcie.

Tylko stan GLOBAL jest zapisywany; trwający RUN nie jest. Zapisy GLOBAL i RUN są rozdzielone od istniejącego `CalionPlayerStats`.

## Definicje JSON

Pola eventu: `id`, `name`, `pool: random|continuation`, `storyId` (dla wątków), `weight` (dla losowych), `repeat`, `permanence`, `category`, `description`, `image`, `conditions`, `choices`.

Decyzja: `id`, `text`, opcjonalne `conditions`, `actions` i ważone `outcomes: [{weight,text,actions}]`. Decyzje nie spełniające warunków są ukryte w widoku.

Warunki:
- `requiredFlags` / `forbiddenFlags` dla GLOBAL oraz `requiredRunFlags` / `forbiddenRunFlags` dla RUN, np. `{"requiredFlags":{"event_31":1}}`.
- `minFloor`, `maxFloor`, `minCoins`, `minHp`, `hasItems:["item_id"]`, porównywane do kontekstu przekazanego przez grę.

Akcje:
- `startStory`: `{type,storyId,nextEventId,title}` (wywołuje `story-started`).
- `advanceStory`: `{type,storyId,nextEventId}` (przejście do następnego etapu).
- `finishStory`: `{type,storyId,permanent,flagKey?,flagValue?}`.
- `setFlag` / `setRunFlag`: `{type,key,value}` dla liczbowych zmiennych.
- `effect`: `{type:"effect",effect:{type:"coins"|"hp"|... ,amount:...}}`. Tylko dane dla przyszłego adaptera.

`new EventRegistry(events).validateLinks()` sprawdza, czy wskazane kontynuacje istnieją i mają właściwy `storyId`.

## Testy

`node --test tests/event-engine.test.js`

Nie są wymagane zewnętrzne zależności npm. Testujemy kolejne piętra, śmierć/porzucenie, trwałe flagi 1/2, odblokowanie wydarzenia losowego, równą szansę aktywnych historii, warianty wyników, walidację oraz awarię zapisu. Do czasu integracji nie ma testów UI ani pełnego RUN-u z prawdziwą mapą.

## Celowe ograniczenia prototypu

- Nie ma jeszcze interfejsu okna wątku, odliczania opóźnienia kontynuacji, osiągnięć ani automatycznego przyznawania nagród.
- Żadnego event ID nie przypisujemy przy generowaniu mapy.
- Trwałe decyzje wymagają storage do przetrwania odświeżenia; brak zapisu trwającego RUN-u jest zamierzony.
- Do późniejszego rozważenia: status dostępności kontynuacji przy warunkowych decyzjach, scalanie równoległych historii, migracje stanu GLOBAL i adaptacja do przeglądarki.
