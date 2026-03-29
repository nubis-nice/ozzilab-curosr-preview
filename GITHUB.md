# Publikacja na GitHub

Repozytorium jest gotowe lokalnie: `F:\.cursor\ozzilb-browser-preview`, gałąź **`main`**, jeden commit.

## Opcja A — GitHub CLI (`gh`)

```powershell
cd F:\.cursor\ozzilb-browser-preview
gh auth login
gh repo create ozzilb-browser-preview --public --source=. --remote=origin --push
```

Jeśli nazwa repozytorium na GitHubie ma być inna, zmień pierwszy argument `gh repo create`.

## Opcja B — ręcznie w przeglądarce

1. Utwórz nowe repozytorium **https://github.com/new** (np. `ozzilb-browser-preview`, publiczne, **bez** inicjalizacji README).
2. W katalogu projektu:

```powershell
cd F:\.cursor\ozzilb-browser-preview
git remote add origin https://github.com/TWOJA_NAZWA_UZYTKOWNIKA/ozzilb-browser-preview.git
git push -u origin main
```

(Użyj SSH zamiast HTTPS, jeśli tak masz skonfigurowane Git.)
