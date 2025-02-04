"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StarIcon, MapPinIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function RideHistoryPage() {
  const router = useRouter()
  const rides = [
    { id: 1, driver: "Alice Smith", pickup: "123 Main St", dropoff: "456 Elm St", fare: "$15.50", rating: 5 },
    { id: 2, driver: "Bob Johnson", pickup: "789 Oak Ave", dropoff: "321 Pine Rd", fare: "$22.75", rating: 4 },
    { id: 3, driver: "Carol Williams", pickup: "159 Maple Ln", dropoff: "753 Birch Blvd", fare: "$18.00", rating: 5 },
  ]

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Ride History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rides.map((ride) => (
              <div key={ride.id} className="bg-white p-4 rounded shadow space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{ride.driver}</h3>
                  <span className="text-green-600 font-semibold">{ride.fare}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">From: {ride.pickup}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">To: {ride.dropoff}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">
                    {Array.from({ length: ride.rating }).map((_, index) => (
                      <StarIcon key={index} className="h-4 w-4 inline" />
                    ))}
                  </span>
                  <span className="ml-1">{ride.rating}/5</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Button className="mt-4" onClick={() => router.push("/home")}>
        Back to Home
      </Button>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full py-4">
              HELP
            </Button>
          </DialogTrigger>
          <DialogContent>
            {/* <DialogHeader> */}
              <DialogTitle>How can we help you?</DialogTitle>
            {/* </DialogHeader> */}
            <div className="space-y-4">
              <Button onClick={() => router.push("/chatbot?issue=safety")} className="w-full">
                Report Safety Issues
              </Button>
              <Button onClick={() => router.push("/chatbot?issue=lost-item")} className="w-full">
                Find Lost Item
              </Button>
              <Button onClick={() => router.push("/chatbot?issue=feedback")} className="w-full">
                Provide Feedback to Driver
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">Contact Us</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Contact Us</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Button onClick={() => (window.location.href = "mailto:xyz@hitchiked.com")} className="w-full">
                      Email us at xyz@hitchiked.com
                    </Button>
                    <Button onClick={() => (window.location.href = "tel:8575406410")} className="w-full">
                      Call us at 857-540-6410
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

