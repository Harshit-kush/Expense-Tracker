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

// Transactions are loaded from MySQL through the backend API.
// No LocalStorage is used.
let transactions = [];

const API_URL = "/api/transactions";

function formatAmount(amount) {
  return `₹${Number(amount).toFixed(2)}`;
}
// Make API requests and handle errors
async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// Add transaction
transactionForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const type = typeInput.value;

  if (
    !description ||
    description.length > 255 ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !["income", "expense"].includes(type)
  ) {
    alert("Please enter valid transaction details.");
    return;
  }

  const submitButton = transactionForm.querySelector('button[type="submit"]');

  submitButton.disabled = true;

  try {
    const result = await apiRequest(API_URL, {
      method: "POST",
      body: JSON.stringify({
        description,
        amount,
        type,
      }),
    });

    transactions.unshift(result.transaction);

    transactionForm.reset();

    displayTransactions();
    updateSummary();
  } catch (error) {
    alert(`Could not add transaction: ${error.message}`);
  } finally {
    submitButton.disabled = false;
  }
});

// Display transactions with the selected filter
function displayTransactions() {
  transactionList.replaceChildren();

  const selectedFilter = filter.value;

  const filteredTransactions =
    selectedFilter === "all"
      ? transactions
      : transactions.filter(
          (transaction) => transaction.type === selectedFilter,
        );

  emptyMessage.style.display =
    filteredTransactions.length === 0 ? "block" : "none";

  filteredTransactions.forEach((transaction) => {
    const li = document.createElement("li");
    li.classList.add("transaction", transaction.type);

    const info = document.createElement("div");
    info.className = "transaction-info";

    const title = document.createElement("h4");

    // textContent prevents descriptions from being interpreted as HTML
    title.textContent = transaction.description;

    const typeLabel = document.createElement("small");
    typeLabel.textContent = transaction.type.toUpperCase();

    info.append(title, typeLabel);

    const right = document.createElement("div");
    right.className = "transaction-right";

    const amountLabel = document.createElement("span");
    amountLabel.className = "transaction-amount";

    const sign = transaction.type === "income" ? "+" : "-";
    amountLabel.textContent = `${sign} ${formatAmount(transaction.amount)}`;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      deleteTransaction(transaction.id, deleteButton);
    });

    right.append(amountLabel, deleteButton);
    li.append(info, right);
    transactionList.appendChild(li);
  });
}

// Delete transaction from MySQL
async function deleteTransaction(id, button) {
  const confirmed = confirm(
    "Are you sure you want to delete this transaction?",
  );

  if (!confirmed) return;

  button.disabled = true;

  try {
    await apiRequest(`${API_URL}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    transactions = transactions.filter(
      (transaction) => String(transaction.id) !== String(id),
    );

    displayTransactions();
    updateSummary();
  } catch (error) {
    alert(`Could not delete transaction: ${error.message}`);
    button.disabled = false;
  }
}

// Update balance, income and expense
function updateSummary() {
  let income = 0;
  let expense = 0;

  transactions.forEach((transaction) => {
    const amount = Number(transaction.amount);

    if (transaction.type === "income") {
      income += amount;
    } else if (transaction.type === "expense") {
      expense += amount;
    }
  });

  const balance = income - expense;

  incomeElement.textContent = formatAmount(income);
  expenseElement.textContent = formatAmount(expense);
  balanceElement.textContent = formatAmount(balance);
}

// Filter transactions
filter.addEventListener("change", displayTransactions);

// Load transactions from MySQL on page startup
async function loadTransactions() {
  try {
    const result = await apiRequest(API_URL);

    transactions = result.transactions;

    displayTransactions();
    updateSummary();
  } catch (error) {
    transactionList.replaceChildren();
    emptyMessage.style.display = "block";
    emptyMessage.textContent = `Could not load transactions: ${error.message}`;

    console.error("Loading transactions failed:", error);
  }
}

// Start application
loadTransactions();
