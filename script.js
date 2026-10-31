
// =====================================
// 1. GET HTML ELEMENTS
// =====================================

const transactionForm = document.getElementById("transactionForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");

const transactionList = document.getElementById("transactionList");
const filter = document.getElementById("filter");
const emptyMessage = document.getElementById("emptyMessage");


// =====================================
// 2. LOCAL STORAGE KEY
// =====================================

const STORAGE_KEY = "transactions";


// =====================================
// 3. LOAD DATA FROM LOCAL STORAGE
// =====================================

function loadTransactions() {

    try {

        const savedData = localStorage.getItem(STORAGE_KEY);

        if (!savedData) {
            return [];
        }

        const parsedData = JSON.parse(savedData);

        return Array.isArray(parsedData) ? parsedData : [];

    } catch (error) {

        console.error("Error loading transactions:", error);

        return [];

    }

}

let transactions = loadTransactions();


// =====================================
// 4. SAVE DATA TO LOCAL STORAGE
// =====================================

function saveTransactions() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(transactions)
        );

    } catch (error) {

        console.error("Error saving transactions:", error);

        alert("Unable to save data in LocalStorage.");

    }

}


// =====================================
// 5. ADD NEW TRANSACTION
// =====================================

transactionForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const description = descriptionInput.value.trim();

    const amount = Number(amountInput.value);

    const type = typeInput.value;

    if (
        description === "" ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !["income", "expense"].includes(type)
    ) {

        alert("Please enter valid transaction details.");

        return;

    }


    const transaction = {

        id: Date.now(),

        description: description,

        amount: amount,

        type: type,

        date: new Date().toISOString()

    };


    // Add transaction to array

    transactions.push(transaction);


    // Save data permanently in browser storage

    saveTransactions();


    // Reset form

    transactionForm.reset();


    // Update UI

    displayTransactions();

    updateSummary();

});


// =====================================
// 6. DISPLAY TRANSACTIONS
// =====================================

function displayTransactions() {

    transactionList.innerHTML = "";

    const selectedFilter = filter.value;

    let filteredTransactions = transactions;


    // Apply filter

    if (selectedFilter !== "all") {

        filteredTransactions = transactions.filter(
            transaction => transaction.type === selectedFilter
        );

    }


    // Empty message

    if (filteredTransactions.length === 0) {

        emptyMessage.style.display = "block";

    } else {

        emptyMessage.style.display = "none";

    }


    // Display each transaction

    filteredTransactions.forEach(function(transaction) {

        const li = document.createElement("li");

        li.classList.add("transaction", transaction.type);

        const sign = transaction.type === "income" ? "+" : "-";


        // Create transaction information safely

        const info = document.createElement("div");

        info.className = "transaction-info";

        const heading = document.createElement("h4");

        heading.textContent = transaction.description;

        const small = document.createElement("small");

        small.textContent = transaction.type.toUpperCase();

        info.appendChild(heading);

        info.appendChild(small);


        // Create transaction amount

        const right = document.createElement("div");

        right.className = "transaction-right";

        const amountSpan = document.createElement("span");

        amountSpan.className = "transaction-amount";

        amountSpan.textContent =
            `${sign} ₹${Number(transaction.amount).toFixed(2)}`;


        // Create delete button

        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-btn";

        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {

            deleteTransaction(transaction.id);

        });


        right.appendChild(amountSpan);

        right.appendChild(deleteButton);

        li.appendChild(info);

        li.appendChild(right);

        transactionList.appendChild(li);

    });

}


// =====================================
// 7. DELETE TRANSACTION
// =====================================

function deleteTransaction(id) {

    transactions = transactions.filter(
        transaction => transaction.id !== id
    );


    // Update LocalStorage

    saveTransactions();


    // Update UI

    displayTransactions();

    updateSummary();

}


// =====================================
// 8. UPDATE INCOME, EXPENSE & BALANCE
// =====================================

function updateSummary() {

    let income = 0;

    let expense = 0;


    transactions.forEach(function(transaction) {

        if (transaction.type === "income") {

            income += Number(transaction.amount);

        } else if (transaction.type === "expense") {

            expense += Number(transaction.amount);

        }

    });


    const balance = income - expense;


    incomeElement.textContent = `₹${income.toFixed(2)}`;

    expenseElement.textContent = `₹${expense.toFixed(2)}`;

    balanceElement.textContent = `₹${balance.toFixed(2)}`;

}


// =====================================
// 9. FILTER TRANSACTIONS
// =====================================

filter.addEventListener("change", function() {

    displayTransactions();

});


// =====================================
// 10. INITIALIZE APPLICATION
// =====================================

function initializeApp() {

    displayTransactions();

    updateSummary();

}

initializeApp();
