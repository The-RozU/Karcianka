# Integracja labiryntu z dev-mode

## Stan początkowy

- Gałąź nadrzędna: dev-mode, commit 71f0fba84a59b2f14a72ad05227ded1860ec7cb2.
- Kopia bezpieczeństwa: backup/dev-mode-before-labirynt-20261030.
- Źródło labiryntu: experiment/labirynt-5x8 (nazwa historyczna; zawiera aktualny labirynt 7×10).
- Eksperyment jest bezpośrednim potomkiem dev-mode, bez osobnych nowszych zmian w dev-mode.
- Przed integracją różnice dotyczyły jedynie game.js, index.html, maze-generator.js i maze-map.css.

## Porównanie mechanik

| Obszar | Stara mapa | Labirynt |
| --- | --- | --- |
| Trasy | 3–5 pasów do przodu, długość zależna od piętra | Siatka 7×10, 70 pól na piętro |
| Ruch | Tylko do przodu, bez animacji | Cztery kierunki, animacja i powrót po odwiedzonych |
| Rozgałęzienia | Przecięcia pasów | Minimum dwa wyjścia ze startu, rozgałęzienia i pętle |
| Widoczność | Cała mapa | Zielone odwiedzone, szare odkryte nieodwiedzone, ciemne nieznane |
| Ściany | Pełne linie SVG | Odkrywane dopiero po wejściu na pole |
| Ikony | Aktualny symbol pokoju | Zapamiętywanie ikon ukończonych zdarzeń |
| Interfejs | Okrągłe punkty, przewijanie poziome | Kafelki, przewijanie pionowe i panel boczny |
| Podsumowanie walki | Podstawowe przyciski | Wyraźny powrót na mapę i czerwone wyjście do lobby |

## Limity na jedno piętro 7×10

1 start, 1 boss, 10 zwykłych przeciwników, 4 elity, 2 sklepy, 3 skrzynie, 2 leczenia, 3 wydarzenia i 44 puste pola. Leczenia są zawsze w ślepym zaułku za zwykłym przeciwnikiem. Wydarzenia nie dodają ponadlimitowych walk.

## Co pozostaje bez zmian

- Silnik walki karcianej, układy, tarcze, statusy, talia, animacje i cechy wrogów.
- EXP, HP, monety, ekwipunek, mikstury, artefakty, sklep, nagrody i poziomy.
- Lobby, sekcje zadań, umiejętności, osiągnięć, statystyk i statystyki ukończonych wypraw.
- Pliki danych przeciwników/przedmiotów, dev.js oraz biblioteka prototypowego silnika wydarzeń.
- Biblioteka zdarzeń w src/events/ była i nadal jest niezależna od przeglądarkowej gry; nie jest automatycznie uruchamiana przez HTML.

## Usunięte elementy

- map-generator.js i renderDiceyMap, zastąpione przez maze-generator.js i renderMazeMap.
- Warstwa svgLayer, linie SVG i okrągłe kafelki node-plate.
- Zbędne współrzędne pikselowe x/y oraz mapWidth/mapHeight.
- Pozostałości stylów starej mapy i nieaktualne odniesienia w dokumentacji.

## Testy i ograniczenia weryfikacji

Testy: node --test tests/*.test.js, uruchamiane również w GitHub Actions.

- 13 istniejących testów prototypowego silnika wydarzeń.
- 9 testów labiryntu: generator 1000 map, limity walk, leczenie za wrogiem, szare pola, odkrywanie ścian, ikony, powrót, monety/EXP po walce, przejście piętra i brak nadmiarowych zasadzek.
- Sprawdzenie składni gry oraz podłączenia jedynego generatora mapy.
- Testy jednostkowe nie zastępują ręcznego testu wizualnego na telefonie i przejścia całego piętra.

## Wycofanie

Przed integracją zachowano gałąź backup/dev-mode-before-labirynt-20261030. Przywrócenie zmian przeprowadzać kontrolowanie na gałęzi rozwojowej. Gałęzi main nie zmieniano.
