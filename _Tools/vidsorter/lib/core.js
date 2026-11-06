'use strict';

const NXM_PATTERN = /\(([0-9.,]+)\s*x\s*([0-9.,]+)\)/gi;
const PREFIX_PATTERN = /^\d{4} - /;
const VIDEO_EXTS = new Set(['mp4', 'mkv']);

function parseNxM(filename) {
  const matches = [...filename.matchAll(NXM_PATTERN)];
  if (!matches.length) return null;
  const last = matches[matches.length - 1];
  const n = parseFloat(last[1].replace(/,/g, '.'));
  const m = parseFloat(last[2].replace(/,/g, '.'));
  if (!Number.isFinite(n) || !Number.isFinite(m)) return null;
  return { n, m };
}

function buildRenamePlan(filenames) {
  const entries = [];
  for (const name of filenames) {
    const parsed = parseNxM(name);
    if (parsed) entries.push({ name, ...parsed });
  }
  
  // Sort by N, then M
  entries.sort((a, b) => (a.n !== b.n ? a.n - b.n : a.m - b.m));
  
  const plan = [];
  entries.forEach((item, i) => {
    const newName = `${String(i + 1).padStart(4, '0')} - ${item.name.replace(PREFIX_PATTERN, "")}`;
    if (newName !== item.name) plan.push({ oldName: item.name, newName });
  });
  return { plan, totalMatched: entries.length };
}

function generatePlaylistContent(filenames) {
  return filenames
    .filter(name => {
      const dot = name.lastIndexOf('.');
      return dot >= 0 && VIDEO_EXTS.has(name.slice(dot + 1).toLowerCase());
    })
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map(n => `./${n}`)
    .join('\n');
}

module.exports = { buildRenamePlan, generatePlaylistContent };