const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');

// process.env.NODE_ENV = 'production';

const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV !== 'production';

let mainWindow;

// Main window
const createWindow = () => {
  mainWindow = new BrowserWindow({
    title: 'Image Resizer',
    width: isDev ? 1000 : 500,
    height: 600,
    icon: path.resolve(__dirname, 'render/images/Icon_256x256.png'),
    resizable: isDev,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: false, // Explicitly set webviewTag to false for security in Electron v5+
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

// Menu template
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

// Respond to the resize image event
ipcMain.on('image:resize', async (e, options) => {
  // console.log('Received options:', options); // Debugging log

  if (!options.imgBuffer) {
    console.error('Error: imgBuffer is undefined!');
    return;
  }

  // const dest = path.join(os.homedir(), 'imageresizer');
  const dest = path.join(os.homedir(), 'Downloads', 'ImageResizer');

  await resizeImage({
    imgBuffer: Buffer.from(options.imgBuffer),
    filename: options.filename,
    height: options.height,
    width: options.width,
    dest,
  });

  e.reply('image:done', dest);
});

// Resize and save image
async function resizeImage({ imgBuffer, filename, height, width, dest }) {
  try {
    // Resize image
    const resizedBuffer = await resizeImg(imgBuffer, {
      width: +width,
      height: +height,
    });

    // Ensure destination folder exists
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const outputPath = path.join(dest, filename);

    // Write the resized image to the destination folder
    fs.writeFileSync(outputPath, resizedBuffer);

    // console.log(`Image saved to: ${outputPath}`);

    // Open the folder in the file explorer
    shell.openPath(dest);
  } catch (err) {
    console.error('Error resizing image:', err);
  }
}

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
