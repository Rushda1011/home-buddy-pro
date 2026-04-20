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
import { Search, Mail, Phone, User as UserIcon, Plus, Pencil, Trash2, Calendar, Clock, Briefcase } from "lucide-react"
import { getStaff, addStaff, updateStaff, deleteStaff, Staff as StaffType } from "@/lib/data-service"
import { BrandedConfirm } from "@/components/BrandedConfirm"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"

const Staff = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [staff, setStaff] = useState<StaffType[]>([])
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedStaff, setSelectedStaff] = useState<StaffType | null>(null)
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        id: string;
    }>({
        isOpen: false,
        id: ""
    })
    
    // Form state
    const [formData, setFormData] = useState<Omit<StaffType, 'id'>>({
        name: "",
        role: "",
        phone: "",
        email: "",
        status: "active",
        shift: "Day",
        joinDate: new Date().toISOString().split('T')[0]
    })

    const loadStaff = async () => {
        const data = await getStaff()
        setStaff(data)
    }

    useEffect(() => {
        loadStaff()
    }, [])

    const filteredStaff = staff.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleAddStaff = async () => {
        // Basic Validations
        if (!formData.name || !formData.role || !formData.phone || !formData.email) {
            toast.error("Please fill in all required fields")
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address")
            return
        }

        const phoneRegex = /^\+?[\d\s-]{10,}$/
        if (!phoneRegex.test(formData.phone)) {
            toast.error("Please enter a valid phone number (min 10 digits)")
            return
        }

        await addStaff(formData)
        toast.success("Staff member added successfully")
        setIsAddDialogOpen(false)
        resetForm()
        await loadStaff()
    }

    const handleEditStaff = async () => {
        if (!selectedStaff) return
        
        if (!formData.name || !formData.role || !formData.phone || !formData.email) {
            toast.error("Please fill in all required fields")
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address")
            return
        }

        await updateStaff(selectedStaff.id, formData)
        toast.success("Staff details updated")
        setIsEditDialogOpen(false)
        setSelectedStaff(null)
        resetForm()
        await loadStaff()
    }

    const handleDeleteStaff = (id: string) => {
        setConfirmConfig({
            isOpen: true,
            id: id
        })
    }

    const confirmDelete = async () => {
        if (!confirmConfig.id) return
        await deleteStaff(confirmConfig.id)
        toast.success("Staff member removed")
        await loadStaff()
    }

    const resetForm = () => {
        setFormData({
            name: "",
            role: "",
            phone: "",
            email: "",
            status: "active",
            shift: "Day",
            joinDate: new Date().toISOString().split('T')[0]
        })
    }

    const openEditDialog = (member: StaffType) => {
        setSelectedStaff(member)
        setFormData({
            name: member.name,
            role: member.role,
            phone: member.phone,
            email: member.email,
            status: member.status,
            shift: member.shift,
            joinDate: member.joinDate
        })
        setIsEditDialogOpen(true)
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar variant="dashboard" />

            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Staff Management</h1>
                        <p className="text-muted-foreground">Manage your hostel staff, shifts, and roles</p>
                    </div>
                    
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Staff Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Staff</DialogTitle>
                                <DialogDescription>
                                    Enter the details of the new staff member here.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input 
                                        id="name" 
                                        value={formData.name} 
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        placeholder="John Doe" 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Input 
                                            id="role" 
                                            value={formData.role} 
                                            onChange={e => setFormData({...formData, role: e.target.value})}
                                            placeholder="e.g. Warden" 
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="shift">Shift</Label>
                                        <Select 
                                            value={formData.shift} 
                                            onValueChange={(v: any) => setFormData({...formData, shift: v})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select shift" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Day">Day</SelectItem>
                                                <SelectItem value="Evening">Evening</SelectItem>
                                                <SelectItem value="Night">Night</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input 
                                        id="email" 
                                        type="email"
                                        value={formData.email} 
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        placeholder="email@example.com" 
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input 
                                        id="phone" 
                                        value={formData.phone} 
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                        placeholder="+91 XXXXX XXXXX" 
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="joinDate">Joining Date</Label>
                                    <Input 
                                        id="joinDate" 
                                        type="date"
                                        value={formData.joinDate} 
                                        onChange={e => setFormData({...formData, joinDate: e.target.value})}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddStaff}>Save Staff Member</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <div className="relative mb-6 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, role or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Staff Table */}
                <div className="rounded-xl border border-border/50 bg-card shadow-elegant overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Staff Member</TableHead>
                                <TableHead>Contact Info</TableHead>
                                <TableHead>Role & Shift</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStaff.length > 0 ? (
                                filteredStaff.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <UserIcon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{member.name}</div>
                                                    <div className="text-xs text-muted-foreground">ID: {member.id}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                                    {member.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                                    {member.phone}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <Briefcase className="h-3 w-3 text-primary" />
                                                    {member.role}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {member.shift} Shift
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={member.status === 'active' ? 'outline' : 'secondary'} 
                                                className={member.status === 'active' ? 'text-success border-success/30 bg-success/5' : ''}
                                            >
                                                {member.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {member.joinDate}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => openEditDialog(member)}
                                                >
                                                    <Pencil className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => handleDeleteStaff(member.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive/70" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No staff members found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </main>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Staff Details</DialogTitle>
                        <DialogDescription>
                            Update the information for {selectedStaff?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Full Name</Label>
                            <Input 
                                id="edit-name" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-role">Role</Label>
                                <Input 
                                    id="edit-role" 
                                    value={formData.role} 
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-shift">Shift</Label>
                                <Select 
                                    value={formData.shift} 
                                    onValueChange={(v: any) => setFormData({...formData, shift: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Day">Day</SelectItem>
                                        <SelectItem value="Evening">Evening</SelectItem>
                                        <SelectItem value="Night">Night</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select 
                                value={formData.status} 
                                onValueChange={(v: any) => setFormData({...formData, status: v})}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="on-leave">On Leave</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input 
                                id="edit-email" 
                                type="email"
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-phone">Phone Number</Label>
                            <Input 
                                id="edit-phone" 
                                value={formData.phone} 
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditStaff}>Update Details</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <BrandedConfirm 
                isOpen={confirmConfig.isOpen}
                onOpenChange={(open) => setConfirmConfig(prev => ({ ...prev, isOpen: open }))}
                title="Remove Staff"
                description="Are you sure you want to remove this staff member from the system?"
                onConfirm={confirmDelete}
                variant="destructive"
            />
        </div>
    )
}

export default Staff
