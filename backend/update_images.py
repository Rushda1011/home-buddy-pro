import sqlite3

# Image mapping by room type
# Single: 1 bed, wardrobe (Swami Vivekanand)
# Double: 2 beds visible (Boys Hostel Room)
# Triple: multi-bed (using both images to show a larger room feel)
SINGLE_IMG = "https://s3.collegedisha.com/collegedisha/institutes/gallery/SVNIT_hostel.webp"
SINGLE_AC_IMG = "https://www.homversity.com/site_assets/img/Property-Photos/3253_46_1669205665.jpg"
DOUBLE_IMG = "https://www.svnit.ac.in/web/hostels1/mtb/image/room.png"
TRIPLE_IMG = "https://thumbs.dreamstime.com/b/dorm-room-cheap-hostel-level-beds-european-table-one-chair-41238352.jpg?w=576"

conn = sqlite3.connect('database.db')
try:
    rooms = conn.execute("SELECT roomNumber, type, amenities FROM rooms").fetchall()
    print(f"Found {len(rooms)} rooms")
    
    for (room_num, room_type, amenities) in rooms:
        amenities = amenities or ""
        if room_type == 'single':
            if 'AC' in amenities.upper():
                images = SINGLE_AC_IMG
            else:
                images = SINGLE_IMG
        elif room_type == 'double':
            images = DOUBLE_IMG
        else:  # triple
            images = TRIPLE_IMG
        
        conn.execute("UPDATE rooms SET images = ? WHERE roomNumber = ?", (images, room_num))
        print(f"  Room {room_num} ({room_type}, {'AC' if 'AC' in amenities.upper() else 'Non-AC'}) OK")
    
    conn.commit()
    print("\nDone! Each room type now has its correct image.")
finally:
    conn.close()
