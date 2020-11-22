const axios = require('axios');
const { reporters } = require('mocha');
window.$ = window.jQuery = require('jquery');
const { InsertDot } = require("./dotme-repository");



var session = require('electron').remote.session;
var ses = session.fromPartition('persist:name');


async function getCaptcha() {
    
    await session.defaultSession.cookies.remove("portalhoras.stefanini.com", "clockDeviceToken8002").then();
    await session.defaultSession.cookies.remove("portalhoras.stefanini.com", "cCtrl1").then();
    await session.defaultSession.cookies.remove("portalhoras.stefanini.com", "cCtrl2").then();

    await VerifyWindowsAuthentication();
    await GetClockDeviceInfo();
    return await requestCaptcha();
}

async function VerifyWindowsAuthentication(){

    let res = await axios.post("https://portalhoras.stefanini.com/.net/index.ashx/VerifyWindowsAuthentication", {},       
    {
        headers: {"content-type": "application/x-www-form-urlencoded; charset=UTF-8" }
    });
    return res.data;
}
  
async function GetClockDeviceInfo(){

    let res = await axios.get("https://portalhoras.stefanini.com/.net/index.ashx/GetClockDeviceInfo?_dc=1605282264286&deviceID=8002&tsc=&sessionID=0&selectedEmployee=0&selectedCandidate=0&selectedVacancy=0&dtFmt=d%2Fm%2FY&tmFmt=H%3Ai%3As&shTmFmt=H%3Ai&dtTmFmt=d%2Fm%2FY%20H%3Ai%3As&language=0&idEmployeeLogged=0", {},       
        {
            headers: {"content-type": "application/x-www-form-urlencoded; charset=UTF-8" }
        });
    return res.data;
}

async function requestCaptcha(){
 
    let res = await axios.post("https://portalhoras.stefanini.com/.net/index.ashx/getCaptcha", {deviceID: 8002},       
    {
        headers: {"content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
    })     


    const url = "https://portalhoras.stefanini.com/";
    const cookie8002cCtrl1 = { url:url, name: '8002cCtrl1', value: '', path:"/", domain: 'portalhoras.stefanini.com', hostOnly: true }
    const cookie8002cCtrl2 = { url:url, name: '8002cCtrl2', value: '', path:"/", domain: '.portalhoras.stefanini.com', hostOnly: true }

    await session.defaultSession.cookies.get({})
    .then( (cookies) => {
        cookies.forEach((c)=>{
            if (c.name == "cCtrl1") {
                cookie8002cCtrl1.value = c.value;
                session.defaultSession.cookies.remove(url, c.name).then();
            }
            if (c.name == "cCtrl2") {
                cookie8002cCtrl2.value = c.value
                session.defaultSession.cookies.remove(url, c.name).then();
            }
        });         
    }).catch((error) => {
        console.log(error)
    })

    await session.defaultSession.cookies.set(cookie8002cCtrl1).then();
    await session.defaultSession.cookies.set(cookie8002cCtrl2).then();

    return res.data.urlcaptcha;   
}
 
async function dotMe(mat, cpf, txtCaptcha){
    
    settings.data.userName = mat; 
    settings.data.password = cpf;
    settings.data.captcha = txtCaptcha;

    // let response = $.ajax(settings).done(function (res) {
    //     return res;
    // });

    const responsePortal = { success: true, msg:{ msg:"sad" } }; //=  getJsonThreatment(response.responseText);

   if (responsePortal.success){
        const responseDb = await InsertDot(mat, cpf, responsePortal.msg.msg);
        if (responseDb){
            return responseDb;
        }
    } 
    
     return responsePortal;
}

function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
}

function getJsonThreatment(data){
    data = replaceAll(data, "success", '"success"');
    data = replaceAll(data, "error", '"error"');
    data = replaceAll(data, "msg", '"msg"');
    data = replaceAll(data, "type", '"type"');
    data = replaceAll(data, "time", '"time"');
    return JSON.parse(data);
}

const settings = {
    "url": "https://portalhoras.stefanini.com/.net/index.ashx/SaveTimmingEvent",
    "method": "POST",
    "timeout": 0,
    "async": false,
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    "data": {
      "deviceID": "8002",
      "eventType": "1",
      "userName": "",
      "password": "",
      "cracha": "",
      "costCenter": "",
      "leave": "",
      "func": "1",
      "captcha": "",
      "tsc": "",
      "sessionID": "0",
      "selectedEmployee": "0",
      "selectedCandidate": "0",
      "selectedVacancy": "0",
      "dtFmt": "d/m/Y,",
      "tmFmt": "H:i:s",
      "shTmFmt": "H:i",
      "dtTmFmt": "d/m/Y H:i:s",
      "language": "0",
      "idEmployeeLogged": "0"
    }
  };
  

 
module.exports = {
    getCaptcha, 
    dotMe
}