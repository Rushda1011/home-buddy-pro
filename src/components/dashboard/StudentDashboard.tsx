import { StatCard } from "@/components/StatCard"
import { RoomCard } from "@/components/RoomCard"
import { RoomRecommendationModal } from "@/components/RoomRecommendationModal"
import { PaymentDialog } from "@/components/PaymentDialog"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import {
    Home,
    AlertCircle,
    CreditCard,
    Calendar,
    Utensils,
    Clock,
    ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { getComplaints, Complaint, getCurrentUser, getRooms, getPayments, updatePaymentStatus, User, Room, Payment, getUser, getUserByEmail, addPayment } from "@/lib/data-service"
import { useEffect, useState, useMemo } from "react"

export function StudentDashboard() {
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [complaints, setComplaints] = useState<Complaint[]>([])
    const [myRoom, setMyRoom] = useState<Room | null>(null)
    const [payments, setPayments] = useState<Payment[]>([])
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false)
    const [isPaymentOpen, setIsPaymentOpen] = useState(false)

    const weeklyMenu = [
        { day: "Monday", breakfast: "Poha & Jalebi", lunch: "Dal Tadka, Rice, Mix Veg", dinner: "Paneer Butter Masala, Roti" },
        { day: "Tuesday", breakfast: "Aloo Paratha", lunch: "Rajma Chawal, Salad", dinner: "Egg Curry / Mix Veg, Rice" },
        { day: "Wednesday", breakfast: "Idli Sambar", lunch: "Chole Bhature", dinner: "Veg Pulao, Raita" },
        { day: "Thursday", breakfast: "Bread Butter, Eggs", lunch: "Kadhi Pakoda, Rice", dinner: "Chicken Curry / Paneer, Roti" },
        { day: "Friday", breakfast: "Puri Bhaji", lunch: "Veg Thali", dinner: "Dal Makhani, Naan" },
        { day: "Saturday", breakfast: "Upma", lunch: "Khichdi", dinner: "Special Veg Biryani" },
        { day: "Sunday", breakfast: "Masala Dosa", lunch: "Special Lunch", dinner: "Fried Rice & Manchurian" },
    ]

    useEffect(() => {
        const loadData = async () => {
            const storedUser = getCurrentUser()
            if (!storedUser) return

            // Fetch fresh user data to ensure roomBox is up to date
            let freshUser: User | null = null
            if (storedUser.id) {
                freshUser = await getUser(storedUser.id)
            } else if (storedUser.email) {
                // Fallback for sessions started before the ID fix
                freshUser = await getUserByEmail(storedUser.email)
            }
            
            const user = freshUser || storedUser
            
            if (freshUser) {
                // Preserve isNewUser flag from the originally stored session data
                const userToStore = { ...freshUser, isNewUser: (storedUser as any).isNewUser };
                localStorage.setItem("currentUser", JSON.stringify(userToStore));
                setCurrentUser(userToStore);
            } else {
                setCurrentUser(storedUser);
            }
            
            if (user) {
                // Clear isNewUser flag after first load
                if ((user as any).isNewUser) {
                    const updatedUser = { ...user, isNewUser: false };
                    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
                }

                try {
                    const [allComplaints, allRooms, allPayments] = await Promise.all([
                        getComplaints(),
                        getRooms(),
                        getPayments()
                    ])

                    // Filter complaints by studentName. Robust case-insensitive match.
                    const myComplaints = Array.isArray(allComplaints)
                        ? allComplaints.filter(c => {
                            const nameMatch = c.studentName?.toLowerCase().trim() === user.name.toLowerCase().trim()
                            const roomMatch = !c.studentName && c.roomNumber === user.roomBox
                            return nameMatch || roomMatch
                        }).slice(0, 3)
                        : [];
                    setComplaints(myComplaints);

                    // Robust room matching
                    const room = Array.isArray(allRooms) ? allRooms.find(r => 
                        r.roomNumber === user.roomBox || 
                        r.residents?.some(res => res.toLowerCase().trim() === user.name.toLowerCase().trim())
                    ) : null;
                    setMyRoom(room || null)

                    // Robust payment matching
                    const myPayments = Array.isArray(allPayments) ? allPayments.filter(p => 
                        p.studentName?.toLowerCase().trim() === user.name.toLowerCase().trim()
                    ) : [];
                    setPayments(myPayments)
                } catch (e) {
                    console.error("Dashboard failed to load specific data", e)
                }
            }
        }
        loadData()
    }, [])

    const studentStats = useMemo(() => {
        const latestPayment = payments[0] // Assuming sorted by date or index
        const rentStatus = payments.length === 0 
            ? (myRoom ? "Pending First Payment" : "No Dues") 
            : (latestPayment?.status === 'paid' ? "Paid" : (latestPayment?.status === 'overdue' ? "Overdue" : "Pending"))
        const isPositive = (payments.length === 0 && !myRoom) || latestPayment?.status === 'paid'

        return [
            {
                title: "Rent Status",
                value: rentStatus,
                icon: <CreditCard className="h-6 w-6" />,
                trend: { value: 0, isPositive, label: isPositive ? "Up to date" : "Action required" },
                action: !isPositive ? (
                    <Button variant="link" size="sm" className="px-0 h-auto text-primary" onClick={() => setIsPaymentOpen(true)}>
                        Pay Now
                    </Button>
                ) : null
            },
            {
                title: "Days Left",
                value: "12",
                icon: <Calendar className="h-6 w-6" />,
                trend: { value: 0, isPositive: true, label: "In current month" }
            },
        ]
    }, [payments])

    const firstUnpaidPayment = payments.find(p => p.status !== 'paid')
    const hasRoomButNoPayments = myRoom && payments.length === 0

    const handlePayNow = async (id: string) => {
        await updatePaymentStatus(id, "paid", new Date().toISOString().split('T')[0])
        const data = await getPayments()
        const user = currentUser
        if (user) {
            setPayments(data.filter(p => p.studentName?.toLowerCase().trim() === user.name.toLowerCase().trim()))
        }
    }

    const handleInitialPayment = async () => {
        if (!currentUser || !myRoom) return;
        
        try {
            const newPayment = {
                studentName: currentUser.name,
                roomNumber: myRoom.roomNumber,
                amount: myRoom.rent,
                month: new Date().toLocaleString('default', { month: 'long' }),
                year: new Date().getFullYear(),
                status: 'paid' as const,
                dueDate: new Date().toISOString().split('T')[0],
                paidDate: new Date().toISOString().split('T')[0]
            };
            
            await addPayment(newPayment);
            const data = await getPayments();
            const user = currentUser;
            if (user) {
                setPayments(data.filter(p => p.studentName?.toLowerCase().trim() === user.name.toLowerCase().trim()));
            }
            setIsPaymentOpen(false);
        } catch (e) {
            console.error("Failed to process initial payment", e);
        }
    }

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">My Dashboard</h1>
                    <p className="text-muted-foreground">
                        {(currentUser as any)?.isNewUser ? "Welcome to HostelHub" : "Welcome back"}, {currentUser?.name || 'Student'}!
                    </p>
                </div>
                {firstUnpaidPayment ? (
                    <>
                        <Button
                            variant="hero"
                            size="lg"
                            className="gap-2 animate-pulse-glow shadow-lg"
                            onClick={() => setIsPaymentOpen(true)}
                        >
                            <CreditCard className="h-5 w-5" />
                            Pay Now ₹{firstUnpaidPayment.amount.toLocaleString()}
                        </Button>
                        <PaymentDialog
                            isOpen={isPaymentOpen}
                            onOpenChange={setIsPaymentOpen}
                            amount={firstUnpaidPayment.amount}
                            month={firstUnpaidPayment.month}
                            year={firstUnpaidPayment.year}
                            onSuccess={() => handlePayNow(firstUnpaidPayment.id)}
                        />
                    </>
                ) : hasRoomButNoPayments ? (
                    <>
                        <Button
                            variant="hero"
                            size="lg"
                            className="gap-2 animate-pulse-glow shadow-lg"
                            onClick={() => setIsPaymentOpen(true)}
                        >
                            <CreditCard className="h-5 w-5" />
                            Pay Initial Rent ₹{myRoom.rent.toLocaleString()}
                        </Button>
                        <PaymentDialog
                            isOpen={isPaymentOpen}
                            onOpenChange={setIsPaymentOpen}
                            amount={myRoom.rent}
                            month={new Date().toLocaleString('default', { month: 'long' })}
                            year={new Date().getFullYear()}
                            onSuccess={handleInitialPayment}
                        />
                    </>
                ) : (
                    <Button variant="outline" size="lg" className="gap-2" asChild>
                        <Link to="/payments">
                            <CreditCard className="h-5 w-5" />
                            View Payments
                        </Link>
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats and Room Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Row */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        {studentStats.map((stat, index) => (
                            <StatCard
                                key={index}
                                title={stat.title}
                                value={stat.value}
                                icon={stat.icon}
                                trend={stat.trend}
                                action={stat.action}
                            />
                        ))}
                    </div>

                    {/* My Room Card */}
                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-4">My Room</h2>
                        {myRoom ? (
                            <RoomCard {...myRoom} />
                        ) : (
                            <RoomRecommendationModal />
                        )}
                    </div>

                    {/* Recent Complaints */}
                    <div className="rounded-xl bg-card p-6 shadow-elegant border border-border/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold text-foreground">My Complaints</h3>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/complaints">View All</Link>
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {complaints.length > 0 ? (
                                complaints.map((c) => (
                                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <div>
                                            <div className="font-medium">{c.title}</div>
                                            <div className="text-xs text-muted-foreground capitalize">{c.category} • {c.createdAt}</div>
                                        </div>
                                        <div className={`text-xs px-2 py-1 rounded-full ${c.status === 'resolved' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                                            }`}>
                                            <span className="capitalize">{c.status}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No complaints recorded yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Quick Actions & Menu */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="rounded-xl bg-card p-6 shadow-elegant border border-border/50">
                        <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Button variant="hero" className="w-full justify-start" asChild>
                                <Link to="/payments">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Pay Rent
                                </Link>
                            </Button>
                            <Button variant="secondary" className="w-full justify-start" asChild>
                                <Link to="/complaints">
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Raise Complaint
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Today's Mess Menu */}
                    <Card className="border-none shadow-elegant overflow-hidden">
                        <CardHeader className="bg-primary/5 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Utensils className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg font-bold">Today's Mess Menu</CardTitle>
                                </div>
                                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">Veg & Non-Veg</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex gap-3 items-center">
                                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                            <span className="text-xs font-bold">B</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">Breakfast</p>
                                            <p className="text-xs text-muted-foreground">08:00 AM - 09:30 AM</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-foreground">Idli, Sambar & Tea</span>
                                </div>
                                <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex gap-3 items-center">
                                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <span className="text-xs font-bold">L</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">Lunch</p>
                                            <p className="text-xs text-muted-foreground">12:30 PM - 02:30 PM</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-foreground">Rice, Dal, Special Paneer</span>
                                </div>
                                <div className="flex items-center justify-between p-4 hover:bg-primary/5 bg-primary/5 transition-colors">
                                    <div className="flex gap-3 items-center">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <span className="text-xs font-bold">S</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">Evening Snacks</p>
                                            <p className="text-xs text-muted-foreground">05:00 PM - 06:00 PM</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-primary border-primary/20">Active Now</Badge>
                                    <span className="text-sm font-medium text-foreground">Samosa & Coffee</span>
                                </div>
                                <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex gap-3 items-center">
                                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                            <span className="text-xs font-bold">D</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">Dinner</p>
                                            <p className="text-xs text-muted-foreground">08:00 PM - 10:00 PM</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-foreground">Chapati, Veg Curry & Curd</span>
                                </div>
                            </div>
                            
                            <Dialog open={isMenuModalOpen} onOpenChange={setIsMenuModalOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" className="w-full rounded-none h-10 text-xs text-muted-foreground hover:text-primary border-t border-border">
                                        View Full Weekly Menu
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <Utensils className="h-5 w-5 text-primary" />
                                            Weekly Mess Menu - HostelHub
                                        </DialogTitle>
                                        <DialogDescription>
                                            Complete menu schedule for the current week.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="mt-4 overflow-hidden rounded-lg border border-border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead className="w-[100px]">Day</TableHead>
                                                    <TableHead>Breakfast</TableHead>
                                                    <TableHead>Lunch</TableHead>
                                                    <TableHead>Dinner</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {weeklyMenu.map((menu) => (
                                                    <TableRow key={menu.day}>
                                                        <TableCell className="font-bold">{menu.day}</TableCell>
                                                        <TableCell className="text-sm">{menu.breakfast}</TableCell>
                                                        <TableCell className="text-sm">{menu.lunch}</TableCell>
                                                        <TableCell className="text-sm">{menu.dinner}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
