import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Bed, Users, Wifi, Fan, Edit, Trash2 } from "lucide-react"

export type RoomStatus = "available" | "occupied" | "pending" | "maintenance"

interface RoomCardProps {
  roomNumber: string
  floor: number
  type: "single" | "double" | "triple"
  rent: number
  status: RoomStatus
  amenities?: string[]
  residents?: string[]
  occupants?: number
  maxOccupants: number
  images?: string[]
  hideApplyButton?: boolean
  onApply?: () => void
  onAccept?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onDeallocate?: () => void
  onView?: () => void
  showAdminControls?: boolean
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
  residents = [],
  occupants = 0,
  maxOccupants,
  images = [],
  hideApplyButton = false,
  onApply,
  onAccept,
  onEdit,
  onDelete,
  onDeallocate,
  onView,
  showAdminControls = false,
}: RoomCardProps) {
  const statusInfo = statusConfig[status]

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl bg-card border border-border/50 p-6 shadow-elegant transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      status === "available" && "hover:border-primary/30"
    )}>
      {/* Header with Image */}
      <div className="-mx-6 -mt-6 mb-4 relative h-48 overflow-hidden rounded-t-xl group/img cursor-pointer" onClick={onView}>
        <img 
          src={images && images.length > 0 && images[0].trim() !== "" ? images[0] : "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800"} 
          alt={`Room ${roomNumber}`}
          className="h-full w-full object-contain bg-gray-100 transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover/img:opacity-80 transition-opacity" />
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge variant={statusInfo.variant} className="bg-white/90 text-foreground border-none font-semibold shadow-sm">
            {statusInfo.label}
          </Badge>
        </div>

        {showAdminControls && (
          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/90 text-primary hover:bg-white shadow-sm" onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/90 text-destructive hover:bg-white shadow-sm" onClick={(e) => { e.stopPropagation(); onDelete?.(); }}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        <div className="absolute bottom-3 left-4">
          <h3 className="text-xl font-bold text-white drop-shadow-md">Room {roomNumber}</h3>
          <p className="text-xs text-white/90 font-medium">Floor {floor} • {type.charAt(0).toUpperCase() + type.slice(1)}</p>
        </div>
      </div>

      {/* Occupancy */}
      <div className="flex items-center gap-2 mb-2">
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

      {residents && residents.length > 0 && (
        <div className="mb-4 pl-6">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Occupied by:</span> {residents.join(", ")}
          </p>
        </div>
      )}

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
          {status === "available" && !hideApplyButton && (
            <Button variant="hero" size="sm" onClick={onApply}>
              Apply
            </Button>
          )}
          {status === "pending" && showAdminControls && (
            <Button variant="success" size="sm" onClick={onAccept}>
              Accept
            </Button>
          )}
          {(status === "occupied" || status === "pending") && showAdminControls && (
            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={onDeallocate}>
              Deallocate
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
