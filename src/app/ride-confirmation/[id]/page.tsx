// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPinIcon, CarIcon, DollarSignIcon, UserIcon, ClockIcon } from "lucide-react"

interface RideDetails {
  driverName: string
  pickupTime: string
  dropoffLocation: string
  pickupLocation: string
  carNumberplate: string
  carModel: string
  fare: number
}

export default function RideConfirmationPage() {
  const router = useRouter()
  // const params = useParams()
  const searchParams = useSearchParams()
  const [rideDetails, setRideDetails] = useState<RideDetails | null>(null)

  const fareFromParams = useMemo(() => Number.parseFloat(searchParams.get("fare") || "15.50"), [searchParams])

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    const newRideDetails = {
      driverName: "John Doe",
      pickupTime: "2023-05-20T14:30:00",
      dropoffLocation: "456 Elm St, City",
      pickupLocation: "123 Main St, City",
      carNumberplate: "ABC 123",
      carModel: "Toyota Camry",
      fare: fareFromParams,
    }

    // Only update state if the new details are different from the current state
    setRideDetails((prevDetails) =>
      JSON.stringify(prevDetails) !== JSON.stringify(newRideDetails) ? newRideDetails : prevDetails,
    )
  }, [fareFromParams])

  const handlePayment = () => {
    // Handle payment logic here
    console.log("Processing payment...")
    // After successful payment, you might want to redirect to a ride tracking page
    // router.push(`/ride-tracking/${params.id}`)
  }

  if (!rideDetails) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Ride Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              <span>Driver: {rideDetails.driverName}</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              <span>Pickup Time: {new Date(rideDetails.pickupTime).toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2" />
              <span>Pickup: {rideDetails.pickupLocation}</span>
            </div>
            <div className="flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2" />
              <span>Drop-off: {rideDetails.dropoffLocation}</span>
            </div>
            <div className="flex items-center">
              <CarIcon className="h-5 w-5 mr-2" />
              <span>Car: {rideDetails.carModel}</span>
            </div>
            <div className="flex items-center">
              <CarIcon className="h-5 w-5 mr-2" />
              <span>Plate: {rideDetails.carNumberplate}</span>
            </div>
            <div className="flex items-center">
              <DollarSignIcon className="h-5 w-5 mr-2" />
              <span>Fare: ${rideDetails.fare.toFixed(2)}</span>
            </div>
          </div>

          <Button onClick={handlePayment} className="w-full">
            Pay Now
          </Button>
        </CardContent>
      </Card>
      <Button className="mt-4" onClick={() => router.push("/home")}>
        Back to Home
      </Button>
    </div>
  )
}

