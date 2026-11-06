import fs from 'fs/promises';
import path from 'path';
import core from './core.js';

// Define the valid actions in one place
const VALID_ACTIONS = ['sort', 'playlist', 'both'];

/**
 * Prints a JSON array of valid actions.
 * The frontend can call this to populate a dropdown menu.
 */
export function getValidActions() {
    // Using console.log prints directly to stdout, which the frontend captures
    console.log(JSON.stringify(VALID_ACTIONS));
    return;
}

export async function runAction(action, folderPath) {
    // Validate the action before proceeding
    if (!VALID_ACTIONS.includes(action)) {
        console.error(`[Error] Invalid action: "${action}". Valid options: ${VALID_ACTIONS.join(', ')}`);
        return;
    }

    const resolvedPath = path.resolve(folderPath);

    if (action === 'sort' || action === 'both') {
        const entries = await fs.readdir(resolvedPath, { withFileTypes: true });
        const filenames = entries.filter(e => e.isFile()).map(e => e.name);
        const { plan, totalMatched } = core.buildRenamePlan(filenames);

        if (totalMatched === 0) {
            console.log(`[Sort] No files matched the (NxM) format in ${resolvedPath}`);
        } else {
            let renamed = 0;
            for (const op of plan) {
                try {
                    await fs.rename(path.join(resolvedPath, op.oldName), path.join(resolvedPath, op.newName));
                    renamed++;
                } catch (err) {
                    console.error(`[Sort] Failed to rename "${op.oldName}":`, err.message);
                }
            }
            console.log(`[Sort] Success: Renamed ${renamed} of ${totalMatched} files.`);
        }
    }

    if (action === 'playlist' || action === 'both') {
        const entries = await fs.readdir(resolvedPath, { withFileTypes: true });
        const filenames = entries.filter(e => e.isFile()).map(e => e.name);
        const content = core.generatePlaylistContent(filenames);

        if (!content) {
            console.log(`[Playlist] No videos found in ${resolvedPath}`);
        } else {
            const fullPath = path.join(resolvedPath, '_playlist.m3u');
            await fs.writeFile(fullPath, content, 'utf8');
            console.log(`[Playlist] Created at: ${fullPath}`);
        }
    }

    // Intentionally returning nothing to prevent the console from printing "true"
    return;
}
