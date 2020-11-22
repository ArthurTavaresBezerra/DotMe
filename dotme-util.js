function getDateUTC(){
    let date = new Date(Date.UTC(        
                       new Date().getUTCFullYear(), 
                       new Date().getUTCMonth(), 
                       new Date().getUTCDate(), 
                       new Date().getUTCHours(), 
                       new Date().getUTCMinutes(), 
                       new Date().getUTCSeconds()));
   date.setHours(date.getHours()-3);
   return date;
                   
}

function getTodayUTC(){
   const now = getDateUTC();
   let retorno = "";
   retorno += now.getYear()+1900;
   retorno += "-";
   retorno += now.getMonth()+1;
   retorno += "-";
   retorno += now.getDate();
   return retorno;
}

function setToToday(datetime){
   if (datetime){
       return new Date(datetime = Date.parse(getTodayUTC() + " " + datetime));
   }
   return null;
}

function getToday() {
   const now = new Date();
   let retorno = "";
   retorno += now.getYear()+1900;
   retorno += "-";
   retorno += now.getMonth()+1;
   retorno += "-";
   retorno += now.getDate();
   retorno += " 00:00";
   return new Date(retorno);
}

module.exports = { getToday, getTodayUTC, getDateUTC, setToToday }