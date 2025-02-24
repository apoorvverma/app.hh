"use client"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CalendarIcon, MapPinIcon, MenuIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function HomePage() {
  const router = useRouter()
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState<string>()
  const [pickup, setPickup] = useState("")
  const [dropoff, setDropoff] = useState("")
  
  const pickupRef = useRef<HTMLInputElement>(null)
  const dropoffRef = useRef<HTMLInputElement>(null)
  
  const mapRef = useRef<HTMLDivElement>(null)
  // const [map, setMap] = useState<google.maps.Map | null>(null)
  

  // Initialize Google Maps
  useEffect(() => {
    // Load Google Maps JavaScript API
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    script.onload = () => {
      if (mapRef.current) {
        // Initialize map centered on Boston
        new google.maps.Map(mapRef.current, {
          center: { lat: 42.350876, lng: -71.106918 }, // Boston coordinates
          zoom: 13,
        })
        // const mapInstance = new google.maps.Map(mapRef.current, {
        //   center: { lat: 42.350876, lng: -71.106918 }, // Boston coordinates
        //   zoom: 13,
        //   // disableDefaultUI: true,
        //   /* styles: [
        //     {
        //       elementType: "geometry",
        //       stylers: [{ color: "#f5f5f5" }]
        //     },
        //     {
        //       elementType: "labels.icon",
        //       stylers: [{ visibility: "off" }]
        //     },
        //     {
        //       elementType: "labels.text.fill",
        //       stylers: [{ color: "#616161" }]
        //     },
        //     {
        //       elementType: "labels.text.stroke",
        //       stylers: [{ color: "#f5f5f5" }]
        //     }
        //   ] */
        // })
        // setMap(mapInstance)
      }

      if (pickupRef.current && dropoffRef.current) {
        // Initialize Autocomplete for pickup
        const pickupAutocomplete = new google.maps.places.Autocomplete(pickupRef.current, {
          fields: ["formatted_address", "geometry"],
          types: ["address"]
        })

        // Initialize Autocomplete for dropoff
        const dropoffAutocomplete = new google.maps.places.Autocomplete(dropoffRef.current, {
          fields: ["formatted_address", "geometry"],
          types: ["address"]
        })

        // Handle place selection for pickup
        pickupAutocomplete.addListener("place_changed", () => {
          const place = pickupAutocomplete.getPlace()
          setPickup(place.formatted_address || "")
        })

        // Handle place selection for dropoff
        dropoffAutocomplete.addListener("place_changed", () => {
          const place = dropoffAutocomplete.getPlace()
          setDropoff(place.formatted_address || "")
        })
      }
    }

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formattedTime = time
      ? new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true })
      : undefined
    console.log("Ride requested", { date, time: formattedTime, pickup, dropoff })
    router.push(
      `/available-drivers?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(dropoff)}&date=${date?.toISOString()}&time=${encodeURIComponent(formattedTime || "")}`,
    )
  }

  const handleLogout = () => {
    // Handle logout logic here (e.g., clear session, tokens, etc.)
    router.push("/auth")
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Map Container */}
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />

      {/* Menu Button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50 bg-white">
            <MenuIcon className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="flex flex-col h-full">
            <h2 className="text-lg font-semibold mb-4">Menu</h2>
            <Button variant="ghost" className="justify-start" onClick={() => router.push("/profile")}>
              Profile
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => router.push("/addresses")}>
              Addresses
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => router.push("/ride-history")}>
              Ride History
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => router.push("/payment-methods")}>
              Payment Methods
            </Button>
            <Button variant="ghost" className="justify-start mt-auto" onClick={handleLogout}>
              Log Out
            </Button>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Ride Request Card */}
      <div className="absolute bottom-0 left-0 right-0 w-full px-4 pb-4 z-40">
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle>Request a Ride</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pickup">Pickup Location</Label>
                <div className="flex">
                  <MapPinIcon className="w-5 h-5 mr-2 text-muted-foreground" />
                  <Input
                    id="pickup"
                    ref={pickupRef}
                    placeholder="Enter pickup location"
                    required
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoff">Drop-off Location</Label>
                <div className="flex">
                  <MapPinIcon className="w-5 h-5 mr-2 text-muted-foreground" />
                  <Input
                    id="dropoff"
                    ref={dropoffRef}
                    placeholder="Enter drop-off location"
                    required
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Pickup Date and Time</Label>
                <div className="flex space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-[180px]" />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Request Ride
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

