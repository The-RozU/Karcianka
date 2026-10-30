# Kalon

Karczemna gra karciana PvE osadzona w świecie Calionu. Wyprawy odbywają się w labiryncie 7×10 z walkami, zdarzeniami, skrzyniami i sklepami.

**Wersja: 0.4.1**. Poprawki są sprawdzane na `dev-mode`, a następnie publikowane w `main`.

- [Kalon, podgląd dev-mode](https://the-rozu.github.io/Karcianka-test/dev/)
- [Repozytorium testowe](https://github.com/The-RozU/Karcianka-test)
- [Dokumentacja integracji labiryntu](docs/MAZE_MIGRATION.md)

Automatyczne testy: `node --test tests/*.test.js`.

## Poprawki 0.4.1

- Boss jest widoczny na mapie od początku piętra, bez zdradzania nieodkrytych ścian.
- Do poznanych sklepów można wracać. Dostępna oferta i wykupione przedmioty są zapamiętywane w danym sklepie.
- Skrzynia daje jeden losowy typ nagrody: monety albo jednorazowy przedmiot. Przy pełnym plecaku zawsze daje monety.
- Generator ponawia losowanie rzadkich niepoprawnych układów zamiast przerywać tworzenie piętra.
