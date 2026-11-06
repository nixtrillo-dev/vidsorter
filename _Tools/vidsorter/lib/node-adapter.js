'use strict';
const fs = require('fs/promises');
const path = require('path');
const core = require('./core');

async function renameAndSort({ folderPath }) {
  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  const filenames = entries.filter(e => e.isFile()).map(e => e.name);
  const { plan, totalMatched } = core.buildRenamePlan(filenames);

  if (totalMatched === 0) {
    console.log(`[Sort] No files matched the (NxM) format in ${folderPath}`);
    return;
  }

  let renamed = 0;
  for (const op of plan) {
    try {
      await fs.rename(path.join(folderPath, op.oldName), path.join(folderPath, op.newName));
      renamed++;
    } catch (err) {
      console.error(`[Sort] Failed to rename "${op.oldName}":`, err.message);
    }
  }
  console.log(`[Sort] Success: Renamed ${renamed} of ${totalMatched} files.`);
}

async function createPlaylist({ folderPath, fileName = '_playlist.m3u' }) {
  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  const filenames = entries.filter(e => e.isFile()).map(e => e.name);
  const content = core.generatePlaylistContent(filenames);

  if (!content) {
    console.log(`[Playlist] No videos found in ${folderPath}`);
    return;
  }

  const fullPath = path.join(folderPath, fileName);
  await fs.writeFile(fullPath, content, 'utf8');
  console.log(`[Playlist] Created at: ${fullPath}`);
}

module.exports = { renameAndSort, createPlaylist };