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
| `/patch` | ManageMessages | Patch-Notes-Embed |

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
├── lib/                  # embeds.js, store.js, parser.js, loader.js
├── data/                 # lore.json, reports.json, suggestions.json, leaderboard.json
├── test/                 # load.test.js (kein Discord-Connect)
├── package.json
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

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
