import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
    ClipboardList, 
    Home, 
    Clock, 
    AlertCircle, 
    CheckCircle2, 
    ChevronRight,
    User as UserIcon,
    CreditCard
} from "lucide-react"
import { Link } from "react-router-dom"
import { getComplaints, getRooms, getStaff, getPayments, Complaint, Room, Staff, Payment } from "@/lib/data-service"

export const StaffDashboard = () => {
    const [stats, setStats] = useState({
        pendingComplaints: 0,
        occupiedRooms: 0,
        availableRooms: 0,
        totalRooms: 0
    })
    const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([])
    const [staffInfo, setStaffInfo] = useState<Staff | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [complaints, rooms, allStaff, payments] = await Promise.all([
                getComplaints(),
                getRooms(),
                getStaff(),
                getPayments()
            ])

            // Get current staff info (simulated match by email for now)
            const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
            const currentStaff = allStaff.find(s => s.email === currentUser.email)
            if (currentStaff) setStaffInfo(currentStaff)

            setStats({
                pendingComplaints: complaints.filter(c => c.status === 'pending').length,
                occupiedRooms: rooms.filter(r => r.status === 'occupied').length,
                availableRooms: rooms.filter(r => r.status === 'available').length,
                totalRooms: rooms.length
            })

            setRecentComplaints(complaints.slice(0, 3))
        } catch (error) {
            console.error("Error loading dashboard data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">Loading Dashboard...</div>
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Staff Dashboard</h2>
                    <p className="text-muted-foreground">
                        Welcome back, {staffInfo?.name || "Team Member"}. Here's your operational overview.
                    </p>
                </div>
                {staffInfo && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Currently on <span className="text-primary">{staffInfo.shift} Shift</span></span>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Complaints</CardTitle>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingComplaints}</div>
                        <p className="text-xs text-muted-foreground mt-1">Requires your attention</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Occupied Rooms</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.occupiedRooms}</div>
                        <p className="text-xs text-muted-foreground mt-1">{((stats.occupiedRooms / stats.totalRooms) * 100).toFixed(1)}% occupancy rate</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Available Rooms</CardTitle>
                        <Home className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.availableRooms}</div>
                        <p className="text-xs text-muted-foreground mt-1">Ready for check-in</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">My Role</CardTitle>
                        <ClipboardList className="h-4 w-4 text-secondary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate">{staffInfo?.role || "Hostel Staff"}</div>
                        <p className="text-xs text-muted-foreground mt-1">Operational Team</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                {/* Recent Complaints */}
                <Card className="md:col-span-4 border-none shadow-elegant">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-bold">Recent Complaints</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/complaints" className="text-primary hover:bg-primary/5">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentComplaints.length > 0 ? (
                                recentComplaints.map((complaint) => (
                                    <div key={complaint.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <div className="flex gap-3 items-center">
                                            <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border border-border">
                                                <ClipboardList className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium leading-none mb-1">{complaint.title}</p>
                                                <p className="text-xs text-muted-foreground">Room {complaint.roomNumber} • {complaint.category}</p>
                                            </div>
                                        </div>
                                        <Badge 
                                            variant={complaint.status === 'pending' ? 'destructive' : 'secondary'} 
                                            className="uppercase text-[10px]"
                                        >
                                            {complaint.status}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-8 text-muted-foreground italic">No complaints reported yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="md:col-span-3 border-none shadow-elegant overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-4">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <ChevronRight className="h-5 w-5 text-primary" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            <Link to="/complaints" className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group">
                                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive group-hover:scale-110 transition-transform">
                                    <AlertCircle className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">Resolve Complaints</p>
                                    <p className="text-xs text-muted-foreground line-clamp-1">Update status of pending maintenance requests.</p>
                                </div>
                            </Link>
                            <Link to="/rooms" className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Home className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">Check Room Status</p>
                                    <p className="text-xs text-muted-foreground line-clamp-1">View availability and resident details.</p>
                                </div>
                            </Link>
                            <Link to="/payments" className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group">
                                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success group-hover:scale-110 transition-transform">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">View Payments</p>
                                    <p className="text-xs text-muted-foreground line-clamp-1">Check student rent payment records.</p>
                                </div>
                            </Link>
                            <div className="p-4 bg-muted/10">
                                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">My Profile Summary</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                                        <UserIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{staffInfo?.name || "Operational Staff"}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{staffInfo?.role || "Staff Member"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
