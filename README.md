# Kalon

Karczemna gra karciana PvE osadzona w świecie Calionu. Wyprawy odbywają się w labiryncie 7×10 z walkami, zdarzeniami, skrzyniami i sklepami.

**Wersja: 0.4.34** (`dev-mode`). Poprawki są sprawdzane na `dev-mode`, a następnie publikowane w `main`.

- [Kalon, test na telefonie (najnowsze dev-mode)](https://the-rozu.github.io/Karcianka-test/)
- [Alternatywny adres podglądu](https://the-rozu.github.io/Karcianka-test/dev/)
- [Repozytorium testowe](https://github.com/The-RozU/Karcianka-test)
- [Dokumentacja integracji labiryntu](docs/MAZE_MIGRATION.md)

Automatyczne testy: `node --test tests/*.test.js`.

## Poprawki 0.4.34

- Usunięto pięć nieaktualnych grafik świecy (`assets/ui/menu/candle-01.png` do `candle-05.png`) przed przygotowaniem nowej animacji.
- Obecna dekoracja świecy CSS pozostaje do czasu zastąpienia jej nowymi assetami.

## Poprawki 0.4.33

- Przebudowano ekran startowy w stylu dark fantasy: drewniany blat, miedziano-złote ramki, zielony przycisk „Wyprawa” i cztery ozdobne przyciski sekcji.
- Usunięto motyw kotwicy, a litery kart zastąpiono czterema symbolami ♤ ♡ ♧ ◇; zachowano tytuł, wersję i dostęp do trybu deweloperskiego.
- Dodano proceduralną teksturę drewna (SVG), dekoracyjne kości, karty i monety oraz świecę z lekką animacją płomienia. Animację można ograniczyć ustawieniem systemowym ograniczającym ruch.
- Układ dostosowuje się do niskich ekranów w orientacji poziomej oraz wąskich ekranów pionowych. Efekty i zmiany stylu dotyczą wyłącznie lobby; mechanika walki pozostaje bez zmian.
- Dodano testy kontrolujące działanie przycisków i motyw menu, a testy audio odczytują bieżący numer wersji zamiast oczekiwać starego numeru.

## Poprawki 0.4.32

- Uproszczono menu: przycisk rozpoczynający grę nazywa się „Wyprawa”; usunięto sztywne wartości HP wrogów, stare nazwy świata i licznik monet.

## Poprawki 0.4.31

- Zaawansowane ustawienia audio (odsłuch, wybór kroków i cięć) są ukryte w trybie zwykłym. W panelu „Dźwięki” pozostają włącznik efektów i główny suwak głośności.
- Wybór i podgląd próbek odblokowuje istniejący tryb deweloperski: pięć stuknięć tytułu w lobby lub parametr `?dev=1`. Bez tworzenia dodatkowego sposobu włączania trybu dev.
- Funkcje zmiany rodzaju kroków i cięć oraz odsłuchu z listy nie działają, zanim tryb deweloperski zostanie aktywowany.
- Zachowano wcześniej zapisane ustawienia audio, wybrane dźwięki i mechanikę walki. Dodano odświeżanie adresu `dev.js` po zmianie wersji, by mobilne przeglądarki nie używały starego skryptu.
- Ujednolicono numer wersji w README i testach z bieżącym `index.html` (poprzedni kod miał już wersję 0.4.30).

## Poprawki 0.4.29

- Dodano trzy prototypowe, autorsko syntetyzowane krótkie efekty cięcia mieczem: Sword Slash (155 ms), Blade Hit (175 ms), Heavy Slash (190 ms).
- W ustawieniach dźwięku można wybrać i odsłuchać każdy wariant trafienia przeciwnika. Wybór zapisuje się lokalnie i obowiązuje w walce, bez zmiany dźwięku otrzymywanych obrażeń.
- Zachowano kamienne kroki jako domyślne. Historyczne nagrania uderzeń pozostają w repozytorium.
- Wersje 0.4.27–0.4.28 wprowadzono wcześniej w bieżącym kodzie; niniejsza zmiana dotyczy wyłącznie dźwięku trafienia przeciwnika.

## Poprawki 0.4.26

- Poprawiono test mapowania nazw nowych efektów audio (klucze `hit_enemy` i `hit_player` są prawidłowymi polami obiektu, nie łańcuchami w apostrofach). Mechanika i nagrania pozostają takie jak w 0.4.25.

## Poprawki 0.4.25

- Trzy nagrane warianty kroków: **kamień** (domyślny), **drewno** i **miękkie podłoże**. W każdym zestawie są dwa odgłosy, przełączane podczas ruchu.
- Nowy wybór rodzaju podłoża i przycisk odsłuchu w ustawieniach audio. Wybór zapisywany razem z głośnością.
- Dźwięki trafień przy rzeczywistym spadku HP gracza lub przeciwnika, bez dźwięku przy samym pochłonięciu obrażeń przez tarczę.
- Po trzy nagrane warianty uderzeń na każdą stronę (ok. 0,12–0,14 s); gotowe do przyszłych szybkich animacji wielokrotnych ciosów.
- SFX obejmują również kontratak Farrona i obrażenia od trucizny.
- Nowe nagrania pochodzą z Kenney Impact Sounds (CC0); źródło i licencja: [assets/audio/CREDITS.md](assets/audio/CREDITS.md). Poprzednie syntetyczne pliki zostawiono do porównania.

## Poprawki 0.4.24

- Karty i kroki w labiryncie są ściszone niezależnymi mnożnikami: papier do 30%, kroki do 22% wcześniejszej głośności (nadal zależne od suwaka głównego).
- Efekty są wstępnie ładowane. Na obsługiwanych urządzeniach Web Audio dekoduje je przed pierwszą akcją i odtwarza bez nowego pobierania pliku przy każdym kliknięciu.
- Mobilne odblokowanie AudioContext następuje już przy dotknięciu ekranu, przed kliknięciem; na starszych urządzeniach pozostaje wstępnie załadowany HTML Audio.
- Dźwięki nadal wyzwalają się przy zmianie wyboru karty i na początku każdego animowanego kroku; żaden spóźniony efekt nie jest odtwarzany po zakończeniu ładowania.
- Zachowano wyciszenie siedmiu niechcianych efektów i dotychczasowe ustawienia użytkownika.

## Poprawki 0.4.23

- Tymczasowo wyciszono 7 efektów: potwierdzenie, monety, EXP, awans, trening, start wyprawy i zwycięstwo. Pliki WAV pozostają w repozytorium.
- Wycofano dodatkowy dźwięk potwierdzenia i odgłos ekwipunku z akcji „Atak”. Przyciski mają krótki, dyskretny klik.
- Dodano dwa warianty szelestu papieru przy zaznaczaniu i odznaczaniu kart; brak efektu przy niedozwolonym zaznaczeniu.
- Dodano dwa warianty kroku w labiryncie: osobny odgłos przy każdym przebytym kafelku, także na wielopolowych trasach powrotnych. Kafelki mapy nie wyzwalają dodatkowego kliku.
- Uproszczono listę odsłuchu do aktywnych efektów; zostawiono regulację i zapamiętywanie głośności.

## Poprawki 0.4.22

- Gwarantowana bezpieczna obsługa efektów także w izolowanych testach logiki labiryntu, które wywołują pojedyncze funkcje poza środowiskiem gry.

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
