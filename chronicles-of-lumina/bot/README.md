# 🌟 LuminaBot

Official Discord bot for **Chronicles of Lumina**.
8 slash commands, 4 event handlers, JSON-persisted bug reports & suggestions.

## Quickstart

```bash
cd bot
npm install
cp .env.example .env       # then fill in DISCORD_TOKEN + DISCORD_CLIENT_ID
npm test                   # load + embed + parser + store tests (no token needed)
npm run deploy             # register slash commands
npm start                  # connect to Discord
```

## Docker

```bash
cp .env.example .env       # fill in
docker compose up -d
docker compose logs -f lumina-bot
```

## Slash Commands

| Command | Permission | Description |
|---|---|---|
| `/help` | everyone | Befehlsübersicht |
| `/status` | everyone | Server- + Spielstatus |
| `/lore [thema]` | everyone | Lore-Eintrag aus der Lumina-Welt |
| `/leaderboard` | everyone | Top-5-Helden |
| `/bugreport` | everyone | Bug registrieren (ephemeral) |
| `/suggestion` | everyone | Feature-Vorschlag (ephemeral) |
| `/announce` | ManageMessages | Offizielle Ankündigung |
| `/patch` | ManageMessages | Patch-Notes-Embed + optionaler GitHub-Draft-Release |

## Event Handlers

- `guildMemberAdd` → Willkommensnachricht in `WELCOME_CHANNEL_ID`
- `messageCreate` → 🎉-Reaction auf `level up` / `aufgestiegen`
- `messageCreate` → Auto-React in `SCREENSHOT_CHANNEL_ID` bei Bildanhängen
- `messageCreate` → weiche Deeskalation bei toxischen Schlüsselwörtern

## Verzeichnis

```
bot/
├── index.js              # Main entry
├── deploy.js             # Slash-Command-Registrierung
├── commands/             # 8 Slash-Commands
├── events/               # 4 Event-Handler
├── lib/                  # embeds.js, store.js, parser.js, loader.js, github.js
├── data/                 # lore.json, reports.json, suggestions.json, leaderboard.json
├── test/                 # load.test.js (kein Discord-Connect, mocked fetch für GitHub)
├── package.json
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## GitHub-Releases via /patch

`/patch` kann optional einen **Draft-Release** auf GitHub erstellen.

**Setup:**
1. PAT mit `repo`-Scope: https://github.com/settings/tokens
2. In `.env` setzen:
   ```
   GITHUB_TOKEN=ghp_xxx
   GITHUB_REPO=Pierreg99/Lumina-Game
   ```
3. `npm run deploy` + `npm start`

**Verwendung:**
```
/patch version:0.10.0
beschreibung:
  Neu: Asset-Gen, LuminaBot
  Geändert: materials.js nutzt Canvas
  Gefixt: Test-Pollution
github_release:true
```

→ Embed wird in Discord gepostet **und** Draft-Release auf GitHub erstellt
(mit denselben Notizen als Markdown, getaggt `v0.10.0`, `draft: true`).
Mod reviewt auf github.com, klickt "Publish release" wenn ready.

**Bei Fehler:** Tag existiert schon (422) → klare Fehlermeldung im Embed.
Kein Token konfiguriert → Embed wird trotzdem gepostet, Embed-Footer zeigt "GitHub-Release skipped".

## Tests

```bash
$ npm test
✓ 8 commands, 4 events, 8 embeds, parser + store OK
```

Lädt alle Module, baut alle Embeds, parst Patch-Description, schreibt + liest JSON-Store.
Kein Discord-Connect, kein Token nötig.

## Token-Sicherheit

- `.env` ist in `.gitignore` und `.dockerignore`
- `.env.example` enthält nur Platzhalter
- Token **niemals** in Commits, Issues oder Chat posten — bei Leak sofort auf
  https://discord.com/developers/applications → Bot → Reset Token rotieren
