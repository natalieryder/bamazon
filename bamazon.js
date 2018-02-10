var mysql = require('mysql');
var Table = require('cli-table');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon"
});
// need version w/ and w/out
function showProducts(callbackFunction) {
	console.log("Selecting all products...\n");
  	connection.query("SELECT item_id, product_name, price, stock_quantity FROM products", function(err, res) {
      var table = new Table({
          head: ['id', 'item', 'price', 'quantity']
        , colWidths: [10, 20, 20, 10]
      });

    	if (err) throw err;
    	for (i = 0; i < res.length; i++) {
    		table.push([ res[i].item_id, res[i].product_name, res[i].price, res[i].stock_quantity]);
    	}

    	console.log(table.toString() + "\n");
      //do whatever after the products have been loaded
      if (callbackFunction) {
        callbackFunction();
      } 

  	});
};

function printToConsole(message) {
  console.log("\n======================================\n");
  console.log(message);
  console.log("\n======================================\n");
}

module.exports = {showProducts, inquirer, connection, Table, printToConsole};