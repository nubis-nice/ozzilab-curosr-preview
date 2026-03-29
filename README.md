# ozzilb-browser-preview

Rozszerzenie **Chrome / Edge (Chromium)** do pracy z [Cursor](https://cursor.com) w stylu **Windsurf Preview**: wybierasz element na stronie w zwykłej przeglądarce, a dane trafiają na **lokalny mostek HTTP**, skąd agent AI (MCP) może je odczytać i proponować zmiany w kodzie frontendu / backendu.

## Wymagania

- Przeglądarka oparta o Chromium (Chrome, Edge, Brave itd.).
- **Działający lokalny serwer mostka** nasłuchujący domyślnie na `http://127.0.0.1:17373` (endpoint `POST /v1/capture`). Mostek jest częścią osobnego projektu Node (serwer MCP + HTTP); bez niego rozszerzenie wyśle żądanie w próżnię.

## Instalacja (tryb deweloperski)

1. Sklonuj to repozytorium lub pobierz ZIP i rozpakuj.
2. Otwórz `chrome://extensions` (lub `edge://extensions`).
3. Włącz **Tryb deweloperski**.
4. Kliknij **Załaduj rozpakowane** i wskaż **katalog repozytorium** (folder z plikiem `manifest.json` w głównym poziomie).

Po instalacji na pasku narzędzi pojawi się **ozzilb-browser-preview**.

## Konfiguracja

1. Kliknij ikonę rozszerzenia.
2. **Adres mostka** — bazowy URL **bez** ścieżki `/v1/capture`, np. `http://127.0.0.1:17373` (domyślnie).
3. **Token** — opcjonalnie, jeśli serwer wymaga nagłówka `X-Preview-Token`.
4. **Zapisz ustawienia**.

## Użycie

| Akcja | Opis |
|--------|------|
| **Wybierz element na tej karcie** | Tryb inspekcji: najedź i kliknij element — zostanie wysłany pełny kontekst DOM (HTML, selektory, style). |
| **Alt+Shift+C** | To samo (skrót można zmienić w `chrome://extensions/shortcuts`). |
| **Zaznaczenie tekstu → menu kontekstowe** | Wyśle tylko zaznaczony tekst (bez pełnego `outerHTML`). |

Po udanym wysłaniu w **Cursorze** poproś agenta o użycie narzędzia MCP, np. `browser_preview_get_last`, aby wczytać ostatni zrzut z mostka.

## Protokół (dla integracji własnego serwera)

`POST {bridgeBase}/v1/capture`  
Nagłówki: `Content-Type: application/json`, opcjonalnie `X-Preview-Token`.  
Treść: JSON z polem `schemaVersion: 1` oraz m.in. `pageUrl`, `tagName`, `outerHTML`, `cssSelector`, `computedStyles` (szczegóły w kodzie `content-picker.js` i `background.js`).

## Bezpieczeństwo

Rozszerzenie ma szerokie uprawnienia (`<all_urls>`) — nadaje się do **środowiska developerskiego**. Nie publikuj w Chrome Web Store bez osobnego audytu i polityki prywatności.

## Licencja

MIT — plik `LICENSE`.
