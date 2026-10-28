# Calion: organizacja zawartości

Stan na 2026-10-28. Aplikacja działa na klasycznych skryptach JS, w kolejności z index.html (bez bundlera).

## Dane
- data/items/shop-items.js: istniejące SHOP_ITEMS, pomocnicze SVG oraz przedmioty sklepu.
- data/enemies/regular.js: REGULAR_ENEMIES.
- data/enemies/elite.js: ELITE_ENEMIES.
- data/enemies/bosses.js: CALION_BOSSES.
- data/events/random/, story/, special/: katalogi pod przyszłe wydarzenia, bez wdrożonego jeszcze silnika.

## Kod
- game.js: mechanika gry i przebieg wyprawy.
- map-generator.js: losowanie mapy, w tym pól ?.
- player-stats.js: localStorage statystyk ukończonych wypraw; NIE zapisuje aktywnego RUN-u, flag fabularnych ani osiągnięć.
- dev.js: narzędzia dla dewelopera.

## Grafiki
- assets/events/, enemies/, items/, backgrounds/, ui/: przestrzeń na nowe ilustracje.
- img/: istniejące działające grafiki, pozostawione bez przenoszenia, żeby nie zerwać ścieżek.

## Zasady
1. Zanim dodasz nową mechanikę lub treść, sprawdź, czy już istnieje.
2. Zachowuj kompatybilne ID oraz publiczne stałe SHOP_ITEMS, REGULAR_ENEMIES, ELITE_ENEMIES i CALION_BOSSES.
3. Pliki danych z klasycznymi deklaracjami const muszą zostać załadowane przed game.js; dev.js po game.js.
4. Docelowe wydarzenia: osobny plik na wydarzenie, unikalne ID, wspólny silnik i rejestr; nie zakładaj, że silnik istnieje.
5. Docelowo każdy przeciwnik i przedmiot może mieć oddzielny plik z rejestrem; obecnie grupy są rozdzielone według typu, by zachować kompatybilność.
6. Najpierw sprawdź powiązania z kodem, a dopiero potem przenoś obecne grafiki lub zmieniaj strukturę.
7. Wszystkie zmiany robocze wyłącznie na dev-mode. Nie edytuj main ani mian bez wyraźnej prośby.

## Kontrola ręczna
Uruchom grę i sprawdź: sklep (2 leczenia, 2 zużywalne, 1 artefakt, reroll), zwykłą walkę, elity, bossów, mapę, tryb dev i zapis statystyk.
