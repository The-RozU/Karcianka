# Kalon

Karczemna gra karciana PvE osadzona w świecie Calionu. Wyprawy odbywają się w labiryncie 7×10 z walkami, zdarzeniami, skrzyniami i sklepami.

**Wersja: 0.4.5**. Poprawki są sprawdzane na `dev-mode`, a następnie publikowane w `main`.

- [Kalon, test na telefonie (najnowsze dev-mode)](https://the-rozu.github.io/Karcianka-test/)
- [Alternatywny adres podglądu](https://the-rozu.github.io/Karcianka-test/dev/)
- [Repozytorium testowe](https://github.com/The-RozU/Karcianka-test)
- [Dokumentacja integracji labiryntu](docs/MAZE_MIGRATION.md)

Automatyczne testy: `node --test tests/*.test.js`.

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
