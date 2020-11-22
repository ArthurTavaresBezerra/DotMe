const mysql = require('mysql');
const config = require("./db-config");

function GetPessoa (matricula, cpf, callback) {

    let query = "SELECT * FROM pessoa; "
    executeCMD(callback, query);
} 

function executeCMD(callback, query) {

    var connection = mysql.createConnection(config.stfqa);

    // connect to mysql
    connection.connect(function (err) {
        // in case of error
        if (err) {
            console.log(err.code);
            console.log(err.fatal);
        }
    });

    connection.query(query, function (err, rows, fields) {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return false;
        }

        console.log(rows);
        callback(rows);
        console.log("Query succesfully executed");
    });
 
    connection.end(function () {});
}

module.exports = {
    GetPessoa
}