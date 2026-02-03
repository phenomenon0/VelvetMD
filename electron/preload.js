const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('velvetAPI', {
    // File operations
    readDirectory: (dirPath) => ipcRenderer.invoke('read-directory', dirPath),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),

    // File watching
    watchDirectory: (dirPath, callback) => {
        const channel = `file-change-${Date.now()}`;
        ipcRenderer.on(channel, (event, data) => callback(data));
        ipcRenderer.invoke('watch-directory', dirPath, channel);
        return () => ipcRenderer.invoke('unwatch-directory', channel);
    },

    // Session mode
    getSessionFiles: () => ipcRenderer.invoke('get-session-files'),
    addSessionFile: (filePath) => ipcRenderer.invoke('add-session-file', filePath),
    watchSessionFiles: (callback) => {
        const channel = `session-change-${Date.now()}`;
        ipcRenderer.on(channel, (event, data) => callback(data));
        ipcRenderer.invoke('watch-session-files', channel);
        return () => ipcRenderer.invoke('unwatch-directory', channel);
    },

    // Dialog
    openFolder: () => ipcRenderer.invoke('open-folder-dialog'),

    // Window controls
    windowControls: {
        minimize: () => ipcRenderer.send('window-minimize'),
        maximize: () => ipcRenderer.send('window-maximize'),
        close: () => ipcRenderer.send('window-close'),
        isMaximized: () => ipcRenderer.invoke('window-is-maximized')
    },

    // Get initial file from env
    getInitialFile: () => ipcRenderer.invoke('get-initial-file')
});
