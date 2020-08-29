// Storage Controller
const StorageCtrl = (function(){
  // Public Methods
  return{
    getStoredItems: function() {
      // Return an array 'items' with the items in LS, if there isn't, returns empty array
      let items;
      if (localStorage.getItem('items') === null){
        items = [];
      } else {
        items = JSON.parse(localStorage.getItem('items'));
      }
      return items
    },
    setItem: function(item) {
      // Gets items in LS
      const items = this.getStoredItems();
      // Adds new Item
      items.push(item);
      // Save the new array to LS
      localStorage.setItem('items', JSON.stringify(items));
    },
    saveChanges(meals) {
      // Save the new array to LS
      localStorage.setItem('items', JSON.stringify(meals));
    }
  }
})();

// Item Controller
const ItemCtrl = (function(){
  // Meal constructor
  const Meal = function(name, calories, id){
    this.name = name,
    this.calories = calories,
    this.id = id
  }
  // Data structure and state 
  const data = {
    meals: StorageCtrl.getStoredItems(),
    currentMeal: null,
    totalCalories: 0
  }

  // Public Methods
  return {
    getMeals: function() {
      return data.meals
    },
    generateId: function(array) {
      const auxArr = array.sort();
      for (let i = 0; i < auxArr.length; i++) {
        if (auxArr[i] !== i) {
          return i
        } 
      }
      return auxArr.length
    },
    createNewMeal: function(newMeal) {
      // TENGO QUE CREAR UNA MEJOR FORMA DE ASIGNAR ID'S
      const mealsId = data.meals.map(val => val.id);
      const id = this.generateId(mealsId);
      const createdMeal = new Meal(newMeal.name, newMeal.calories, id);
      data.meals.push(createdMeal);
      return createdMeal
    },
    getSelectedElement(id) {
      let found;
      data.meals.forEach(meal => {
        if(Number(meal.id) === Number(id)){
          found = meal;
        }
      });
      return found
    },
    saveEditedMeal(inputs, id) {
      data.meals.forEach(meal => {
        if (Number(meal.id) === Number(id)) {
          meal.name = inputs.name;
          meal.calories = Number(inputs.calories);
          return meal
        }
      });
    },
    deleteMeal() {
      const index = data.meals.indexOf(data.currentMeal);
      data.meals.splice(index, 1);
    },
    clearMeals() {
      data.meals.splice(0);
    },
    setCurrent(meal) {
      data.currentMeal = meal;
    },
    getCurrent() {
      return data.currentMeal;
    },
    logData: function() {
      console.log(data)
    }
  }
})();

// UI Controller
const UICtrl = (function(){
  // Selectors
  const UISelectors = {
    resultList: 'result-list',
    addBtn: 'add-btn',
    editBtn: 'edit-btn',
    deleteBtn: 'delete-btn',
    backBtn: 'back-btn',
    clearBtn: 'clear-btn',
    name: 'name',
    calories: 'calories',
    total: 'total',
    editing: '.editing',
    home: '.home'
  }
  // Public Methods
  return{
    populateList: function(meals) {
      let html = '';
      meals.forEach(meal => {
        html += `
        <li id=${meal.id} class="list-group-item">
          <strong>${meal.name}:</strong> ${meal.calories} Calories
          <span class="float-right"><a href="#"><i class="fas fa-pencil-alt edit-meal"></i></a></span>
        </li>
        `
      });
      document.getElementById(UISelectors.resultList).innerHTML = html;
    },
    getSelectors: function() {
      return UISelectors;
    },
    getInputs: function() {
      const mealName = document.getElementById(UISelectors.name).value;
      const mealCalories = document.getElementById(UISelectors.calories).value;
      if(mealName && mealCalories){
        return {
          name: mealName,
          calories: mealCalories
        }
      }
    },
    clearInputs(){
      document.getElementById(UISelectors.name).value = '';
      document.getElementById(UISelectors.calories).value = '';
    },
    showTotalCalories(meals) {
      let total = 0;
      meals.forEach(function(meal) {
        total += Number(meal.calories);
      });
      document.getElementById(UISelectors.total).textContent = `Total Calories: ${total}`
    },
    showNewMeal: function(meal) {
      const li = document.createElement('li');
      li.setAttribute('id', meal.id);
      li.classList.add('list-group-item');
      li.innerHTML = `
        <strong>${meal.name}:</strong> ${meal.calories} Calories
        <span class="float-right"><a href="#"><i class="fas fa-pencil-alt edit-meal"></i></a></span>
      `
      document.getElementById(UISelectors.resultList).appendChild(li);
    },
    showSelected(meal) {
      document.getElementById(UISelectors.name).value = meal.name;
      document.getElementById(UISelectors.calories).value = meal.calories;
    },
    editState: function() {
      document.querySelector(UISelectors.home).classList.add('d-none');
      document.querySelector(UISelectors.editing).classList.remove('d-none');
    },
    homeState: function() {
      document.querySelector(UISelectors.home).classList.remove('d-none');
      document.querySelector(UISelectors.editing).classList.add('d-none');
    }

  }
})();

