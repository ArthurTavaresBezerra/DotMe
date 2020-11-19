require('update-electron-app')({
  logger: require('electron-log')
})

const path = require('path')
const glob = require('glob')
const {app, BrowserWindow, screen} = require('electron')

const debug = /--debug/.test(process.argv[2])

if (process.mas) app.setName('Electron APIs')

let mainWindow = null

function initialize () {
  makeSingleInstance()

  loadDemos()

  function createWindow () {
    const windowOptions = {
      width: 275,
      minWidth: 35,
      height: 180,
      title: app.getName(),
      webPreferences: {
        nodeIntegration: true
      },
      transparent: true, 
      frame: false,      
      alwaysOnTop: true,
      visibleOnAllWorkspaces: true,
      titleBarStyle: 'hidden',
      resizable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      fullscreenable: false,
      isMovable: false
    }

    if (process.platform === 'linux') {
      windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png')
    }

    mainWindow = new BrowserWindow(windowOptions)
//    mainWindow.setIgnoreMouseEvents(true)
    mainWindow.loadURL(path.join('file://', __dirname, '/dotMeMain.html'))

    let display = screen.getPrimaryDisplay();
    let width = display.bounds.width;
    mainWindow.setPosition(width-mainWindow.getSize()[0], mainWindow.getPosition()[1]);

    if (debug) {
 //     mainWindow.webContents.openDevTools()
      //mainWindow.maximize()
      require('devtron').install()
    }

    mainWindow.on('closed', () => {
      mainWindow = null
    })
  }

  app.on('ready', () => {
    createWindow()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  })
}

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance () {
  if (process.mas) return

  app.requestSingleInstanceLock()

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// Require each JS file in the main-process dir
function loadDemos () {
  // const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
  // files.forEach((file) => { require(file) })
}

initialize()
