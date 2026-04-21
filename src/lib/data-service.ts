import { INITIAL_DATA, AppData } from './mock-data';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'admin' | 'staff';
    roomBox: string;
    joinDate: string;
    status: 'active' | 'pending';
    phone: string;
    password?: string;
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

// Demo Mode Detection - Broadened to ensure it works on localhost during dev
let FORCE_DEMO = localStorage.getItem('force_demo') === 'true';

const IS_DEMO_MODE = 
    FORCE_DEMO ||
    window.location.hostname.includes('github.io') || 
    window.location.hostname.includes('stackblitz') || 
    window.location.hostname.includes('netlify.app') ||
    window.location.hostname.includes('localhost') || 
    window.location.hostname.includes('127.0.0.1');

// Helper to manage persistent state in Demo Mode
const getDemoData = (): AppData => {
    const saved = localStorage.getItem('demo_data');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('demo_data', JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
};

const saveDemoData = (data: AppData) => {
    localStorage.setItem('demo_data', JSON.stringify(data));
};

export const getUsers = async (): Promise<User[]> => {
    if (IS_DEMO_MODE) return getDemoData().users;
    try {
        const res = await fetch(`${API_BASE}/users`);
        if (!res.ok) throw new Error();
        return await res.json();
    } catch (e) {
        console.warn("API unreachable, falling back to Demo Mode");
        return getDemoData().users;
    }
};

export const getUser = async (id: string): Promise<User | null> => {
    if (IS_DEMO_MODE) return getDemoData().users.find(u => u.id === id) || null;
    try {
        const res = await fetch(`${API_BASE}/users`);
        const users = await res.json();
        return users.find((u: User) => u.id === id) || null;
    } catch (e) {
        return getDemoData().users.find(u => u.id === id) || null;
    }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
    if (IS_DEMO_MODE) return getDemoData().users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    try {
        const res = await fetch(`${API_BASE}/users`);
        const users = await res.json();
        return users.find((u: User) => u.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (e) {
        return getDemoData().users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
};

export const addUser = async (user: Omit<User, 'id' | 'joinDate' | 'status' | 'roomBox'> & { password?: string, staffRole?: string }) => {
    if (IS_DEMO_MODE) {
        const data = getDemoData();
        const newUser: User = {
            ...user,
            id: Math.random().toString(36).substr(2, 9),
            joinDate: new Date().toISOString().split('T')[0],
            status: 'active',
            roomBox: 'Unassigned'
        };
        data.users.push(newUser);
        saveDemoData(data);
        return newUser;
    }
    const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    return await res.json();
};

export const loginUser = async (credentials: { email: string; password: string }) => {
    const data = getDemoData();
    const demoLogin = () => {
        const user = data.users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
        
        if (user && user.password && user.password === credentials.password) {
            return { user };
        }
        
        // Handle case where user might not have a password yet (shouldn't happen after my update)
        if (user && !user.password) {
            console.warn("User record missing password field, allowing login for migration");
            return { user };
        }

        throw new Error('Invalid email or password');
    };

    if (IS_DEMO_MODE) return demoLogin();

    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        
        if (!res.ok) {
            throw new Error('Invalid email or password');
        }
        
        return await res.json();
    } catch (e) {
        if (e instanceof Error && e.message === 'Invalid email or password') throw e;
        console.warn("Backend login failed, attempting demo login fallback");
        return demoLogin();
    }
};

export const getCurrentUser = (): User | null => {
    const saved = localStorage.getItem('currentUser');
    if (!saved) return null;
    return JSON.parse(saved);
};

export const getComplaints = async (): Promise<Complaint[]> => {
    if (IS_DEMO_MODE) return getDemoData().complaints;
    try {
        const res = await fetch(`${API_BASE}/complaints`);
        return await res.json();
    } catch (e) {
        return getDemoData().complaints;
    }
};

export const addComplaint = async (complaint: Omit<Complaint, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    if (IS_DEMO_MODE) {
        const data = getDemoData();
        const newComplaint: Complaint = {
            ...complaint,
            id: `c${data.complaints.length + 1}`,
            status: 'pending',
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };
        data.complaints.push(newComplaint);
        saveDemoData(data);
        return newComplaint;
    }
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
    if (IS_DEMO_MODE) {
        const data = getDemoData();
        const complaint = data.complaints.find(c => c.id === id);
        if (complaint) {
            complaint.status = status;
            complaint.updatedAt = new Date().toISOString().split('T')[0];
            saveDemoData(data);
        }
        return;
    }
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
    if (IS_DEMO_MODE) return getDemoData().rooms;
    try {
        const res = await fetch(`${API_BASE}/rooms`);
        return await res.json();
    } catch (e) {
        return getDemoData().rooms;
    }
};

export const updateRoomStatus = async (roomNumber: string, status: RoomStatus, occupantsDelta: number = 0, userId?: string) => {
    if (IS_DEMO_MODE) {
        const data = getDemoData();
        const room = data.rooms.find(r => r.roomNumber === roomNumber);
        if (room) {
            room.status = status;
            room.occupants = (room.occupants || 0) + occupantsDelta;
            if (userId) {
                const user = data.users.find(u => u.id === userId);
                if (user) {
                    if (status === 'occupied') {
                        room.residents = [...(room.residents || []), user.name];
                        user.roomBox = roomNumber;
                    } else if (status === 'available') {
                        room.residents = (room.residents || []).filter(r => r !== user.name);
                        user.roomBox = 'Unassigned';
                    }
                }
            }
            saveDemoData(data);
        }
        return;
    }
    await fetch(`${API_BASE}/rooms/${roomNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, occupantsDelta, userId })
    });
};

export const deallocateRoom = async (roomNumber: string) => {
    if (IS_DEMO_MODE) {
        const data = getDemoData();
        const room = data.rooms.find(r => r.roomNumber === roomNumber);
        if (room) {
            const residentNames = room.residents || [];
            data.users.forEach(u => {
                if (residentNames.includes(u.name)) u.roomBox = 'Unassigned';
            });
            room.status = 'available';
            room.occupants = 0;
            room.residents = [];
            saveDemoData(data);
        }
        return;
    }
    await fetch(`${API_BASE}/rooms/${roomNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'available', reset: true })
    });
};

export const updateRoomDetails = async (roomNumber: string, room: Omit<Room, 'residents' | 'occupants' | 'status'>) => {
    if (IS_DEMO_MODE) {
        const data = getDemoData();
        const existingRoom = data.rooms.find(r => r.roomNumber === roomNumber);
        if (existingRoom) {
            Object.assign(existingRoom, room);
            saveDemoData(data);
        }
        return;
    }
    await fetch(`${API_BASE}/rooms/${roomNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room)
    });
};

export const deleteRoom = async (roomNumber: string) => {
    if (IS_DEMO_MODE) {
        const data = getDemoData();
        data.rooms = data.rooms.filter(r => r.roomNumber !== roomNumber);
        saveDemoData(data);
        return;
    }
    await fetch(`${API_BASE}/rooms/${roomNumber}`, {
        method: 'DELETE'
    });
};

export const addRoom = async (room: Omit<Room, 'residents' | 'occupants'>) => {
    if (IS_DEMO_MODE) {
        const data = getDemoData();
        const newRoom: Room = { ...room, residents: [], occupants: 0 };
        data.rooms.push(newRoom);
        saveDemoData(data);
        return newRoom;
    }
    const res = await fetch(`${API_BASE}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room)
    });
    return await res.json();
};

