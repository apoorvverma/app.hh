"use client"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck


import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarIcon, CarIcon, MapPinIcon, DollarSignIcon } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Driver {
  id: string
  name: string
  rating: number
  fare: number
  destination: string
  carModel: string
  ridesCompleted: number
  profilePicture: string
  occupation: string
  interests: string[]
  bio: string
}

export default function DriverDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const [driver, setDriver] = useState<Driver | null>(null)
  const [showNegotiate, setShowNegotiate] = useState(false)
  const [negotiatedFare, setNegotiatedFare] = useState(0)
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    setDriver({
      id: params.id as string,
      name: "John Doe",
      rating: 4.8,
      fare: 15.5,
      destination: "Downtown",
      carModel: "Toyota Camry",
      ridesCompleted: 500,
      profilePicture: "/placeholder.svg?height=100&width=100",
      occupation: "Software Engineer",
      interests: ["Music", "Hiking", "Photography"],
      bio: "Friendly driver with 5 years of experience. Always punctual and enjoys good conversation.",
    })
  }, [params.id])

  const handleAcceptRide = () => {
    router.push(`/ride-confirmation/${driver?.id}`)
  }

  const handleNegotiateFare = (discount: number) => {
    const newFare = driver ? driver.fare * (1 - discount) : 0
    setNegotiatedFare(newFare)
    setShowNegotiate(true)
  }

  const handleSendNewFareRequest = () => {
    // Simulate API call to send new fare request
    setTimeout(() => {
      // Randomly decide if the driver accepts or rejects the new fare
      const driverAccepts = Math.random() > 0.5
      if (driverAccepts) {
        router.push(`/ride-confirmation/${driver?.id}?fare=${negotiatedFare}`)
      } else {
        setShowRejectionDialog(true)
      }
    }, 1000)
  }

  if (!driver) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Driver Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={driver.profilePicture} alt={driver.name} />
              <AvatarFallback>
                {driver.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{driver.name}</h2>
              <p className="text-gray-500">{driver.occupation}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <StarIcon className="h-5 w-5 mr-2 text-yellow-400" />
              <span>{driver.rating.toFixed(1)} Rating</span>
            </div>
            <div className="flex items-center">
              <CarIcon className="h-5 w-5 mr-2" />
              <span>{driver.carModel}</span>
            </div>
            <div className="flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2" />
              <span>Destination: {driver.destination}</span>
            </div>
            <div className="flex items-center">
              <DollarSignIcon className="h-5 w-5 mr-2" />
              <span>${driver.fare.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Bio</h3>
            <p>{driver.bio}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {driver.interests.map((interest, index) => (
                <span key={index} className="bg-gray-200 px-2 py-1 rounded">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Rides Completed</h3>
            <p>{driver.ridesCompleted}</p>
          </div>

          <div className="flex justify-between">
            <Button onClick={handleAcceptRide}>Accept Ride</Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Negotiate Fare</Button>
              </DialogTrigger>
              <DialogTitle>
              <DialogContent>
                {/* <DialogHeader> */}
                  <DialogTitle>Negotiate Fare</DialogTitle>
                {/* </DialogHeader> */}
                <div className="space-y-4">
                  <Button onClick={() => handleNegotiateFare(0.05)} className="w-full">
                    5% lower (${(driver.fare * 0.95).toFixed(2)})
                  </Button>
                  <Button onClick={() => handleNegotiateFare(0.1)} className="w-full">
                    10% lower (${(driver.fare * 0.9).toFixed(2)})
                  </Button>
                  {showNegotiate && (
                    <div>
                      <p>New fare: ${negotiatedFare.toFixed(2)}</p>
                      <Button onClick={handleSendNewFareRequest} className="w-full mt-2">
                        Send New Fare Request
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
              </DialogTitle>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
      <DialogTitle>
        
        <DialogContent>
          {/* <DialogHeader> */}
            <DialogTitle>Negotiation Rejected</DialogTitle>
          {/* </DialogHeader> */}
          <p>
            The driver has rejected your new fare request. Would you like to proceed with the original fare or cancel
            the ride?
          </p>
          <div className="flex justify-between mt-4">
            <Button onClick={() => router.push(`/ride-confirmation/${driver.id}`)}>Accept Original Fare</Button>
            <Button variant="outline" onClick={() => router.push("/available-drivers")}>
              Cancel Ride
            </Button>
          </div>
        </DialogContent>
        </DialogTitle>

      </Dialog>

      <Button className="mt-4" onClick={() => router.push("/available-drivers")}>
        Back to Available Drivers
      </Button>
    </div>
  )
}