// App Controller
const App = (function(ItemCtrl, StorageCtrl, UICtrl){
  
  const loadEventListeners = function(){
    const UISelectors = UICtrl.getSelectors();
    
    // Add button event
    document.getElementById(UISelectors.addBtn).addEventListener('click', addMeal);

    // Edit button event
    document.getElementById(UISelectors.resultList).addEventListener('click', editMeal);

    // Save edit button event
    document.getElementById(UISelectors.editBtn).addEventListener('click', saveEdit);

    // Delete button event
    document.getElementById(UISelectors.deleteBtn).addEventListener('click', deleteMeal);

    // Back Button event
    document.getElementById(UISelectors.backBtn).addEventListener('click', goBack);

    // Clear All event
    document.getElementById(UISelectors.clearBtn).addEventListener('click', clearAll);

  }

  const addMeal = function() {
    // Get inputs
    const input = UICtrl.getInputs();
    // Just continues if inputs are filled
    if (input) {
      // Clear inputs
      UICtrl.clearInputs(); 
      // Creates a new meal in meals array
      const createdMeal = ItemCtrl.createNewMeal(input);
      // Stores the new meal in LS
      StorageCtrl.setItem(createdMeal);
      // Show new meal in UI
      UICtrl.showNewMeal(createdMeal);
      // Update Total Calories
      const meals = ItemCtrl.getMeals();
      UICtrl.showTotalCalories(meals);
    }
  }
  
  const editMeal = function(e) {
    const icon = e.target;  
    if(e.target.classList.contains('edit-meal')) {
        // Change to Edit Interface (UICtrl)
        UICtrl.editState();
        // Get selected data to be edited (ITEMCtrl)
        const selectedId = icon.parentElement.parentElement.parentElement.id;
        const selectedMeal = ItemCtrl.getSelectedElement(selectedId);
        // Set current Item
        ItemCtrl.setCurrent(selectedMeal);
        // Print selected data in UI
        UICtrl.showSelected(selectedMeal);
      };
    e.preventDefault();    
  }

  const saveEdit = function() {
    // Get new input values
    const newInputs = UICtrl.getInputs();
    // Get the current id value
    const currentId = ItemCtrl.getCurrent().id;
    // Update the data with the currentId with the new values {name: "Filete2", calories: "600"}
    const updatedMeal = ItemCtrl.saveEditedMeal(newInputs, currentId);
    // Clear inputs
    UICtrl.clearInputs();
    // Update Total Calories
    const meals = ItemCtrl.getMeals();
    UICtrl.showTotalCalories(meals);
    // Show changes
    UICtrl.populateList(meals);
    // Switch to home state
    UICtrl.homeState();
    // Save Changes
    StorageCtrl.saveChanges(meals)

  }

  const deleteMeal = function() {
    // Delete the selected meal in the data
    ItemCtrl.deleteMeal();
    // Clear inputs
    UICtrl.clearInputs();
    // Update Total Calories
    const meals = ItemCtrl.getMeals();
    console.log(meals);
    UICtrl.showTotalCalories(meals);
    // Show changes
    UICtrl.populateList(meals);
    // Switch to home state
    UICtrl.homeState();
    // Saves changes to LS
    StorageCtrl.saveChanges(meals);
  }

  const clearAll = function() {
    // Removes all information from data
    ItemCtrl.clearMeals();
    // Clear inputs
    UICtrl.clearInputs();
    // Update Total Calories
    const meals = ItemCtrl.getMeals();
    UICtrl.showTotalCalories(meals);
    // Show changes
    UICtrl.populateList(meals);
    // Switch to home state
    UICtrl.homeState();
    // Saves changes to LS
    StorageCtrl.saveChanges(meals);
  }

  const goBack = function() {
    // Switch to home state (UICtrl)
    UICtrl.homeState();
    // Erase the inputs
    UICtrl.clearInputs();
  }

  return{
    init: function(){
      // Gets the data
      const meals = ItemCtrl.getMeals();
      // Shows the results of calories in UI
      UICtrl.showTotalCalories(meals);
      // Shows meals elements in UI
      UICtrl.populateList(meals);
      // Load events listeners
      loadEventListeners();
    }
  }
})(ItemCtrl, StorageCtrl, UICtrl);

App.init();