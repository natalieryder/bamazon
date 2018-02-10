// TODO

// Check if the id entered exists in the database

var inquirer = require('inquirer');
var mysql = require('mysql');
// var Table = require('cli-table');
var bamazon = require('./bamazon');


var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  // call prompt when db loads

});


function checkQuantity(id,quantity) {
  connection.query ("SELECT stock_quantity, product_name, price FROM products WHERE ?", {item_id: id}, function(err,res) {
    if (err) throw err;

    if (res.length === 0) {
      bamazon.printToConsole("that item doesn't exist");
      promptPurchase();
      return;
    }
   
    if (res[0].stock_quantity < quantity) {
      bamazon.printToConsole("Insufficient quantity!")
      promptPurchase();
      return;
    }
    
    connection.query(
      "UPDATE products SET ? WHERE ?",
      [
        {
          stock_quantity: res[0].stock_quantity - quantity,
        },
        {
          item_id: id,
        }
      ],
      function(error) {
        if (error) throw err;
        bamazon.printToConsole("You bought " +quantity+ " of this product: " + res[0].product_name + "\nYou paid: $" + (res[0].price * quantity).toFixed(2));
        inquirer.prompt([
        {
          message: "Would you like to make another purchase?",
          name: "another",
          type: "confirm"
        }
        ]).then(answers => {
          if (answers.another) {
            bamazon.showProducts(promptPurchase);
          } else {
            bamazon.printToConsole("Goodbye");
            process.exit();
          }
        })
      }
    );
  });
}

function promptPurchase() {
	inquirer.prompt([{
    message: "Enter the ID of the product you would like to buy",
    name: "id",
	},
  {
    message: "How many would you like to buy?",
    name: "quantity"

  }
  ]).then(answers => {

    if (!isNaN(answers.quantity) && !isNaN(answers.id)) {
      checkQuantity(answers.id, answers.quantity);
		} else {
      bamazon.printToConsole("enter a number");
      promptPurchase();
    }

	})
};

bamazon.showProducts(promptPurchase);





