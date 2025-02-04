"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircleIcon, HomeIcon, BriefcaseIcon } from "lucide-react"

export default function AddressesPage() {
  const router = useRouter()
  const [addresses, setAddresses] = useState([
    { id: 1, label: "Home", address: "123 Home St, City, Country" },
    { id: 2, label: "Work", address: "456 Work Ave, City, Country" },
  ])
  const [newLabel, setNewLabel] = useState("")
  const [newAddress, setNewAddress] = useState("")

  const handleAddAddress = () => {
    if (newLabel && newAddress) {
      setAddresses([...addresses, { id: Date.now(), label: newLabel, address: newAddress }])
      setNewLabel("")
      setNewAddress("")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">My Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address.id} className="flex items-center space-x-2 bg-white p-4 rounded shadow">
                {address.label === "Home" ? (
                  <HomeIcon className="h-5 w-5 text-gray-500" />
                ) : address.label === "Work" ? (
                  <BriefcaseIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-gray-300" />
                )}
                <div>
                  <p className="font-semibold">{address.label}</p>
                  <p className="text-gray-500">{address.address}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Add New Address</h3>
            <div className="space-y-2">
              <Label htmlFor="newLabel">Label</Label>
              <Input
                id="newLabel"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Gym, School"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newAddress">Address</Label>
              <Input
                id="newAddress"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Enter full address"
              />
            </div>
            <Button onClick={handleAddAddress} className="w-full">
              <PlusCircleIcon className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </div>
        </CardContent>
      </Card>
      <Button className="mt-4" onClick={() => router.push("/home")}>
        Back to Home
      </Button>
    </div>
  )
}

