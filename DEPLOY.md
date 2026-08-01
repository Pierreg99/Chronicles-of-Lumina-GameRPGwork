# ⚔️ Chronicles of Lumina — Deployment

> *„Drei Pfade führen den Helden hinaus: das offene Web, der mobile Schrein
> und der heimische Desktop-Thron. Wähle weise, welcher Stein geschliffen
> werden soll."* — Dorfälteste

Die nachfolgende Tabelle ist dein **Reaktions-Plan** für jedes Deployment-Szenario.
Jede Zeile mappt eine Situation auf den exakten Prompt-Block, den du in die
AI / CI / Shell gibst.

| Situation | Prompt / Aktion |
|---|---|
| **Erstes Setup aller drei Plattformen** | Komplette Pipeline einmal durchlaufen: `🌐 WEB → 🤖 ANDROID → 🖥️ DESKTOP` |
| **Nur Web-Deploy aktualisieren** | Nur den `🌐 WEB`-Abschnitt ausführen (`python3 -m http.server 8080` / statischer Host) |
| **Android-Problem debuggen** | Nur `🤖 ANDROID` + Fehlermeldung anhängen (`adb logcat`, `npx cap sync`) |
| **Neue EXE-Version bauen** | `🖥️ DESKTOP` + „Version bump auf X.Y.Z" |

---

## 🌐 WEB — Statisches Hosting

```bash
# Lokal testen
cd chronicles-of-lumina
python3 -m http.server 8080
# → http://localhost:8080

# Produktion: beliebiger statischer Host
# (GitHub Pages, Netlify, Vercel, Cloudflare Pages, S3+CloudFront)
# Build-Schritt: keiner — Pure ES-Module, keine Toolchain
```

**Lieferumfang:** `index.html`, `src/`, `assets/`, `manifest.webmanifest`, `sw.js`, `tests/`

**URLs:**
- Production: `https://<user>.github.io/Lumina-Game/`
- Eigener Host: `https://lumina.example.com/`

**Voraussetzungen:** keinerlei — Vanilla JS, Three.js via CDN-Import.

---

## 🤖 ANDROID — PWA / TWA

```bash
# 1. PWA-Grundlage steht: manifest + service worker vorhanden
# 2. Mit Bubblewrap zur Trusted Web Activity wrappen
npx @bubblewrap/cli init --manifest https://<host>/manifest.webmanifest
npx @bubblewrap/cli build
# → app-release-signed.apk (oder .aab für Play Store)
```

**Play-Store-Variante:**
```bash
# 3. AAB hochladen
npx @bubblewrap/cli build --release
# → app-release-bundle.aab
```

**Voraussetzungen:**
- HTTPS-Endpoint der Web-Version (PWA-TWA verlangt gültiges Zert)
- `assetlinks.json` unter `/.well-known/` mit korrektem SHA-256-Fingerprint
- Google-Play-Console-Account ($25 einmalig)

**Manifest-Felder (Pflicht):** `name`, `short_name`, `start_url`, `display: standalone`,
`background_color`, `theme_color`, `icons[192, 512]`.

---

## 🖥️ DESKTOP — Electron-Wrapper

```bash
# 1. Electron-Wrapper ausführen (Node + Chromium)
cd desktop
npm install
npm start               # Dev
npm run build           # → dist/Lumina-Setup-X.Y.Z.exe (NSIS-Installer)
```

**Cross-Build (Win / Mac / Linux):**
```bash
# Windows .exe
npx electron-builder --win --x64
# macOS .dmg
npx electron-builder --mac
# Linux AppImage
npx electron-builder --linux
```

**Version-Bump-Reihenfolge:**
1. `package.json` → `version`
2. `desktop/package.json` → `version`
3. `CHANGELOG.md` → neuer Block
4. `ROADMAP.md` → Status aktualisieren
5. Commit: `chore(desktop): version bump X.Y.Z`

**Voraussetzungen:**
- Node ≥ 18
- `desktop/main.js` (Electron-Main, lädt `../index.html`)
- `desktop/preload.js` (sicherheits-Bridge)

---

## 🔁 CI/CD (optional)

`/.github/workflows/` enthält bereits:

| Workflow | Zweck |
|---|---|
| `webpack.yml` | Webpack-Lint (falls später Bundler eingeführt) |
| `npm-publish-github-packages.yml` | Paket-Publish zu GitHub Packages |
| `generator-generic-ossf-slsa3-publish.yml` | SLSA-3 Provenienz für Releases |

`npm test` läuft die 53 Assertion-Tests lokal — sollte **vor jedem Push** grün sein.

---

## 🎯 Entscheidungs-Baum

```
                    Neuer Build nötig?
                           │
                ┌──────────┼──────────┐
                │          │          │
            nur Web?   Android?   Desktop?
                │          │          │
                ▼          ▼          ▼
         static host   Bubblewrap  electron-builder
                │          │          │
                └──────────┴──────────┘
                           │
                   Version bump + CHANGELOG
                           │
                   git commit + push
                           │
                   npm test grün? → ✅ done
```
