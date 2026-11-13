

// Load dashboard information
async function loadDashboard() {
    try {
        const response = await fetch("/api/dashboard");
        const data = await response.json();

        document.getElementById("total").textContent = data.total;
        document.getElementById("completed").textContent = data.completed;
        document.getElementById("companies").textContent = data.companies;
        document.getElementById("progress").textContent = data.progress;

    } catch (error) {
        console.error("Dashboard Error:", error);
    }
}

// Add a new task
async function addTask() {
    const category = document.getElementById("category").value;
    const title = document.getElementById("taskTitle").value.trim();
    const difficulty = document.getElementById("difficulty").value;

    if (title === "") {
        alert("Please enter a task title!");
        return;
    }

    try {
        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                category: category,
                title: title,
                difficulty: difficulty
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error);
            return;
        }

        alert("Task added successfully!");

        document.getElementById("taskTitle").value = "";

        loadTasks();
        loadDashboard();

    } catch (error) {
        console.error("Add Task Error:", error);
        alert("Unable to add task!");
    }
}

// Display all tasks
async function loadTasks() {
    try {
        const response = await fetch("/api/tasks");
        const tasks = await response.json();

        const taskList = document.getElementById("taskList");
        taskList.replaceChildren();

        tasks.forEach(task => {
            const div = document.createElement("div");
            const heading = document.createElement("h3");
            const details = document.createElement("p");
            const status = document.createElement("p");
            const completeButton = document.createElement("button");
            const deleteButton = document.createElement("button");

            heading.textContent = task.title;
            details.textContent =
                task.category + " | " + task.difficulty;
            status.textContent = "Status: " + task.status;

            completeButton.textContent =
                task.status === "Completed"
                    ? "Mark Pending"
                    : "Mark Completed";

            completeButton.addEventListener("click", () => {
                updateTask(task.id, task.status);
            });

            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                deleteTask(task.id);
            });

            div.append(heading, details, status,
                       completeButton, deleteButton);

            taskList.appendChild(div);
        });

    } catch (error) {
        console.error("Load Tasks Error:", error);
    }
}

// Update task status
async function updateTask(id, currentStatus) {
    const newStatus =
        currentStatus === "Completed" ? "Pending" : "Completed";

    try {
        const response = await fetch("/api/tasks/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            alert("Unable to update task!");
            return;
        }

        loadTasks();
        loadDashboard();

    } catch (error) {
        console.error("Update Error:", error);
    }
}

// Delete task
async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) {
        return;
    }

    try {
        const response = await fetch("/api/tasks/" + id, {
            method: "DELETE"
        });

        if (!response.ok) {
            alert("Unable to delete task!");
            return;
        }

        alert("Task deleted successfully!");

        loadTasks();
        loadDashboard();

    } catch (error) {
        console.error("Delete Error:", error);
    }
}

// Load everything when page opens
document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
    loadTasks();
    loadCompanies();
});



// Add a new company
async function addCompany() {
    const name = document.getElementById("companyName").value.trim();
    const role = document.getElementById("companyRole").value.trim();
    const status = document.getElementById("companyStatus").value;

    if (name === "" || role === "") {
        alert("Please enter company name and job role!");
        return;
    }

    try {
        const response = await fetch("/api/companies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                role: role,
                status: status
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error);
            return;
        }

        alert("Company added successfully!");

        document.getElementById("companyName").value = "";
        document.getElementById("companyRole").value = "";

        loadCompanies();
        loadDashboard();

    } catch (error) {
        console.error("Add Company Error:", error);
        alert("Unable to add company!");
    }
}

// Display all companies
async function loadCompanies() {
    try {
        const response = await fetch("/api/companies");
        const companies = await response.json();

        const companyList = document.getElementById("companyList");
        companyList.replaceChildren();

        companies.forEach(company => {
            const div = document.createElement("div");
            const heading = document.createElement("h3");
            const details = document.createElement("p");
            const status = document.createElement("p");
            const deleteButton = document.createElement("button");

            heading.textContent = company.name;
            details.textContent = "Role: " + company.role;
            status.textContent = "Status: " + company.status;

            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                deleteCompany(company.id);
            });

            div.append(heading, details, status, deleteButton);
            companyList.appendChild(div);
        });

    } catch (error) {
        console.error("Load Companies Error:", error);
    }
}

// Delete a company
async function deleteCompany(id) {
    if (!confirm("Are you sure you want to delete this company?")) {
        return;
    }

    try {
        const response = await fetch("/api/companies/" + id, {
            method: "DELETE"
        });

        if (!response.ok) {
            alert("Unable to delete company!");
            return;
        }

        alert("Company deleted successfully!");

        loadCompanies();
        loadDashboard();

    } catch (error) {
        console.error("Delete Company Error:", error);
    }
}

