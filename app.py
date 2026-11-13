
from flask import Flask, render_template, request, jsonify
import sqlite3
import os

app = Flask(__name__)

DATABASE = "database/preppath.db"


def get_db():
    os.makedirs("database", exist_ok=True)
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            title TEXT NOT NULL,
            difficulty TEXT DEFAULT 'Medium',
            status TEXT DEFAULT 'Pending'
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS companies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            status TEXT DEFAULT 'Applied'
        )
    """)

    conn.commit()
    conn.close()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/dashboard")
def dashboard():
    conn = get_db()

    total = conn.execute(
        "SELECT COUNT(*) FROM tasks"
    ).fetchone()[0]

    completed = conn.execute(
        "SELECT COUNT(*) FROM tasks WHERE status='Completed'"
    ).fetchone()[0]

    aptitude = conn.execute(
        "SELECT COUNT(*) FROM tasks WHERE category='Aptitude'"
    ).fetchone()[0]

    coding = conn.execute(
        "SELECT COUNT(*) FROM tasks WHERE category='Coding'"
    ).fetchone()[0]

    interviews = conn.execute(
        "SELECT COUNT(*) FROM tasks WHERE category='Interview'"
    ).fetchone()[0]

    companies = conn.execute(
        "SELECT COUNT(*) FROM companies"
    ).fetchone()[0]

    conn.close()

    progress = round(completed / total * 100) if total else 0

    return jsonify({
        "total": total,
        "completed": completed,
        "aptitude": aptitude,
        "coding": coding,
        "interviews": interviews,
        "companies": companies,
        "progress": progress
    })


@app.route("/api/tasks", methods=["GET", "POST"])
def tasks():
    if request.method == "POST":
        data = request.get_json() or {}

        category = data.get("category")
        title = data.get("title", "").strip()
        difficulty = data.get("difficulty", "Medium")

        if category not in ["Aptitude", "Coding", "Interview"]:
            return jsonify({"error": "Invalid category"}), 400

        if not title:
            return jsonify({"error": "Title is required"}), 400

        if difficulty not in ["Easy", "Medium", "Hard"]:
            return jsonify({"error": "Invalid difficulty"}), 400

        conn = get_db()

        conn.execute("""
            INSERT INTO tasks (category, title, difficulty)
            VALUES (?, ?, ?)
        """, (category, title, difficulty))

        conn.commit()
        conn.close()

        return jsonify({"message": "Task added"}), 201

    category = request.args.get("category")

    conn = get_db()

    if category:
        result = conn.execute(
            "SELECT * FROM tasks WHERE category=?",
            (category,)
        ).fetchall()
    else:
        result = conn.execute(
            "SELECT * FROM tasks"
        ).fetchall()

    conn.close()

    return jsonify([dict(row) for row in result])


@app.route("/api/tasks/<int:task_id>", methods=["PUT", "DELETE"])
def manage_task(task_id):
    conn = get_db()

    if request.method == "DELETE":
        cursor = conn.execute(
            "DELETE FROM tasks WHERE id=?",
            (task_id,)
        )
    else:
        data = request.get_json() or {}
        status = data.get("status")

        if status not in ["Pending", "Completed"]:
            conn.close()
            return jsonify({"error": "Invalid status"}), 400

        cursor = conn.execute(
            "UPDATE tasks SET status=? WHERE id=?",
            (status, task_id)
        )

    conn.commit()
    found = cursor.rowcount
    conn.close()

    if found == 0:
        return jsonify({"error": "Record not found"}), 404

    return jsonify({"message": "Operation successful"})


@app.route("/api/companies", methods=["GET", "POST"])
def companies():
    conn = get_db()

    if request.method == "POST":
        data = request.get_json() or {}

        name = data.get("name", "").strip()
        role = data.get("role", "").strip()
        status = data.get("status", "Applied")

        if not name or not role:
            conn.close()
            return jsonify({"error": "Enter company and role"}), 400

        if status not in [
            "Applied", "Assessment", "Interview",
            "Selected", "Rejected"
        ]:
            conn.close()
            return jsonify({"error": "Invalid status"}), 400

        conn.execute("""
            INSERT INTO companies (name, role, status)
            VALUES (?, ?, ?)
        """, (name, role, status))

        conn.commit()
        conn.close()

        return jsonify({"message": "Company added"}), 201

    result = conn.execute(
        "SELECT * FROM companies ORDER BY id DESC"
    ).fetchall()

    conn.close()

    return jsonify([dict(row) for row in result])


@app.route("/api/companies/<int:company_id>", methods=["DELETE"])
def delete_company(company_id):
    conn = get_db()

    cursor = conn.execute(
        "DELETE FROM companies WHERE id=?",
        (company_id,)
    )

    conn.commit()
    found = cursor.rowcount
    conn.close()

    if found == 0:
        return jsonify({"error": "Company not found"}), 404

    return jsonify({"message": "Company deleted"})


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
