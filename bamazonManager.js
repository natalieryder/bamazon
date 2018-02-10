var bamazon = require ('./bamazon');


function prompt() {
	bamazon.inquirer.prompt([
	{
		message: "Menu:",
		name: "choice",
		type: "list",
		choices: ["1) View Products for Sale","2) View Low Inventory","3) Add to Inventory","4) Add New Product"],
	}
	]).then(answers => {
		switch(answers.choice) {
			case "1) View Products for Sale":
			bamazon.showProducts(prompt);
			break;

			case "2) View Low Inventory":
			//then it should list all items with an inventory count lower than five.
			showLowInventory(prompt);
			
			break;
			case "3) Add to Inventory":

			addToInventory(prompt);
			//your app should display a prompt that will let the manager "add more" of any item currently in the store.
			
			break;
			// it should allow the manager to add a completely new product to the store

			case "4) Add New Product":
			addNewProduct(prompt);
			
			break;
			default:
			console.log("none");
		}
	})
}

function showLowInventory(callbackFunction) {
	bamazon.connection.query("SELECT item_id, product_name, price, stock_quantity FROM products WHERE stock_quantity < 5", function(err, res) {
      var table = new bamazon.Table({
          head: ['id', 'item', 'quantity']
        , colWidths: [10, 20, 10]
      });
      	if (err) throw err;
		for (i = 0; i < res.length; i++) {
			table.push([res[i].item_id,res[i].product_name,res[i].stock_quantity]);
    	}

    	console.log(table.toString() + "\n");

    	if (callbackFunction) {
        	callbackFunction();
      	} 
  	});

};

function addToInventory(callbackFunction) {

	bamazon.inquirer.prompt([{
		message: "What product do you want to add inventory to?",
		name: "id"
	},
	{
		message: "How many?",
		name: "quantityToAdd"
	}
	]).then(answers => {

		if (isNaN(answers.quantityToAdd) || isNaN(answers.id)) {
			//if not numbers entered, restart the function
	      console.log("enter a number");
	      addToInventory(callbackFunction);
	      return;
		}

		bamazon.connection.query("UPDATE products SET `stock_quantity` = `stock_quantity` + ? WHERE ?", 
			[
				answers.quantityToAdd,
				{
					item_id: answers.id
				}
			], 

			function (err, res) {

				if (err) throw err;

				// check if the id is a product
				// if not restart the function
			    if (res.changedRows === 0) {
			      console.log("that item doesn't exist or you didn't enter a quantity");
			      addToInventory(callbackFunction);
			      return;
			    }

				bamazon.connection.query("SELECT product_name, stock_quantity FROM products where ?",
				[{
					item_id: answers.id
				}], 
				function(err, res) {

					bamazon.printToConsole("Added " + answers.quantityToAdd + " to " + res[0].product_name + ". \nInventory is now " + res[0].stock_quantity);
				
					if (callbackFunction) {
				    	callbackFunction();
				  	} 
				})

		});
		
	})
};

function addNewProduct(callbackFunction) {
	bamazon.inquirer.prompt([
		{
			message: "Product Name:",
			name: "product_name"
		},
		{
			message: "Department Name:",
			name: "department_name"
		},
		{
			message: "Price",
			name: "price"
		},
		{
			message: "Stock Quantity",
			name: "stock_quantity"
		}

	]).then(answers => {
		

		bamazon.connection.query("INSERT INTO products SET ?",
		{
			product_name: answers.product_name,
			department_name: answers.department_name,
			price: answers.price,
			stock_quantity: answers.stock_quantity

		}, 
		function(err, res){
			if (err) {
				console.log(err);
				bamazon.printToConsole("You did something wrong, try again.");
				addNewProduct(callbackFunction);
				return;
			};
			bamazon.printToConsole("you added a new product: \n" + JSON.stringify(answers, null, ' '))

			if (callbackFunction) {
		    	callbackFunction();
		  	}
		})

		
	})
	

}

prompt();
