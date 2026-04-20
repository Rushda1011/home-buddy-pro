import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Building2, Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react"

import { addUser, getRooms } from "@/lib/data-service"

const Register = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    staffRole: "",
    gender: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.role) {
      toast({ title: "Role required", description: "Please select if you are a student, staff, or admin.", variant: "destructive" })
      return
    }

    if (formData.role === "staff" && !formData.staffRole) {
      toast({ title: "Staff Role required", description: "Please select your specific staff designation (e.g., Cook, Warden).", variant: "destructive" })
      return
    }

    if (!formData.gender) {
      toast({ title: "Gender required", description: "Please select your gender.", variant: "destructive" })
      return
    }

    if (formData.gender === "Male") {
      toast({ title: "Registration Denied", description: "Sorry, this hostel is exclusively for ladies.", variant: "destructive" })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" })
      return
    }

    if (formData.password.length < 6) {
      toast({ title: "Weak password", description: "Password must be at least 6 characters long.", variant: "destructive" })
      return
    }

    if (formData.phone.length < 10) {
      toast({ title: "Invalid phone", description: "Please enter a valid phone number.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    
    // Check room availability
    try {
      const rooms = await getRooms()
      const availableRooms = rooms.filter(r => r.status === 'available')
      
      if (availableRooms.length === 0) {
        toast({ 
          title: "Oops!", 
          description: "Now all the rooms are fills. Please contact admin", 
          variant: "destructive" 
        })
        setIsLoading(false)
        return
      }
    } catch (error) {
      console.error("Failed to check room availability:", error)
      // Proceeding might be risky if rooms are actually full, but let's assume availability if API fails
    }

    try {
      // Verify name against genderize.io API
      const firstName = formData.name.split(' ')[0]
      const response = await fetch(`https://api.genderize.io/?name=${firstName}`)
      const data = await response.json()
      
      if (data.gender === 'male' && data.probability > 0.6) {
        toast({ 
          title: "Registration Denied", 
          description: `The name "${firstName}" appears to be male. This hostel is exclusively for ladies. Please contact admin if this is an error.`, 
          variant: "destructive" 
        })
        setIsLoading(false)
        return
      }
    } catch (error) {
      console.error("Gender verification failed:", error);
      // Proceed if API fails, fallback to manual verification
    }

    // Simulate registration delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const role = (formData.role as 'student' | 'admin' | 'staff') || "student"

    // Persist to our "mock database"
    const res = await addUser({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: role,
      password: formData.password,
      ...(formData.role === 'staff' && { staffRole: formData.staffRole })
    })

    localStorage.setItem("currentUser", JSON.stringify({
      id: res.id,
      name: formData.name,
      email: formData.email,
      role: role,
      isNewUser: true
    }))

    toast({
      title: "Account created!",
      description: `Welcome! Your ${role} account is ready.`,
    })

    navigate("/dashboard")
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="relative z-10 text-center text-primary-foreground">
          <h2 className="text-4xl font-bold mb-4">Join HostelHub</h2>
          <p className="text-primary-foreground/80 max-w-md">
            Create your account and start managing your hostel accommodation with ease.
          </p>
        </div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary-foreground/10 rounded-full" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-primary-foreground/10 rounded-full" />
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg shadow-md bg-white overflow-hidden">
              <img src="/app_logo.png" alt="Logo" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground leading-none">
                Hostel<span className="text-primary">Hub</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                Your Home, Away From Your Home
              </span>
            </div>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create account</h1>
            <p className="text-muted-foreground">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10"
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10"
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">I am a</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === "staff" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="staffRole">Staff Role <span className="text-destructive">*</span></Label>
                <Select value={formData.staffRole} onValueChange={(value) => setFormData({ ...formData, staffRole: value })}>
                  <SelectTrigger className={!formData.staffRole ? "border-destructive/50 focus:ring-destructive/30 text-muted-foreground" : ""}>
                    <SelectValue placeholder="Select specific role (e.g. Cook, Warden)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cook">Cook</SelectItem>
                    <SelectItem value="Warden">Warden</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="General Staff">Other / General Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
