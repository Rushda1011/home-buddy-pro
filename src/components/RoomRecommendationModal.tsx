import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight, CheckCircle2, Search, ArrowLeft, Home, Wind } from "lucide-react"
import { getRooms, Room, updateRoomStatus, getCurrentUser } from "@/lib/data-service"
import { useToast } from "@/hooks/use-toast"
import { RoomCard } from "./RoomCard"

export function RoomRecommendationModal() {
    const { toast } = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const [step, setStep] = useState(0)
    const [rooms, setRooms] = useState<Room[]>([])
    const [isApplying, setIsApplying] = useState(false)
    
    // Preferences
    const [budget, setBudget] = useState(8000)
    const [roomType, setRoomType] = useState<string>("any")
    const [amenities, setAmenities] = useState<string[]>([])
    
    // Results
    const [recommendedRoom, setRecommendedRoom] = useState<Room | null>(null)
    const [matchScore, setMatchScore] = useState(0)

    useEffect(() => {
        if (isOpen) {
            loadRooms()
            setStep(0)
            setBudget(8000)
            setRoomType("any")
            setAmenities([])
            setRecommendedRoom(null)
            setMatchScore(0)
        }
    }, [isOpen])

    const loadRooms = async () => {
        const data = await getRooms()
        // Only consider available rooms
        setRooms(data.filter(r => r.status === 'available'))
    }

    const availableAmenities = ["WiFi", "AC", "Balcony"]

    const toggleAmenity = (am: string) => {
        if (amenities.includes(am)) {
            setAmenities(amenities.filter(a => a !== am))
        } else {
            setAmenities([...amenities, am])
        }
    }

    const calculateRecommendation = () => {
        if (rooms.length === 0) {
            setRecommendedRoom(null)
            setStep(4)
            return
        }

        let bestRoom: Room | null = null;
        let highestScore = -1;

        rooms.forEach(room => {
            let score = 0;
            
            // 1. Budget Score (up to 40 points)
            if (room.rent <= budget) {
                score += 40;
                score += Math.min(10, ((budget - room.rent) / budget) * 10)
            } else {
                score -= ((room.rent - budget) / budget) * 100 // Steep penalty
            }

            // 2. Type Score (up to 30 points)
            if (roomType === "any" || room.type === roomType) {
                score += 30;
            }

            // 3. Amenities Score (up to 30 points)
            if (amenities.length > 0) {
                let matchedAmenities = 0;
                const roomAmenities = room.amenities || [];
                amenities.forEach(am => {
                    // Simple text match
                    if (roomAmenities.some(ra => ra.toLowerCase().includes(am.toLowerCase()))) {
                        matchedAmenities++;
                    }
                })
                score += (matchedAmenities / amenities.length) * 30;
            } else {
                score += 30; 
            }

            if (score > highestScore) {
                highestScore = score;
                bestRoom = room;
            }
        });

        // Normalize score
        const finalScore = Math.max(0, Math.min(100, Math.round(highestScore)));
        
        setMatchScore(finalScore);
        setRecommendedRoom(bestRoom);
        setStep(4);
    }

    const handleApply = async (roomNumber: string) => {
        const user = getCurrentUser();
        if (!user) {
             toast({ title: "Error", description: "You must be logged in to apply.", variant: "destructive" })
             return;
        }
        
        try {
            setIsApplying(true)
            await updateRoomStatus(roomNumber, "pending", 0, user.id)
            toast({
                title: "Magic Match Successful!",
                description: `You have successfully requested Room ${roomNumber}.`,
            })
            setIsOpen(false)
            window.location.reload()
        } catch (error) {
            toast({ title: "Error", description: "Failed to apply for the room.", variant: "destructive" })
        } finally {
            setIsApplying(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className="relative group cursor-pointer overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-8 text-center transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
                    
                    <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg animate-pulse-glow">
                            <Sparkles className="h-8 w-8" />
                        </div>
                        
                        <div>
                            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-2">
                                Find Your Perfect Room
                            </h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Let our intelligent assistant match you with the best available room based on your preferences.
                            </p>
                        </div>
                        
                        <Button className="mt-4 gap-2" variant="hero" size="lg">
                            <Search className="h-4 w-4" />
                            Start Magic Finder
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-background">
                <div className="p-6 bg-gradient-to-r from-primary/10 to-transparent border-b border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-foreground">
                            <Sparkles className="h-6 w-6 text-primary" />
                            Magic Room Matcher
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            We'll find the best fit for your needs in just a few clicks.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8">
                    {/* Progress Bar */}
                    <div className="w-full bg-muted h-2 rounded-full mb-8 overflow-hidden">
                        <div 
                            className="bg-primary h-full transition-all duration-500 ease-in-out"
                            style={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>

                    <div className="min-h-[250px]">
                        {/* Step 0: Welcome */}
                        {step === 0 && (
                            <div className="text-center space-y-6 animate-fade-in">
                                <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <Home className="h-12 w-12 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 text-foreground">Ready to find your ideal space?</h3>
                                    <p className="text-muted-foreground">Answer 3 quick questions about your budget, preferred room type, and amenities.</p>
                                </div>
                                <Button size="lg" className="w-full sm:w-auto" onClick={() => setStep(1)}>
                                    Let's Go <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {/* Step 1: Budget */}
                        {step === 1 && (
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 text-foreground">What's your maximum monthly budget?</h3>
                                    <p className="text-muted-foreground">We'll filter options to ensure they fit your finances.</p>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="text-4xl font-bold text-center text-primary">
                                        ₹ {budget.toLocaleString()}
                                    </div>
                                    <input 
                                        type="range" 
                                        min="5000" 
                                        max="10000" 
                                        step="500" 
                                        value={budget} 
                                        onChange={(e) => setBudget(Number(e.target.value))}
                                        className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex justify-between text-sm text-muted-foreground font-medium">
                                        <span>₹5,000</span>
                                        <span>₹10,000</span>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button variant="ghost" onClick={() => setStep(0)}>
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>
                                    <Button onClick={() => setStep(2)}>
                                        Next <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Room Type */}
                        {step === 2 && (
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 text-foreground">How much privacy do you need?</h3>
                                    <p className="text-muted-foreground">Select your preferred room layout.</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: "single", label: "Single", desc: "Just for you" },
                                        { id: "double", label: "Double", desc: "Share with 1 person" },
                                        { id: "triple", label: "Triple", desc: "Share with 2 people" },
                                        { id: "any", label: "Any Type", desc: "I'm flexible!" },
                                    ].map((type) => (
                                        <div 
                                            key={type.id}
                                            onClick={() => setRoomType(type.id)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                roomType === type.id 
                                                    ? 'border-primary bg-primary/5 shadow-md' 
                                                    : 'border-muted hover:border-primary/50'
                                            }`}
                                        >
                                            <div className="font-semibold text-foreground">{type.label}</div>
                                            <div className="text-xs text-muted-foreground mt-1">{type.desc}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button variant="ghost" onClick={() => setStep(1)}>
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>
                                    <Button onClick={() => setStep(3)}>
                                        Next <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Amenities */}
                        {step === 3 && (
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 text-foreground">Any must-have amenities?</h3>
                                    <p className="text-muted-foreground">Select the features you care about most.</p>
                                </div>
                                
                                <div className="flex flex-wrap gap-3">
                                    {availableAmenities.map(am => {
                                        const isSelected = amenities.includes(am);
                                        return (
                                            <Badge 
                                                key={am} 
                                                variant={isSelected ? "default" : "outline"}
                                                className={`px-4 py-2 cursor-pointer text-sm transition-all ${isSelected ? 'shadow-md scale-105' : 'hover:border-primary/50 text-foreground'}`}
                                                onClick={() => toggleAmenity(am)}
                                            >
                                                {isSelected && <CheckCircle2 className="w-4 h-4 mr-2" />}
                                                {am}
                                            </Badge>
                                        )
                                    })}
                                </div>

                                <div className="flex justify-between pt-8">
                                    <Button variant="ghost" onClick={() => setStep(2)}>
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>
                                    <Button className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white" onClick={calculateRecommendation}>
                                        <Sparkles className="mr-2 h-4 w-4" /> Find My Match
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Results */}
                        {step === 4 && (
                            <div className="space-y-6 animate-fade-in">
                                {recommendedRoom ? (
                                    <>
                                        <div className="text-center mb-6">
                                            <Badge variant="secondary" className="bg-success/20 text-success-foreground mb-4 text-xs font-bold px-3 py-1 uppercase tracking-widest border border-success/30 rounded-full inline-flex items-center shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                                                <Sparkles className="w-3 h-3 mr-1" />
                                                {matchScore}% Match
                                            </Badge>
                                            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-2">We Found Your Match!</h3>
                                            <p className="text-muted-foreground">Based on your preferences, this is the best room for you.</p>
                                        </div>
                                        
                                        <div className="transform scale-90 origin-top border-4 border-primary/20 rounded-xl overflow-hidden shadow-2xl relative">
                                            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                                            {/* Pointer events bound to RoomCard, removing custom bounds */}
                                            <RoomCard 
                                                {...recommendedRoom} 
                                                hideApplyButton={true} 
                                            />
                                        </div>

                                        <div className="flex justify-center mt-2">
                                             <Button 
                                                size="lg" 
                                                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg text-lg h-12 text-white"
                                                onClick={() => handleApply(recommendedRoom.roomNumber)}
                                                disabled={isApplying}
                                            >
                                                {isApplying ? "Applying..." : "Claim This Room"}
                                                {!isApplying && <ArrowRight className="ml-2 h-5 w-5" />}
                                            </Button>
                                        </div>
                                        <div className="text-center mt-2">
                                            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                                                Change Preferences
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                            <Wind className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2 text-foreground">No Matches Found</h3>
                                        <p className="text-muted-foreground mb-6">We couldn't find any available rooms right now. Please check back later or modify your budget.</p>
                                        <Button variant="outline" onClick={() => setStep(1)}>
                                            Try Different Preferences
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
