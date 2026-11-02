# Kalon

Karczemna gra karciana PvE osadzona w świecie Calionu. Wyprawy odbywają się w labiryncie 7×10 z walkami, zdarzeniami, skrzyniami i sklepami.

**Wersja: 0.4.21**. Poprawki są sprawdzane na `dev-mode`, a następnie publikowane w `main`.

- [Kalon, test na telefonie (najnowsze dev-mode)](https://the-rozu.github.io/Karcianka-test/)
- [Alternatywny adres podglądu](https://the-rozu.github.io/Karcianka-test/dev/)
- [Repozytorium testowe](https://github.com/The-RozU/Karcianka-test)
- [Dokumentacja integracji labiryntu](docs/MAZE_MIGRATION.md)

Automatyczne testy: `node --test tests/*.test.js`.

## Poprawki 0.4.21

- Naprawiono zgodność z testami mechanik uruchamianymi bez przeglądarkowego modułu audio. Efekty pozostają włączone w normalnej grze.

## Poprawki 0.4.20

- Dodano 12 efektów dźwiękowych medieval fantasy do `assets/audio/` i moduł `audio.js`.
- Dźwięki obsługują menu, otwieranie okien, wyprawę, zdobycze, sklep, używanie przedmiotów, zwycięstwa i awanse.
- W górnym pasku dodano panel 🔊 Dźwięki: włączanie, regulację głośności, odsłuch wszystkich 12 efektów. Ustawienia zachowują się w localStorage.
- Pliki WAV to autorska rekonstrukcja motywów Calion Sound Pack v2; pozostałe efekty są przygotowane również do przyszłych systemów.

## Poprawki 0.4.12

- Powiązano komplet 11/11 awatarów zwykłych przeciwników, w tym Nożownika z Zaułka (`thug`).
- Nowe pliki nazwane `.webp` zawierają w rzeczywistości dane PNG (zidentyfikowane przez sygnatury binarne i niezmienione SHA plików); aby uniknąć błędnego formatu, dodano równoległe ścieżki `.png` wskazujące dokładnie tę samą zawartość. Oryginalnych przesłanych plików nie usuwano.
- Postać Barnaba nadal używa swojego oryginalnego prawdziwego pliku `tavern_drunk.webp`.
- Rozszerzono test kompletności i poprawnego formatu przypisanych portretów na wszystkie 11 zwykłych postaci.

## Poprawki 0.4.11

- Przywrócono aliasy plików PNG na potrzeby HUD-u, zachowując nowe uploady użytkownika z rozszerzeniem .webp. Mapowania postaci wskazują na rzeczywiste pliki PNG, bez ruszania oryginalnych uploadów.

## Poprawki 0.4.10

- Przypisano kolejne portrety zwykłych przeciwników: `grave_digger`.
- Poprawiono rozszerzenia grafik PNG (nie były prawdziwymi WebP) i usunięto duplikaty plików o tej samej zawartości.
- Łącznie 10 z 11 zwykłych przeciwników ma portret. Oczekują: thug.

## Poprawki 0.4.9

- Połączono 8 nowych portretów zwykłych przeciwników z identyfikatorami w `data/enemies/regular.js`; razem z Barnabą 9 z 11 zwykłych postaci ma przypisany portret.
- Nowe grafiki okazały się danymi PNG zapisanymi z rozszerzeniem `.webp`, dlatego w repozytorium zostały przemianowane na `.png` bez zmiany zawartości obrazu.
- Dwa brakujące portrety: `thug` (Nożownik z Zaułka) i `grave_digger` (Cmentarny Grabarz). HUD nadal wyświetla dla nich inicjały.
- Dodano test ścieżek i sygnatur plików przypisanych portretów.

## Poprawki 0.4.5

- Ujednolicono adres wersji testowej z kodem `dev-mode`, bez zmian mechaniki gry.
- Dodano automatyczne wyzwalanie publikacji testu po zmianach na `dev-mode` (wymaga jednorazowego ustawienia sekretu `KALON_TEST_SYNC_TOKEN` w repozytorium Karcianka).

## Poprawki 0.4.4

- Dodano sześciu zwykłych przeciwników: Bełkotliwy Barnaba, Portowy Tragarz, Uliczny Żebrak, Wędrowny Kupiec, Strażak Hubert i Cmentarny Grabarz. Łącznie 11 zwykłych przeciwników.

## Poprawki 0.4.3

- Dodano zwykłych przeciwników: Znudzona Kelnerka i Małolat.

## Poprawki 0.4.1

- Boss jest widoczny na mapie od początku piętra, bez zdradzania nieodkrytych ścian.
- Do poznanych sklepów można wracać. Dostępna oferta i wykupione przedmioty są zapamiętywane w danym sklepie.
- Skrzynia daje jeden losowy typ nagrody: monety albo jednorazowy przedmiot. Przy pełnym plecaku zawsze daje monety.
- Generator ponawia losowanie rzadkich niepoprawnych układów zamiast przerywać tworzenie piętra.


### Awatary przeciwników

HUD automatycznie wczytuje portret z pola `portrait` w danych postaci (`data/enemies/regular.js`, `elite.js`, `bosses.js`). Obrazy umieszczaj w katalogu `assets/enemies/`, najlepiej jako kwadratowe pliki WebP w stylistyce medieval dark fantasy pixel art. Przykład: `portrait: 'assets/enemies/tavern_drunk.webp'`. Opcjonalne pole `quote` dodaje kwestię postaci pod paskiem HP. Gdy portretu brak lub nie może się wczytać, HUD wyświetla inicjał postaci zamiast uszkodzonego obrazka.
