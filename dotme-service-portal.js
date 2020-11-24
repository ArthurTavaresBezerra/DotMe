const axios = require('axios');
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

    let response = $.ajax(settings).done(function (res) {
        return res;
    });

//    const responsePortal = { success: true, msg:{ msg:"sad" } }; 
    const responsePortal = getJsonThreatment(response.responseText);

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

//    {success: true, msg: {msg: "Server Error\nApA-002399 - A Senha não é válida\n<< Build: 3.13.1.8590 [26/06/2020 19:58:22] / SHA=4e8a063432907c2 >> [ TimeStamp: 23/11/2020 12:17:17 ]", type: 2, time: 4000}}
//    {success: true, msg: {msg: "Server Error\nApA-007818 - Usuário / Senha inválidos\n<< Build: 3.13.1.8590 [26/06/2020 19:58:22] / SHA=4e8a063432907c2 >> [ TimeStamp: 23/11/2020 12:18:09 ]", type: 2, time: 4000}}

    data = replaceAll(data, "success", '"success"');
    data = replaceAll(data, "error", '"error"');
    data = replaceAll(data, "msg", '"msg"');
    data = replaceAll(data, "type", '"type"');
    data = replaceAll(data, "time", '"time"');

    let json = JSON.parse(data);

    if ( json.success == true && json.msg.type == 2){ 
        
        let responseError = {
            success: false,
            error: json.msg.msg
        };

        if (responseError.error == "USER_DISABLED"){
            responseError.error = "Usuário desabilitado ou inativo";
        }

        if (responseError.error.includes('Error')){
            responseError.error = responseError.error.replace("Server Error\nApA-002399 - ", "");
            responseError.error = responseError.error.replace("Server Error\nApA-007818 - ", "");
            let endIndex = responseError.error.indexOf("\n<<");
            responseError.error = responseError.error.substring(0, endIndex);
        }

        return responseError;
    } 

    return json;
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