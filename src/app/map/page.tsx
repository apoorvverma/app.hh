"use client";

import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { createSocket } from "@/utils/socket";
import { emitLocationUpdate, registerUser, UserLocation } from "./socket-map-helpers";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";
import { SocketStatusCard } from "@/components/ui/socket-status-card";
import { acceptRequest, createRideRequest, updateMyLocation } from "@/lib/api";

interface MarkerWithId {
  marker: google.maps.Marker;
  userId: string;
}

interface OfferPayload {
  eventId: string;
  requestId: string;
  riderId: string;
  pickup: { lat: number; lng: number; address?: string };
  dropoff: { lat: number; lng: number; address?: string };
  distanceMeters: number;
}

export default function MapPage() {
  const [socketStatus, setSocketStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected");
  const [socketDetails, setSocketDetails] = useState<string>("");
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState("");
  const [otherUsers, setOtherUsers] = useState<UserLocation[]>([]);
  const [offers, setOffers] = useState<OfferPayload[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const myMarker = useRef<google.maps.Marker | null>(null);
  const otherMarkers = useRef<MarkerWithId[]>([]);

  const pickupRef = useRef<HTMLInputElement>(null);
  const dropoffRef = useRef<HTMLInputElement>(null);

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const role = typeof window !== "undefined" ? (localStorage.getItem("role") as "driver" | "rider" | null) : null;

  useEffect(() => {
    let watchId: number | undefined;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => setError("Could not get location: " + err.message),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
      );
    } else {
      setError("Geolocation not supported");
    }
    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !("google" in window) || !location) return;
    if (!mapInstance.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, { center: location, zoom: 15 });
      myMarker.current = new google.maps.Marker({
        position: location,
        map: mapInstance.current,
        title: "You are here",
        icon: { url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" },
      });
    }
  }, [location]);

  useEffect(() => {
    if (!userId || !role) {
      setSocketStatus("disconnected");
      setSocketDetails("Missing user session (userId/role).");
      return;
    }
    if (socketRef.current) return;

    setSocketStatus("connecting");
    setSocketDetails("Connecting to server...");
    const s = createSocket(userId, role);
    socketRef.current = s;

    s.on("connect", () => {
      setSocketStatus("connected");
      setSocketDetails(`Socket ID: ${s.id}`);
      if (location) registerUser(s, userId, role, location.lat, location.lng);
    });
    s.on("disconnect", (reason: string) => {
      setSocketStatus("disconnected");
      setSocketDetails(reason ? `Disconnected: ${reason}` : "Disconnected");
    });
    s.on("connect_error", () => {
      setSocketStatus("disconnected");
      setSocketDetails("Connection error");
    });
    s.on("reconnect_attempt", () => {
      setSocketStatus("connecting");
      setSocketDetails("Reconnecting.");
    });

    s.on("user:location", (data: UserLocation) => {
      setOtherUsers((prev) => {
        const filtered = prev.filter((u) => u.userId !== data.userId);
        return [...filtered, data];
      });
    });

    s.on("request:offer", (offer: OfferPayload) => {
      setOffers((prev) => {
        if (prev.some((x) => x.eventId === offer.eventId || x.requestId === offer.requestId)) return prev;
        return [offer, ...prev].slice(0, 5);
      });
    });

    s.on("ride:update", () => {
      setSuccess("Ride status updated.");
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [userId, role, location]);

  useEffect(() => {
    if (!location) return;
    if (mapInstance.current) mapInstance.current.setCenter(location);
    if (myMarker.current) myMarker.current.setPosition(location);
    if (socketRef.current && userId && role) {
      registerUser(socketRef.current, userId, role, location.lat, location.lng);
      emitLocationUpdate(socketRef.current, location.lat, location.lng);
    }
    updateMyLocation(location.lat, location.lng).catch(() => {});
  }, [location, userId, role]);

  useEffect(() => {
    if (!mapInstance.current) return;
    otherMarkers.current.forEach(({ marker }) => marker.setMap(null));
    otherMarkers.current = [];
    for (const u of otherUsers) {
      if (!u || u.userId === userId) continue;
      const marker = new google.maps.Marker({
        position: { lat: u.lat, lng: u.lng },
        map: mapInstance.current,
        icon: { url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" },
        title: `User: ${u.userId}`,
      });
      otherMarkers.current.push({ marker, userId: u.userId });
    }
  }, [otherUsers, userId]);

  const [pickupAddr, setPickupAddr] = useState("");
  const [dropoffAddr, setDropoffAddr] = useState("");
  const [pickupLL, setPickupLL] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffLL, setDropoffLL] = useState<{ lat: number; lng: number } | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (pickupRef.current && dropoffRef.current) {
        const pickupAutocomplete = new google.maps.places.Autocomplete(pickupRef.current, {
          fields: ["formatted_address", "geometry"],
          types: ["address"],
        });

        const dropoffAutocomplete = new google.maps.places.Autocomplete(dropoffRef.current, {
          fields: ["formatted_address", "geometry"],
          types: ["address"],
        });

        pickupAutocomplete.addListener("place_changed", () => {
          const place = pickupAutocomplete.getPlace();
          setPickupAddr(place.formatted_address || "");
          const loc = place.geometry?.location;
          if (loc) setPickupLL({ lat: loc.lat(), lng: loc.lng() });
        });

        dropoffAutocomplete.addListener("place_changed", () => {
          const place = dropoffAutocomplete.getPlace();
          setDropoffAddr(place.formatted_address || "");
          const loc = place.geometry?.location;
          if (loc) setDropoffLL({ lat: loc.lat(), lng: loc.lng() });
        });
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSuccess("");
    if (!pickupAddr || !dropoffAddr || !date || !time) {
      setFormError("All fields are required.");
      return;
    }
    if (!userId) {
      setFormError("Missing user session.");
      return;
    }

    setLoading(true);
    try {
      const pickup = pickupLL ?? location;
      const dropoff = dropoffLL ?? location;
      if (!pickup || !dropoff) throw new Error("Could not resolve pickup/dropoff.");

      if (role !== "driver") {
        await createRideRequest({
          pickup: { lat: pickup.lat, lng: pickup.lng, address: pickupAddr },
          dropoff: { lat: dropoff.lat, lng: dropoff.lng, address: dropoffAddr },
        });
        setSuccess("Ride requested successfully!");
      } else {
        setFormError("Drivers receive live offers below. Accept one to start a ride.");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setFormError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(offer: OfferPayload) {
    setFormError("");
    setSuccess("");
    try {
      const ride = await acceptRequest(offer.requestId);
      setOffers((prev) => prev.filter((o) => o.requestId !== offer.requestId));
      setSuccess(`Accepted request. Ride ID: ${ride.id}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to accept request";
      setFormError(errorMessage);
    }
  }

  return (
    <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0, position: "fixed", top: 0, left: 0 }}>
      <div ref={mapRef} style={{ width: "100vw", height: "100vh" }} />
      {error && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: "#fff",
            padding: 8,
            borderRadius: 4,
            color: "red",
            zIndex: 1000,
          }}
        >
          {error}
        </div>
      )}
      <SocketStatusCard status={socketStatus} userId={userId ?? undefined} details={socketDetails} />

      {role === "driver" && offers.length > 0 && (
        <div className="absolute top-20 right-4 w-[350px] max-h-[45vh] overflow-auto z-40 space-y-2">
          {offers.map((offer) => (
            <Card key={offer.eventId} className="shadow-lg">
              <CardContent className="p-3 space-y-2">
                <div className="text-sm font-semibold">New rider request</div>
                <div className="text-xs">From: {offer.pickup.address || `${offer.pickup.lat}, ${offer.pickup.lng}`}</div>
                <div className="text-xs">To: {offer.dropoff.address || `${offer.dropoff.lat}, ${offer.dropoff.lng}`}</div>
                <div className="text-xs">Distance: {offer.distanceMeters}m</div>
                <Button size="sm" className="w-full" onClick={() => handleAccept(offer)}>
                  Accept Request
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 w-full px-4 pb-4 z-40">
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle>{role === "driver" ? "Driver Console" : "Find a Ride"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pickup">Pickup Location</Label>
                <div className="flex">
                  <Input
                    id="pickup"
                    ref={pickupRef}
                    placeholder="Enter pickup location"
                    required
                    value={pickupAddr}
                    onChange={(e) => setPickupAddr(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoff">Drop-off Location</Label>
                <div className="flex">
                  <Input
                    id="dropoff"
                    ref={dropoffRef}
                    placeholder="Enter drop-off location"
                    required
                    value={dropoffAddr}
                    onChange={(e) => setDropoffAddr(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date and Time</Label>
                <div className="flex space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                        {date ? date.toLocaleDateString() : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <TimePicker value={time} onChange={setTime} disabled={loading} />
                </div>
              </div>
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <Button type="submit" className="w-full" disabled={loading || role === "driver"}>
                {loading ? "Submitting..." : role === "driver" ? "Drivers use live offers" : "Find Ride"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
