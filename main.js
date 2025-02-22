const path = require('path');
const { app, BrowserWindow, Menu } = require('electron/main');

const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV !== 'production';

let mainWindow;

// Main window
const createWindow = () => {
  mainWindow = new BrowserWindow({
    title: 'Image Resizer',
    width: isDev ? 1100 : 800,
    height: 600,
    icon: path.resolve(__dirname, 'render/images/Icon_256x256.png'),
    resizable: isDev,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.resolve(__dirname, 'render/index.html'));
};

// About Window
const createAboutWindow = () => {
  const aboutWin = new BrowserWindow({
    width: 300,
    height: 300,
    title: 'About Electron',
    icon: path.resolve(__dirname, 'render/images/Icon_256x256.png'),
    resizable: false,
  });

  aboutWin.loadFile(path.resolve(__dirname, 'render/about.html'));

  // Hide menu in the About window
  aboutWin.setMenu(null);
};

const menuTemplate = [
  ...(isMac ? [{ label: app.name, submenu: [{ label: 'About', click: createAboutWindow }] }] : []),
  { role: 'fileMenu' },
  ...(!isMac ? [{ label: 'Help', submenu: [{ label: 'About', click: createAboutWindow }] }] : []),
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [{ role: 'reload' }, { role: 'forcereload' }, { type: 'separator' }, { role: 'toggledevtools' }],
        },
      ]
    : []),
];

app.whenReady().then(() => {
  createWindow();

  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);

  // Remove variable from memory
  // mainWindow.on('closed', () => (mainWindow = null));
  mainWindow.on('close', (event) => {
    if (isMac === 'darwin') {
      event.preventDefault(); // Keep the app running on macOS
      mainWindow.hide();
    } else {
      mainWindow = null;
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Close the app completely on Windows/Linux, keep running on macOS
  app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit();
    }
  });
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
