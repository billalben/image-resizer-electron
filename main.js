const path = require('path')
const { app, BrowserWindow } = require('electron/main')

const createWindow = () => {
  const win = new BrowserWindow({
    title: 'Image Ressizer',
    width: 800,
    height: 600,
  })

  // win.loadFile('./render/index.html')
  win.loadFile(path.join(__dirname, './render/index.html'))
}

app.whenReady().then(() => {
  // Ensures Electron is initialized before opening a window
  createWindow()

  // Handles macOS behavior, reopening a window when clicking the app icon
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Closes the app completely on Windows/Linux, but keeps it running on macOS
app.on('window-all-closed', () => {
  // darwin for macos - wind32 for windows
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
