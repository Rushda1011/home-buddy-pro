import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { 
  Building2, 
  Shield, 
  Bell, 
  CreditCard, 
  Users, 
  BarChart3, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Clock,
  MessageSquare,
  Home
} from "lucide-react"

const features = [
  {
    icon: <Home className="h-6 w-6" />,
    title: "Smart Room Allocation",
    description: "AI-powered room recommendations based on preferences, availability, and budget.",
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: "Rent Tracking",
    description: "Never miss a payment with automated reminders and transparent payment history.",
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: "Complaint Management",
    description: "Submit and track complaints with real-time status updates and quick resolution.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Visitor Logs",
    description: "Digital visitor management system for enhanced security and record keeping.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Analytics Dashboard",
    description: "Comprehensive reports on occupancy, revenue, and maintenance trends.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure Access",
    description: "Role-based authentication ensuring data privacy for students and admins.",
  },
]

const steps = [
  {
    number: "01",
    title: "Register & Apply",
    description: "Create your account and browse available rooms. Apply for your preferred accommodation.",
  },
  {
    number: "02",
    title: "Get Allocated",
    description: "Our smart system recommends the best rooms. Admins approve your application quickly.",
  },
  {
    number: "03",
    title: "Move In & Manage",
    description: "Access your dashboard to manage payments, submit requests, and track everything.",
  },
]

const stats = [
  { value: "500+", label: "Rooms Managed" },
  { value: "2000+", label: "Happy Students" },
  { value: "99%", label: "Issue Resolution" },
  { value: "24/7", label: "Support Available" },
]

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="landing" />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 animate-fade-up">
              <Sparkles className="mr-1 h-3 w-3" />
              Smart Hostel Management System
            </Badge>
            
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Simplify Your
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Hostel Operations</span>
            </h1>
            
            <p className="mb-10 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
              A comprehensive platform for managing hostel accommodations with smart room allocation, 
              transparent rent tracking, and efficient complaint resolution.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/dashboard">View Demo</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Manage
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From room allocation to rent collection, our platform handles all aspects of hostel management efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-card p-8 shadow-elegant transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border/50"
              >
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-md">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get Started in 3 Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-7xl font-extrabold text-primary/10 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary/20 to-transparent -translate-x-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Recommendations Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <Badge variant="default" className="mb-4">
                <Sparkles className="mr-1 h-3 w-3" />
                Innovation
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Smart Room & Issue Recommendations
              </h2>
              <p className="text-muted-foreground mb-6">
                Our intelligent system uses rule-based logic to suggest suitable rooms based on availability, 
                rent range, and past complaint history. Rooms with repeated issues are automatically flagged 
                for administrative attention.
              </p>
              <ul className="space-y-4">
                {[
                  "AI-powered room matching based on preferences",
                  "Automatic flagging of rooms needing maintenance",
                  "Predictive issue resolution for better service",
                  "Data-driven occupancy optimization",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="rounded-2xl bg-card p-8 shadow-xl border border-border/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Room Recommendation</div>
                    <div className="text-sm text-muted-foreground">Based on your preferences</div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { room: "Room 203", match: 95, type: "Single AC" },
                    { room: "Room 115", match: 88, type: "Double Non-AC" },
                    { room: "Room 312", match: 82, type: "Single Non-AC" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <div className="font-medium text-foreground">{item.room}</div>
                        <div className="text-sm text-muted-foreground">{item.type}</div>
                      </div>
                      <Badge variant="success">{item.match}% Match</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -z-10 inset-4 rounded-2xl bg-primary/20 blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl gradient-hero p-12 md:p-20 text-center">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
                Ready to Transform Your Hostel Management?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Join hundreds of hostels already using HostelHub to streamline their operations and improve student satisfaction.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-20">
                <Button variant="accent" size="xl" asChild>
                  <Link to="/register">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <a href="#contact">Contact Sales</a>
                </Button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/10 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary shadow-md">
                  <Building2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">
                  Hostel<span className="text-primary">Hub</span>
                </span>
              </Link>
              <p className="text-muted-foreground text-sm">
                Simplifying hostel management with smart technology and seamless experiences.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} HostelHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Index
