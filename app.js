var budgetController = (function() {

    class Expense {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        }
    }
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0)
        {this.percentage = Math.round((this.value/totalIncome) * 100);}
        else {
            this.percentage = -1;
        }
    }
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    class Income {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    }
    
    var calculateTotal = function(type) {
        var sum = 0;
        // console.log(data.allItems);
        data.allItems[type].forEach(function(current, index, arr) {
            sum += current.value;         
        })
        data.totals[type] = sum;
        
    };

    var data = {
        allItems : {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget : 0,
        percentage: -1
    }

    return {
        addItem : function(type,des,val){
            var newItem, ID
            // console.log(type,des,val)
            //create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }    
            //create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID,des,val);
            } else if(type === 'inc'){
                newItem = new Income(ID,des,val);
            }
            //push it into our data structure
            data.allItems[type].push(newItem);
            //return the new element
            return newItem;
        },
        deleteItem : function (type,id) {
            var ids,index
            // create a array of all of ids,find the index of the Id we want to remove,
            // because the when an object has been deleted, the index and id are not the same
            // 1.using forEach
            // data.allItems[type].forEach(function(current,index,arr) {
            //     ids.push(current.id)
            // })
            // 2.using map ,always return something
            ids = data.allItems[type].map(function(current) {
                return current.id;
            })

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index,1);
            }
        },

        calculateBudget : function() {
            // calculate total of income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate of budget(income - budget)
            data.budget = data.totals.inc - data.totals.exp;
            // percentage of income that we spent
            
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100 );
                // console.log('percentage: ' +  data.percentage );                
            } else {
                data.percentage = -1;// when income is less than or equal to 0, percentage is not making sense
            }

        },
        calculatePercentage : function() {
            data.allItems.exp.forEach (function(cur) {
                cur.calcPercentage(data.totals.inc);
            })
            
        },
        getPercentage : function() {
            var allPerc = data.allItems.exp.map (function(cur) {
                return cur.getPercentage();
            });
            return allPerc; 
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing :function() {
            console.log(data);
        }
    }
    
})();


var UIController = (function() {

    var DOMstrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container : '.container',
        expensesPrecentageLabel : '.item__percentage',
        dateLable : '.budget__title--month'
    }

    var formatNumber = function(num,type) {
            
        var numSpilt,int,deci;
        num = Math.abs(num);
        // returns a string type number  with exactly two decimal points 
        num = num.toFixed(2);
        //seperate the number into integer part and decimal part
        numSplit = num.split('.');

        int = numSplit[0];
        // using comma to seperating the thousands
        if (int.length > 3 ) {
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,int.length);
        }
        deci = numSplit[1];
        // + or - before numbers
        // type === 'exp' ? sign = '-' : sign = '+';
        
        return ((type === 'exp' ? '-' : '+') + ' ' + int + '.' + deci);
    };


    // forEach loop for nodeList
    var nodeListForEach = function(list,callback) {
        for (var i = 0; i< list.length;i++) {
            callback(list[i],i); 
            // console.log(i);
        }
    }    



    //return public object that can be accessed by other controllers
    return {
        getInput : function() {
            return {
                type : document.querySelector(DOMstrings.inputType).value,//will be either 'inc' or 'exp'
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj,type) {
            var html,newHtml,element
            //create HTML string with placeholder text
            if (type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if (type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //replace the placeholders with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value , type)  );
            //insert the HTML into the DOM
            // console.log(newHtml);
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },

        deleteListItem : function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields,fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            // console.log(fields);
            // change the fields list into array
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current,index,array) {
                current.value = '';
            })

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp' ;
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
            
            //if percentage is right, put a % sign, if not 
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---'
            }
        },

        displayPercentage: function(percentageArr) {
            var fields = document.querySelectorAll(DOMstrings.expensesPrecentageLabel);

            
            nodeListForEach(fields, function (current, index) {
                // console.log(current);
                if (percentageArr[index] > 0 ) {
                    current.textContent = percentageArr[index] + '%';
                } else {
                    current.textContent = '---'
                } 
            })
        },

        displayMonth: function() {
            var now, year, month, months
            months= ["January","February","March","April","May","June","July",
            "August","September","October","November","December"];
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLable).textContent =  months[month] + year ;
        },

        changeType: function() {
            var fields;
            fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue
            );

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            })

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        getDOMstrings : function() {
            return DOMstrings;
        }
    }
})();


var controller = (function(budgetCtrl,UICtrl) {
    // set up event listeners
    var setupEventListener = function() {
        
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress',function(event) {
            if (event.keyCode === 13 || event.witch === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem)
        
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType)
    };
    
    var updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2. return the budget
        var budget = budgetCtrl.getBudget()
        // 3. Display the budget and total percentage on the UI 

        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        // 1. calculate percentage
        budgetCtrl.calculatePercentage();
        // 2. Read percentage from the budget controller
        var percentageArr = budgetCtrl.getPercentage();
        console.log(percentageArr);
        // 3. update the UI with the new percentage
        UICtrl.displayPercentage(percentageArr)
    };

    var ctrlAddItem = function() {
        var input,newItem      
        // 1. Get the field input data
        // console.log('add item');
        // console.log(UICtrl);
        input = UICtrl.getInput();
        // console.log(input.type,input.description,input.value);
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to budget controller
            newItem = budgetCtrl.addItem(input.type,input.description,input.value);
            // console.log(newItem)
            // 3. Add the item to UI
            UICtrl.addListItem(newItem,input.type)
            // 4. clear the fields after input
            UICtrl.clearFields();
            // 5. Calculate and update the budget
            updateBudget(); 
            // 6. Calculate and update percentage
            updatePercentages();
        } else {
            alert('invalid input');
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemId,splitId,type,id;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);
        }

        // 1. Delete the item from data structure
        budgetCtrl.deleteItem(type,id);
        // 2. Delete the item from the UI
        UICtrl.deleteListItem(itemId);
        // 3. Update the budget
        updateBudget();
        // 4. Update percentages for each expenses
    };

    return {
        init : function() {
            console.log('Application has started'); 
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1                
            });             

            setupEventListener();
            
        }
    }

})(budgetController,UIController)

controller.init();
