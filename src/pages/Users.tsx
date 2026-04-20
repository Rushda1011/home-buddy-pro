import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search, Mail, Phone, Home, User as UserIcon, Settings2 } from "lucide-react"
import { getUsers, User as UserType, getRooms, Room, allocateRoom } from "@/lib/data-service"
import { toast } from "sonner"

const Users = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [users, setUsers] = useState<UserType[]>([])
    const [rooms, setRooms] = useState<Room[]>([])
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
    const [selectedRoom, setSelectedRoom] = useState<string>("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const loadData = async () => {
        const [usersData, roomsData] = await Promise.all([getUsers(), getRooms()])
        setUsers(usersData)
        setRooms(roomsData)
    }

    useEffect(() => {
        loadData()
    }, [])

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.roomBox.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const availableRooms = rooms.filter(r => r.status === 'available')

    const handleAllocate = async () => {
        if (!selectedUser || !selectedRoom) return

        await allocateRoom(selectedUser.id, selectedRoom)
        toast.success(`Room ${selectedRoom} allocated to ${selectedUser.name}`)
        await loadData()
        setIsDialogOpen(false)
        setSelectedUser(null)
        setSelectedRoom("")
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar variant="dashboard" />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Registered Users</h1>
                    <p className="text-muted-foreground">Manage and view details of all registered users</p>
                </div>

                {/* Search */}
                <div className="relative mb-6 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Users Table */}
                <div className="rounded-xl border border-border/50 bg-card shadow-elegant overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <UserIcon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-xs text-muted-foreground">ID: #{user.id}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="h-3 w-3 text-muted-foreground" />
                                                {user.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-3 w-3 text-muted-foreground" />
                                                {user.phone}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {user.roomBox !== '-' && user.roomBox !== 'Unassigned' ? (
                                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-1.5 py-1">
                                                    <Home className="h-3.5 w-3.5" />
                                                    Room {user.roomBox}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground italic text-xs">Not Allocated</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === 'active' ? 'outline' : 'secondary'} className={user.status === 'active' ? 'text-success border-success/30 bg-success/5' : ''}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {user.joinDate}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {user.role === 'student' && (
                                            <Dialog open={isDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                                                setIsDialogOpen(open);
                                                if (open) setSelectedUser(user);
                                            }}>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Settings2 className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Allocate Room</DialogTitle>
                                                        <DialogDescription>
                                                            Assign a room to {user.name}. Only available rooms are shown.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="py-4">
                                                        <Select onValueChange={setSelectedRoom} value={selectedRoom}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a room" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {availableRooms.map((room) => (
                                                                    <SelectItem key={room.roomNumber} value={room.roomNumber}>
                                                                        Room {room.roomNumber} ({room.type} - ₹{room.rent})
                                                                    </SelectItem>
                                                                ))}
                                                                {availableRooms.length === 0 && (
                                                                    <p className="p-2 text-sm text-muted-foreground">No available rooms</p>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                                        <Button onClick={handleAllocate} disabled={!selectedRoom}>Allocate</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </main>
        </div>
    )
}

export default Users