export const getPayments = async (): Promise<Payment[]> => {
    if (IS_DEMO_MODE) return getDemoData().payments;
    try {
        const res = await fetch(`${API_BASE}/payments`);
        return await res.json();
    } catch (e) {
        return getDemoData().payments;
    }
};

export const updatePaymentStatus = async (id: string, status: PaymentStatus, paidDate?: string) => {
    if (IS_DEMO_MODE) {
        const data = getDemoData();
        const payment = data.payments.find(p => p.id === id);
        if (payment) {
            payment.status = status;
            payment.paidDate = paidDate;
            saveDemoData(data);
        }
        return;
    }
    await fetch(`${API_BASE}/payments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, paidDate })
    });
};

export const addPayment = async (payment: Omit<Payment, 'id'>) => {
    if (IS_DEMO_MODE) {
        const data = getDemoData();
        const newPayment: Payment = { ...payment, id: `p${data.payments.length + 1}` };
        data.payments.push(newPayment);
        saveDemoData(data);
        return newPayment;
    }
    const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment)
    });
    return await res.json();
};

export const allocateRoom = async (userId: string, roomNumber: string) => {
    if (IS_DEMO_MODE) {
        const data = getDemoData();
        const user = data.users.find(u => u.id === userId);
        const room = data.rooms.find(r => r.roomNumber === roomNumber);
        if (user && room) {
            user.roomBox = roomNumber;
            room.status = 'occupied';
            room.occupants = (room.occupants || 0) + 1;
            room.residents = [...(room.residents || []), user.name];
            saveDemoData(data);
        }
        return;
    }
    await fetch(`${API_BASE}/allocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roomNumber })
    });
};

