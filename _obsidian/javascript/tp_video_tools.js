// _obsidian/javascript/tp_video_tools.js
'use strict';

let adapterInstance = null;

async function getAdapter() {
    // Return the cached instance if already loaded
    if (adapterInstance) return adapterInstance;

    const corePath = '_Tools/vidsorter/lib/core.js';
    const adapterPath = '_Tools/vidsorter/lib/obsidian-adapter.js';

    try {
        // 1. Read and evaluate core.js
        const coreContent = await app.vault.adapter.read(corePath);
        const coreModule = { exports: {} };
        new Function('module', 'exports', coreContent)(coreModule, coreModule.exports);
        
        // 2. Read and evaluate obsidian-adapter.js
        const adapterContent = await app.vault.adapter.read(adapterPath);
        const adapterModule = { exports: {} };
        new Function('module', 'exports', adapterContent)(adapterModule, adapterModule.exports);
        
        // 3. Initialize the adapter with the core logic
        adapterInstance = adapterModule.exports.createObsidianAdapter(coreModule.exports);
        return adapterInstance;
        
    } catch (err) {
        console.error("Templater Error: Failed to load modules from _Tools.", err);
        new Notice("Failed to load Vidsorter modules. Check console (Ctrl+Shift+I).");
        throw err;
    }
}

module.exports = {
    // Lazy-load the adapter on the first function call
    renameAndSort: async (tp, params) => {
        const adapter = await getAdapter();
        return adapter.renameAndSort(tp, params);
    },
    createPlaylist: async (tp, params) => {
        const adapter = await getAdapter();
        return adapter.createPlaylist(tp, params);
    }
};