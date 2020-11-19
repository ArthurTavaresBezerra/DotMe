console.log("dotme-main.js - log")

window.$ = window.jQuery = require('jquery');
const { getCaptcha, dotMe } = require("./dotme-service-portal");
const remote = require('electron').remote;
const currentWindow = remote.getCurrentWindow();
const ipcRenderer = require('electron').ipcRenderer

const widthWindow = 276;
const heightWindow = 200;
 

window.onload = function(){
    currentWindow.setIgnoreMouseEvents(false);
    addEventClickOnBtnShowAndHide();
    showSideBarMain(widthWindow, heightWindow);
    addEventClickOnBtnDoDot();
}

async function loadCaptcha(){
    let imgCaptcha = document.getElementById("imgCaptcha");
    let captchaImg = await getCaptcha();
    imgCaptcha.setAttribute("src", captchaImg);
}

function addEventClickOnBtnShowAndHide(){
    var btnShow = document.getElementById('btnShow');
    btnShow.addEventListener('click', () => {
        onClickBtnShow();
    });
}

function onClickBtnShow(){
    openModalOpenMain();
    currentWindow.setIgnoreMouseEvents(true, {forward: true});
    var btnShow = document.getElementById('btnShow');
    hideComponents(btnShow);
}

function addEventClickOnBtnDoDot(){
    var btnDoDot = document.getElementById('btnDoDot');


    btnDoDot.addEventListener('click', async () => {
        showLoad();

        let txtRegistration = $("#txtRegistration").val();
        let txt3FirstDigitsCpf = $("#txt3FirstDigitsCpf").val();
        let txtCapctha = $("#txtCapctha").val();
    
        dotMe(txtRegistration, txt3FirstDigitsCpf, txtCapctha).then((responseDotMe)=>{
            if (responseDotMe.success === true) {
                showMessageError(responseDotMe.msg.msg);
                setTimeout(onClickBtnShow, 2000);
            }
            else {
                showMessageError(responseDotMe.error);
                loadCaptcha();
                setTimeout(hideLoad, 2000);
            }    
        });
     });
}

function showMessageError(txt){
    let responseError = document.getElementById("response-error");
    responseError.innerText = txt;
    responseError.classList.remove('hidden');
}

function hideMessageError(txt){
    let responseError = document.getElementById("response-error");
    responseError.classList.add('hidden');
}

function showLoad(){
    document.getElementById("btnDoDot").classList.add("hidden");
    document.getElementById("load-heart").classList.remove("hidden");
}

function hideLoad(){
    document.getElementById("btnDoDot").classList.remove("hidden");
    document.getElementById("load-heart").classList.add("hidden");
}

function hideComponents(){
        var btnShow = document.getElementById('btnShow');
    var sideBarMain = document.getElementById('sideBarMain');
    var sideBarTime = document.getElementById('sideBarTime');
    btnShow.classList.add("hidden");        
    sideBarMain.classList.add("hidden");
    sideBarTime.classList.remove("hidden");
}

function showComponents(){
    var btnShow = document.getElementById('btnShow');
    var sideBarMain = document.getElementById('sideBarMain');
    var sideBarTime = document.getElementById('sideBarTime');
    btnShow.classList.remove("hidden");        
    sideBarMain.classList.remove("hidden");
    sideBarTime.classList.add("hidden");
    currentWindow.setIgnoreMouseEvents(false);
}
  
const {BrowserWindow, screen} = require('electron').remote
const path = require('path');
const { reporters } = require("mocha");

function openModalOpenMain() {
  const modalPath = path.join('file://', __dirname, './dotMeTimer.html')
  let win = new BrowserWindow({ 
        width: 35,
        minWidth: 35,
        height: 21,
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
        fullscreenable: false,
        isMovable: false
    });

    showSideBarMain(win.getSize()[0],120);
    setSizeAndPositionModalOpenMain(win);


    win.webContents.on('did-finish-load', () => {
        win.webContents.send('send-window-source', currentWindow.id);
    })

    win.on('close', () => { win = null })
    win.loadURL(modalPath)
    win.show()
}

function setSizeAndPositionModalOpenMain(win){
    let display = screen.getPrimaryDisplay();
    let width = display.bounds.width;
    let positionYMainWindow = currentWindow.getPosition()[1];
    let heightMainWindow = currentWindow.getSize()[1];
    let positionY =positionYMainWindow+heightMainWindow - win.getSize()[1];
    win.setPosition(width-win.getSize()[0], positionY);
}

function showSideBarMain(width, height){
    currentWindow.resizable = true;
    let newWidth = width;
    currentWindow.setSize(newWidth, height);    
    let display = screen.getPrimaryDisplay();
    let widthDisplay = display.bounds.width;
    currentWindow.setPosition(widthDisplay-currentWindow.getSize()[0], currentWindow.getPosition()[1]);
    currentWindow.resizable = false;
    hideLoad();
    showComponents();
    loadCaptcha();
    hideMessageError();
}


ipcRenderer.on('open-main', (event, args) => {
    var btnShow = document.getElementById('btnShow');
    showSideBarMain(widthWindow, heightWindow);
})


//const {ipcMain, app, Menu, Tray} = require('electron')

// let appIcon = null

// ipcMain.on('remove-tray', () => {
//   appIcon.destroy()
// })

// app.on('window-all-closed', () => {
//   if (appIcon) appIcon.destroy()
// })


 
    // const iconName = process.platform === 'win32' ? 'windows-icon.png' : 'iconTemplate.png'
    // const iconPath = path.join(__dirname, iconName)
    // appIcon = new Tray(iconPath)
  
    // const contextMenu = Menu.buildFromTemplate([{
    //   label: 'Remove UI',
    //   click: () => {
    //     event.sender.send('tray-removed')
    //   }
    // }])
  
    // appIcon.setToolTip('DotMe Stefanini.')
    // appIcon.setContextMenu(contextMenu)
 
 

  