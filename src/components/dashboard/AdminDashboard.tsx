import { StatCard } from "@/components/StatCard"
import { RoomCard } from "@/components/RoomCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
    Home,
    Users,
    AlertCircle,
    CreditCard,
    Bell,
    ArrowRight,
    TrendingUp,
    Plus,
    MessageSquare
} from "lucide-react"

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

import { getUsers, User as UserType, getRooms, getComplaints, getPayments, Room, Staff, getStaff, Visitor, getVisitors } from "@/lib/data-service"
import { useEffect, useState, useMemo } from "react"

export function AdminDashboard() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserType[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [complaintsCount, setComplaintsCount] = useState(0);
    const [revenue, setRevenue] = useState(0);
    const [keyStaff, setKeyStaff] = useState<Staff[]>([]);
    const [visitors, setVisitors] = useState<Visitor[]>([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            const [usersData, allRooms, complaintsData, paymentsData, staffData, visitorsData] = await Promise.all([
                getUsers(),
                getRooms(),
                getComplaints(),
                getPayments(),
                getStaff(),
                getVisitors()
            ]);
            setUsers(usersData);
            setRooms(allRooms);
            setComplaintsCount(complaintsData.filter(c => c.status === 'pending').length);
            setRevenue(paymentsData.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0));
            setKeyStaff(staffData.filter(s => ['cook', 'warden', 'security'].includes(s.role.toLowerCase())));
            setVisitors(visitorsData);
            
            // Generate dynamic activity
            const activities = [
                ...complaintsData.map(c => ({
                    id: `c-${c.id}`,
                    message: `${c.studentName || 'Student'} filed: ${c.title}`,
                    time: c.createdAt,
                    type: c.status === 'resolved' ? 'success' as const : 'info' as const
                })),
                ...paymentsData.filter(p => p.status === 'paid').map(p => ({
                    id: `p-${p.id}`,
                    message: `Payment received: ₹${p.amount} from ${p.studentName}`,
                    time: p.paidDate || p.dueDate,
                    type: 'success' as const
                })),
                ...paymentsData.filter(p => p.status === 'overdue').map(p => ({
                    id: `po-${p.id}`,
                    message: `Payment Overdue: ${p.studentName} (Room ${p.roomNumber})`,
                    time: p.dueDate,
                    type: 'warning' as const
                }))
            ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
            
            setRecentNotifications(activities);
        };
        loadDashboardData();
    }, []);

    const dynamicStats = useMemo(() => [
        {
            title: "Total Rooms",
            value: rooms.length,
            icon: <Home className="h-6 w-6" />,
            trend: { value: 0, isPositive: true }
        },
        {
            title: "Occupied",
            value: rooms.filter(r => r.status === 'occupied').length,
            icon: <Users className="h-6 w-6" />,
            trend: { value: 0, isPositive: true }
        },
        {
            title: "Pending Issues",
            value: complaintsCount,
            icon: <AlertCircle className="h-6 w-6" />,
            trend: { value: 0, isPositive: false }
        },
        {
            title: "Revenue (₹)",
            value: revenue > 100000 ? `${(revenue / 100000).toFixed(1)}L` : revenue.toLocaleString(),
            icon: <CreditCard className="h-6 w-6" />,
            trend: { value: 0, isPositive: true }
        },
    ], [rooms, complaintsCount, revenue]);

    const recentRoomsList = useMemo(() => rooms.slice(0, 4), [rooms]);

    const [recentNotifications, setRecentNotifications] = useState<{id: string | number, message: string, time: string, type: 'success' | 'info' | 'warning'}[]>([]);

    const handleViewRoom = (roomNumber: string) => {
        navigate(`/rooms/${roomNumber}`);
    };

    const handleApplyRoom = (roomNumber: string) => {
        toast.info(`Managing allocation for Room ${roomNumber}`, {
            description: "Go to the Rooms page to manage student allocation."
        });
    };

    const occupancyStats = useMemo(() => {
        const totalMax = rooms.reduce((sum, r) => sum + r.maxOccupants, 0);
        const totalCurrent = rooms.reduce((sum, r) => sum + (r.occupants || 0), 0);
        const rate = totalMax > 0 ? Math.round((totalCurrent / totalMax) * 100) : 0;
        return { totalMax, totalCurrent, rate };
    }, [rooms]);

    const chartData = useMemo(() => {
        const types = ["single", "double", "triple"];
        return types.map(type => {
            const roomsOfType = rooms.filter(r => r.type === type);
            const capacity = roomsOfType.reduce((sum, r) => sum + r.maxOccupants, 0);
            const occupied = roomsOfType.reduce((sum, r) => sum + (r.occupants || 0), 0);
            return {
                type: type.charAt(0).toUpperCase() + type.slice(1),
                capacity: capacity,
                occupied: occupied
            };
        });
    }, [rooms]);

    const chartConfig = {
        capacity: {
            label: "Total Capacity",
            color: "hsl(var(--muted))",
        },
        occupied: {
            label: "Occupied Beds",
            color: "hsl(var(--primary))",
        },
    };

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Overview of your hostel operations.</p>
                </div>
                <Button variant="hero" className="gap-2" asChild>
                    <Link to="/rooms">
                        <Plus className="h-4 w-4" />
                        Add Room
                    </Link>
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {dynamicStats.map((stat, index) => (
                    <StatCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        trend={stat.trend}
                    />
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Room Overview */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">Room Overview</h2>
                            <p className="text-sm text-muted-foreground">Recently updated rooms</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link to="/rooms">
                                View All
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {recentRoomsList.map((room) => (
                            <RoomCard
                                key={room.roomNumber}
                                {...room}
                                hideApplyButton={true}
                                onView={() => handleViewRoom(room.roomNumber)}
                            />
                        ))}
                    </div>

                    {/* Occupancy Chart */}
                    <div className="rounded-xl bg-card p-6 shadow-elegant border border-border/50">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold text-foreground">Occupancy by Room Type</h3>
                            </div>
                            <span className="text-2xl font-bold text-primary">{occupancyStats.rate}% Total</span>
                        </div>

                        <div className="h-[300px] w-full">
                            <ChartContainer config={chartConfig} className="h-full w-full">
                                <AreaChart
                                    data={chartData}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                                    accessibilityLayer
                                >
                                    <defs>
                                        <linearGradient id="colorOccupied" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="type"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <ChartLegend content={<ChartLegendContent />} />
                                    <Area
                                        type="monotone"
                                        dataKey="occupied"
                                        stroke="hsl(var(--primary))"
                                        fillOpacity={1}
                                        fill="url(#colorOccupied)"
                                        name="Occupied Beds"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="capacity"
                                        stroke="hsl(var(--muted))"
                                        fill="transparent"
                                        strokeDasharray="5 5"
                                        name="Total Capacity"
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </div>
                    </div>
                </div>

                {/* Notifications & Quick Actions */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="rounded-xl bg-card p-6 shadow-elegant border border-border/50">
                        <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Button variant="secondary" className="w-full justify-start" asChild>
                                <Link to="/admin/messages">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Message Center
                                </Link>
                            </Button>
                            <Button variant="secondary" className="w-full justify-start" asChild>
                                <Link to="/rooms">
                                    <Home className="mr-2 h-4 w-4" />
                                    Manage Rooms
                                </Link>
                            </Button>
                            <Button variant="secondary" className="w-full justify-start" asChild>
                                <Link to="/users">
                                    <Users className="mr-2 h-4 w-4" />
                                    Manage Users
                                </Link>
                            </Button>
                            <Button variant="secondary" className="w-full justify-start" asChild>
                                <Link to="/complaints">
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    All Complaints
                                </Link>
                            </Button>
                            <Button variant="secondary" className="w-full justify-start" asChild>
                                <Link to="/payments">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Track Payments
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="rounded-xl bg-card p-6 shadow-elegant border border-border/50">
                        <div className="flex items-center gap-2 mb-4">
                            <Bell className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-foreground">Recent Activity</h3>
                        </div>
                        <div className="space-y-4">
                            {recentNotifications.map((notification) => (
                                <div key={notification.id} className="flex items-start gap-3 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                                    <div className={`h-2 w-2 rounded-full mt-2 ${notification.type === 'success' ? 'bg-success' :
                                        notification.type === 'warning' ? 'bg-warning' : 'bg-primary'
                                        }`} />
                                    <div>
                                        <p className="text-sm text-foreground">{notification.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Registered Users Section */}
                <div className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">Registered Users</h2>
                            <p className="text-sm text-muted-foreground">
                                {users.length} total &bull; {users.filter(u => u.role === 'student').length} students
                            </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link to="/users">
                                Manage Users
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-card shadow-elegant overflow-hidden">
                        <div className="relative w-full overflow-auto max-h-[420px]">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm [&_tr]:border-b z-10">
                                    <tr className="border-b transition-colors">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">#</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">User</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Role</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Room</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {users.map((user, index) => (
                                        <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <td className="p-4 align-middle text-muted-foreground text-xs">{index + 1}</td>
                                            <td className="p-4 align-middle">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.name}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${user.role === 'admin' ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80' : user.role === 'staff' ? 'border-transparent bg-secondary text-secondary-foreground' : 'border-transparent bg-success/10 text-success'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle">
                                                {user.roomBox && user.roomBox !== '-' && user.roomBox !== 'Unassigned' ? (
                                                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-1.5">
                                                        <Home className="h-3 w-3" />
                                                        {user.roomBox}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent ${user.status === 'active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'} hover:opacity-80`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">{user.joinDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Key Facility Staff Section */}
                <div className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">Facility Staff</h2>
                            <p className="text-sm text-muted-foreground">
                                Cook, Warden, and Security
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-card shadow-elegant overflow-hidden">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="bg-muted/80 backdrop-blur-sm [&_tr]:border-b">
                                    <tr className="border-b transition-colors">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">#</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Role</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Phone</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Shift</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {keyStaff.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-4 text-center text-muted-foreground py-8">No facility staff assigned yet.</td>
                                        </tr>
                                    ) : (
                                        keyStaff.map((staff, index) => (
                                            <tr key={staff.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle text-muted-foreground text-xs">{index + 1}</td>
                                                <td className="p-4 align-middle font-medium">{staff.name}</td>
                                                <td className="p-4 align-middle capitalize">{staff.role}</td>
                                                <td className="p-4 align-middle">{staff.phone}</td>
                                                <td className="p-4 align-middle">{staff.shift}</td>
                                                <td className="p-4 align-middle">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent ${staff.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                                                        {staff.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                {/* Visitors Log Section */}
                <div className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">Visitors Log</h2>
                            <p className="text-sm text-muted-foreground">
                                Recent visitors for hostel students
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-card shadow-elegant overflow-hidden">
                        <div className="relative w-full overflow-auto max-h-[420px]">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="bg-muted/80 backdrop-blur-sm [&_tr]:border-b">
                                    <tr className="border-b transition-colors">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">#</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Visitor</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Visiting</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">In/Out Times</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {visitors.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-4 text-center text-muted-foreground py-8">No visitor records found.</td>
                                        </tr>
                                    ) : (
                                        visitors.map((visitor, index) => (
                                            <tr key={visitor.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle text-muted-foreground text-xs">{index + 1}</td>
                                                <td className="p-4 align-middle font-medium text-xs">{visitor.visitDate}</td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{visitor.visitorName}</span>
                                                        <span className="text-xs text-muted-foreground">{visitor.relation}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">{visitor.studentName}</td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs">In: {visitor.checkIn}</span>
                                                        <span className="text-xs text-muted-foreground">{visitor.checkOut ? `Out: ${visitor.checkOut}` : 'Out: --'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent ${visitor.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'}`}>
                                                        {visitor.status === 'active' ? 'Visiting' : 'Checked Out'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
