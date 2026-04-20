import { Navbar } from "@/components/Navbar"
import { AdminDashboard } from "@/components/dashboard/AdminDashboard"
import { StudentDashboard } from "@/components/dashboard/StudentDashboard"
import { StaffDashboard } from "@/components/dashboard/StaffDashboard"
import { useState, useEffect } from "react"

const Dashboard = () => {
  const [role, setRole] = useState<"admin" | "student" | "staff">(() => {
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        if (user.role === "admin") return "admin"
        if (user.role === "staff") return "staff"
        return "student"
      } catch (e) {
        console.error("Failed to parse user data")
      }
    }
    return "student"
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="dashboard" />

      <main className="container mx-auto px-4 py-8">
        {role === "admin" ? (
          <AdminDashboard />
        ) : role === "staff" ? (
          <StaffDashboard />
        ) : (
          <StudentDashboard />
        )}
      </main>
    </div>
  )
}

export default Dashboard