export const addInquiry = async (inquiry: { firstName: string; lastName: string; email: string; message: string }) => {
    if (IS_DEMO_MODE) {
        const data = getDemoData();
        const newMessage: Message = { ...inquiry, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString(), status: 'unread' };
        data.messages.push(newMessage);
        saveDemoData(data);
        return newMessage;
    }
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
    if (IS_DEMO_MODE) return getDemoData().messages;
    try {
        const res = await fetch(`${API_BASE}/messages`);
        return await res.json();
    } catch (e) {
        return getDemoData().messages;
    }
};

export const updateMessageStatus = async (id: string, status: 'unread' | 'replied') => {
    if (IS_DEMO_MODE) {
        const data = getDemoData();
        const msg = data.messages.find(m => m.id === id);
        if (msg) {
            msg.status = status;
            saveDemoData(data);
        }
        return;
    }
    await fetch(`${API_BASE}/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
};

export const getStaff = async (): Promise<Staff[]> => {
    if (IS_DEMO_MODE) return getDemoData().staff;
    try {
        const res = await fetch(`${API_BASE}/staff`);
        return await res.json();
    } catch (e) {
        return getDemoData().staff;
    }
};

export const addStaff = async (staff: Omit<Staff, 'id'>) => {
    if (IS_DEMO_MODE) {
        const data = getDemoData();
        const newStaff: Staff = { ...staff, id: `s${data.staff.length + 1}` };
        data.staff.push(newStaff);
        saveDemoData(data);
        return newStaff;
    }
    const res = await fetch(`${API_BASE}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staff)
    });
    return await res.json();
};

export const updateStaff = async (id: string, staff: Partial<Staff>) => {
    if (IS_DEMO_MODE) {
        const data = getDemoData();
        const st = data.staff.find(s => s.id === id);
        if (st) {
            Object.assign(st, staff);
            saveDemoData(data);
        }
        return;
    }
    await fetch(`${API_BASE}/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staff)
    });
};

export const deleteStaff = async (id: string) => {
    if (IS_DEMO_MODE) {
        const data = getDemoData();
        data.staff = data.staff.filter(s => s.id !== id);
        saveDemoData(data);
        return;
    }
    await fetch(`${API_BASE}/staff/${id}`, {
        method: 'DELETE'
    });
};

export const getVisitors = async (): Promise<Visitor[]> => {
    if (IS_DEMO_MODE) return getDemoData().visitors;
    try {
        const res = await fetch(`${API_BASE}/visitors`);
        return await res.json();
    } catch (e) {
        return getDemoData().visitors;
    }
};

export const addVisitor = async (visitor: Omit<Visitor, 'id' | 'status' | 'checkOut'>) => {
    if (IS_DEMO_MODE) {
        const data = getDemoData();
        const newVisitor: Visitor = { 
            ...visitor, 
            id: `v${data.visitors.length + 1}`, 
            status: 'active' 
        };
        data.visitors.push(newVisitor);
        saveDemoData(data);
        return newVisitor;
    }
    const res = await fetch(`${API_BASE}/visitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitor)
    });
    return await res.json();
};

export const updateVisitorStatus = async (id: string, status: 'active' | 'completed', checkOut?: string) => {
    if (IS_DEMO_MODE) {
        const data = getDemoData();
        const v = data.visitors.find(v => v.id === id);
        if (v) {
            v.status = status;
            if (checkOut) v.checkOut = checkOut;
            saveDemoData(data);
        }
        return;
    }
    await fetch(`${API_BASE}/visitors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, checkOut })
    });
};
