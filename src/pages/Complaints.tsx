import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Zap,
  Droplets,
  Shield,
  Search,
  Filter,
  User
} from "lucide-react"

import {
  getComplaints,
  addComplaint,
  updateComplaintStatus,
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  getCurrentUser
} from "@/lib/data-service"

const categoryIcons: Record<ComplaintCategory, React.ReactNode> = {
  maintenance: <Wrench className="h-4 w-4" />,
  electrical: <Zap className="h-4 w-4" />,
  plumbing: <Droplets className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  other: <MessageSquare className="h-4 w-4" />,
}

const statusConfig: Record<ComplaintStatus, { label: string; variant: "pending" | "warning" | "success"; icon: React.ReactNode }> = {
  pending: { label: "Pending", variant: "pending", icon: <Clock className="h-3 w-3" /> },
  "in-progress": { label: "In Progress", variant: "warning", icon: <AlertCircle className="h-3 w-3" /> },
  resolved: { label: "Resolved", variant: "success", icon: <CheckCircle2 className="h-3 w-3" /> },
}

const Complaints = () => {
  const { toast } = useToast()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as ComplaintCategory | "",
    roomNumber: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all")
  const [userRole, setUserRole] = useState<"admin" | "student" | "staff">("student")

  useEffect(() => {
    const loadComplaints = async () => {
      const data = await getComplaints()
      const user = getCurrentUser()
      if (user) setUserRole(user.role)

      if (user && user.role === 'student') {
        setComplaints(data.filter(c => c.studentName === user.name || (!c.studentName && c.roomNumber === user.roomBox)))
      } else {
        setComplaints(data)
      }
    }
    loadComplaints()
  }, [])

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.roomNumber.includes(searchQuery) ||
      (c.studentName && c.studentName.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter === "all" || c.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.category || !formData.roomNumber) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const user = getCurrentUser()
    const newComplaint = await addComplaint({
      title: formData.title,
      description: formData.description,
      category: formData.category as ComplaintCategory,
      roomNumber: formData.roomNumber,
      studentName: user?.name,
    })

    const refreshed = await getComplaints()
    setComplaints(refreshed)
    setFormData({ title: "", description: "", category: "", roomNumber: "" })
    setShowForm(false)

    toast({
      title: "Complaint submitted",
      description: "Your complaint has been registered successfully.",
    })
  }

  const handleStatusChange = async (id: string, newStatus: ComplaintStatus) => {
    await updateComplaintStatus(id, newStatus)
    const data = await getComplaints()
    setComplaints(data) // Refresh from store
    toast({
      title: "Status Updated",
      description: `Complaint status changed to ${newStatus}`,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="dashboard" />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Complaints</h1>
            <p className="text-muted-foreground">
                {userRole === 'admin' || userRole === 'staff' ? 'Manage and track all student requests' : 'Submit and track your maintenance requests'}
            </p>
          </div>
          {userRole === 'student' && (
            <Button variant="hero" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              New Complaint
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, room, or student..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 bg-muted/50 p-1 rounded-lg overflow-x-auto">
            {(["all", "pending", "in-progress", "resolved"] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "secondary" : "ghost"}
                size="sm"
                className="capitalize whitespace-nowrap"
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* New Complaint Form */}
        {showForm && (
          <div className="rounded-xl bg-card p-6 shadow-elegant border border-border/50 mb-8 animate-fade-up">
            <h3 className="text-lg font-semibold text-foreground mb-4">Submit New Complaint</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Room Number</label>
                  <Input
                    placeholder="e.g., 203"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: ComplaintCategory) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
                <Input
                  placeholder="Brief description of the issue"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                <Textarea
                  placeholder="Provide detailed information about the issue..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="hero">
                  Submit Complaint
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Complaints List */}
        <div className="space-y-4">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((complaint) => {
              const statusInfo = statusConfig[complaint.status]
              return (
                <div
                  key={complaint.id}
                  className="rounded-xl bg-card p-6 shadow-elegant border border-border/50 transition-all duration-300 hover:shadow-lg animate-fade-up"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                          {categoryIcons[complaint.category]}
                          <span className="capitalize">{complaint.category}</span>
                        </div>
                        <Badge variant={statusInfo.variant} className="gap-1">
                          {statusInfo.icon}
                          {statusInfo.label}
                        </Badge>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          Room {complaint.roomNumber}
                        </span>
                        {userRole === 'admin' && complaint.studentName && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                            <User className="h-3 w-3" />
                            {complaint.studentName}
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{complaint.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">{complaint.description}</p>

                      {/* Admin/Staff/Student Action Section */}
                      {userRole === 'admin' || userRole === 'staff' ? (
                        <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Update Status:</span>
                          <Select
                            value={complaint.status}
                            onValueChange={(value) => handleStatusChange(complaint.id, value as ComplaintStatus)}
                          >
                            <SelectTrigger className="h-9 w-[160px] bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="pt-2 text-xs text-muted-foreground italic">
                          Status: <span className="font-medium text-foreground capitalize">{complaint.status}</span>
                        </div>
                      )}

                    </div>
                    <div className="text-right text-xs text-muted-foreground shrink-0 flex flex-col justify-between h-auto sm:h-24">
                      <div>
                        <p className="font-medium text-foreground/70">Created</p>
                        <p>{complaint.createdAt}</p>
                      </div>
                      <div className="mt-auto">
                        <p className="font-medium text-foreground/70">Last Update</p>
                        <p>{complaint.updatedAt}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-foreground/70">No complaints found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Complaints
