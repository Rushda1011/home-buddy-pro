import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { RoomCard } from "@/components/RoomCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, SlidersHorizontal, Plus, Home as HomeIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { getRooms, updateRoomStatus, Room, getCurrentUser, addRoom, RoomType, updateRoomDetails, deleteRoom, deallocateRoom, getUser, getUserByEmail } from "@/lib/data-service"
import { BrandedConfirm } from "@/components/BrandedConfirm"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const Rooms = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [currentUser, setCurrentUser] = useState(getCurrentUser())
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false)
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  })

  const [newRoom, setNewRoom] = useState({
    roomNumber: "",
    floor: 1,
    type: "single" as RoomType,
    rent: 5000,
    maxOccupants: 1,
    amenities: "WiFi"
  })

  const isAdmin = currentUser?.role === 'admin'
  const isStaff = currentUser?.role === 'staff'

  useEffect(() => {
    if (currentUser?.role === 'student') {
      navigate('/dashboard', { replace: true })
      return
    }

    const loadRooms = async () => {
      const data = await getRooms()
      setRooms(data)

      // Repair user session if ID is missing
      const storedUser = getCurrentUser()
      if (storedUser && !storedUser.id && storedUser.email) {
        const freshUser = await getUserByEmail(storedUser.email)
        if (freshUser) {
          localStorage.setItem("currentUser", JSON.stringify(freshUser))
          setCurrentUser(freshUser)
        }
      }
    }
    loadRooms()
  }, [])

  const handleApply = async (roomNumber: string) => {
    if (!currentUser) return;
    await updateRoomStatus(roomNumber, "pending", 0, currentUser.id)
    const data = await getRooms()
    setRooms(data) // Refresh from store

    toast({
      title: "Application Submitted",
      description: `You have successfully applied for Room ${roomNumber}.`,
    })
  }

  const validateRoom = (room: any) => {
    if (room.rent < 500 || room.rent > 50000) {
      toast({ title: "Invalid Rent", description: "Rent must be between ₹500 and ₹50,000", variant: "destructive" })
      return false
    }
    if (room.maxOccupants < 1 || room.maxOccupants > 10) {
      toast({ title: "Invalid Occupants", description: "Max occupants must be between 1 and 10", variant: "destructive" })
      return false
    }
    if (room.floor < 1) {
      toast({ title: "Invalid Floor", description: "Floor must be at least 1", variant: "destructive" })
      return false
    }
    return true
  }

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateRoom(newRoom)) return

    try {
      await addRoom({
        ...newRoom,
        status: 'available',
        amenities: newRoom.amenities.split(',').map(a => a.trim()).filter(a => a)
      })
      toast({
        title: "Room Added",
        description: `Room ${newRoom.roomNumber} has been successfully added.`,
      })
      setIsAddRoomOpen(false)
      const data = await getRooms()
      setRooms(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add room. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room)
    setNewRoom({
      roomNumber: room.roomNumber,
      floor: room.floor,
      type: room.type,
      rent: room.rent,
      maxOccupants: room.maxOccupants,
      amenities: room.amenities.join(', ')
    })
    setIsEditRoomOpen(true)
  }

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateRoom(newRoom)) return

    try {
      await updateRoomDetails(newRoom.roomNumber, {
        ...newRoom,
        amenities: newRoom.amenities.split(',').map(a => a.trim()).filter(a => a)
      })
      toast({
        title: "Room Updated",
        description: `Room ${newRoom.roomNumber} has been successfully updated.`,
      })
      setIsEditRoomOpen(false)
      const data = await getRooms()
      setRooms(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update room.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteRoom = (roomNumber: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Room",
      description: `Are you sure you want to delete Room ${roomNumber}? This action cannot be undone.`,
      variant: "destructive",
      onConfirm: async () => {
        await deleteRoom(roomNumber)
        toast({ title: "Room Deleted", description: `Room ${roomNumber} removed.` })
        const data = await getRooms()
        setRooms(data)
      }
    })
  }

  const handleDeallocate = (roomNumber: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Deallocate Room",
      description: `Are you sure you want to deallocate Room ${roomNumber}? The residents will be unassigned and the room will become available.`,
      onConfirm: async () => {
        await deallocateRoom(roomNumber)
        toast({ title: "Room Deallocated", description: `Room ${roomNumber} is now available.` })
        const data = await getRooms()
        setRooms(data)
      }
    })
  }

  const handleAccept = async (roomNumber: string) => {
    // Transition from pending to occupied, backend handles user updates
    await updateRoomStatus(roomNumber, "occupied")
    const data = await getRooms()
    setRooms(data)

    toast({
      title: "Application Accepted",
      description: `Room ${roomNumber} is now officially occupied.`,
    })
  }

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || room.status === statusFilter
    const matchesType = typeFilter === "all" || room.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const statusCounts = {
    all: rooms.length,
    available: rooms.filter((r) => r.status === "available").length,
    occupied: rooms.filter((r) => r.status === "occupied").length,
    pending: rooms.filter((r) => r.status === "pending").length,
    maintenance: rooms.filter((r) => r.status === "maintenance").length,
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="dashboard" />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Rooms</h1>
            <p className="text-muted-foreground">Browse and manage all hostel rooms</p>
          </div>

          {isAdmin && (
            <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Room
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleAddRoom}>
                  <DialogHeader>
                    <DialogTitle>Add New Room</DialogTitle>
                    <DialogDescription>
                      Fill in the details to add a new room to the hostel.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="roomNumber" className="text-right">
                        Room #
                      </Label>
                      <Input
                        id="roomNumber"
                        value={newRoom.roomNumber}
                        onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g. 101"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="floor" className="text-right">
                        Floor
                      </Label>
                      <Input
                        id="floor"
                        type="number"
                        value={newRoom.floor}
                        onChange={(e) => setNewRoom({ ...newRoom, floor: parseInt(e.target.value) })}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">
                        Type
                      </Label>
                      <Select
                        value={newRoom.type}
                        onValueChange={(v: RoomType) => setNewRoom({ ...newRoom, type: v })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="double">Double</SelectItem>
                          <SelectItem value="triple">Triple</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="rent" className="text-right">
                        Rent
                      </Label>
                      <Input
                        id="rent"
                        type="number"
                        value={newRoom.rent}
                        onChange={(e) => setNewRoom({ ...newRoom, rent: parseInt(e.target.value) })}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="maxOccupants" className="text-right">
                        Max Occ.
                      </Label>
                      <Input
                        id="maxOccupants"
                        type="number"
                        value={newRoom.maxOccupants}
                        onChange={(e) => setNewRoom({ ...newRoom, maxOccupants: parseInt(e.target.value) })}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amenities" className="text-right">
                        Amenities
                      </Label>
                      <Input
                        id="amenities"
                        value={newRoom.amenities}
                        onChange={(e) => setNewRoom({ ...newRoom, amenities: e.target.value })}
                        className="col-span-3"
                        placeholder="WiFi, AC, Study Table"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Room</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {/* Edit Room Dialog */}
          <Dialog open={isEditRoomOpen} onOpenChange={setIsEditRoomOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleUpdateRoom}>
                <DialogHeader>
                  <DialogTitle>Edit Room {editingRoom?.roomNumber}</DialogTitle>
                  <DialogDescription>
                    Update the details for this room.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-floor" className="text-right">
                      Floor
                    </Label>
                    <Input
                      id="edit-floor"
                      type="number"
                      value={newRoom.floor}
                      onChange={(e) => setNewRoom({ ...newRoom, floor: parseInt(e.target.value) })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-type" className="text-right">
                      Type
                    </Label>
                    <Select
                      value={newRoom.type}
                      onValueChange={(v: RoomType) => setNewRoom({ ...newRoom, type: v })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                        <SelectItem value="triple">Triple</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-rent" className="text-right">
                      Rent
                    </Label>
                    <Input
                      id="edit-rent"
                      type="number"
                      value={newRoom.rent}
                      onChange={(e) => setNewRoom({ ...newRoom, rent: parseInt(e.target.value) })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-maxOccupants" className="text-right">
                      Max Occ.
                    </Label>
                    <Input
                      id="edit-maxOccupants"
                      type="number"
                      value={newRoom.maxOccupants}
                      onChange={(e) => setNewRoom({ ...newRoom, maxOccupants: parseInt(e.target.value) })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-amenities" className="text-right">
                      Amenities
                    </Label>
                    <Input
                      id="edit-amenities"
                      value={newRoom.amenities}
                      onChange={(e) => setNewRoom({ ...newRoom, amenities: e.target.value })}
                      className="col-span-3"
                      placeholder="WiFi, AC, Study Table"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditRoomOpen(false)}>Cancel</Button>
                  <Button type="submit">Update Room</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Status Filter Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${statusFilter === status
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
            >
              <span className="capitalize">{status}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${statusFilter === status ? "bg-primary-foreground/20" : "bg-background"
                }`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by room number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Room Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="double">Double</SelectItem>
              <SelectItem value="triple">Triple</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rooms Grid */}
        {filteredRooms.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.roomNumber}
                {...room}
                hideApplyButton={isAdmin || isStaff}
                showAdminControls={isAdmin}
                onApply={() => handleApply(room.roomNumber)}
                onAccept={() => handleAccept(room.roomNumber)}
                onEdit={() => handleEditRoom(room)}
                onDelete={() => handleDeleteRoom(room.roomNumber)}
                onDeallocate={() => handleDeallocate(room.roomNumber)}
                onView={() => navigate(`/rooms/${room.roomNumber}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No rooms found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </main>

      <BrandedConfirm 
        isOpen={confirmConfig.isOpen}
        onOpenChange={(open) => setConfirmConfig(prev => ({ ...prev, isOpen: open }))}
        title={confirmConfig.title}
        description={confirmConfig.description}
        onConfirm={confirmConfig.onConfirm}
        variant={confirmConfig.variant}
      />
    </div>
  )
}

export default Rooms

