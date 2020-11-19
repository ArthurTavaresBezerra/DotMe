const mysql = require('mysql');

function el(selector) {
    return document.getElementById(selector);
}

el('action-btn').addEventListener('click', function () {
    // Get the mysql service
    getFirstTenRows(function (rows) {
        var html = '';

        rows.forEach(function (row) {
            html += '<tr>';
            html += '<td>';
            html += row.id;
            html += '</td>';
            html += '<td>';
            html += row.display_name;
            html += '</td>';
            html += '<td>';
            html += row.city;
            html += '</td>';
            html += '</tr>';
            console.log(row);
        });

        document.querySelector('#table > tbody').innerHTML = html;
        document.querySelector('#table > thead').innerHTML = '<tr><th scope="col">ID</th> <th scope="col">Name</th> <th scope="col">Location</th> </tr>';
        document.querySelector('#table > tfoot').innerHTML = '<tr><td colspan="3">Last joined 10 users are listed here.</td> </tr>';

    });
}, false);

function getFirstTenRows(callback) {
    var mysql = require('mysql');
    var config = require("./db-config");

    // Add the credentials to access your database
    var connection = mysql.createConnection(config.db);

    // connect to mysql
    connection.connect(function (err) {
        // in case of error
        if (err) {
            console.log(err.code);
            console.log(err.fatal);
        }
    });

    // Perform a query
    $query = 'SELECT id, display_name, city FROM user_profile ORDER BY id DESC LIMIT 8';

    connection.query($query, function (err, rows, fields) {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }

        callback(rows);

        console.log("Query succesfully executed");
    });

    // Close the connection
    connection.end(function () {
        // The connection has been closed
    });
}