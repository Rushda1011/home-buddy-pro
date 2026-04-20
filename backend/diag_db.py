import sqlite3

def diag():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    
    print("--- USERS ---")
    users = conn.execute('SELECT id, name, email, role, roomBox FROM users').fetchall()
    for u in users:
        print(dict(u))
        
    print("\n--- ROOMS ---")
    rooms = conn.execute('SELECT roomNumber, status, occupants, residents, pendingUserId FROM rooms').fetchall()
    for r in rooms:
        print(dict(r))
        
    conn.close()

if __name__ == "__main__":
    diag()
