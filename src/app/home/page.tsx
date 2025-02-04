"use client"

import { useState } from "react"
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
    <div className="min-h-screen bg-gray-100">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50">
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

      <main className="container mx-auto px-4 py-8">
        <Card>
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
      </main>
    </div>
  )
}

