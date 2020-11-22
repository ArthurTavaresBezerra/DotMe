const Op = require('sequelize').Op;
const { Pessoa } = require('./model/Pessoa');
const { PontoHora } = require('./model/PontoHora');
const { getDateUTC, setToToday, getTodayUTC, getToday } = require("./dotme-util")

async function InsertDot(mat, cpf, nome){    
    try {
        let pessoa = await GetOrInsertPerson(mat, cpf, nome);
        await UpdateOrInsertDot(pessoa.id);
    }
    catch(error){
        if (error.errors){
            return {success : false, error: error.errors[0].message};
        }    
    }
}

async function GetOrInsertPerson(mat, cpf, nome){
    let pessoa = await Pessoa.findOne({where: { matricula : mat, cpf: cpf }});    
 
    try {
        if (pessoa == null){
            pessoa = await Pessoa.create({nome: nome, custo: 0, matricula: mat, cpf: cpf });        
        }
    }
    catch(error){
        throw error;
    }  
    return pessoa;
}

async function UpdateOrInsertDot(pessoaId){

    let today = getTodayUTC();

    let pontoHora = await PontoHora.findOne({where: { pessoa_id : pessoaId, data: today}});     
    try {
        if ( pontoHora == null){
             pontoHora = await PontoHora.create({
                pessoa_id: pessoaId,
                data: today,
                entrada1: getDateUTC(),
                is_ferias: false,
                is_falta: false,
                is_inconsistente: true,
                is_apontado: false,
                qtd_hora_total: 0,
                qtd_hora_saldo: 0
            });        
        }else 
        {
            await PontoHora.update(getObjectDotUpdate(pontoHora), {where:{ id: pontoHora.id }});   
        }
    }
    catch(error){
        throw error;
    }  
}

async function getDotToday(mat, cpf){

    let today = getTodayUTC();

    try {
        let pessoa = await Pessoa.findOne({where: { matricula : mat, cpf: cpf }});    
        if (pessoa){
            return await PontoHora.findOne({where: { pessoa_id :  pessoa.id, data: today}});         
        }
    }
    catch(error){
        throw error;
    }  
}


function getObjectDotUpdate(p){

    const CARGA_HORARIA_DIARIA = 8

    let updating  = {};
    processQtyHourWorked(p, updating);

    updating.qtd_hora_total = p.qtd_hora_total;
    updating.qtd_hora_saldo = updating.qtd_hora_total -  CARGA_HORARIA_DIARIA;
    return updating;
}

function processQtyHourWorked(p, updating){

    if (p == null || p == undefined) return null;

    function process (p, updating) {    
        let isSaida4 = p.entrada1 && p.saida1 && p.entrada2 && p.saida2 && p.entrada3 && p.saida3 && p.entrada4;
        let isEntrada4 = p.entrada1 && p.saida1 && p.entrada2 && p.saida2 && p.entrada3 && p.saida3;
        let isSaida3 = p.entrada1 && p.saida1 && p.entrada2 && p.saida2 && p.entrada3;
        let isEntrada3 = p.entrada1 && p.saida1 && p.entrada2 && p.saida2;
        let isSaida2 = p.entrada1 && p.saida1 && p.entrada2;
        let isEntrada2 = p.entrada1 && p.saida1;
        let isSaida1 = p.entrada1;

        let newDate = getDateUTC();
    
        if (p.getDateBrowser)
            newDate = new Date();


        if (isSaida4) { 
            p.saida4 = updating.saida4 = newDate;
            p.isPlay = true;
            return;
        }
        if (isEntrada4) { 
            p.entrada4 = updating.entrada4 = newDate;
            p.isPlay = true;
            return;
        }
        if (isSaida3) { 
            p.saida3 = updating.saida3 = newDate;
            p.isPlay = true;
            return;
        }
        if (isEntrada3) { 
            p.entrada3 = updating.entrada3 = newDate;
            p.isPlay = true;
            return;
        }
        if (isSaida2) { 
            p.saida2 = updating.saida2 = newDate;
            p.isPlay = true;
            return;
        }
        if (isEntrada2) { 
            p.entrada2 = updating.entrada2 = newDate;
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
 
module.exports = {
    InsertDot, getDotToday, processQtyHourWorked
}