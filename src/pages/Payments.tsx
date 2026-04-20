import { useState, useEffect, useMemo } from "react"
import { PaymentDialog } from "@/components/PaymentDialog"
import { Navbar } from "@/components/Navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, Download, Check, Clock, AlertTriangle, Search, Filter } from "lucide-react"

import {
  getPayments,
  updatePaymentStatus,
  addPayment,
  Payment,
  PaymentStatus,
  getRooms,
  Room
} from "@/lib/data-service"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"

const statusConfig: Record<PaymentStatus, { label: string; variant: "success" | "warning" | "destructive"; icon: React.ReactNode }> = {
  paid: { label: "Paid", variant: "success", icon: <Check className="h-3 w-3" /> },
  pending: { label: "Pending", variant: "warning", icon: <Clock className="h-3 w-3" /> },
  overdue: { label: "Overdue", variant: "destructive", icon: <AlertTriangle className="h-3 w-3" /> },
}

const Payments = () => {
  const [role, setRole] = useState<"admin" | "student" | "staff">("student")
  const [payments, setPayments] = useState<Payment[]>([])
  const [allRooms, setAllRooms] = useState<Room[]>([])
  const [currentUser, setCurrentUser] = useState<{ role: "admin" | "student" | "staff", name: string, roomBox?: string } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      let user: { role: "admin" | "student" | "staff", name: string } | null = null;
      const savedUser = localStorage.getItem("currentUser")
      if (savedUser) {
        try {
          user = JSON.parse(savedUser)
          setRole(user.role === "admin" ? "admin" : user.role === "staff" ? "staff" : "student")
        } catch (e) {
          console.error("Failed to parse user data")
        }
      }

      const [paymentData, roomData] = await Promise.all([
        getPayments(),
        getRooms()
      ])
      
      setAllRooms(roomData)
      setCurrentUser(user)

      if (user && user.role === 'student') {
        const studentNameLower = user.name.toLowerCase().trim()
        setPayments(paymentData.filter(p => 
          p.studentName?.toLowerCase().trim() === studentNameLower
        ))
      } else {
        setPayments(paymentData)
      }
    }
    fetchData()
  }, [])

  const handlePayNow = async (id: string) => {
    await updatePaymentStatus(id, "paid", new Date().toISOString().split('T')[0])
    const data = await getPayments()
    setPayments(data)
  }

  // Admin View Component
  const AdminView = () => {
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all")
    const [showRecordForm, setShowRecordForm] = useState(false)
    const [formData, setFormData] = useState({
      studentName: "",
      roomNumber: "",
      amount: "",
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear().toString(),
      status: "paid" as PaymentStatus,
      dueDate: new Date().toISOString().split('T')[0],
    })

    // Auto-fill amount based on roomNumber
    useEffect(() => {
      if (formData.roomNumber) {
        const room = allRooms.find(r => r.roomNumber === formData.roomNumber)
        if (room && room.rent) {
          setFormData(prev => ({ ...prev, amount: room.rent.toString() }))
        }
      }
    }, [formData.roomNumber, allRooms])

    const filteredPayments = payments.filter(payment => {
      const matchesSearch = 
        payment.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || payment.status === statusFilter
      
      return matchesSearch && matchesStatus
    })

    const handleRecordPayment = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.studentName || !formData.roomNumber || !formData.amount) {
        toast({ title: "Missing fields", description: "Please fill in all student and payment details.", variant: "destructive" })
        return
      }

      if (Number(formData.amount) <= 0) {
        toast({ title: "Invalid amount", description: "Rent amount must be greater than zero.", variant: "destructive" })
        return
      }

      await addPayment({
        studentName: formData.studentName,
        roomNumber: formData.roomNumber,
        amount: Number(formData.amount),
        month: formData.month,
        year: Number(formData.year),
        status: formData.status,
        dueDate: formData.dueDate,
        paidDate: formData.status === 'paid' ? new Date().toISOString().split('T')[0] : ""
      })

      const data = await getPayments()
      setPayments(data)
      setShowRecordForm(false)
      setFormData({
        ...formData,
        studentName: "",
        roomNumber: "",
        amount: "",
      })
      toast({ title: "Payment Recorded", description: "The payment has been successfully logged." })
    }

    const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
    const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
    const overdueCount = payments.filter(p => p.status === 'overdue').length

    return (
      <div className="space-y-6 animate-fade-up">
        {/* Admin Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <div className="rounded-xl bg-card p-6 shadow-elegant border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-card p-6 shadow-elegant border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Pending Collection</span>
            </div>
            <p className="text-2xl font-bold text-foreground">₹{pendingAmount.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-card p-6 shadow-elegant border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Overdue Accounts</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{overdueCount}</p>
          </div>
        </div>

        {/* Record Payment Form */}
        {showRecordForm && (
          <div className="rounded-xl bg-card p-6 shadow-elegant border border-border/50 mb-8 animate-fade-down">
            <h3 className="text-lg font-semibold mb-4">Record New Payment</h3>
            <form onSubmit={handleRecordPayment} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input 
                placeholder="Student Name" 
                value={formData.studentName} 
                onChange={e => setFormData({...formData, studentName: e.target.value})}
              />
              <Input 
                placeholder="Room No" 
                value={formData.roomNumber} 
                onChange={e => setFormData({...formData, roomNumber: e.target.value})}
              />
              <Input 
                type="number" 
                placeholder="Amount" 
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
              <Select 
                value={formData.status} 
                onValueChange={(val: PaymentStatus) => setFormData({...formData, status: val})}
              >
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <div className="lg:col-span-4 flex justify-end gap-3 mt-2">
                <Button type="button" variant="outline" onClick={() => setShowRecordForm(false)}>Cancel</Button>
                <Button type="submit" variant="hero">Save Payment Record</Button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Search student or room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 bg-muted/50 p-1 rounded-lg">
            {(["all", "paid", "pending", "overdue"] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "secondary" : "ghost"}
                size="sm"
                className="capitalize"
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>
          {!showRecordForm && role === 'admin' && (
            <Button variant="hero" className="md:ml-auto gap-2" onClick={() => setShowRecordForm(true)}>
              <Plus className="h-4 w-4" />
              Record Payment
            </Button>
          )}
        </div>

        <div className="rounded-xl bg-card shadow-elegant border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Room No</th>
                  <th className="px-6 py-4">Month/Year</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => {
                    const status = statusConfig[payment.status]
                    return (
                      <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{payment.studentName}</td>
                        <td className="px-6 py-4">{payment.roomNumber}</td>
                        <td className="px-6 py-4">{payment.month} {payment.year}</td>
                        <td className="px-6 py-4 font-semibold">₹{payment.amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <Badge variant={status.variant} className="gap-1">
                            {status.icon} {status.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Select
                            value={payment.status}
                            onValueChange={async (newStatus: PaymentStatus) => {
                                await updatePaymentStatus(payment.id, newStatus)
                                const data = await getPayments()
                                setPayments(data)
                                toast({ title: "Status Updated" })
                            }}
                          >
                            <SelectTrigger className="h-8 w-[120px] ml-auto">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // Student View Component (Original)
  const StudentView = () => {
    const { toast } = useToast()
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
    const [isPaymentOpen, setIsPaymentOpen] = useState(false)

    const totalDue = payments
      .filter((p) => p.status !== "paid")
      .reduce((sum, p) => sum + p.amount, 0)

    const totalPaid = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0)
    
    const allocatedRoomRent = useMemo(() => {
      const room = allRooms.find(r => r.roomNumber === currentUser?.roomBox)
      return room?.rent || null
    }, [allRooms, currentUser])

    const handleDownloadReceipt = (payment: Payment) => {
      const receiptContent = `
=========================================
          HOSTEL HUB - RENT RECEIPT
=========================================
Receipt No: RCPT-${payment.id.toUpperCase()}
Date: ${payment.paidDate || new Date().toISOString().split('T')[0]}
-----------------------------------------
Student Name: ${payment.studentName}
Room Number: ${payment.roomNumber}
Period: ${payment.month} ${payment.year}
Amount Paid: ₹${payment.amount.toLocaleString()}
Status: PAID SUCCESSFULLY
Payment Mode: Online (Simulated)
-----------------------------------------
Thank you for your payment!
This is a computer-generated receipt.
=========================================
`
      const blob = new Blob([receiptContent], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Receipt_${payment.month}_${payment.year}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({ title: "Receipt Downloaded", description: "Your payment receipt has been saved." })
    }

    return (
      <>
        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <div className="rounded-xl bg-card p-6 shadow-elegant border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Check className="h-5 w-5 text-success" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Total Paid</span>
            </div>
            <p className="text-2xl font-bold text-foreground">₹{totalPaid.toLocaleString()}</p>
          </div>

          <div className="rounded-xl bg-card p-6 shadow-elegant border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Total Due</span>
            </div>
            <p className="text-2xl font-bold text-foreground">₹{totalDue.toLocaleString()}</p>
          </div>

          <div className="rounded-xl gradient-primary p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-sm text-primary-foreground/80 font-medium">Monthly Rent</span>
            </div>
            <p className="text-2xl font-bold text-primary-foreground">
                ₹{allocatedRoomRent?.toLocaleString() || "N/A"}
            </p>
          </div>
        </div>

        {/* Payment History */}
        <div className="rounded-xl bg-card shadow-elegant border border-border/50 overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Payment History</h2>
          </div>

          <div className="divide-y divide-border">
            {payments.map((payment) => {
              const status = statusConfig[payment.status]
              return (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${payment.status === "paid" ? "bg-success/10" :
                      payment.status === "pending" ? "bg-warning/10" : "bg-destructive/10"
                      }`}>
                      <CreditCard className={`h-6 w-6 ${payment.status === "paid" ? "text-success" :
                        payment.status === "pending" ? "text-warning" : "text-destructive"
                        }`} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{payment.month} {payment.year}</p>
                      <p className="text-sm text-muted-foreground font-medium">Due: {payment.dueDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-right">
                      <p className="font-bold text-foreground text-lg">₹{payment.amount.toLocaleString()}</p>
                      {payment.paidDate && (
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Paid on {payment.paidDate}</p>
                      )}
                    </div>
                    <Badge variant={status.variant} className="gap-1">
                      {status.icon}
                      {status.label}
                    </Badge>
                    {payment.status === "paid" && (
                      <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/5" onClick={() => handleDownloadReceipt(payment)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {payment.status !== "paid" && (
                      <Button variant="hero" size="sm" onClick={() => {
                        setSelectedPayment(payment)
                        setIsPaymentOpen(true)
                      }}>
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {selectedPayment && (
          <PaymentDialog 
            isOpen={isPaymentOpen}
            onOpenChange={setIsPaymentOpen}
            amount={selectedPayment.amount}
            month={selectedPayment.month}
            year={selectedPayment.year}
            onSuccess={() => handlePayNow(selectedPayment.id)}
          />
        )}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="dashboard" />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {role === 'admin' || role === 'staff' ? 'Payment Records' : 'My Payments'}
          </h1>
          <p className="text-muted-foreground">
            {role === 'admin' || role === 'staff' ? 'Manage and track student payments' : 'Track your rent payments and history'}
          </p>
        </div>

        {role === 'admin' || role === 'staff' ? <AdminView /> : <StudentView />}
      </main>
    </div>
  )
}

export default Payments
