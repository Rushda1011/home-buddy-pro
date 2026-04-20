import sqlite3

conn = sqlite3.connect('database.db')
try:
    conn.execute(
        "INSERT INTO users (id, name, email, role, roomBox, joinDate, status, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        ('shifa-1', 'Shifa', 'shifa@student.com', 'student', 'Unassigned', '2026-03-19', 'active', '0000000000')
    )
    conn.commit()
    print("✅ Shifa added successfully!")
    rows = conn.execute("SELECT id, name, email FROM users").fetchall()
    for r in rows:
        print(r)
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
