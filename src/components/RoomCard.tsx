import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Bed, Users, Wifi, Fan } from "lucide-react"

export type RoomStatus = "available" | "occupied" | "pending" | "maintenance"

interface RoomCardProps {
  roomNumber: string
  floor: number
  type: "single" | "double" | "triple"
  rent: number
  status: RoomStatus
  amenities?: string[]
  occupants?: number
  maxOccupants: number
  onApply?: () => void
  onView?: () => void
}

const statusConfig: Record<RoomStatus, { label: string; variant: "available" | "occupied" | "pending" | "maintenance" }> = {
  available: { label: "Available", variant: "available" },
  occupied: { label: "Occupied", variant: "occupied" },
  pending: { label: "Pending", variant: "pending" },
  maintenance: { label: "Maintenance", variant: "maintenance" },
}

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-4 w-4" />,
  ac: <Fan className="h-4 w-4" />,
}

export function RoomCard({
  roomNumber,
  floor,
  type,
  rent,
  status,
  amenities = [],
  occupants = 0,
  maxOccupants,
  onApply,
  onView,
}: RoomCardProps) {
  const statusInfo = statusConfig[status]

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl bg-card border border-border/50 p-6 shadow-elegant transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      status === "available" && "hover:border-primary/30"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">Room {roomNumber}</h3>
          <p className="text-sm text-muted-foreground">Floor {floor} • {type.charAt(0).toUpperCase() + type.slice(1)} Room</p>
        </div>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>

      {/* Occupancy */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="text-sm">
            {occupants}/{maxOccupants} Occupants
          </span>
        </div>
        <div className="flex gap-1 ml-auto">
          {Array.from({ length: maxOccupants }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                i < occupants ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Amenities */}
      {amenities.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {amenities.map((amenity) => (
            <div
              key={amenity}
              className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
            >
              {amenityIcons[amenity.toLowerCase()] || <Bed className="h-3 w-3" />}
              <span className="capitalize">{amenity}</span>
            </div>
          ))}
        </div>
      )}

      {/* Price & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div>
          <span className="text-2xl font-bold text-foreground">₹{rent.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">/month</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onView}>
            View
          </Button>
          {status === "available" && (
            <Button variant="hero" size="sm" onClick={onApply}>
              Apply
            </Button>
          )}
        </div>
      </div>

      {/* Decorative element */}
      <div className={cn(
        "absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full transition-colors",
        status === "available" ? "bg-primary/10" : "bg-muted/50"
      )} />
    </div>
  )
}
