import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { RoomCard, RoomStatus } from "@/components/RoomCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, SlidersHorizontal } from "lucide-react"

const allRooms = [
  { roomNumber: "101", floor: 1, type: "single" as const, rent: 8500, status: "available" as RoomStatus, amenities: ["WiFi", "AC"], occupants: 0, maxOccupants: 1 },
  { roomNumber: "102", floor: 1, type: "single" as const, rent: 7500, status: "occupied" as RoomStatus, amenities: ["WiFi"], occupants: 1, maxOccupants: 1 },
  { roomNumber: "103", floor: 1, type: "double" as const, rent: 6500, status: "available" as RoomStatus, amenities: ["WiFi", "AC"], occupants: 0, maxOccupants: 2 },
  { roomNumber: "201", floor: 2, type: "double" as const, rent: 6000, status: "occupied" as RoomStatus, amenities: ["WiFi"], occupants: 2, maxOccupants: 2 },
  { roomNumber: "202", floor: 2, type: "single" as const, rent: 8000, status: "pending" as RoomStatus, amenities: ["WiFi", "AC"], occupants: 0, maxOccupants: 1 },
  { roomNumber: "203", floor: 2, type: "triple" as const, rent: 5000, status: "available" as RoomStatus, amenities: ["WiFi"], occupants: 1, maxOccupants: 3 },
  { roomNumber: "301", floor: 3, type: "single" as const, rent: 7000, status: "maintenance" as RoomStatus, amenities: ["WiFi"], occupants: 0, maxOccupants: 1 },
  { roomNumber: "302", floor: 3, type: "double" as const, rent: 6500, status: "available" as RoomStatus, amenities: ["WiFi", "AC"], occupants: 1, maxOccupants: 2 },
  { roomNumber: "303", floor: 3, type: "triple" as const, rent: 4500, status: "occupied" as RoomStatus, amenities: ["WiFi"], occupants: 3, maxOccupants: 3 },
]

const Rooms = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const filteredRooms = allRooms.filter((room) => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || room.status === statusFilter
    const matchesType = typeFilter === "all" || room.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const statusCounts = {
    all: allRooms.length,
    available: allRooms.filter((r) => r.status === "available").length,
    occupied: allRooms.filter((r) => r.status === "occupied").length,
    pending: allRooms.filter((r) => r.status === "pending").length,
    maintenance: allRooms.filter((r) => r.status === "maintenance").length,
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="dashboard" />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Rooms</h1>
          <p className="text-muted-foreground">Browse and manage all hostel rooms</p>
        </div>

        {/* Status Filter Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                statusFilter === status
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <span className="capitalize">{status}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                statusFilter === status ? "bg-primary-foreground/20" : "bg-background"
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
              <RoomCard key={room.roomNumber} {...room} />
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
    </div>
  )
}

export default Rooms
