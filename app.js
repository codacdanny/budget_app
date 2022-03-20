//  BUDGET CONTROLLER
let budgetController = (function () {
  let Expense = function (id, description, value) {
    // we are using object as our data structure because we are going to have a lot inouts coming in and we are puting it in a function constructor so that we can easily access them
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };
  let Income = function (id, description, value) {
    // we are using object as our data structure because we are going to have a lot inouts coming in and we are puting it in a function constructor so that we can easily access them
    this.id = id;
    this.description = description;
    this.value = value;
  };
  let calculateTotal = function (type) {
    // this is not returned because it is not meant to be public, the calculation goes on behind the scenes (here). The (type) param is to choose if it is inc or exp
    let sum = 0; // this is the initial sum we set
    data.allItems[type].forEach((current) => {
      sum += current.value;
    });
    data.totals[type] = sum;
  };

  //Choosing a data structure can be difficult but  this is the best for this project. always try to group your data

  let data = {
    allItems: {
      exp: [], //expenses stored in array
      inc: [], //income stored in an array
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1, // this is the value we use for when a value is non existent
  };

  return {
    addItem: function (type, des, val) {
      let newItem, ID;
      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1; // here we accessed the array and then accessed the array length and Minused 1 from it to get the index of the last digit in the array and then made it an ID, THEN IF ANOTHER ID is added we will only increase the ID value by one so that it remains logical
      } else {
        ID = 0; // we wrote this code because the index of the first array element is 0, and 0 - 1 is -1 and this does not exist in the array. that is why we have to return the ID to 0 here
      }
      if (type === "exp") {
        // if type is exp , this would happen
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      // once the TYPE (either inc or exp) is gotten we pushed in to the exp array or inc array located in the all items object
      data.allItems[type].push(newItem); //since we already stored our 'type' as eithe exp or inc via the ifelse statement, there will be nno need to use another conditional to to determine what we are pushing into our data object

      // We Return the newItem
      return newItem; // so that it can be accessed
    },

    deleteItem: function (type, id) {
      let ids, index;

      ids = data.allItems[type].map((current) => current.id); // here we find and return(into an array because of the map function) the id  that we want to delete
      index = ids.indexOf(id); // here we got the index of the id in the array
      if (index !== -1) {
        data.allItems[type].splice(index, 1); // this will remove the element with the given index and remove only one entry which is that index alone
      }
    },
    calculateBudget: function () {
      //calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");
      // calculate the budget : income - expense
      data.budget = data.totals.inc - data.totals.exp;
      // calculate the percentage of income we spent
      if (data.totals.inc > 0) {
        // this if statement is eliminating the problem of division by 0. mathematically we can't divide a number by 0.
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (current) {
        current.calcPercentage(data.totals.inc);
      }); // here we are looping over the array withoutt returning anything, because that is what the forEach Loop does
    },
    returnPercentages: function () {
      let allPercentages = data.allItems.exp.map(
        (current) => current.getPercentage() // this loops through the elements, calls the get percentage method and store it in the all percentage
      );
      return allPercentages; // this ia an array with all percentages
    },
    returnBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },
  };
})();

// UI CONTROLLER
let UIcontroller = (function () {
  // WE ARE USING THIS SO THAT INCASE WE HAVE TO CHANGE NAMES, IT WOULD BE EASIER FOR US
  let DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputButton: ".add__btn",
    incomeContainer: ".income__list", //this is the html element we want to select from the html for the insert ADjacent html thingy
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercentage: ".item__percentage",
    dateLabel: ".budget__title--month",
  };
  let formatNumber = function (num, type) {
    let numSplit, int, decimal;

    num = Math.abs(num); // this result overwrits our initial num variable
    num = num.toFixed(2); // this is a default numbers prot otype.fies the number to 2 decimalplaces
    //this also overwrites our previous num variable
    numSplit = num.split(".");
    int = numSplit[0];
    decimal = numSplit[1];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }

    return (type === "exp" ? "-" : "+") + " " + int + "." + decimal; // this is also return type === exp ? sign = '-' : sign = '+' + int + dec;
  };
  let nodeListForEach = function (list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i); // here the call back fxn is called in each iteration in the list, we passed the current element and its index as arguments
    }
  }; // this is a function that we can use to loop over Nodelists because normally we cant use the foreach property with it

  return {
    getInput: function () {
      // we are puting these in an object and returning them here because they are from different sources and it will be asier to put them in an object than putting each of them in a separate variable. it easier to return them as object and values so that  THE CONTROLLER can read all of them at the same time
      return {
        type: document.querySelector(DOMstrings.inputType).value, // we'll be expecting values to be 'inc or exp'
        description: document.querySelector(DOMstrings.inputDescription).value, // we are expexting the description
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value), // we are expecting the amount, we use the parsefloat to change the string to a number
      };
    },

    addListItem: function (obj, type) {
      let html, newHtml, element;
      // create HTML STRINGS WITH PLACEHOLDER TEXT

      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="item__date"></div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="item__date"</div><div class="right clearfix"> <div class="item__value">-%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="item__date"></div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // REPLACE THE PLACEHOLDER TEXT WITH SOME ACTUALDATA
      newHtml = html.replace("%id%", obj.id);
      //here we are using the replace method still on the new html because the newHTML has rexieved command to replave the ID , so now the ID is already replace. now all we have to do is to replace the description and value in the newHtml because it already has the new ID  that we desire.
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      // INSERT THE HTML INTO THE DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml); // we are using before end because we want this newHtml strings to be direct children of INCOMECONTAINER(ie income__list) from our html. this also goes for the expensescontainer too
    },
    removeListItem: function (selectorID) {
      document.getElementById(selectorID).remove();
    },
    clearFields: function () {
      let fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields); // here we are trying to convert the list generated by the 'query selector all' to an array because we want o use the arrAY prototypes on it.
      fieldsArr.forEach((current, index, array) => {
        // the for each accepts 3 arguments, the current element being processed in loop, the index of the array you choose and the array itself
        current.value = ""; //here we just cleared all the values of the input fields that is passed into the fields array, and they are the description values ad the numerical or amount values that we selected via the queryselectorall
      });

      fieldsArr[0].focus();
    },
    displayBudget: function (obj) {
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(DOMstrings.expenseLabel).textContent =
        formatNumber(obj.totalInc, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },
    displayPercentages: function (percentages) {
      let fields2 = document.querySelectorAll(DOMstrings.expensesPercentage); //this returns a node list, and we know that the list or node list does not have the array methods like FOREACH that we can use here. so we have to convert it to an array

      nodeListForEach(fields2, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "--";
        }
      });
    },

    displayMonth: function () {
      let currentDate, currentMonth, months, day, days, year;
      currentDate = new Date();
      days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      currentMonth = currentDate.getMonth();
      day = currentDate.getDay();
      year = currentDate.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent =
        days[day] + ", " + months[currentMonth] + " " + year;
    },

    changedType: function () {
      let fields3 = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          ", " +
          DOMstrings.inputValue
      );
      nodeListForEach(fields3, function (cur) {
        cur.classList.toggle("red-focus");
      });
      document.querySelector(DOMstrings.inputButton).classList.toggle("red");
    },
    getDOMstrings: function () {
      // we are doing this so that the domstringa object created earlier can be accessed from the CONTROLLER MODULE
      return DOMstrings;
    },
  };
})();

