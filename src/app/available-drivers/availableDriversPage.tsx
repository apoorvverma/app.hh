"use client"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StarIcon, DollarSignIcon } from "lucide-react"

declare global {
  interface Window {
    google: typeof google
  }
}

interface Driver {
  id: string
  name: string
  rating: number
  fare: number
}

export default function AvailableDriversPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null)

  const pickup = searchParams.get("pickup")
  const dropoff = searchParams.get("dropoff")
  const date = searchParams.get("date")
  const time = searchParams.get("time")

  // Initialize map and directions
  useEffect(() => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    script.onload = () => {
      if (mapRef.current) {
        // Initialize map centered on Boston
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 42.3601, lng: -71.0589 },
          zoom: 12,
        })
        setMap(mapInstance)

        // Initialize DirectionsRenderer
        const rendererInstance = new google.maps.DirectionsRenderer({
          map: mapInstance,
          suppressMarkers: false,
        })
        setDirectionsRenderer(rendererInstance)
      }
    }

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  // Calculate and display route when pickup and dropoff are available
  useEffect(() => {
    if (map && directionsRenderer && pickup && dropoff) {
      const directionsService = new google.maps.DirectionsService()

      directionsService.route(
        {
          origin: pickup,
          destination: dropoff,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result)
            
            // Fit map bounds to show the entire route
            const bounds = new google.maps.LatLngBounds()
            result.routes[0].legs.forEach((leg) => {
              bounds.extend(leg.start_location)
              bounds.extend(leg.end_location)
            })
            map.fitBounds(bounds)
          }
        }
      )
    }
  }, [map, directionsRenderer, pickup, dropoff])

  useEffect(() => {
    // Mock drivers data
    setDrivers([
      { id: "1", name: "John Doe", rating: 4.8, fare: 15.5 },
      { id: "2", name: "Jane Smith", rating: 4.6, fare: 14.75 },
      { id: "3", name: "Bob Johnson", rating: 4.9, fare: 16.25 },
      { id: "4", name: "Alice Brown", rating: 4.7, fare: 15.0 },
      { id: "5", name: "Charlie Davis", rating: 4.5, fare: 14.5 },
    ])
  }, [])

  const handleDriverClick = (driverId: string) => {
    router.push(`/driver-details/${driverId}`)
  }

// ... existing code ...
return (
  <div className="h-screen w-screen relative overflow-hidden">
    {/* Map Container */}
    <div ref={mapRef} className="absolute inset-0 w-full h-full" />

    {/* Content overlay - Modified positioning and height */}
    <div className="absolute bottom-0 left-0 right-0 h-[30vh] transition-transform">
      {/* Draggable handle */}
      <div className="bg-white/95 backdrop-blur rounded-t-xl p-2 flex justify-center">
        <div className="w-12 h-1 bg-gray-300 rounded-full" />
      </div>

      {/* Scrollable content */}
      <div className="bg-white/95 backdrop-blur h-full overflow-y-auto px-4 pb-4">
        <Card className="w-full max-w-3xl mx-auto mb-4 border-none bg-transparent">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Ride Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Pickup:</strong> {pickup}</p>
            <p><strong>Drop-off:</strong> {dropoff}</p>
            <p><strong>Date:</strong> {date ? new Date(date).toLocaleDateString() : "Not specified"}</p>
            <p><strong>Time:</strong> {time}</p>
          </CardContent>
        </Card>

        <Card className="w-full max-w-3xl mx-auto border-none bg-transparent">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Available Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {drivers.map((driver) => (
                <Card
                  key={driver.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleDriverClick(driver.id)}
                >
                  <CardContent className="flex justify-between items-center p-4">
                    <div>
                      <h3 className="text-lg font-semibold">{driver.name}</h3>
                      <div className="flex items-center mt-1">
                        <StarIcon className="h-4 w-4 mr-1 text-yellow-400" />
                        <span>{driver.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end mt-1">
                        <DollarSignIcon className="h-4 w-4 mr-1" />
                        <span>${driver.fare.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-4 mb-4">
          <Button 
            className="bg-white" 
            onClick={() => router.push("/home")}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  </div>
)
}

