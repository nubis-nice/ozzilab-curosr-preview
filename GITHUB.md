# Publikacja na GitHub

**Remote:** [github.com/nubis-nice/ozzilab-curosr-preview](https://github.com/nubis-nice/ozzilab-curosr-preview)  
Repozytorium lokalne (przykład): `F:\.cursor\ozzilb-browser-preview`, gałąź **`main`**.

## Wypchnij kod na GitHub

```powershell
cd F:\.cursor\ozzilb-browser-preview
.\scripts\push.ps1 "https://github.com/nubis-nice/ozzilab-curosr-preview.git"
```

Albo:

```powershell
$env:GITHUB_REPO_URL = "https://github.com/nubis-nice/ozzilab-curosr-preview.git"
.\scripts\push.ps1
```

Przy pierwszym `push` Git może poprosić o logowanie (Git Credential Manager / PAT).

## Opcja — nowe repo przez GitHub CLI

```powershell
cd F:\.cursor\ozzilb-browser-preview
gh auth login
gh repo create ozzilb-browser-preview --public --source=. --remote=origin --push
```

## Ręcznie (bez skryptu)

```powershell
cd F:\.cursor\ozzilb-browser-preview
git remote add origin https://github.com/nubis-nice/ozzilab-curosr-preview.git
git push -u origin main
```

(Użyj SSH zamiast HTTPS, jeśli tak masz skonfigurowane Git.)
