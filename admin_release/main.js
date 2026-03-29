const { app, BrowserWindow } = require('electron')
const path = require('path')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 480,
    height: 700,
    resizable: false,
    autoHideMenuBar: true,
    title: 'TomWhatsBulk Keygen',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  })

  win.loadFile(path.join(__dirname, 'index.html'))
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
})
