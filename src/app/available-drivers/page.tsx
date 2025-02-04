// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StarIcon, DollarSignIcon } from "lucide-react"

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

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    setDrivers([
      { id: "1", name: "John Doe", rating: 4.8, fare: 15.5 },
      { id: "2", name: "Jane Smith", rating: 4.6, fare: 14.75 },
      { id: "3", name: "Bob Johnson", rating: 4.9, fare: 16.25 },
      { id: "4", name: "Alice Brown", rating: 4.7, fare: 15.0 },
      { id: "5", name: "Charlie Davis", rating: 4.5, fare: 14.5 },
    ])
  }, [])

  const pickup = searchParams.get("pickup")
  const dropoff = searchParams.get("dropoff")
  const date = searchParams.get("date")
  const time = searchParams.get("time")

  const handleDriverClick = (driverId: string) => {
    router.push(`/driver-details/${driverId}`)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-3xl mx-auto mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Ride Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Pickup:</strong> {pickup}
          </p>
          <p>
            <strong>Drop-off:</strong> {dropoff}
          </p>
          <p>
            <strong>Date:</strong> {date ? new Date(date).toLocaleDateString() : "Not specified"}
          </p>
          <p>
            <strong>Time:</strong> {time}
          </p>
        </CardContent>
      </Card>

      <Card className="max-w-3xl mx-auto">
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
      <Button className="mt-4" onClick={() => router.push("/home")}>
        Back to Home
      </Button>
    </div>
  )
}

