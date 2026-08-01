// lib/github.js — minimal GitHub Releases API client.
// POST /repos/{owner}/{repo}/releases with tag_name, name, body, draft, prerelease.
//
// Auth: requires GITHUB_TOKEN (PAT with `repo` scope for classic, or
// `contents: write` for fine-grained) and GITHUB_REPO (`owner/repo`).
// Drafts by default so a mod can review on github.com before publishing.

const GITHUB_API = 'https://api.github.com';

export function isGitHubConfigured() {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
}

export async function createRelease({ tag, name, body, draft = true, prerelease = false, fetchImpl = globalThis.fetch }) {
  const token = process.env.GITHUB_TOKEN;
  const repo  = process.env.GITHUB_REPO;
  if (!token) throw new Error('GITHUB_TOKEN not set');
  if (!repo || !repo.includes('/')) throw new Error('GITHUB_REPO must be in `owner/repo` format');

  const url = `${GITHUB_API}/repos/${repo}/releases`;
  const resp = await fetchImpl(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'LuminaBot/0.1.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tag_name: tag, name, body, draft, prerelease }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    // 422 = tag already exists — give a friendlier error
    if (resp.status === 422 && /already_exists/i.test(text)) {
      throw new Error(`Tag ${tag} existiert bereits auf GitHub. Anderen Tag wählen oder existierendes Release löschen.`);
    }
    throw new Error(`GitHub API ${resp.status}: ${text.slice(0, 200)}`);
  }
  return await resp.json();
}

/** Format parsed sections into a Markdown release body. */
export function formatReleaseBody(sections, version) {
  const out = [`# v${version}`, '', '> 🤖 _Auto-generated from Discord `/patch` command._', ''];
  const push = (heading, lines) => {
    if (!lines?.length) return;
    out.push(`## ${heading}`, '');
    out.push(...lines.map((s) => `- ${s.replace(/^•\s*/, '')}`));
    out.push('');
  };
  push('🆕 Neu',       sections.neu);
  push('🔄 Geändert',  sections.geaendert);
  push('🐛 Gefixt',    sections.gefixt);
  return out.join('\n').trim() + '\n';
}
