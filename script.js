// Get elements from HTML

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

// Load transactions from LocalStorage

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Add transaction

transactionForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const type = typeInput.value;

  if (description === "" || amount <= 0) {
    alert("Please enter valid transaction details.");
    return;
  }

  const transaction = {
    id: Date.now(),
    description: description,
    amount: amount,
    type: type,
  };

  transactions.push(transaction);

  saveTransactions();

  transactionForm.reset();

  displayTransactions();
  updateSummary();
});

// Save transactions

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Display transactions

function displayTransactions() {
  transactionList.innerHTML = "";

  const selectedFilter = filter.value;

  let filteredTransactions = transactions;

  if (selectedFilter !== "all") {
    filteredTransactions = transactions.filter(
      (transaction) => transaction.type === selectedFilter,
    );
  }

  if (filteredTransactions.length === 0) {
    emptyMessage.style.display = "block";
  } else {
    emptyMessage.style.display = "none";
  }

  filteredTransactions.forEach(function (transaction) {
    const li = document.createElement("li");

    li.classList.add("transaction", transaction.type);

    const sign = transaction.type === "income" ? "+" : "-";

    li.innerHTML = `
            <div class="transaction-info">

                <h4>${transaction.description}</h4>

                <small>
                    ${transaction.type.toUpperCase()}
                </small>

            </div>

            <div class="transaction-right">

                <span class="transaction-amount">
                    ${sign} ₹${transaction.amount.toFixed(2)}
                </span>

                <button
                    class="delete-btn"
                    onclick="deleteTransaction(${transaction.id})">
                    Delete
                </button>

            </div>
        `;

    transactionList.appendChild(li);
  });
}

// Delete transaction

function deleteTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);

  saveTransactions();

  displayTransactions();
  updateSummary();
}

// Update balance, income and expense

function updateSummary() {
  let income = 0;
  let expense = 0;

  transactions.forEach(function (transaction) {
    if (transaction.type === "income") {
      income += transaction.amount;
    } else {
      expense += transaction.amount;
    }
  });

  const balance = income - expense;

  incomeElement.textContent = `₹${income.toFixed(2)}`;

  expenseElement.textContent = `₹${expense.toFixed(2)}`;

  balanceElement.textContent = `₹${balance.toFixed(2)}`;
}

// Filter transactions

filter.addEventListener("change", function () {
  displayTransactions();
});

// Load application

displayTransactions();
updateSummary();
