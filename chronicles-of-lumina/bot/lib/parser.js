// lib/parser.js — turn a free-form patch description into Neu/Geändert/Gefixt sections.
// Format: lines starting with "Neu:", "Geändert:", "Gefixt:" (or "Added:", "Changed:", "Fixed:").

const HEADERS = {
  'neu': 'neu', 'added': 'neu', 'hinzugefügt': 'neu', 'hinzugefuegt': 'neu',
  'geändert': 'geaendert', 'changed': 'geaendert', 'changed:': 'geaendert',
  'gefixt': 'gefixt', 'fixed': 'gefixt', 'behoben': 'gefixt', 'bugfix': 'gefixt',
};

export function parsePatchDescription(text) {
  const sections = { neu: [], geaendert: [], gefixt: [] };
  let current = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^([A-Za-zäöüÄÖÜß]+):\s*(.*)$/);
    if (m) {
      const key = HEADERS[m[1].toLowerCase()];
      if (key) {
        current = key;
        if (m[2]) sections[current].push(`• ${m[2]}`);
        continue;
      }
    }
    if (current) sections[current].push(`• ${line}`);
  }
  return sections;
}
