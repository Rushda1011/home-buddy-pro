import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Menu, X, ArrowLeft } from "lucide-react"
import { useState } from "react"

interface NavbarProps {
  variant?: "landing" | "dashboard"
}

export function Navbar({ variant = "landing" }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isLanding = variant === "landing"

  const handleLogout = () => {
    localStorage.clear()
    navigate("/")
    setIsOpen(false)
  }

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
  const role = currentUser.role

  const navLinks = isLanding
    ? [
      { href: "#features", label: "Features" },
      { href: "#how-it-works", label: "How It Works" },
      { href: "#contact", label: "Contact" },
    ]
    : role === "admin" 
    ? [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/rooms", label: "Rooms" },
      { href: "/complaints", label: "Complaints" },
      { href: "/payments", label: "Payments" },
      { href: "/staff", label: "Staff" },
    ]
    : role === "staff"
    ? [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/rooms", label: "Rooms" },
      { href: "/complaints", label: "Complaints" },
      { href: "/payments", label: "Payments" },
    ]
    : [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/complaints", label: "Complaints" },
      { href: "/payments", label: "Payments" },
    ]

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setIsOpen(false); // Close mobile menu if open
      }
    } else {
      setIsOpen(false);
    }
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      isLanding
        ? "bg-background/80 backdrop-blur-md border-b border-border/50"
        : "bg-card shadow-sm border-b border-border"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            {!isLanding && location.pathname !== '/dashboard' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="mr-2"
                title="Go Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg shadow-md group-hover:shadow-lg transition-shadow bg-white overflow-hidden">
                <img src="/app_logo.png" alt="Logo" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground leading-none">
                  Hostel<span className="text-primary">Hub</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                  Your Home, Away From Your Home
                </span>
                <span className="text-[9px] text-primary/80 font-bold uppercase tracking-wider mt-0.5">
                  ABC Institute of Technology
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary cursor-pointer",
                  location.pathname === link.href || location.hash === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLanding ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden py-4 border-t border-border/50 animate-fade-up">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                {isLanding ? (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button variant="hero" asChild className="w-full">
                      <Link to="/register">Get Started</Link>
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={handleLogout} className="w-full">
                    Logout
                  </Button>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
