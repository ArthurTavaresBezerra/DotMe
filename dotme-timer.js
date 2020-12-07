window.$ = window.jQuery = require('jquery');
const { getDotToday } = require("./dotme-repository");
const { getToday, setToToday, getTodayUTC } = require("./dotme-util")
const ipc = require('electron').ipcRenderer;
const DEZ_SEGUNDOS = 10000;

let dotOfToday;

setInterval(processTimer, DEZ_SEGUNDOS);

async function reset(){

    forceShowLoad();
    contTimerAlert  = 0;
    document.getElementById("timer").innerText = ""; 
    let txtRegistration = $("#txtRegistration").val();
    let txt3FirstDigitsCpf = $("#txt3FirstDigitsCpf").val();
    try {
        dotOfToday = await getDotToday(txtRegistration, txt3FirstDigitsCpf);
        setTimeout(processTimer, 1000);
    }
    catch(error){
        console.log("error-timer-reset", error);
    }
}

function processTimer(){

    try {
        if (dotOfToday){
            let copyDotOfToday = copyDot(dotOfToday);
            processQtyHourWorked(copyDotOfToday, {});
            let time = getHoursAndMinutosFrom(copyDotOfToday.qtd_hora_total);
            let timeFormatted = time.toLocaleString('en-GB', { hour: '2-digit', minute:'2-digit' }).replace(/\//g, '-');
            document.getElementById("timer").innerText = timeFormatted; 
            showLoad(copyDotOfToday.qtd_hora_total);
            showPlayOrPause(copyDotOfToday.isPlay);
            
            if ( copyDotOfToday.data != getTodayUTC()){
                reset();                
            }
        }
        else {
            document.getElementById("timer").innerText = "--:--"; 
            showLoadWithoutStartWork();
            showPlayOrPause();
        }


    }catch(error){
        console.log("crash process timer",error);
    }
}

const showPlayOrPause = (isPlay) => {
    let imgPlay = $(".imgPlay");
    let imgPause = $(".imgPause");

    if (isPlay){
        imgPlay.removeClass("hidden");
        imgPause.addClass("hidden");
    }
    else {
        imgPlay.addClass("hidden");
        imgPause.removeClass("hidden");
    }
}

function copyDot(dot){
    let copy = {};
    copy.data = dot.data;
    copy.getDateBrowser = true;
    copy.entrada1 = dot.entrada1;
    copy.entrada2 = dot.entrada2;
    copy.entrada3 = dot.entrada3;
    copy.entrada4 = dot.entrada4;
    copy.saida1 = dot.saida1;
    copy.saida2 = dot.saida2;
    copy.saida3 = dot.saida3;
    copy.saida4 = dot.saida4;
    return copy;
}

function getHoursAndMinutosFrom(hours){
    let today = getToday();
    const UMA_HORA = 1000 * 60 * 60;
    today = new Date(today.getTime() + (UMA_HORA*hours));
    return today;
}

let contTimerAlert  = 0;

function showLoad(hours){

    const TURNO_TRABALHO = 4;
    const HORARIO_ALMOCO = 12
    let now = new Date();

    const isEstaPertoDoAlmoco = (now.getHours() == HORARIO_ALMOCO) || (now.getHours() == 11 && now.getMinutes() >= 55)
    const isJATRABLHOU_TURNO = hours >= TURNO_TRABALHO;
    const isJATRABLHOU_DIA = hours >= TURNO_TRABALHO*2;

    let loader = document.getElementById("loader");

    if ( (isEstaPertoDoAlmoco && isJATRABLHOU_TURNO) || isJATRABLHOU_DIA ){
        contTimerAlert += 1;
        loader.classList.remove("hidden");
        if (contTimerAlert >= 6*5 || isJATRABLHOU_DIA ) loader.classList.add("red");
    }
    else {
        loader.classList.add("hidden");
        loader.classList.remove("red");
    }
}

function showLoadWithoutStartWork(){

    const HORARIO_INICIO = 8
    let now = new Date();

    const isJaEhHorarioDeInicio = (now.getHours() >= HORARIO_INICIO)
    const isJaPassou30Minutos = isJaEhHorarioDeInicio && (now.getMinutes() > 30);
    
    if (isJaEhHorarioDeInicio ){
        document.getElementById("loader").classList.remove("hidden");
        if (isJaPassou30Minutos)
            document.getElementById("loader").classList.add("red");
    }
    else {
        document.getElementById("loader").classList.add("hidden");
        document.getElementById("loader").classList.remove("red");
    }
}

function forceShowLoad(){
    document.getElementById("loader").classList.remove("hidden");
    document.getElementById("loader").classList.remove("red");
}

function processQtyHourWorked(p, updating){

    if (p == null || p == undefined) return null;

    function process (p, updating) {    
        let isSaida4 = p.entrada1 && p.saida1 && p.entrada2 && p.saida2 && p.entrada3 && p.saida3 && p.entrada4 && (p.saida4 == null || p.saida4 == undefined);
        let isSaida3 = p.entrada1 && p.saida1 && p.entrada2 && p.saida2 && p.entrada3 && (p.saida3 == null || p.saida3 == undefined);
        let isSaida2 = p.entrada1 && p.saida1 && p.entrada2 && (p.saida2 == null || p.saida2 == undefined);
        let isSaida1 = p.entrada1 && (p.saida1 == null || p.saida1 == undefined);

        let newDate = new Date();

        if (isSaida4) { 
            p.saida4 = updating.saida4 = newDate;
            p.isPlay = true;
            return;
        }
        if (isSaida3) { 
            p.saida3 = updating.saida3 = newDate;
            p.isPlay = true;
            return;
        }
        if (isSaida2) { 
            p.saida2 = updating.saida2 = newDate;
            p.isPlay = true;
            return;
        }
        if (isSaida1) { 
            p.saida1 = updating.saida1 = newDate;
            p.isPlay = true;
            return;
        }
    }

    p.entrada1 = setToToday(p.entrada1); 
    p.saida1 = setToToday(p.saida1); 
    p.entrada2 = setToToday(p.entrada2); 
    p.saida2 = setToToday(p.saida2); 
    p.entrada3 = setToToday(p.entrada3); 
    p.saida3 = setToToday(p.saida3); 
    p.entrada4 = setToToday(p.entrada4); 
    p.saida4 = setToToday(p.saida4);

    process(p, updating);

    var hour1 = p.entrada1 && p.saida1 ? Math.abs( p.saida1 - p.entrada1) / 36e5 : 0;  
    var hour2 = p.entrada2 && p.saida2 ? Math.abs( p.saida2 - p.entrada2) / 36e5 : 0;  
    var hour3 = p.entrada3 && p.saida3 ? Math.abs( p.saida3 - p.entrada3) / 36e5 : 0;  
    var hour4 = p.entrada4 && p.saida4 ? Math.abs( p.saida4 - p.entrada4) / 36e5 : 0; 

    p.qtd_hora_total = hour1 + hour2 + hour3 + hour4;
}


ipc.on('send-reset-timer', function (event, fromWindowId) {
    console.log("send-reset-timer");
    reset();
})
