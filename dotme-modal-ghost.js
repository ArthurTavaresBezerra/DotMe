console.log("dotme-timer.js - log");

const ipc = require('electron').ipcRenderer
const remote = require('electron').remote;
const BrowserWindow = require('electron').remote.BrowserWindow
const currentWindow =remote.getCurrentWindow();

let windowIdSource;

window.onload = function(){
    currentWindow.setIgnoreMouseEvents(false);
    addEventClickOnBtnHide();
}

function addEventClickOnBtnHide(){
    var btnHide = document.getElementById('btnHide');
    console.log(currentWindow.getSize());
    btnHide.addEventListener('click', () => {
        
        const fromWindow = BrowserWindow.fromId(windowIdSource)
        fromWindow.webContents.send('open-main')    
        console.log("close");
        if (currentWindow.isDevToolsOpened()) {
            currentWindow.closeDevTools();
        }
        currentWindow.close();
    });
}
 
ipc.on('send-window-source', function (event, fromWindowId) {
    console.log("send-window-source");
    windowIdSource = fromWindowId;
})