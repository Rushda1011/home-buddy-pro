import { User, Room, Complaint, Payment, Staff, Visitor, Message } from './data-service';

export interface AppData {
    users: User[];
    rooms: Room[];
    complaints: Complaint[];
    payments: Payment[];
    staff: Staff[];
    visitors: Visitor[];
    messages: Message[];
}

export const INITIAL_DATA: AppData = {
  "users": [
    {
      "id": "1",
      "name": "Riya Sharma",
      "email": "riya.s@example.com",
      "role": "student",
      "roomBox": "203",
      "joinDate": "2024-01-14",
      "status": "active",
      "phone": "+91 98765 43210"
    },
    {
      "id": "2",
      "name": "Priya Patel",
      "email": "priya.p@example.com",
      "role": "student",
      "roomBox": "102",
      "joinDate": "2024-01-10",
      "status": "active",
      "phone": "+91 98765 43211"
    },
    {
      "id": "3",
      "name": "Admin User",
      "email": "admin@homebuddy.com",
      "role": "admin",
      "roomBox": "-",
      "joinDate": "2023-12-01",
      "status": "active",
      "phone": "+91 98765 43212"
    },
    {
      "id": "4",
      "name": "Amita Kumari",
      "email": "amita.k@example.com",
      "role": "student",
      "roomBox": "204",
      "joinDate": "2024-01-15",
      "status": "pending",
      "phone": "+91 98765 43213"
    },
    {
      "id": "staff-1",
      "name": "Jane Staff",
      "email": "staff@homebuddy.com",
      "role": "staff",
      "roomBox": "-",
      "joinDate": "2024-01-15",
      "status": "active",
      "phone": "+91 98765 43215"
    },
    {
      "id": "6",
      "name": "Airaah",
      "email": "airaah@staff.com",
      "role": "staff",
      "roomBox": "Unassigned",
      "joinDate": "2024-03-10",
      "status": "active",
      "phone": "8495761320"
    },
    {
      "id": "shifa-1",
      "name": "Shifa",
      "email": "shifa@student.com",
      "role": "student",
      "roomBox": "101",
      "joinDate": "2026-03-19",
      "status": "active",
      "phone": "0000000000"
    },
    {
      "id": "4d8c1782-feef-4fbf-9cac-e71011dbb82c",
      "name": "Adhila Fathima",
      "email": "adz@gmail.com",
      "role": "student",
      "roomBox": "101",
      "joinDate": "2024-02-15",
      "status": "active",
      "phone": "9784521364"
    },
    {
      "id": "5faf2124-5ed6-4a04-bbb6-fd32a41da62e",
      "name": "Reetha",
      "email": "reetha@gmail.com",
      "role": "student",
      "roomBox": "401",
      "joinDate": "2024-03-18",
      "status": "active",
      "phone": "9632587410"
    }
  ],
  "rooms": [
    {
      "roomNumber": "101",
      "floor": 1,
      "type": "single",
      "rent": 8500,
      "status": "occupied",
      "amenities": ["WiFi", "AC"],
      "occupants": 2,
      "maxOccupants": 2,
      "residents": ["Adhila Fathima", "Shifa"],
      "images": ["https://www.homversity.com/site_assets/img/Property-Photos/3253_46_1669205665.jpg"]
    },
    {
      "roomNumber": "102",
      "floor": 2,
      "type": "single",
      "rent": 7500,
      "status": "occupied",
      "amenities": ["WiFi", "Study Table"],
      "occupants": 1,
      "maxOccupants": 1,
      "residents": ["Priya Patel"],
      "images": ["https://s3.collegedisha.com/collegedisha/institutes/gallery/SVNIT_hostel.webp"]
    },
    {
      "roomNumber": "203",
      "floor": 2,
      "type": "triple",
      "rent": 6000,
      "status": "occupied",
      "amenities": ["WiFi", "AC", "Study Table"],
      "occupants": 1,
      "maxOccupants": 3,
      "residents": ["Riya Sharma"],
      "images": ["https://thumbs.dreamstime.com/b/dorm-room-cheap-hostel-level-beds-european-table-one-chair-41238352.jpg?w=576"]
    },
    {
      "roomNumber": "204",
      "floor": 2,
      "type": "double",
      "rent": 6500,
      "status": "occupied",
      "amenities": ["WiFi", "Study Table"],
      "occupants": 2,
      "maxOccupants": 2,
      "residents": ["Amita Kumari", "Sureshmi Raina"],
      "images": ["https://www.svnit.ac.in/web/hostels1/mtb/image/room.png"]
    },
    {
      "roomNumber": "401",
      "floor": 1,
      "type": "double",
      "rent": 7500,
      "status": "occupied",
      "amenities": ["WiFi"],
      "occupants": 1,
      "maxOccupants": 2,
      "residents": ["Reetha"],
      "images": ["https://www.homversity.com/site_assets/img/Property-Photos/3253_46_1669205665.jpg"]
    },
    {
      "roomNumber": "402",
      "floor": 2,
      "type": "double",
      "rent": 5580,
      "status": "available",
      "amenities": ["WiFi", "Balcony"],
      "occupants": 0,
      "maxOccupants": 2,
      "residents": [],
      "images": ["https://www.svnit.ac.in/web/hostels1/mtb/image/room.png"]
    }
  ],
  "complaints": [
    {
      "id": "c1",
      "title": "Fan not working",
      "description": "The ceiling fan in my room makes a lot of noise and doesn't spin fast.",
      "category": "electrical",
      "status": "in-progress",
      "roomNumber": "203",
      "studentName": "Riya Sharma",
      "createdAt": "2024-03-10",
      "updatedAt": "2024-03-12"
    },
    {
      "id": "c2",
      "title": "Leaking tap",
      "description": "The bathroom tap is leaking constantly.",
      "category": "plumbing",
      "status": "pending",
      "roomNumber": "102",
      "studentName": "Priya Patel",
      "createdAt": "2024-03-15",
      "updatedAt": "2024-03-15"
    },
    {
      "id": "c3",
      "title": "WiFi signal weak",
      "description": "Internet keeps disconnecting in the evening.",
      "category": "other",
      "status": "resolved",
      "roomNumber": "204",
      "studentName": "Amita Kumari",
      "createdAt": "2024-03-05",
      "updatedAt": "2024-03-07"
    },
    {
      "id": "c4",
      "title": "Door lock issue",
      "description": "The main door lock is jammed.",
      "category": "security",
      "status": "pending",
      "roomNumber": "203",
      "studentName": "Riya Sharma",
      "createdAt": "2024-03-16",
      "updatedAt": "2024-03-16"
    }
  ],
  "payments": [
    {
      "id": "p1",
      "studentName": "Riya Sharma",
      "roomNumber": "203",
      "amount": 5000,
      "month": "March",
      "year": 2024,
      "status": "paid",
      "dueDate": "2024-03-05",
      "paidDate": "2024-03-04"
    },
    {
      "id": "p2",
      "studentName": "Priya Patel",
      "roomNumber": "102",
      "amount": 7500,
      "month": "March",
      "year": 2024,
      "status": "paid",
      "dueDate": "2024-03-05",
      "paidDate": "2026-04-10"
    },
    {
      "id": "p3",
      "studentName": "Amita Kumari",
      "roomNumber": "204",
      "amount": 6500,
      "month": "March",
      "year": 2024,
      "status": "paid",
      "dueDate": "2024-03-05",
      "paidDate": "2026-03-18"
    },
    {
      "id": "p4",
      "studentName": "Riya Sharma",
      "roomNumber": "203",
      "amount": 5000,
      "month": "February",
      "year": 2024,
      "status": "paid",
      "dueDate": "2024-02-05",
      "paidDate": "2024-02-03"
    },
    {
      "id": "p5",
      "studentName": "Priya Patel",
      "roomNumber": "102",
      "amount": 7500,
      "month": "February",
      "year": 2024,
      "status": "paid",
      "dueDate": "2024-02-05",
      "paidDate": "2024-02-05"
    }
  ],
  "messages": [
    {
      "id": "d13e3c52",
      "firstName": "Anakha",
      "lastName": "Dinesan",
      "email": "angu@gmail.com",
      "message": "How are the closing times of the hostel?",
      "createdAt": "2026-03-18T18:28:44.260Z",
      "status": "unread"
    }
  ],
  "staff": [
    {
      "id": "s1",
      "name": "Rethi Devi",
      "role": "Warden",
      "phone": "+91 98765 43220",
      "email": "rethy@gmail.com",
      "status": "active",
      "shift": "Day",
      "joinDate": "2024-01-01"
    },
    {
      "id": "s2",
      "name": "Thahira",
      "role": "Cook",
      "phone": "+91 98765 43221",
      "email": "thahira@gmail.com",
      "status": "active",
      "shift": "Day",
      "joinDate": "2024-02-01"
    },
    {
      "id": "s3",
      "name": "Kalpana",
      "role": "Security",
      "phone": "+91 98765 43222",
      "email": "kalpana@gmail.com",
      "status": "active",
      "shift": "Night",
      "joinDate": "2024-03-01"
    }
  ],
  "visitors": [
    {
      "id": "v1",
      "visitorName": "Sunila Sharma",
      "studentName": "Riya Sharma",
      "relation": "Mother",
      "visitDate": "2024-03-20",
      "checkIn": "10:00",
      "checkOut": "11:30",
      "status": "completed"
    },
    {
      "id": "v2",
      "visitorName": "Neha Patel",
      "studentName": "Priya Patel",
      "relation": "Sister",
      "visitDate": "2024-03-21",
      "checkIn": "14:00",
      "checkOut": "",
      "status": "active"
    }
  ]
};
