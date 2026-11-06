'use strict';

// We wrap it in a function that accepts the core logic
function createObsidianAdapter(core) {
  function resolveFolder(tp, folderPath) {
    if (!folderPath || folderPath === '/' || folderPath === '.') {
      return app.vault.getRoot();
    }
    return app.vault.getAbstractFileByPath(folderPath);
  }

  async function renameAndSort(tp, { folderPath, notifyNonExistence = true } = {}) {
    const folder = resolveFolder(tp, folderPath);
    if (!folder || !(folder instanceof tp.obsidian.TFolder)) {
      new Notice(`Error: Folder "${folderPath}" not found.`);
      return;
    }

    const nameToFile = new Map();
    for (const child of folder.children) {
      if (child instanceof tp.obsidian.TFile) nameToFile.set(child.name, child);
    }

    const { plan, totalMatched } = core.buildRenamePlan([...nameToFile.keys()]);

    if (totalMatched === 0) {
      if (notifyNonExistence) new Notice('No files matched the (NxM) format.');
      return;
    }

    let renamed = 0, failed = 0;
    for (const op of plan) {
      const tfile = nameToFile.get(op.oldName);
      if (!tfile) continue;
      
      const newPath = tp.obsidian.normalizePath(`${folder.path}/${op.newName}`);
      
      try {
        await app.fileManager.renameFile(tfile, newPath);
        renamed++;
      } catch (err) {
        console.error(`Failed to rename "${op.oldName}"`, err);
        failed++;
      }
    }
    new Notice(`Sorted ${totalMatched} files. Renamed: ${renamed}, Failed: ${failed}.`);
  }

  async function createPlaylist(tp, { folderPath, notifyNonExistence = true, fileName = '_playlist.m3u' } = {}) {
    const folder = resolveFolder(tp, folderPath);
    if (!folder || !(folder instanceof tp.obsidian.TFolder)) {
      new Notice(`Error: Folder "${folderPath}" not found.`);
      return;
    }

    const names = folder.children
      .filter(f => f instanceof tp.obsidian.TFile)
      .map(f => f.name);

    const content = core.generatePlaylistContent(names);
    if (!content) {
      if (notifyNonExistence) new Notice('No video files found; playlist not created.');
      return;
    }

    const isRoot = folder.path === '/' || folder.path === '';
    const fullPath = tp.obsidian.normalizePath(isRoot ? fileName : `${folder.path}/${fileName}`);

    const existing = app.vault.getAbstractFileByPath(fullPath);
    if (existing && existing instanceof tp.obsidian.TFile) {
      await app.vault.modify(existing, content);
    } else {
      await app.vault.create(fullPath, content);
    }
    new Notice(`Playlist created at: ${fullPath}`);
  }

  return { renameAndSort, createPlaylist };
}

module.exports = { createObsidianAdapter };