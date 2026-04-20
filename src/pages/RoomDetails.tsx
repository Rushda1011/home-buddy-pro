import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    ArrowLeft,
    Bed,
    Users,
    Wifi,
    Fan,
    MessageSquare,
    AlertCircle,
    CreditCard,
    IndianRupee,
    ChevronLeft,
    ChevronRight,
    Camera
} from "lucide-react"
import { getRooms, getComplaints, getPayments, Room, Complaint, Payment } from "@/lib/data-service"

const statusConfig: Record<string, { label: string; variant: "available" | "occupied" | "pending" | "maintenance" }> = {
    available: { label: "Available", variant: "available" },
    occupied: { label: "Occupied", variant: "occupied" },
    pending: { label: "Pending", variant: "pending" },
    maintenance: { label: "Maintenance", variant: "maintenance" },
}

const amenityIcons: Record<string, React.ReactNode> = {
    wifi: <Wifi className="h-4 w-4" />,
    ac: <Fan className="h-4 w-4" />,
}

const RoomDetails = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [room, setRoom] = useState<Room | null>(null)
    const [complaints, setComplaints] = useState<Complaint[]>([])
    const [payments, setPayments] = useState<Payment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeImageIndex, setActiveImageIndex] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            if (id) {
                const [allRooms, allComplaints, allPayments] = await Promise.all([
                    getRooms(),
                    getComplaints(),
                    getPayments()
                ])

                const foundRoom = allRooms.find(r => r.roomNumber === id)
                setRoom(foundRoom || null)

                setComplaints(allComplaints.filter(c => c.roomNumber === id))
                setPayments(allPayments.filter(p => p.roomNumber === id))
            }
            setIsLoading(false)
        }
        fetchData()
    }, [id])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar variant="dashboard" />
                <main className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
                        <p className="text-muted-foreground">Loading room details...</p>
                    </div>
                </main>
            </div>
        )
    }

    if (!room) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar variant="dashboard" />
                <main className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center max-w-md text-center">
                    <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Room Not Found</h1>
                    <p className="text-muted-foreground mb-8">The room number "{id}" does not exist in our system.</p>
                    <Button onClick={() => navigate("/rooms")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Return to Rooms
                    </Button>
                </main>
            </div>
        )
    }

    const statusInfo = statusConfig[room.status]

    return (
        <div className="min-h-screen bg-background">
            <Navbar variant="dashboard" />

            <main className="container mx-auto px-4 py-8 space-y-8 animate-fade-up">
                {/* Image Gallery Header */}
                <div className="space-y-4">
                    <div className="w-full h-64 md:h-[450px] rounded-2xl overflow-hidden relative border border-border/50 shadow-elegant group">
                        {room.images && room.images.length > 0 ? (
                            <div className="w-full h-full relative">
                                <img
                                    src={room.images[activeImageIndex]}
                                    alt={`Room ${room.roomNumber} - View ${activeImageIndex + 1}`}
                                    className="w-full h-full object-contain bg-gray-100 transition-all duration-500 ease-in-out"
                                />
                                
                                {/* Navigation arrows */}
                                {room.images.length > 1 && (
                                    <>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => setActiveImageIndex((prev) => (prev - 1 + room.images!.length) % room.images!.length)}
                                        >
                                            <ChevronLeft className="h-6 w-6" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => setActiveImageIndex((prev) => (prev + 1) % room.images!.length)}
                                        >
                                            <ChevronRight className="h-6 w-6" />
                                        </Button>
                                    </>
                                )}
                                
                                {/* Counter */}
                                <div className="absolute bottom-4 right-6 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                                    <Camera className="h-3 w-3" />
                                    {activeImageIndex + 1} / {room.images.length}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                <p className="text-muted-foreground">No images available</p>
                            </div>
                        )}
                        
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                        
                        <Button variant="secondary" onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm border-none shadow-md hover:bg-background">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        
                        <div className="absolute bottom-4 left-6 flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Room {room.roomNumber}</h1>
                            <Badge variant={statusInfo.variant} className="text-sm px-3 py-1 bg-white/90 text-foreground border-none font-semibold">
                                {statusInfo.label}
                            </Badge>
                        </div>
                    </div>

                    {/* Thumbnails */}
                    {room.images && room.images.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                            {room.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                        activeImageIndex === idx ? "border-primary ring-2 ring-primary/20 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                                    }`}
                                >
                                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain bg-gray-100" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Header Actions (Legacy removed in favor of image overlay) */}
                <div>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <p className="text-muted-foreground text-lg">
                                Floor {room.floor} • {room.type.charAt(0).toUpperCase() + room.type.slice(1)} Room
                            </p>
                        </div>
                        <div className="bg-card px-6 py-4 rounded-xl border border-border/50 shadow-sm flex flex-col items-end">
                            <span className="text-sm text-muted-foreground mb-1">Monthly Rent</span>
                            <div className="flex items-center text-3xl font-bold text-primary">
                                <IndianRupee className="h-6 w-6 mr-1" />
                                {room.rent.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Overview Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Room Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                                        <Users className="h-4 w-4 mr-2" /> Occupancy status
                                    </h4>
                                    <div className="flex items-center gap-4">
                                        <div className="text-2xl font-bold">
                                            {room.occupants} <span className="text-muted-foreground text-lg font-normal">/ {room.maxOccupants}</span>
                                        </div>
                                        <div className="flex flex-1 gap-1 max-w-[200px]">
                                            {Array.from({ length: room.maxOccupants }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-2 flex-1 rounded-full \${i < room.occupants ? "bg-primary" : "bg-muted"}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                                        <Bed className="h-4 w-4 mr-2" /> Amenities Included
                                    </h4>
                                    <ul className="list-disc pl-5 space-y-2">
                                        {room.amenities.map(amenity => (
                                            <li key={amenity} className="text-sm text-foreground capitalize">
                                                {amenity}
                                            </li>
                                        ))}
                                        {room.amenities.length === 0 && (
                                            <li className="text-sm text-muted-foreground italic">
                                                No special amenities listed
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                                        <Users className="h-4 w-4 mr-2" /> Current Residents
                                    </h4>
                                    {room.residents && room.residents.length > 0 ? (
                                        <ul className="space-y-2">
                                            {room.residents.map((resident, idx) => (
                                                <li key={idx} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                                        {resident.charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-sm">{resident}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-muted-foreground py-2 italic bg-muted/20 px-3 rounded text-center">
                                            Room is currently vacant.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Complaints */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center">
                                    <MessageSquare className="mr-2 h-5 w-5" /> Recent Complaints
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {complaints.length > 0 ? (
                                    <div className="space-y-4">
                                        {complaints.slice(0, 5).map(complaint => (
                                            <div key={complaint.id} className="flex justify-between items-start p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium text-sm">{complaint.title}</p>
                                                    <p className="text-xs text-muted-foreground capitalize">{complaint.category} • {complaint.createdAt}</p>
                                                </div>
                                                <Badge variant={complaint.status === 'resolved' ? 'success' : complaint.status === 'in-progress' ? 'warning' : 'pending'}>
                                                    {complaint.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/10">
                                        No complaints recorded for this room.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CreditCard className="mr-2 h-5 w-5" /> Payment History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {payments.length > 0 ? (
                                    <div className="space-y-3">
                                        {payments.slice(0, 5).map(payment => (
                                            <div key={payment.id} className="flex justify-between items-center p-2 border-b last:border-0">
                                                <div>
                                                    <p className="font-medium text-sm">{payment.month}</p>
                                                    <p className="text-xs text-muted-foreground">{payment.studentName}</p>
                                                </div>
                                                <Badge variant={payment.status === 'paid' ? 'success' : 'destructive'} className="text-xs">
                                                    {payment.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/10">
                                        No payment history available.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default RoomDetails
