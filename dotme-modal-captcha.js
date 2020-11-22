console.log("dotme-captcha.js - log");

const ipc = require('electron').ipcRenderer
const remote = require('electron').remote;
const BrowserWindow = require('electron').remote.BrowserWindow
const currentWindow =remote.getCurrentWindow();

let windowIdSource;

window.onload = function(){
    currentWindow.setIgnoreMouseEvents(false);
    addEventClickOnBtnHide();
    addEventClickOnBtnRefresh();
}

function addEventClickOnBtnRefresh(){
    var btnRefresh = document.getElementById('btnRefresh');
    btnRefresh.addEventListener('click', () => {
        
        const fromWindow = BrowserWindow.fromId(windowIdSource);
        fromWindow.webContents.send('refresh-captcha', currentWindow.id);    
    });
}


function addEventClickOnBtnHide(){
    var btnHide = document.getElementById('btnHide');
    btnHide.addEventListener('click', () => {
        
        if (currentWindow.isDevToolsOpened()) {
            currentWindow.closeDevTools();
        }
        currentWindow.close();
    });
}
 
ipc.on('send-window-source', function (event, fromWindowId, captchaImg64) {
    windowIdSource = fromWindowId;
    let imgCaptcha = document.getElementById("imgCaptcha");
    imgCaptcha.setAttribute("src", captchaImg64);
  
})