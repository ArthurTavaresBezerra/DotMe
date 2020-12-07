if (require('electron-squirrel-startup')) return;

require('update-electron-app')({
  logger: require('electron-log')
})

const path = require('path')
const glob = require('glob')
const electron = require('electron');  
const {app, BrowserWindow, screen} = require('electron')
const { Menu, Tray} = require('electron')

const debug = /--debug/.test(process.argv[2])

if (process.mas) app.setName('DotMe Stefanini')

let mainWindow = null
let trayInstance = null

function initialize () {
  makeSingleInstance()

//  loadDemos()

  function createTray(){
    const iconPath = path.join(__dirname, "./assets/img/logo.ico");
    trayInstance = new Tray(iconPath)
    trayInstance.setToolTip('DotMe Stefanini.') 

    const contextMenu = Menu.buildFromTemplate([{
      label: 'Fechar',
      click: () => {
        mainWindow.close();
      }
    }])  
    trayInstance.setContextMenu(contextMenu)
  }

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
      closable: true,
      fullscreenable: false,
      isMovable: false,
      skipTaskbar: true
    }

//    if (process.platform === 'linux') {
      windowOptions.icon = path.join(__dirname, '/assets/img/logo.png')
  //  }

    mainWindow = new BrowserWindow(windowOptions)
    mainWindow.loadURL(path.join('file://', __dirname, '/dotMeMain.html'))

    let display = screen.getPrimaryDisplay();
    let width = display.bounds.width;
    mainWindow.setPosition(width-mainWindow.getSize()[0], mainWindow.getPosition()[1]);

    if (debug) {
      //mainWindow.webContents.openDevTools()
      require('devtron').install()
    }

    mainWindow.on('closed', () => {
      mainWindow = null
    })
  }

  app.on('ready', () => {
    createWindow();
    createTray();
  })

  app.on('window-all-closed', () => {
    if (trayInstance) trayInstance.destroy()
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow(); 
    }
  })
}

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
 
// // Require each JS file in the main-process dir
// function loadDemos () {
//   // const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
//   // files.forEach((file) => { require(file) })
// }

 

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process'); 
  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);


  const setAutoLaunch = () => {    

    const AutoLaunch = require('auto-launch');
    let autoLaunch = new AutoLaunch({
      name: 'DotMe Stefanini',
      path: app.getPath('exe'),
    });
    
    autoLaunch.isEnabled().then((isEnabled) => {
      if (!isEnabled) autoLaunch.enable();
    });

    electron.app.setLoginItemSettings({
      openAtLogin: arg.settings.startOnStartup,
      path: electron.app.getPath("exe")
    });
  } 

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);
      setAutoLaunch();
      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
};

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

initialize();