import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { StatCard } from "@/components/StatCard"
import { RoomCard, RoomStatus } from "@/components/RoomCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Link } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"

type Room = {
  roomNumber: string
  floor: number
  type: "single" | "double" | "triple"
  rent: number
  status: RoomStatus
  amenities: string[]
  occupants: number
  maxOccupants: number
}
import { 
  Home, 
  Users, 
  AlertCircle, 
  CreditCard, 
  Bell,
  ArrowRight,
  TrendingUp,
  CheckCircle2
} from "lucide-react"

const stats = [
  { 
    title: "Total Rooms", 
    value: 48, 
    icon: <Home className="h-6 w-6" />,
    trend: { value: 5, isPositive: true }
  },
  { 
    title: "Occupied", 
    value: 42, 
    icon: <Users className="h-6 w-6" />,
    trend: { value: 3, isPositive: true }
  },
  { 
    title: "Pending Issues", 
    value: 7, 
    icon: <AlertCircle className="h-6 w-6" />,
    trend: { value: 12, isPositive: false }
  },
  { 
    title: "Revenue (₹)", 
    value: "4.2L", 
    icon: <CreditCard className="h-6 w-6" />,
    trend: { value: 8, isPositive: true }
  },
]

const recentRooms = [
  {
    roomNumber: "101",
    floor: 1,
    type: "single" as const,
    rent: 8500,
    status: "available" as const,
    amenities: ["WiFi", "AC"],
    occupants: 0,
    maxOccupants: 1,
  },
  {
    roomNumber: "205",
    floor: 2,
    type: "double" as const,
    rent: 6500,
    status: "occupied" as const,
    amenities: ["WiFi"],
    occupants: 2,
    maxOccupants: 2,
  },
  {
    roomNumber: "312",
    floor: 3,
    type: "triple" as const,
    rent: 5000,
    status: "available" as const,
    amenities: ["WiFi"],
    occupants: 1,
    maxOccupants: 3,
  },
]

const recentNotifications = [
  { id: 1, message: "Room 203 maintenance request approved", time: "2 hours ago", type: "success" },
  { id: 2, message: "New application for Room 101", time: "4 hours ago", type: "info" },
  { id: 3, message: "Rent due reminder sent to 15 students", time: "1 day ago", type: "warning" },
]

const Dashboard = () => {
  const { toast } = useToast()
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [applyDialogOpen, setApplyDialogOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="dashboard" />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your hostel.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
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
              {recentRooms.map((room) => (
                <RoomCard 
                  key={room.roomNumber} 
                  {...room}
                  onView={() => {
                    setSelectedRoom(room)
                    setViewDialogOpen(true)
                  }}
                  onApply={() => {
                    setSelectedRoom(room)
                    setApplyDialogOpen(true)
                  }}
                />
              ))}
            </div>
          </div>

          {/* Notifications & Quick Actions */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="rounded-xl bg-card p-6 shadow-elegant border border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Recent Activity</h3>
              </div>
              <div className="space-y-4">
                {recentNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                    <div className={`h-2 w-2 rounded-full mt-2 ${
                      notification.type === 'success' ? 'bg-success' :
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

            {/* Quick Actions */}
            <div className="rounded-xl bg-card p-6 shadow-elegant border border-border/50">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="secondary" className="w-full justify-start" asChild>
                  <Link to="/rooms">
                    <Home className="mr-2 h-4 w-4" />
                    Browse Rooms
                  </Link>
                </Button>
                <Button variant="secondary" className="w-full justify-start" asChild>
                  <Link to="/complaints">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Submit Complaint
                  </Link>
                </Button>
                <Button variant="secondary" className="w-full justify-start" asChild>
                  <Link to="/payments">
                    <CreditCard className="mr-2 h-4 w-4" />
                    View Payments
                  </Link>
                </Button>
              </div>
            </div>

            {/* Occupancy Chart Placeholder */}
            <div className="rounded-xl bg-card p-6 shadow-elegant border border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Occupancy Rate</h3>
              </div>
              <div className="flex items-end justify-between h-32">
                {[65, 78, 82, 75, 88, 92, 87].map((value, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div 
                      className="w-6 rounded-t-md gradient-primary transition-all duration-300 hover:opacity-80"
                      style={{ height: `${value}%` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* View Room Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Room {selectedRoom?.roomNumber}</DialogTitle>
              <DialogDescription>
                Floor {selectedRoom?.floor} • {selectedRoom?.type?.charAt(0).toUpperCase()}{selectedRoom?.type?.slice(1)} Room
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={selectedRoom?.status === "available" ? "available" : selectedRoom?.status === "occupied" ? "occupied" : selectedRoom?.status === "pending" ? "pending" : "maintenance"}>
                  {selectedRoom?.status?.charAt(0).toUpperCase()}{selectedRoom?.status?.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rent</span>
                <span className="font-semibold">₹{selectedRoom?.rent?.toLocaleString()}/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Occupancy</span>
                <span>{selectedRoom?.occupants}/{selectedRoom?.maxOccupants}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amenities</span>
                <span>{selectedRoom?.amenities?.join(", ") || "None"}</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
              {selectedRoom?.status === "available" && (
                <Button variant="hero" onClick={() => {
                  setViewDialogOpen(false)
                  setApplyDialogOpen(true)
                }}>
                  Apply for Room
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Apply for Room Dialog */}
        <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for Room {selectedRoom?.roomNumber}</DialogTitle>
              <DialogDescription>
                Confirm your application for this room. You'll be notified once your application is reviewed.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <div className="flex justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Room</span>
                <span className="font-medium">Room {selectedRoom?.roomNumber}</span>
              </div>
              <div className="flex justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium capitalize">{selectedRoom?.type}</span>
              </div>
              <div className="flex justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Monthly Rent</span>
                <span className="font-semibold text-primary">₹{selectedRoom?.rent?.toLocaleString()}</span>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
              <Button 
                variant="hero" 
                onClick={() => {
                  setApplyDialogOpen(false)
                  toast({
                    title: "Application Submitted!",
                    description: `Your application for Room ${selectedRoom?.roomNumber} has been submitted successfully.`,
                  })
                }}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

export default Dashboard