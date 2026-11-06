<%*
const folder = tp.file.folder(true);
const obsidianFolderPath = (folder === "/") ? "" : folder;

await tp.user.tp_video_tools.renameAndSort(tp, {
  folderPath: obsidianFolderPath
});

await tp.user.tp_video_tools.createPlaylist(tp, {
  folderPath: obsidianFolderPath
});
%>