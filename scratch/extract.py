import sqlite3
import json
import os

def extract_data():
    db_path = 'backend/database.db'
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found")
        return

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    data = {}
    
    try:
        tables_cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [t[0] for t in tables_cursor.fetchall()]
        
        for table in tables:
            data[table] = [dict(row) for row in conn.execute(f'SELECT * FROM {table}')]
            
        with open('backend_dump.json', 'w') as f:
            json.dump(data, f, indent=2)
        print("Successfully extracted data to backend_dump.json")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    extract_data()
