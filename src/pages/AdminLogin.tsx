import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Mail, Lock, ShieldAlert } from "lucide-react"
import { loginUser } from "@/lib/data-service"

const AdminLogin = () => {
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

            if (userProfile.role !== "admin") {
                toast({
                    title: "Access Denied",
                    description: "You do not have administrative privileges.",
                    variant: "destructive",
                })
                setIsLoading(false)
                return
            }

            localStorage.setItem("currentUser", JSON.stringify(userProfile))

            toast({
                title: "Welcome Administrator",
                description: "You have successfully logged in to the admin panel.",
            })

            navigate("/dashboard")
        } catch (error: any) {
            toast({
                title: "Login failed",
                description: error.message || "Invalid email or password.",
                variant: "destructive",
            })
        }
        
        setIsLoading(false)
    }

    return (
        <div className="min-h-screen flex bg-muted/30">
            {/* Left side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-elegant border border-border/50">
                    <Link to="/" className="flex items-center gap-2 mb-8">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg shadow-md bg-primary text-primary-foreground overflow-hidden">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-foreground leading-none">
                                Hostel<span className="text-primary">Hub</span>
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium">
                                Admin Portal
                            </span>
                        </div>
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-foreground mb-2">Admin Login</h1>
                        <p className="text-muted-foreground">Secure access for hostel management</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                        <div className="space-y-2">
                            <Label htmlFor="email">Admin Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@example.com"
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
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
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
                            {isLoading ? "Verifying..." : "Access Dashboard"}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        Not an admin?{" "}
                        <Link to="/login" className="text-primary font-medium hover:underline">
                            Student Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin
