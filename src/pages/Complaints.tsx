import { useState } from "react"
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
  Shield
} from "lucide-react"

type ComplaintStatus = "pending" | "in-progress" | "resolved"
type ComplaintCategory = "maintenance" | "electrical" | "plumbing" | "security" | "other"

interface Complaint {
  id: string
  title: string
  description: string
  category: ComplaintCategory
  status: ComplaintStatus
  roomNumber: string
  createdAt: string
  updatedAt: string
}

const mockComplaints: Complaint[] = [
  {
    id: "1",
    title: "Water leakage in bathroom",
    description: "There's a continuous water leak from the bathroom faucet that needs immediate attention.",
    category: "plumbing",
    status: "in-progress",
    roomNumber: "203",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-16",
  },
  {
    id: "2",
    title: "AC not working",
    description: "The air conditioning unit is not cooling properly. Temperature remains high even at lowest setting.",
    category: "electrical",
    status: "pending",
    roomNumber: "105",
    createdAt: "2024-01-14",
    updatedAt: "2024-01-14",
  },
  {
    id: "3",
    title: "Door lock malfunction",
    description: "The main door lock is stuck and difficult to open. Security concern.",
    category: "security",
    status: "resolved",
    roomNumber: "312",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-12",
  },
]

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
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as ComplaintCategory | "",
    roomNumber: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.category || !formData.roomNumber) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const newComplaint: Complaint = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category as ComplaintCategory,
      status: "pending",
      roomNumber: formData.roomNumber,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }

    setComplaints([newComplaint, ...complaints])
    setFormData({ title: "", description: "", category: "", roomNumber: "" })
    setShowForm(false)
    
    toast({
      title: "Complaint submitted",
      description: "Your complaint has been registered successfully.",
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
            <p className="text-muted-foreground">Submit and track your maintenance requests</p>
          </div>
          <Button variant="hero" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Complaint
          </Button>
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
          {complaints.map((complaint) => {
            const status = statusConfig[complaint.status]
            return (
              <div
                key={complaint.id}
                className="rounded-xl bg-card p-6 shadow-elegant border border-border/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                        {categoryIcons[complaint.category]}
                        <span className="capitalize">{complaint.category}</span>
                      </div>
                      <Badge variant={status.variant} className="gap-1">
                        {status.icon}
                        {status.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Room {complaint.roomNumber}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{complaint.title}</h3>
                    <p className="text-muted-foreground text-sm">{complaint.description}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Created: {complaint.createdAt}</p>
                    <p>Updated: {complaint.updatedAt}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default Complaints
