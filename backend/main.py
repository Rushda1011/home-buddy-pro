import sqlite3
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json

app = Flask(__name__)
# Enable more robust CORS for local development ports
CORS(app, resources={r"/api/*": {"origins": [
    "http://localhost:5173", "http://127.0.0.1:5173",
    "http://localhost:8080", "http://127.0.0.1:8080",
    "http://localhost:8081", "http://127.0.0.1:8081",
    "http://localhost:8082", "http://127.0.0.1:8082",
    "http://localhost:8083", "http://127.0.0.1:8083",
    "http://localhost:8084", "http://127.0.0.1:8084",
    "http://localhost:8085", "http://127.0.0.1:8085"
]}})

DB_PATH = 'database.db'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, timeout=20)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create Tables (Safe to run multiple times with IF NOT EXISTS)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT UNIQUE,
            role TEXT,
            roomBox TEXT,
            joinDate TEXT,
            status TEXT,
            phone TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rooms (
            roomNumber TEXT PRIMARY KEY,
            floor INTEGER,
            type TEXT,
            rent INTEGER,
            status TEXT,
            amenities TEXT,
            occupants INTEGER,
            maxOccupants INTEGER,
            residents TEXT,
            images TEXT,
            pendingUserId TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS complaints (
            id TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            category TEXT,
            status TEXT,
            roomNumber TEXT,
            studentName TEXT,
            createdAt TEXT,
            updatedAt TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS payments (
            id TEXT PRIMARY KEY,
            studentName TEXT,
            roomNumber TEXT,
            amount INTEGER,
            month TEXT,
            year INTEGER,
            status TEXT,
            dueDate TEXT,
            paidDate TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            firstName TEXT,
            lastName TEXT,
            email TEXT,
            message TEXT,
            createdAt TEXT,
            status TEXT DEFAULT 'unread'
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS visitors (
            id TEXT PRIMARY KEY,
            visitorName TEXT,
            studentName TEXT,
            relation TEXT,
            visitDate TEXT,
            checkIn TEXT,
            checkOut TEXT,
            status TEXT
        )
    ''')
    
    # Ensure columns exist (Migrations)
    try:
        cursor.execute('SELECT status FROM messages LIMIT 1')
    except sqlite3.OperationalError:
        cursor.execute("ALTER TABLE messages ADD COLUMN status TEXT DEFAULT 'unread'")

    try:
        cursor.execute('SELECT studentName FROM complaints LIMIT 1')
    except sqlite3.OperationalError:
        cursor.execute('ALTER TABLE complaints ADD COLUMN studentName TEXT')
    
    try:
        cursor.execute('SELECT year FROM payments LIMIT 1')
    except sqlite3.OperationalError:
        cursor.execute('ALTER TABLE payments ADD COLUMN year INTEGER')
    
    try:
        cursor.execute('SELECT paidDate FROM payments LIMIT 1')
    except sqlite3.OperationalError:
        cursor.execute('ALTER TABLE payments ADD COLUMN paidDate TEXT')
    
    try:
        cursor.execute('SELECT images FROM rooms LIMIT 1')
    except sqlite3.OperationalError:
        cursor.execute('ALTER TABLE rooms ADD COLUMN images TEXT')

    try:
        cursor.execute('SELECT pendingUserId FROM rooms LIMIT 1')
    except sqlite3.OperationalError:
        cursor.execute('ALTER TABLE rooms ADD COLUMN pendingUserId TEXT')

    try:
        cursor.execute('SELECT password FROM users LIMIT 1')
    except sqlite3.OperationalError:
        cursor.execute("ALTER TABLE users ADD COLUMN password TEXT DEFAULT 'password123'")

    # Initial Data - Only seed if users table is empty
    cursor.execute('SELECT COUNT(*) FROM users')
    if cursor.fetchone()[0] == 0:
        initial_users = [
            ("1", "Rahul Sharma", "rahul.s@example.com", "student", "203", "2024-01-14", "active", "+91 98765 43210", "password123"),
            ("2", "Priya Patel", "priya.p@example.com", "student", "205", "2024-01-10", "active", "+91 98765 43211", "password123"),
            ("3", "Admin User", "admin@homebuddy.com", "admin", "-", "2023-12-01", "active", "+91 98765 43212", "admin123"),
            ("4", "Amit Kumar", "amit.k@example.com", "student", "312", "2024-01-15", "pending", "+91 98765 43213", "password123"),
        ]
        cursor.executemany('INSERT INTO users (id, name, email, role, roomBox, joinDate, status, phone, password) VALUES (?,?,?,?,?,?,?,?,?)', initial_users)

    # Ensure at least one staff user exists for testing
    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'staff'")
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
            INSERT INTO users (id, name, email, role, roomBox, joinDate, status, phone, password)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', ("staff-1", "John Staff", "staff@homebuddy.com", "staff", "-", "2024-01-15", "active", "+91 98765 43215", "staff123"))

    # Seed rooms if empty
    cursor.execute('SELECT COUNT(*) FROM rooms')
    if cursor.fetchone()[0] == 0:
        initial_rooms = [
            ("101", 1, "single", 8500, "available", "WiFi,AC", 0, 1, "", "https://images.unsplash.com/photo-1596276020587-8cc44fe84d00?auto=format&fit=crop&q=80&w=800,https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=800,https://images.unsplash.com/photo-1588854337236-40713be536c4?auto=format&fit=crop&q=80&w=800,https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=800", ""),
            ("102", 1, "double", 6500, "available", "WiFi", 0, 2, "", "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&q=80&w=800,https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=800,https://images.unsplash.com/photo-1588854337236-40713be536c4?auto=format&fit=crop&q=80&w=800,https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=800", ""),
            ("103", 1, "triple", 5000, "available", "WiFi", 0, 3, "", "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800,https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=800,https://images.unsplash.com/photo-1588854337236-40713be536c4?auto=format&fit=crop&q=80&w=800,https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=800", ""),
            ("201", 2, "single", 9000, "available", "WiFi,AC,Balcony", 0, 1, "", "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800,https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=800,https://images.unsplash.com/photo-1588854337236-40713be536c4?auto=format&fit=crop&q=80&w=800,https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=800", ""),
            ("202", 2, "double", 7000, "available", "WiFi,AC", 0, 2, "", "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&q=80&w=800,https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=800,https://images.unsplash.com/photo-1588854337236-40713be536c4?auto=format&fit=crop&q=80&w=800,https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=800", ""),
        ]
        cursor.executemany('INSERT INTO rooms VALUES (?,?,?,?,?,?,?,?,?,?,?)', initial_rooms)

    # Seed complaints if empty
    cursor.execute('SELECT COUNT(*) FROM complaints')
    if cursor.fetchone()[0] == 0:
        initial_complaints = [
            ("c1", "Fan not working", "The ceiling fan in my room makes a lot of noise and doesn't spin fast.", "electrical", "in-progress", "203", "Rahul Sharma", "2024-03-10", "2024-03-12"),
            ("c2", "Leaking tap", "The bathroom tap is leaking constantly.", "plumbing", "pending", "102", "Priya Patel", "2024-03-15", "2024-03-15"),
            ("c3", "WiFi signal weak", "Internet keeps disconnecting in the evening.", "other", "resolved", "204", "Amit Kumar", "2024-03-05", "2024-03-07"),
            ("c4", "Door lock issue", "The main door lock is jammed.", "security", "pending", "203", "Rahul Sharma", "2024-03-16", "2024-03-16")
        ]
        cursor.executemany('INSERT INTO complaints VALUES (?,?,?,?,?,?,?,?,?)', initial_complaints)

    # Seed payments if empty
    cursor.execute('SELECT COUNT(*) FROM payments')
    if cursor.fetchone()[0] == 0:
        initial_payments = [
            ("p1", "Rahul Sharma", "203", 5000, "March", 2024, "paid", "2024-03-05", "2024-03-04"),
            ("p2", "Priya Patel", "102", 7500, "March", 2024, "pending", "2024-03-05", ""),
            ("p3", "Amit Kumar", "204", 6500, "March", 2024, "overdue", "2024-03-05", ""),
            ("p4", "Rahul Sharma", "203", 5000, "February", 2024, "paid", "2024-02-05", "2024-02-03"),
            ("p5", "Priya Patel", "102", 7500, "February", 2024, "paid", "2024-02-05", "2024-02-05")
        ]
        cursor.executemany('INSERT INTO payments VALUES (?,?,?,?,?,?,?,?,?)', initial_payments)

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS staff (
            id TEXT PRIMARY KEY,
            name TEXT,
            role TEXT,
            phone TEXT,
            email TEXT,
            status TEXT,
            shift TEXT,
            joinDate TEXT
        )
    ''')

    # Seed staff if empty
    cursor.execute('SELECT COUNT(*) FROM staff')
    if cursor.fetchone()[0] == 0:
        initial_staff = [
            ("s1", "Amit Sharma", "Warden", "+91 98765 43220", "amit.s@example.com", "active", "Day", "2024-01-01")
        ]
        cursor.executemany('INSERT INTO staff (id, name, role, phone, email, status, shift, joinDate) VALUES (?,?,?,?,?,?,?,?)', initial_staff)

    # Seed visitors if empty
    cursor.execute('SELECT COUNT(*) FROM visitors')
    if cursor.fetchone()[0] == 0:
        initial_visitors = [
            ("v1", "Sunil Sharma", "Rahul Sharma", "Father", "2024-03-20", "10:00", "11:30", "completed"),
            ("v2", "Neha Patel", "Priya Patel", "Sister", "2024-03-21", "14:00", "", "active")
        ]
        cursor.executemany('INSERT INTO visitors VALUES (?,?,?,?,?,?,?,?)', initial_visitors)

    conn.commit()
    conn.close()

# API Endpoints
@app.route('/api/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    users = conn.execute('SELECT * FROM users').fetchall()
    conn.close()
    return jsonify([dict(u) for u in users])

@app.route('/api/users', methods=['POST'])
def add_user():
    data = request.json
    conn = get_db_connection()
    new_id = str(uuid.uuid4())
    conn.execute('''
        INSERT INTO users (id, name, email, role, roomBox, joinDate, status, phone, password)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (new_id, data['name'], data['email'], data['role'], data.get('roomBox', 'Unassigned'), data.get('joinDate', ''), 'active', data['phone'], data.get('password', 'password123')))
    
    # Sync with staff table if role is staff
    if data['role'] == 'staff':
        staff_id = 's' + new_id
        staff_specific_role = data.get('staffRole', 'General Staff')
        conn.execute('''
            INSERT INTO staff (id, name, role, phone, email, status, shift, joinDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (staff_id, data['name'], staff_specific_role, data['phone'], data['email'], 'active', 'Day', data.get('joinDate', '')))
        
    conn.commit()
    conn.close()
    return jsonify({"status": "success", "id": new_id})

@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"status": "error", "message": "Email and password are required"}), 400
        
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ? AND password = ?', (email, password)).fetchone()
    conn.close()
    
    if user:
        return jsonify({"status": "success", "user": dict(user)})
    else:
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401

@app.route('/api/rooms', methods=['GET'])
def get_rooms():
    conn = get_db_connection()
    rooms = conn.execute('SELECT * FROM rooms').fetchall()
    conn.close()
    result = []
    for r in rooms:
        room = dict(r)
        # Handle cases where amenities might already be a string or list
        if isinstance(room.get('amenities'), str):
            room['amenities'] = room['amenities'].split(',') if room['amenities'] else []
        elif room.get('amenities') is None:
            room['amenities'] = []
            
        if isinstance(room.get('residents'), str):
            room['residents'] = room['residents'].split(',') if room['residents'] else []
        elif room.get('residents') is None:
            room['residents'] = []
            
        if isinstance(room.get('images'), str):
            room['images'] = room['images'].split(',') if room['images'] else []
        elif room.get('images') is None:
            room['images'] = []
            
        result.append(room)
    return jsonify(result)

@app.route('/api/rooms', methods=['POST'])
def add_room():
    try:
        data = request.json
        print(f"Received add_room request: {data}")
        
        # Convert amenities list to string if necessary
        amenities = data.get('amenities', '')
        if isinstance(amenities, list):
            amenities = ','.join(amenities)
            
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO rooms (roomNumber, floor, type, rent, status, amenities, occupants, maxOccupants, residents, images, pendingUserId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['roomNumber'], 
            data['floor'], 
            data['type'], 
            data['rent'], 
            data.get('status', 'available'), 
            amenities, 
            0, 
            data['maxOccupants'], 
            '',
            ','.join(data.get('images', [])) if isinstance(data.get('images'), list) else data.get('images', ''),
            ''
        ))
        conn.commit()
        conn.close()
        print(f"Successfully added room {data['roomNumber']}")
        return jsonify({"status": "success"})
    except Exception as e:
        print(f"Error adding room: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/complaints', methods=['GET', 'POST'])
def handle_complaints():
    conn = get_db_connection()
    if request.method == 'GET':
        complaints = conn.execute('SELECT * FROM complaints').fetchall()
        conn.close()
        return jsonify([dict(c) for c in complaints])
    else:
        data = request.json
        new_id = str(os.urandom(4).hex())
        
        # Check if table has studentName column yet (for backwards compatibility without migration)
        # If not, alter the table.
        try:
            conn.execute('SELECT studentName FROM complaints LIMIT 1')
        except sqlite3.OperationalError:
            conn.execute('ALTER TABLE complaints ADD COLUMN studentName TEXT')
            
        conn.execute('''
            INSERT INTO complaints (id, title, description, category, status, roomNumber, studentName, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (new_id, data['title'], data['description'], data['category'], 'pending', data['roomNumber'], data.get('studentName', ''), data['createdAt'], data['updatedAt']))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "id": new_id})

@app.route('/api/complaints/<id>', methods=['PATCH'])
def update_complaint(id):
    data = request.json
    status = data.get('status')
    updated_at = data.get('updatedAt', '')
    conn = get_db_connection()
    conn.execute('UPDATE complaints SET status = ?, updatedAt = ? WHERE id = ?', (status, updated_at, id))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"})

@app.route('/api/rooms/<roomNumber>', methods=['PATCH'])
def update_room(roomNumber):
    data = request.json
    status = data.get('status')
    occupants_delta = data.get('occupantsDelta', 0)
    reset_occupants = data.get('reset', False)
    user_id = data.get('userId')
    
    conn = get_db_connection()
    print(f"DEBUG: Updating room {roomNumber} to status {status}, user_id={user_id}")
    
    if reset_occupants:
        # Before clearing the room, find who lives there and update their user record
        room = conn.execute('SELECT residents FROM rooms WHERE roomNumber = ?', (roomNumber,)).fetchone()
        if room and room['residents']:
            resident_names = room['residents'].split(',')
            for name in resident_names:
                if name.strip():
                    conn.execute("UPDATE users SET roomBox = 'Unassigned' WHERE name = ?", (name.strip(),))
        
        conn.execute("UPDATE rooms SET status = ?, occupants = 0, residents = '', pendingUserId = '' WHERE roomNumber = ?", (status, roomNumber))
    elif status == 'pending' and user_id:
        print(f"DEBUG: Setting pendingUserId {user_id} for room {roomNumber}")
        conn.execute("UPDATE rooms SET status = ?, pendingUserId = ? WHERE roomNumber = ?", (status, user_id, roomNumber))
    elif status == 'occupied':
        room = conn.execute('SELECT pendingUserId, residents FROM rooms WHERE roomNumber = ?', (roomNumber,)).fetchone()
        pending_uid = room['pendingUserId']
        print(f"DEBUG: Room {roomNumber} transition to occupied. Found pendingUserId: {pending_uid}")
        
        if pending_uid:
            user = conn.execute('SELECT name FROM users WHERE id = ?', (pending_uid,)).fetchone()
            if user:
                user_name = user['name']
                print(f"DEBUG: Found user {user_name} (ID: {pending_uid}). Updating user.roomBox and room residents.")
                conn.execute('UPDATE users SET roomBox = ? WHERE id = ?', (roomNumber, pending_uid))
                current_residents = room['residents']
                new_residents = f"{current_residents},{user_name}" if current_residents else user_name
                conn.execute('''
                    UPDATE rooms 
                    SET status = 'occupied', 
                        occupants = occupants + 1, 
                        residents = ?, 
                        pendingUserId = '' 
                    WHERE roomNumber = ?
                ''', (new_residents, roomNumber))
            else:
                print(f"WARNING: User ID {pending_uid} not found in users table.")
                conn.execute('UPDATE rooms SET status = ?, occupants = occupants + ? WHERE roomNumber = ?', (status, occupants_delta, roomNumber))
        else:
            print(f"DEBUG: No pendingUserId found for room {roomNumber}. Performing fallback update.")
            conn.execute('UPDATE rooms SET status = ?, occupants = occupants + ? WHERE roomNumber = ?', (status, occupants_delta, roomNumber))
    else:
        conn.execute('UPDATE rooms SET status = ?, occupants = occupants + ? WHERE roomNumber = ?', (status, occupants_delta, roomNumber))
        
    conn.commit()
    conn.close()
    return jsonify({"status": "success"})

@app.route('/api/rooms/<roomNumber>', methods=['PUT'])
def edit_room(roomNumber):
    data = request.json
    conn = get_db_connection()
    amenities = data.get('amenities', '')
    if isinstance(amenities, list):
        amenities = ','.join(amenities)
        
    conn.execute('''
        UPDATE rooms 
        SET floor = ?, type = ?, rent = ?, maxOccupants = ?, amenities = ?
        WHERE roomNumber = ?
    ''', (data['floor'], data['type'], data['rent'], data['maxOccupants'], amenities, roomNumber))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"})

@app.route('/api/rooms/<roomNumber>', methods=['DELETE'])
def delete_room(roomNumber):
    conn = get_db_connection()
    conn.execute('DELETE FROM rooms WHERE roomNumber = ?', (roomNumber,))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"})

@app.route('/api/payments', methods=['GET'])
def get_payments():
    conn = get_db_connection()
    payments = conn.execute('SELECT * FROM payments').fetchall()
    conn.close()
    return jsonify([dict(p) for p in payments])

@app.route('/api/payments', methods=['POST'])
def add_payment():
    data = request.json
    new_id = str(os.urandom(4).hex())
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO payments (id, studentName, roomNumber, amount, month, year, status, dueDate, paidDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (new_id, data.get('studentName'), data['roomNumber'], data['amount'], data['month'], data.get('year'), data['status'], data['dueDate'], data.get('paidDate')))
    conn.commit()
    conn.close()
    return jsonify({"status": "success", "id": new_id})

@app.route('/api/payments/<id>', methods=['PATCH'])
def update_payment(id):
    data = request.json
    status = data.get('status')
    paid_date = data.get('paidDate')
    conn = get_db_connection()
    if paid_date:
        conn.execute('UPDATE payments SET status = ?, paidDate = ? WHERE id = ?', (status, paid_date, id))
    else:
        conn.execute('UPDATE payments SET status = ? WHERE id = ?', (status, id))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"})

@app.route('/api/allocate', methods=['POST'])
def allocate_room():
    data = request.json
    user_id = data['userId']
    room_number = data['roomNumber']
    
    conn = get_db_connection()
    # Find user name
    user = conn.execute('SELECT name FROM users WHERE id = ?', (user_id,)).fetchone()
    if not user:
        conn.close()
        return jsonify({"status": "error", "message": "User not found"}), 404
        
    user_name = user['name']
    
    # Update user
    conn.execute('UPDATE users SET roomBox = ? WHERE id = ?', (room_number, user_id))
    
    # Update room: increment occupants AND add to residents list
    room = conn.execute('SELECT residents FROM rooms WHERE roomNumber = ?', (room_number,)).fetchone()
    if room:
        current_residents = room['residents'] or ""
        residents_list = [r.strip() for r in current_residents.split(',') if r.strip()]
        if user_name not in residents_list:
            residents_list.append(user_name)
        new_residents = ','.join(residents_list)
        
        conn.execute('''
            UPDATE rooms 
            SET status = 'occupied', 
                occupants = ?, 
                residents = ? 
            WHERE roomNumber = ?
        ''', (len(residents_list), new_residents, room_number))
        
    conn.commit()
    conn.close()
    return jsonify({"status": "success"})

@app.route('/api/messages', methods=['GET'])
def get_messages():
    conn = get_db_connection()
    messages = conn.execute('SELECT * FROM messages ORDER BY createdAt DESC').fetchall()
    conn.close()
    return jsonify([dict(m) for m in messages])

@app.route('/api/messages/<id>', methods=['PATCH'])
def update_message(id):
    data = request.json
    status = data.get('status')
    conn = get_db_connection()
    conn.execute('UPDATE messages SET status = ? WHERE id = ?', (status, id))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"})

@app.route('/api/messages', methods=['POST'])
def add_message():
    data = request.json
    new_id = str(os.urandom(4).hex())
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO messages (id, firstName, lastName, email, message, createdAt, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (new_id, data['firstName'], data['lastName'], data['email'], data['message'], data.get('createdAt', ''), 'unread'))
    conn.commit()
    conn.close()
    return jsonify({"status": "success", "id": new_id})

@app.route('/api/staff', methods=['GET'])
def get_staff():
    conn = get_db_connection()
    staff = conn.execute('SELECT * FROM staff').fetchall()
    conn.close()
    return jsonify([dict(s) for s in staff])

@app.route('/api/staff', methods=['POST'])
def add_staff():
    data = request.json
    conn = get_db_connection()
    new_id = 's-' + str(os.urandom(4).hex())
    conn.execute('''
        INSERT INTO staff (id, name, role, phone, email, status, shift, joinDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (new_id, data['name'], data['role'], data['phone'], data['email'], data.get('status', 'active'), data['shift'], data['joinDate']))
    
    # Also add to users table for login
    user_id = str(uuid.uuid4())
    conn.execute('''
        INSERT INTO users (id, name, email, role, roomBox, joinDate, status, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, data['name'], data['email'], 'staff', 'Unassigned', data['joinDate'], 'active', data['phone']))
    
    conn.commit()
    conn.close()
    return jsonify({"status": "success", "id": new_id})

@app.route('/api/staff/<id>', methods=['PATCH'])
def update_staff(id):
    data = request.json
    conn = get_db_connection()
    
    # Dynamically build the UPDATE query
    fields = []
    values = []
    for key in ['name', 'role', 'phone', 'email', 'status', 'shift', 'joinDate']:
        if key in data:
            fields.append(f"{key} = ?")
            values.append(data[key])
    
    if not fields:
        return jsonify({"status": "error", "message": "No fields to update"}), 400
        
    values.append(id)
    query = f"UPDATE staff SET {', '.join(fields)} WHERE id = ?"
    conn.execute(query, tuple(values))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"})

@app.route('/api/staff/<id>', methods=['DELETE'])
def delete_staff(id):
    conn = get_db_connection()
    # Get staff email to remove from users too
    staff = conn.execute('SELECT email FROM staff WHERE id = ?', (id,)).fetchone()
    if staff:
        conn.execute('DELETE FROM users WHERE email = ?', (staff['email'],))
        
    conn.execute('DELETE FROM staff WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"})

@app.route('/api/visitors', methods=['GET'])
def get_visitors():
    conn = get_db_connection()
    visitors = conn.execute('SELECT * FROM visitors').fetchall()
    conn.close()
    return jsonify([dict(v) for v in visitors])

if __name__ == '__main__':
    init_db()
    try:
        app.run(port=5000, debug=True, use_reloader=False)
    except Exception as e:
        import traceback
        traceback.print_exc()
