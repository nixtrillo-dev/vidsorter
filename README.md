# VidSorter

VidSorter sorts video files whose names contain an `(NxM)` value and can create an M3U playlist for a folder. It can be run from a terminal, and the repository also includes an Obsidian/Templater template.

## What it does

- Finds files with a name containing a value such as `(1x2)` or `(1,920 x 1,080)`.
- Sorts matching files numerically by the first value, then the second, and prefixes them `0001 - `, `0002 - `, and so on. An existing four-digit prefix is replaced.
- Writes `_playlist.m3u` containing the folder's `.mp4` and `.mkv` files, in natural filename order. Playlist paths are relative to the playlist.

Only files directly inside the selected folder are processed; subfolders are not traversed. Sorting applies to any file whose name matches the `(NxM)` pattern, while playlists include only MP4 and MKV files. Renaming changes the original filenames.

## Use in Obsidian

The Obsidian workflow uses the [Templater](https://github.com/SilentVoid13/Templater) community plugin, the provided user script, and the provided template. The user script loads the shared sorting logic and Obsidian adapter from your vault.

1. Copy `_Tools/` and `_obsidian/` into the root of your Obsidian vault, preserving the folder structure. In particular, keep `core.js` and `obsidian-adapter.js` together under `_Tools/vidsorter/lib/`. If these folders are already in the vault, leave them in place.
2. In Templater settings, set **User scripts folder location** to `_obsidian/javascript` (relative to the vault root).
3. Add `_Templates` as a Templater template folder, or copy `Rename and sort (nxn).md` into a template folder already configured in Templater. The provided template is in the `Video Tools` subfolder.
4. In the vault, open or create a note inside the folder containing the videos.
5. Run Templater's **Insert template** command and select **Rename and sort (nxn)**. The template uses the current note's folder, renames matching files, then creates or updates `_playlist.m3u` beside them.

The operation is run by inserting the template; it does not require a separate CLI or command-line installation. Obsidian displays notices for successful sorting and playlist creation, and for cases where the folder or matching files are not found. If you insert the template from a note at the vault root, it operates on the vault root.

## Use from the CLI

The CLI requires Node.js and has no third-party package dependencies. Run commands from the project root:

```sh
node _Tools/vidsorter/bin/cli.js <sort|playlist|both> <folder-path>
```

Examples:

```sh
node _Tools/vidsorter/bin/cli.js sort "/path/to/videos"
node _Tools/vidsorter/bin/cli.js playlist "/path/to/videos"
node _Tools/vidsorter/bin/cli.js both "/path/to/videos"
```

- `sort` renames matching files in the folder.
- `playlist` creates or replaces `_playlist.m3u` with the folder's MP4 and MKV files.
- `both` sorts first, then creates the playlist using the resulting filenames.

Paths containing spaces should be quoted. You can also run the CLI from any directory by passing an absolute folder path. Invalid commands or missing arguments print the usage line and exit with an error.

## Use from GUI

An optional QT GUI application can be downloaded via the releases section. The GUI supports Windows and most Linux distros.

Note 1: Windows users will need to install Node seperately as per usual.

Disclaimer: The GUI is built using [Guify My Script](https://github.com/nixtrillo-dev/guify_my_script)

### Optional `vp` command

To make the `vp` command available globally on your machine, link the local package with npm:

```sh
cd _Tools/vidsorter
npm link
vp both "/path/to/videos"
```

To remove the global link later, run `npm unlink -g vidsorter`.

## Example

Given these files:

```text
Scene B (1920x1080).mp4
Scene A (1280x720).mkv
notes.txt
```

Running `sort` renames the two matching files in resolution order:

```text
0001 - Scene A (1280x720).mkv
0002 - Scene B (1920x1080).mp4
notes.txt
```

Running `playlist` creates `_playlist.m3u` with entries like:

```text
./0001 - Scene A (1280x720).mkv
./0002 - Scene B (1920x1080).mp4
```

## License

VidSorter is distributed under the MIT License. See [LICENSE.txt](LICENSE.txt).
