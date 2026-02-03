const { app, BrowserWindow, globalShortcut, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

let mainWindow;
let fileWatchers = new Map();
let initialFile = process.env.VELVETMD_FILE || null;
let sessionMode = process.env.VELVETMD_MODE === 'session';
let sessionFiles = process.env.VELVETMD_FILES ? process.env.VELVETMD_FILES.split(':').filter(f => f) : [];

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1100,
        height: 800,
        minWidth: 600,
        minHeight: 400,
        frame: false,
        titleBarStyle: 'hidden',
        trafficLightPosition: { x: 12, y: 12 },
        transparent: false,
        backgroundColor: '#1e1e1e',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        vibrancy: 'under-window',
        visualEffectState: 'active',
    });

    mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));

    // Dev tools shortcut
    globalShortcut.register('CommandOrControl+Shift+I', () => {
        mainWindow.webContents.toggleDevTools();
    });

    // Reload shortcut
    globalShortcut.register('CommandOrControl+R', () => {
        mainWindow.reload();
    });

    // Close shortcut
    globalShortcut.register('CommandOrControl+W', () => {
        mainWindow.close();
    });

    mainWindow.on('closed', () => {
        // Clean up all file watchers
        fileWatchers.forEach(watcher => watcher.close());
        fileWatchers.clear();
        mainWindow = null;
    });
}

// IPC Handlers

// Read directory contents - only .md files, flat list
ipcMain.handle('read-directory', async (event, dirPath) => {
    try {
        const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
        const mdFiles = [];

        for (const entry of entries) {
            if (entry.name.startsWith('.')) continue;
            if (!entry.isDirectory() && entry.name.endsWith('.md')) {
                const filePath = path.join(dirPath, entry.name);
                const stat = await fs.promises.stat(filePath);
                mdFiles.push({
                    name: entry.name,
                    path: filePath,
                    mtime: stat.mtime
                });
            }
        }

        // Sort by modification time, newest first
        mdFiles.sort((a, b) => b.mtime - a.mtime);
        return mdFiles;
    } catch (err) {
        console.error('read-directory error:', err);
        return [];
    }
});

// Read file contents
ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const content = await fs.promises.readFile(filePath, 'utf8');
        return { success: true, content, path: filePath, name: path.basename(filePath) };
    } catch (err) {
        console.error('read-file error:', err);
        return { success: false, error: err.message };
    }
});

// Watch directory for changes
ipcMain.handle('watch-directory', async (event, dirPath, channel) => {
    try {
        // Close existing watcher for this channel
        if (fileWatchers.has(channel)) {
            fileWatchers.get(channel).close();
        }

        const watcher = chokidar.watch(dirPath, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true,
            depth: 5
        });

        watcher.on('change', (changedPath) => {
            if (changedPath.endsWith('.md')) {
                mainWindow?.webContents.send(channel, { type: 'change', path: changedPath });
            }
        });

        watcher.on('add', (addedPath) => {
            if (addedPath.endsWith('.md')) {
                mainWindow?.webContents.send(channel, { type: 'add', path: addedPath });
            }
        });

        watcher.on('unlink', (removedPath) => {
            if (removedPath.endsWith('.md')) {
                mainWindow?.webContents.send(channel, { type: 'unlink', path: removedPath });
            }
        });

        fileWatchers.set(channel, watcher);
        return { success: true };
    } catch (err) {
        console.error('watch-directory error:', err);
        return { success: false, error: err.message };
    }
});

// Stop watching
ipcMain.handle('unwatch-directory', async (event, channel) => {
    if (fileWatchers.has(channel)) {
        fileWatchers.get(channel).close();
        fileWatchers.delete(channel);
    }
    return { success: true };
});

// Open folder dialog
ipcMain.handle('open-folder-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    if (result.canceled) return null;
    return result.filePaths[0];
});

// Get initial file from environment
ipcMain.handle('get-initial-file', async () => {
    // Session mode: return list of specific files
    if (sessionMode && sessionFiles.length > 0) {
        return {
            mode: 'session',
            files: sessionFiles
        };
    }

    // Browse mode: file or directory
    if (!initialFile) return null;
    try {
        const stat = await fs.promises.stat(initialFile);
        if (stat.isFile()) {
            return {
                mode: 'browse',
                path: initialFile,
                directory: path.dirname(initialFile)
            };
        }
        if (stat.isDirectory()) {
            return {
                mode: 'browse',
                path: null,
                directory: initialFile
            };
        }
    } catch (err) {
        console.error('get-initial-file error:', err);
    }
    return null;
});

// Get session files
ipcMain.handle('get-session-files', async () => {
    if (!sessionMode) return [];

    const files = [];
    for (const filePath of sessionFiles) {
        try {
            const stat = await fs.promises.stat(filePath);
            if (stat.isFile()) {
                files.push({
                    name: path.basename(filePath),
                    path: filePath,
                    mtime: stat.mtime
                });
            }
        } catch (err) {
            // File doesn't exist, skip
        }
    }

    // Sort by modification time, newest first
    files.sort((a, b) => b.mtime - a.mtime);
    return files;
});

// Add file to session
ipcMain.handle('add-session-file', async (event, filePath) => {
    if (!sessionFiles.includes(filePath)) {
        sessionFiles.push(filePath);
    }
    return { success: true };
});

// Watch session files for changes
ipcMain.handle('watch-session-files', async (event, channel) => {
    try {
        // Close existing watcher
        if (fileWatchers.has(channel)) {
            fileWatchers.get(channel).close();
        }

        const watcher = chokidar.watch(sessionFiles, {
            persistent: true,
            ignoreInitial: true
        });

        watcher.on('change', (changedPath) => {
            mainWindow?.webContents.send(channel, { type: 'change', path: changedPath });
        });

        watcher.on('unlink', (removedPath) => {
            mainWindow?.webContents.send(channel, { type: 'unlink', path: removedPath });
        });

        fileWatchers.set(channel, watcher);
        return { success: true };
    } catch (err) {
        console.error('watch-session-files error:', err);
        return { success: false, error: err.message };
    }
});

// Window control handlers
ipcMain.on('window-minimize', () => {
    mainWindow?.minimize();
});

ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow?.maximize();
    }
});

ipcMain.on('window-close', () => {
    mainWindow?.close();
});

ipcMain.handle('window-is-maximized', () => {
    return mainWindow?.isMaximized() ?? false;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    globalShortcut.unregisterAll();
    app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
