import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserMinus, Plus, Search, Calendar, User, Users } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { getVisitors, addVisitor, updateVisitorStatus, Visitor } from "@/lib/data-service"
import { useToast } from "@/hooks/use-toast"

const Visitors = () => {
    const { toast } = useToast()
    const [visitors, setVisitors] = useState<Visitor[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [newVisitor, setNewVisitor] = useState({
        visitorName: "",
        studentName: "",
        relation: "",
        visitDate: new Date().toISOString().split('T')[0],
        checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    })

    useEffect(() => {
        loadVisitors()
    }, [])

    const loadVisitors = async () => {
        const data = await getVisitors()
        setVisitors(data)
    }

    const handleAddVisitor = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await addVisitor(newVisitor)
            toast({
                title: "Success",
                description: "Visitor record added successfully.",
            })
            setIsAddDialogOpen(false)
            loadVisitors()
            setNewVisitor({
                visitorName: "",
                studentName: "",
                relation: "",
                visitDate: new Date().toISOString().split('T')[0],
                checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add visitor record.",
                variant: "destructive",
            })
        }
    }

    const handleCheckOut = async (id: string) => {
        const checkOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        try {
            await updateVisitorStatus(id, 'completed', checkOutTime)
            toast({
                title: "Checked Out",
                description: `Visitor checked out at ${checkOutTime}.`,
            })
            loadVisitors()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update status.",
                variant: "destructive",
            })
        }
    }

    const filteredVisitors = visitors.filter(v => 
        v.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())

    return (
        <div className="min-h-screen bg-muted/30">
            <Navbar variant="dashboard" />
            
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                            <Users className="h-8 w-8 text-primary" />
                            Visitor Log
                        </h1>
                        <p className="text-muted-foreground font-medium">Monitor and manage hostel visitors.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search visitor or student..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="hero" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Log Visitor
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Log New Visitor</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAddVisitor} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="visitorName">Visitor Name</Label>
                                        <Input
                                            id="visitorName"
                                            required
                                            value={newVisitor.visitorName}
                                            onChange={(e) => setNewVisitor({ ...newVisitor, visitorName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="studentName">Visiting Student</Label>
                                        <Input
                                            id="studentName"
                                            required
                                            value={newVisitor.studentName}
                                            onChange={(e) => setNewVisitor({ ...newVisitor, studentName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="relation">Relation</Label>
                                        <Input
                                            id="relation"
                                            placeholder="Parent, Sibling, Friend, etc."
                                            required
                                            value={newVisitor.relation}
                                            onChange={(e) => setNewVisitor({ ...newVisitor, relation: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="visitDate">Date</Label>
                                            <Input
                                                id="visitDate"
                                                type="date"
                                                required
                                                value={newVisitor.visitDate}
                                                onChange={(e) => setNewVisitor({ ...newVisitor, visitDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="checkIn">Check-In Time</Label>
                                            <Input
                                                id="checkIn"
                                                type="time"
                                                required
                                                value={newVisitor.checkIn}
                                                onChange={(e) => setNewVisitor({ ...newVisitor, checkIn: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" variant="hero" className="w-full">Save Record</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="bg-card rounded-xl shadow-elegant border border-border/50 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[150px]">Date</TableHead>
                                <TableHead>Visitor</TableHead>
                                <TableHead>Visiting Student</TableHead>
                                <TableHead>Relation</TableHead>
                                <TableHead>Timing</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredVisitors.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                        No visitor records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredVisitors.map((v) => (
                                    <TableRow key={v.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-primary" />
                                                {v.visitDate}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold">{v.visitorName}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                {v.studentName}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal">{v.relation}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-xs">
                                                <span className="text-success font-medium">In: {v.checkIn}</span>
                                                <span className="text-muted-foreground">
                                                    Out: {v.checkOut || "--:--"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={v.status === 'active' ? "hero" : "secondary"}
                                                className={v.status === 'active' ? "shadow-sm" : "opacity-70 font-normal"}
                                            >
                                                {v.status === 'active' ? 'Visiting' : 'Checked Out'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {v.status === 'active' && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-8 gap-1.5 border-primary/20 text-primary hover:bg-primary/10"
                                                    onClick={() => handleCheckOut(v.id)}
                                                >
                                                    <UserMinus className="h-3.5 w-3.5" />
                                                    Check Out
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </main>
        </div>
    )
}

export default Visitors
