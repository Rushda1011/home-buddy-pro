import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Building2, Eye, EyeOff, Mail, Lock } from "lucide-react"
import { loginUser } from "@/lib/data-service"

const Login = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1000))

    try {
      const response = await loginUser({ email: formData.email, password: formData.password })
      const userProfile = response.user
      
      localStorage.setItem("currentUser", JSON.stringify(userProfile))
      toast({
        title: "Welcome back!",
        description: `You have been logged in as ${userProfile.role}.`,
      })
      navigate("/dashboard")
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive"
      })
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg shadow-md bg-white overflow-hidden">
              <img src="app_logo.png" alt="Logo" className="h-full w-full object-cover" />
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create account
            </Link>
          </p>

          <div className="mt-4 text-center">
            <Link to="/admin/login" className="text-xs text-muted-foreground hover:text-foreground underline">
              Admin Login
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="relative z-10 text-center text-primary-foreground">
          <h2 className="text-4xl font-bold mb-4">Manage Your Stay</h2>
          <p className="text-primary-foreground/80 max-w-md">
            Access your room details, track payments, and submit maintenance requests all in one place.
          </p>
        </div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary-foreground/10 rounded-full" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-primary-foreground/10 rounded-full" />
      </div>
    </div>
  )
}

export default Login
