"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { listMyRides, Ride, updateRideStatus } from "@/lib/api";

type Role = "driver" | "rider";

export default function RideHistoryPage() {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role = (typeof window !== "undefined" ? localStorage.getItem("role") : "rider") as Role;

  async function load() {
    try {
      setLoading(true);
      setError("");
      const items = await listMyRides(role || "rider");
      setRides(items || []);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load rides";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function changeStatus(rideId: string, next: "IN_PROGRESS" | "COMPLETED" | "CANCELLED") {
    try {
      await updateRideStatus(rideId, next);
      await load();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to update ride status";
      setError(message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 pb-28">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Ride History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <div>Loading rides...</div>}
          {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
          {!loading && rides.length === 0 && <div>No rides yet.</div>}

          <div className="space-y-4">
            {rides.map((ride) => (
              <div key={ride.id} className="bg-white p-4 rounded shadow space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Ride #{ride.id}</h3>
                  <span className="font-semibold">{ride.status || "UNKNOWN"}</span>
                </div>
                <div className="text-sm text-gray-600">From: {ride.origin?.address || "N/A"}</div>
                <div className="text-sm text-gray-600">To: {ride.destination?.address || "N/A"}</div>
                <div className="text-sm text-gray-600">Driver: {ride.driverId || "-"} | Rider: {ride.riderId || "-"}</div>

                {role === "driver" && (
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => changeStatus(ride.id, "IN_PROGRESS")}>
                      Start
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => changeStatus(ride.id, "COMPLETED")}>
                      Complete
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => changeStatus(ride.id, "CANCELLED")}>
                      Cancel
                    </Button>
                  </div>
                )}
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
            <DialogTitle>How can we help you?</DialogTitle>
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
  );
}
