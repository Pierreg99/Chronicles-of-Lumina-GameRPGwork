# Security Policy — Chronicles of Lumina

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| main    | :white_check_mark: |
| older   | :x:                |

This project is in **active development** (pre-1.0). Only the `main` branch
on GitHub receives security updates. Older commits and tags are not patched.

## Reporting a Vulnerability

**Preferred:** Open a private security advisory via GitHub:
https://github.com/Pierreg99/Lumina-Game/security/advisories/new

**Alternative:** Email the maintainer (Cryofreee / Pierreg99) — see
`.well-known/security.txt` for the current address.

Please **do not** open a public issue for suspected vulnerabilities before
a fix is available. Public disclosure before a patch gives attackers a
free window.

## What to include

- Affected version (commit SHA or release tag)
- Reproduction steps
- Impact (what an attacker gains)
- Environment (browser, OS, Three.js version if relevant)

## Response Targets

| Stage                | Target time |
|----------------------|-------------|
| Initial triage       | 7 days      |
| Patch release (high) | 30 days     |
| Patch release (low)  | 90 days     |
| Public disclosure    | After patch |

Critical issues (RCE, auth bypass) are prioritised. Low-severity findings
may be batched into the next regular release.

## Scope

In scope:
- Game client (`chronicles-of-lumina/src/**`)
- Discord bot (`chronicles-of-lumina/bot/**`)
- Desktop wrapper (`chronicles-of-lumina/desktop/**`)
- Build & release pipeline (`.github/workflows/**`)

Out of scope:
- Three.js library itself — report upstream
- Discord.js library — report upstream
- Electron — report upstream
- GitHub Actions — report upstream
- Dependabot alerts on transitive deps without a known-impact path
