window.$ = window.jQuery = require('jquery');
const { getCaptcha, dotMe } = require("./dotme-service-portal");
const remote = require('electron').remote;
const currentWindow = remote.getCurrentWindow();
const ipcRenderer = require('electron').ipcRenderer
const {BrowserWindow, screen} = require('electron').remote
const path = require('path');
const Store = require('./store.js');

const widthWindow = 276;
const heightWindow = 200;
const store = new Store({
    configName: 'user-preferences',
    defaults: {
        lastUser: {
            mat: "",
            cpf: ""
          }
      }
});

let modalCapctha;
let modalGhost;

window.onload = function(){
    currentWindow.setIgnoreMouseEvents(false);
    addEventClickOnBtnShowAndHide();
    addEventClickOnImgCaptcha();
    showSideBarMain(widthWindow, heightWindow);
    addEventClickOnBtnDoDot();
    loadBasicData();
}

currentWindow.on('close',(event) => {
    if (modalCapctha)
        modalCapctha.close();
    if (modalGhost)
        modalGhost.close();
});

function loadBasicData(){
    let lastUser = store.get('lastUser') 
    $("#txtRegistration").val(lastUser.mat);
    $("#txt3FirstDigitsCpf").val(lastUser.cpf);
}

async function loadCaptcha(fromWindowIdCaptcha){
    let imgCaptcha = document.getElementById("imgCaptcha");
    let captchaImg = await getCaptcha();
    imgCaptcha.setAttribute("src", captchaImg);

    if (fromWindowIdCaptcha){
        const fromWindow = BrowserWindow.fromId(fromWindowIdCaptcha)
        fromWindow.webContents.send('send-window-source', currentWindow.id, captchaImg); 
    }
    $("#txtCapctha").val("");
}

function addEventClickOnBtnShowAndHide(){
    var btnShow = document.getElementById('btnShow');
    btnShow.addEventListener('click', () => {
        onClickBtnShow();
    });
}

function addEventClickOnImgCaptcha(){
    var imgCaptcha = document.getElementById('imgCaptcha');
    imgCaptcha.addEventListener('click', () => {
        openModalCaptcha();
    });    
}

function openModalCaptcha() {
    const modalPath = path.join('file://', __dirname, './dotMeModalCaptcha.html')
    let win = new BrowserWindow({ 
        width: 320, minWidth: 320, height: 150, transparent: true, frame: false, alwaysOnTop: true, 
        visibleOnAllWorkspaces: true, titleBarStyle: 'Captcha',  skipTaskbar: true, webPreferences: {nodeIntegration: true}
    });

    let imgCaptcha = $("#imgCaptcha").attr("src");

    win.webContents.on('did-finish-load', () => {
        win.webContents.send('send-window-source', currentWindow.id, imgCaptcha);
    });

    win.loadURL(modalPath);
    win.show();

    modalCapctha = win;
}  

function onClickBtnShow(){
    openModalGhost();
    currentWindow.setIgnoreMouseEvents(true, {forward: true});
    hideMainComponents(btnShow);
    currentWindow.webContents.send('send-reset-timer', {});
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
                setTimeout(onClickBtnShow, 1000);
                store.set('lastUser', {mat: txtRegistration, cpf: txt3FirstDigitsCpf });
            }
            else {
                showMessageError(responseDotMe.error);
                hideLoad();
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

function hideMainComponents(){
    var btnShow = document.getElementById('btnShow');
    var sideBarMain = document.getElementById('sideBarMain');
    var sideBarTime = document.getElementById('sideBarTime');
    btnShow.classList.add("hidden");        
    sideBarMain.classList.add("hidden");
    sideBarTime.classList.remove("hidden");
}

function showMainComponents(){
    var btnShow = document.getElementById('btnShow');
    var sideBarMain = document.getElementById('sideBarMain');
    var sideBarTime = document.getElementById('sideBarTime');
    btnShow.classList.remove("hidden");        
    sideBarMain.classList.remove("hidden");
    sideBarTime.classList.add("hidden");
    currentWindow.setIgnoreMouseEvents(false);
}
  
function openModalGhost() {
  const modalPath = path.join('file://', __dirname, './dotMeModalGhost.html')
  let win = new BrowserWindow({ 
        width: 35, minWidth: 35, height: 21, 
        webPreferences: { nodeIntegration: true }, 
        transparent: true,  frame: false, alwaysOnTop: true, visibleOnAllWorkspaces: true, titleBarStyle: 'hidden',
        resizable: false, minimizable: false, maximizable: false, fullscreenable: false, isMovable: false, skipTaskbar: true
    });

    showSideBarMain(win.getSize()[0],120);
    setSizeAndPositionModalOpenMain(win);

    win.webContents.on('did-finish-load', () => {
        win.webContents.send('send-window-source', currentWindow.id);
    })

    win.on('close', () => { win = null })
    win.loadURL(modalPath)
    win.show()

    modalGhost = win;
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
    showMainComponents();
    loadCaptcha();
    hideMessageError();
}

ipcRenderer.on('open-main', (event, args) => {
    showSideBarMain(widthWindow, heightWindow);
})

ipcRenderer.on('refresh-captcha', (event, fromWindowId) => {
    loadCaptcha(fromWindowId);
})
