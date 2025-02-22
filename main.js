const path = require('path');
const { app, BrowserWindow } = require('electron/main');

const createWindow = () => {
  const isDev = process.env.NODE_ENV !== 'production';

  const win = new BrowserWindow({
    title: 'Image Ressizer',
    width: isDev ? 1200 : 800,
    height: 600,
  });

  // Show devtools automatically if in development
  if (isDev) {
    win.webContents.openDevTools();
  }

  // win.loadFile('./render/index.html')
  win.loadFile(path.join(__dirname, './render/index.html'));
};

app.whenReady().then(() => {
  // Ensures Electron is initialized before opening a window
  createWindow();

  // Handles macOS behavior, reopening a window when clicking the app icon
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Closes the app completely on Windows/Linux, but keeps it running on macOS
app.on('window-all-closed', () => {
  // darwin for macos - wind32 for windows
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
