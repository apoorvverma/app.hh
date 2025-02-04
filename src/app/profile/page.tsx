// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { StarIcon } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    picture: "/placeholder.svg?height=100&width=100",
    co2Saved: "50 kg",
    interests: ["Hiking", "Photography", "Travel"],
    rating: 4.8,
    ridesTaken: 25,
    bio: "Friendly passenger who enjoys good conversation during rides.",
  })

  const reviews = [
    { id: 1, text: "Great passenger!", rating: 5 },
    { id: 2, text: "Very punctual and friendly.", rating: 4 },
  ]

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically send the updated data to your backend
    console.log("Saving profile data:", profileData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profileData.picture} alt={profileData.name} />
              <AvatarFallback>
                {profileData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              {isEditing ? (
                <Input name="name" value={profileData.name} onChange={handleChange} className="text-2xl font-bold" />
              ) : (
                <h2 className="text-2xl font-bold">{profileData.name}</h2>
              )}
              <p className="text-gray-500">CO2 Saved: {profileData.co2Saved}</p>
            </div>
          </div>

          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="rides">Rides</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Bio</h3>
                  {isEditing ? (
                    <Textarea name="bio" value={profileData.bio} onChange={handleChange} rows={3} />
                  ) : (
                    <p>{profileData.bio}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Interests</h3>
                  {isEditing ? (
                    <Input
                      name="interests"
                      value={profileData.interests.join(", ")}
                      onChange={(e) => setProfileData({ ...profileData, interests: e.target.value.split(", ") })}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profileData.interests.map((interest, index) => (
                        <span key={index} className="bg-gray-200 px-2 py-1 rounded">
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <h3 className="text-lg font-semibold mb-2">Reviews</h3>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white p-4 rounded shadow">
                    <p>{review.text}</p>
                    <p className="text-yellow-500">{"★".repeat(review.rating)}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="rides">
              <h3 className="text-lg font-semibold mb-2">Ride Statistics</h3>
              <p>Total Rides Taken: {profileData.ridesTaken}</p>
              <p>Average Rating: {profileData.rating}</p>
            </TabsContent>
          </Tabs>

          {isEditing ? (
            <Button onClick={handleSave} className="mt-4">
              Save Changes
            </Button>
          ) : (
            <Button onClick={handleEdit} className="mt-4">
              Edit Profile
            </Button>
          )}
        </CardContent>
      </Card>
      <Button className="mt-4" onClick={() => router.push("/home")}>
        Back to Home
      </Button>
    </div>
  )
}