// GLOBAL APP CONTROLLER
let controller = (function (budgetCtrl, UIctrl) {
  let setUpEventListeners = function () {
    let DOM = UIctrl.getDOMstrings();
    document
      .querySelector(DOM.inputButton) // we used DOM. because in the controller module the domstrings is saved as DOM
      .addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", function (event) {
      if (event.keycode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    //in this function it is DOM, and not Domstrings
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem); // we are setting the event listener on the container class because it is the first element that the income and expenses have in Common

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UIctrl.changedType);
  };

  let updateBudget = function () {
    // 1 CALCULATE THE BUDGET
    budgetCtrl.calculateBudget();
    // 2 return the budget
    let budgetMax = budgetCtrl.returnBudget();
    // 3  DISPLAY THE BUDGET ON THE UI
    UIctrl.displayBudget(budgetMax);
  };

  let updatePercentages = function () {
    // calculate the percentages
    budgetCtrl.calculatePercentages();
    // 2 read them from the budget controller
    let percent1 = budgetCtrl.returnPercentages();
    // 3 update the UI ith the new percentages
    UIctrl.displayPercentages(percent1);
  };

  let ctrlAddItem = function () {
    let input, newItem;
    // 1. GET THE FIELD INPUT DATA
    input = UIctrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // this IF statement is to ensure that there is no empty description, a NAN value and a value <= 0
      // 2 ADD  THE ITEM TO THE BUDGET CONTROLLER
      newItem = budgetCtrl.addItem(input.type, input.description, input.value); // note that this are just argument names

      // 3 ADD THE ITEM TO THE UI
      UIctrl.addListItem(newItem, input.type);

      //4 clear the INPUT after hittinh enter or clicking the button
      UIctrl.clearFields();
      // 5 calculate and update budget
      updateBudget();
      // 6 calculate and update percentages
      updatePercentages();
    }
  };

  // deleting Item by DOM Delegation
  let ctrlDeleteItem = function (event) {
    let itemID, splitId, type, ID;
    //we need the event parameter because we need to now what the TARGET EEMENT IS
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; // so here we are using this to catch the ID because in the html structure there is no other place where an ID is defined. like there is no ID any other place in the code except in the icon. so with this we can use it to target an event that should happen once an ID is defined
    if (itemID) {
      //inc-1, we have to use the split method to  seperate the inc and 1
      splitId = itemID.split("-");
      type = splitId[0]; // inc is the type and is the firt element with index-0
      ID = parseInt(splitId[1]); // it is important you convert this to a number because it returns originally as a string

      //1 delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);
      // 2 delete the item from the UI
      UIctrl.removeListItem(itemID);
      // 3 update and show the new budget
      updateBudget();
      // 4 calculate and update percentages
      updatePercentages();
    }
  };
  return {
    init: function () {
      console.log("App has started");
      UIctrl.displayMonth();
      UIctrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      }); // we are initializing everything to 0 that is why we did not pass the budgetMax as an argument

      setUpEventListeners();
    }, // this init function is used to call other functions that are inside this controller and those functions won't execute unless we call them despite the fact that they are in an IIFE. so we have to return the IIFE  as an object then call it from outside the scope entirelly
  };
})(budgetController, UIcontroller);

controller.init(); // this is where we call the init function deom outside CONTROLLER  scope so that the setup and other sub-functions can work properly
