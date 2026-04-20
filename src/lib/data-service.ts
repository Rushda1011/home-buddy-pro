export interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'admin' | 'staff';
    roomBox: string;
    joinDate: string;
    status: 'active' | 'pending';
    phone: string;
}

export type RoomStatus = "available" | "occupied" | "pending" | "maintenance";
export type RoomType = "single" | "double" | "triple";

export type ComplaintStatus = "pending" | "in-progress" | "resolved";
export type ComplaintCategory = "maintenance" | "electrical" | "plumbing" | "security" | "other";

export interface Message {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    message: string;
    createdAt: string;
    status: 'unread' | 'replied';
}

export interface Complaint {
    id: string;
    title: string;
    description: string;
    category: ComplaintCategory;
    status: ComplaintStatus;
    roomNumber: string;
    studentName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Room {
    roomNumber: string;
    floor: number;
    type: RoomType;
    rent: number;
    status: RoomStatus;
    amenities: string[];
    occupants: number;
    maxOccupants: number;
    residents?: string[];
    images?: string[];
}

export type PaymentStatus = "paid" | "pending" | "overdue";

export interface Payment {
    id: string;
    studentName?: string;
    roomNumber: string;
    amount: number;
    month: string;
    year?: number;
    status: PaymentStatus;
    dueDate: string;
    paidDate?: string;
}

export interface Staff {
    id: string;
    name: string;
    role: string;
    phone: string;
    email: string;
    status: 'active' | 'on-leave' | 'inactive';
    shift: 'Day' | 'Night' | 'Evening';
    joinDate: string;
}

export interface Visitor {
    id: string;
    visitorName: string;
    studentName: string;
    relation: string;
    visitDate: string;
    checkIn: string;
    checkOut?: string;
    status: 'active' | 'completed';
}

const API_BASE = 'http://127.0.0.1:5000/api';

export const getUsers = async (): Promise<User[]> => {
    try {
        const res = await fetch(`${API_BASE}/users`);
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch users", e);
        return [];
    }
};

export const getUser = async (id: string): Promise<User | null> => {
    try {
        const res = await fetch(`${API_BASE}/users`);
        const users = await res.json();
        return users.find((u: User) => u.id === id) || null;
    } catch (e) {
        console.error("Failed to fetch user", e);
        return null;
    }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
    try {
        const res = await fetch(`${API_BASE}/users`);
        const users = await res.json();
        return users.find((u: User) => u.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (e) {
        console.error("Failed to fetch user by email", e);
        return null;
    }
};

export const addUser = async (user: Omit<User, 'id' | 'joinDate' | 'status' | 'roomBox'> & { password?: string, staffRole?: string }) => {
    const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    return await res.json();
};

export const loginUser = async (credentials: { email: string; password: string }) => {
    const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    
    if (!res.ok) {
        throw new Error('Invalid email or password');
    }
    
    return await res.json();
};

export const getCurrentUser = (): User | null => {
    const saved = localStorage.getItem('currentUser');
    if (!saved) return null;
    return JSON.parse(saved);
};

export const getComplaints = async (): Promise<Complaint[]> => {
    try {
        const res = await fetch(`${API_BASE}/complaints`);
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch complaints", e);
        return [];
    }
};

export const addComplaint = async (complaint: Omit<Complaint, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const res = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...complaint,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        })
    });
    return await res.json();
};

export const updateComplaintStatus = async (id: string, status: ComplaintStatus) => {
    await fetch(`${API_BASE}/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            status,
            updatedAt: new Date().toISOString().split('T')[0]
        })
    });
};

export const getRooms = async (): Promise<Room[]> => {
    try {
        const res = await fetch(`${API_BASE}/rooms`);
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch rooms", e);
        return [];
    }
};

export const updateRoomStatus = async (roomNumber: string, status: RoomStatus, occupantsDelta: number = 0, userId?: string) => {
    await fetch(`${API_BASE}/rooms/${roomNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, occupantsDelta, userId })
    });
};

export const deallocateRoom = async (roomNumber: string) => {
    await fetch(`${API_BASE}/rooms/${roomNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'available', reset: true })
    });
};

export const updateRoomDetails = async (roomNumber: string, room: Omit<Room, 'residents' | 'occupants' | 'status'>) => {
    await fetch(`${API_BASE}/rooms/${roomNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room)
    });
};

export const deleteRoom = async (roomNumber: string) => {
    await fetch(`${API_BASE}/rooms/${roomNumber}`, {
        method: 'DELETE'
    });
};

export const addRoom = async (room: Omit<Room, 'residents' | 'occupants'>) => {
    const res = await fetch(`${API_BASE}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room)
    });
    return await res.json();
};

export const getPayments = async (): Promise<Payment[]> => {
    try {
        const res = await fetch(`${API_BASE}/payments`);
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch payments", e);
        return [];
    }
};

export const updatePaymentStatus = async (id: string, status: PaymentStatus, paidDate?: string) => {
    await fetch(`${API_BASE}/payments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, paidDate })
    });
};

export const addPayment = async (payment: Omit<Payment, 'id'>) => {
    const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment)
    });
    return await res.json();
};

export const allocateRoom = async (userId: string, roomNumber: string) => {
    await fetch(`${API_BASE}/allocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roomNumber })
    });
};

export const addInquiry = async (inquiry: { firstName: string; lastName: string; email: string; message: string }) => {
    const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...inquiry,
            createdAt: new Date().toISOString()
        })
    });
    return await res.json();
};

export const getMessages = async (): Promise<Message[]> => {
    try {
        const res = await fetch(`${API_BASE}/messages`);
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch messages", e);
        return [];
    }
};

export const updateMessageStatus = async (id: string, status: 'unread' | 'replied') => {
    await fetch(`${API_BASE}/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
};

export const getStaff = async (): Promise<Staff[]> => {
    try {
        const res = await fetch(`${API_BASE}/staff`);
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch staff", e);
        return [];
    }
};

export const addStaff = async (staff: Omit<Staff, 'id'>) => {
    const res = await fetch(`${API_BASE}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staff)
    });
    return await res.json();
};

export const updateStaff = async (id: string, staff: Partial<Staff>) => {
    await fetch(`${API_BASE}/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staff)
    });
};

export const deleteStaff = async (id: string) => {
    await fetch(`${API_BASE}/staff/${id}`, {
        method: 'DELETE'
    });
};

export const getVisitors = async (): Promise<Visitor[]> => {
    try {
        const res = await fetch(`${API_BASE}/visitors`);
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch visitors", e);
        return [];
    }
};
