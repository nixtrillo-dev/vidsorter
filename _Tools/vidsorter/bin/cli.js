#!/usr/bin/env node
'use strict';
const path = require('path');
const { renameAndSort, createPlaylist } = require('../lib/node-adapter');

async function main() {
  const [cmd, folderArg] = process.argv.slice(2);
  
  if (!cmd || !folderArg || !['sort', 'playlist', 'both'].includes(cmd)) {
    console.error('Usage: vp <sort|playlist|both> <folder-path>');
    process.exit(1);
  }

  const folderPath = path.resolve(folderArg);

  try {
    if (cmd === 'sort' || cmd === 'both') await renameAndSort({ folderPath });
    if (cmd === 'playlist' || cmd === 'both') await createPlaylist({ folderPath });
  } catch (err) {
    console.error('Execution Error:', err.message);
    process.exit(1);
  }
}
main();