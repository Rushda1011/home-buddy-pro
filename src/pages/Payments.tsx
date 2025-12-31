import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, Download, Check, Clock, AlertTriangle } from "lucide-react"

type PaymentStatus = "paid" | "pending" | "overdue"

interface Payment {
  id: string
  month: string
  year: number
  amount: number
  dueDate: string
  paidDate?: string
  status: PaymentStatus
}

const mockPayments: Payment[] = [
  { id: "1", month: "January", year: 2024, amount: 8500, dueDate: "2024-01-05", paidDate: "2024-01-03", status: "paid" },
  { id: "2", month: "February", year: 2024, amount: 8500, dueDate: "2024-02-05", paidDate: "2024-02-04", status: "paid" },
  { id: "3", month: "March", year: 2024, amount: 8500, dueDate: "2024-03-05", status: "pending" },
  { id: "4", month: "December", year: 2023, amount: 8500, dueDate: "2023-12-05", status: "overdue" },
]

const statusConfig: Record<PaymentStatus, { label: string; variant: "success" | "warning" | "destructive"; icon: React.ReactNode }> = {
  paid: { label: "Paid", variant: "success", icon: <Check className="h-3 w-3" /> },
  pending: { label: "Pending", variant: "warning", icon: <Clock className="h-3 w-3" /> },
  overdue: { label: "Overdue", variant: "destructive", icon: <AlertTriangle className="h-3 w-3" /> },
}

const Payments = () => {
  const totalDue = mockPayments
    .filter((p) => p.status !== "paid")
    .reduce((sum, p) => sum + p.amount, 0)

  const totalPaid = mockPayments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="dashboard" />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Payments</h1>
          <p className="text-muted-foreground">Track your rent payments and history</p>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <div className="rounded-xl bg-card p-6 shadow-elegant border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Check className="h-5 w-5 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Total Paid</span>
            </div>
            <p className="text-2xl font-bold text-foreground">₹{totalPaid.toLocaleString()}</p>
          </div>

          <div className="rounded-xl bg-card p-6 shadow-elegant border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <span className="text-sm text-muted-foreground">Total Due</span>
            </div>
            <p className="text-2xl font-bold text-foreground">₹{totalDue.toLocaleString()}</p>
          </div>

          <div className="rounded-xl gradient-primary p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-sm text-primary-foreground/80">Monthly Rent</span>
            </div>
            <p className="text-2xl font-bold text-primary-foreground">₹8,500</p>
          </div>
        </div>

        {/* Payment History */}
        <div className="rounded-xl bg-card shadow-elegant border border-border/50 overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Payment History</h2>
          </div>

          <div className="divide-y divide-border">
            {mockPayments.map((payment) => {
              const status = statusConfig[payment.status]
              return (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                      payment.status === "paid" ? "bg-success/10" :
                      payment.status === "pending" ? "bg-warning/10" : "bg-destructive/10"
                    }`}>
                      <CreditCard className={`h-6 w-6 ${
                        payment.status === "paid" ? "text-success" :
                        payment.status === "pending" ? "text-warning" : "text-destructive"
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{payment.month} {payment.year}</p>
                      <p className="text-sm text-muted-foreground">Due: {payment.dueDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-right">
                      <p className="font-bold text-foreground text-lg">₹{payment.amount.toLocaleString()}</p>
                      {payment.paidDate && (
                        <p className="text-xs text-muted-foreground">Paid on {payment.paidDate}</p>
                      )}
                    </div>
                    <Badge variant={status.variant} className="gap-1">
                      {status.icon}
                      {status.label}
                    </Badge>
                    {payment.status === "paid" && (
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {payment.status !== "paid" && (
                      <Button variant="hero" size="sm">
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Payments
