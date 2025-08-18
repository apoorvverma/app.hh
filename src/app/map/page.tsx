"use client";

import { useEffect, useRef, useState } from "react";
import { createSocket } from "@/utils/socket";
import type { Socket } from "socket.io-client";
import { emitLocationUpdate, registerUser, UserLocation } from "./socket-map-helpers";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";
import { SocketStatusCard } from "@/components/ui/socket-status-card";

interface MarkerWithId {
  marker: google.maps.Marker;
  userId: string;
}

export default function MapPage() {
  // Socket status state
  const [socketStatus, setSocketStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected");
  const [socketDetails, setSocketDetails] = useState<string>("");
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState("");
  const [otherUsers, setOtherUsers] = useState<UserLocation[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const myMarker = useRef<google.maps.Marker | null>(null);
  const otherMarkers = useRef<MarkerWithId[]>([]);

  const pickupRef = useRef<HTMLInputElement>(null);
  const dropoffRef = useRef<HTMLInputElement>(null);

  // Get userId and role from localStorage
  const userId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null;
  const role = typeof window !== 'undefined' ? localStorage.getItem("role") as "driver" | "rider" : null;

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
  return () => { if (watchId !== undefined) navigator.geolocation.clearWatch(watchId); };
}, []);

  // Get live location
  // useEffect(() => {
  //   let watchId: number;
  //   if (navigator.geolocation) {
  //     watchId = navigator.geolocation.watchPosition(
  //       (pos) => {
  //         setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
  //       },
  //       (err) => setError("Could not get location: " + err.message),
  //       { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
  //     );
  //   } else {
  //     setError("Geolocation not supported");
  //   }
  //   return () => {
  //     if (navigator.geolocation && watchId !== undefined) {
  //       navigator.geolocation.clearWatch(watchId);
  //     }
  //   };
  // }, []);

  useEffect(() => {
    if (!mapRef.current || !('google' in window) || !location) return;
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
  
    return () => { s.disconnect(); };  // only on unmount
  }, [userId, role, location]);

  useEffect(() => {
    if (!location) return;
    if (mapInstance.current) mapInstance.current.setCenter(location);
    if (myMarker.current) myMarker.current.setPosition(location);
    if (socketRef.current) emitLocationUpdate(socketRef.current, location.lat, location.lng);
    if (userId) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ lat: location.lat, lng: location.lng }),
      }).catch(() => {});
    }
  }, [location, userId]);

  useEffect(() => {
    if (!mapInstance.current) return;
    // clear old
    otherMarkers.current.forEach(({ marker }) => marker.setMap(null));
    otherMarkers.current = [];
    // add new
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
  

  // // Initialize socket and map
  // useEffect(() => {
  //   if (!location || !userId || !role || !mapRef.current || typeof window === "undefined" || !window.google || !window.google.maps) return;

  //   // Setup map
  //   if (!mapInstance.current) {
  //     mapInstance.current = new window.google.maps.Map(mapRef.current, {
  //       center: location,
  //       zoom: 15,
  //     });
  //   } else {
  //     mapInstance.current.setCenter(location);
  //   }

  //   // Place/update self marker
  //   if (!myMarker.current) {
  //     myMarker.current = new window.google.maps.Marker({
  //       position: location,
  //       map: mapInstance.current,
  //       title: "You are here",
  //       icon: {
  //         url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  //       },
  //     });
  //   } else {
  //     myMarker.current.setPosition(location);
  //   }

  //   // Setup socket connection
  //   if (!socketRef.current) {
  //     const socket = createSocket(userId, role);
  //     socketRef.current = socket;
  //     setSocketStatus("connecting");
  //     setSocketDetails("Connecting to server...");
  //     // Register user on connect
  //     socket.on("connect", () => {
  //       setSocketStatus("connected");
  //       setSocketDetails(`Socket ID: ${socket.id}`);
  //       registerUser(socket, userId, role, location.lat, location.lng);
  //     });
  //     socket.on("disconnect", (reason: string) => {
  //       setSocketStatus("disconnected");
  //       setSocketDetails(reason ? `Disconnected: ${reason}` : "Disconnected");
  //     });
  //     socket.on("connect_error", (err: any) => {
  //       setSocketStatus("disconnected");
  //       setSocketDetails("Connection error");
  //     });
  //     socket.on("reconnect_attempt", () => {
  //       setSocketStatus("connecting");
  //       setSocketDetails("Reconnecting...");
  //     });
  //     // Listen for other users' locations
  //     socket.on("user:location", (data: UserLocation) => {
  //       setOtherUsers((prev) => {
  //         // Replace or add user
  //         const filtered = prev.filter(u => u.userId !== data.userId);
  //         return [...filtered, data];
  //       });
  //     });
  //   } else {
  //     // If already connected, send register again (for location update)
  //     registerUser(socketRef.current, userId, role, location.lat, location.lng);
  //   }

  //   // Emit own location update
  //   if (socketRef.current) {
  //     emitLocationUpdate(socketRef.current, location.lat, location.lng);
  //   }
  //   fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me/location`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       "x-user-id": userId!,
  //     },
  //     body: JSON.stringify({ lat: location.lat, lng: location.lng }),
  //   }).catch(() => {});

  //   // Render other users' markers
  //   otherMarkers.current.forEach(({ marker }) => marker.setMap(null));
  //   otherMarkers.current = otherUsers.map((u) => {
  //     // Don't show yourself
  //     if (u.userId === userId) return null;
  //     const marker = new window.google.maps.Marker({
  //       position: { lat: u.lat, lng: u.lng },
  //       map: mapInstance.current!,
  //       icon: {
  //         url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
  //       },
  //       title: `User: ${u.userId}`,
  //     });
  //     return { marker, userId: u.userId };
  //   }).filter(Boolean) as MarkerWithId[];

  //   // Cleanup on unmount
  //   return () => {
  //     if (socketRef.current) {
  //       socketRef.current.disconnect();
  //       socketRef.current = null;
  //     }
  //     otherMarkers.current.forEach(({ marker }) => marker.setMap(null));
  //     if (myMarker.current) myMarker.current.setMap(null);
  //     mapInstance.current = null;
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [location, userId, role, otherUsers.length]);

  // Form state for ride/drive card
  const [pickupAddr, setPickupAddr] = useState("");
  const [dropoffAddr, setDropoffAddr] = useState("");
  const [pickupLL, setPickupLL] = useState<{lat:number; lng:number} | null>(null);
  const [dropoffLL, setDropoffLL] = useState<{lat:number; lng:number} | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");


    // Initialize Google Maps
    useEffect(() => {
      // Load Google Maps JavaScript API
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
  
      script.onload = () => {
        if (mapRef.current) {
          // Initialize map centered on Boston
          new google.maps.Map(mapRef.current, {
            center: { lat: 42.350876, lng: -71.106918 }, // Boston coordinates
            zoom: 13,
          })
          // const mapInstance = new google.maps.Map(mapRef.current, {
          //   center: { lat: 42.350876, lng: -71.106918 }, // Boston coordinates
          //   zoom: 13,
          //   // disableDefaultUI: true,
          //   /* styles: [
          //     {
          //       elementType: "geometry",
          //       stylers: [{ color: "#f5f5f5" }]
          //     },
          //     {
          //       elementType: "labels.icon",
          //       stylers: [{ visibility: "off" }]
          //     },
          //     {
          //       elementType: "labels.text.fill",
          //       stylers: [{ color: "#616161" }]
          //     },
          //     {
          //       elementType: "labels.text.stroke",
          //       stylers: [{ color: "#f5f5f5" }]
          //     }
          //   ] */
          // })
          // setMap(mapInstance)
        }
  
        if (pickupRef.current && dropoffRef.current) {
          // Initialize Autocomplete for pickup
          const pickupAutocomplete = new google.maps.places.Autocomplete(pickupRef.current, {
            fields: ["formatted_address", "geometry"],
            types: ["address"]
          })
  
          // Initialize Autocomplete for dropoff
          const dropoffAutocomplete = new google.maps.places.Autocomplete(dropoffRef.current, {
            fields: ["formatted_address", "geometry"],
            types: ["address"]
          })

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
      }
  
      return () => {
        document.head.removeChild(script)
      }
    }, [])

  // Handlers for booking
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
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) throw new Error("Backend URL not configured.");

    // fallback to current location if no geometry was returned
    const pickup = pickupLL ?? location;
    const dropoff = dropoffLL ?? location;
    if (!pickup || !dropoff) throw new Error("Could not resolve pickup/dropoff.");

    if (role !== "driver") {  // default to rider flow
      const body = {
        pickup: { lat: pickup.lat, lng: pickup.lng, address: pickupAddr },
        dropoff: { lat: dropoff.lat, lng: dropoff.lng, address: dropoffAddr },
      };
      const res = await fetch(`${backendUrl}/api/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to request ride");
      setSuccess("Ride requested successfully!");
    } else {
      setFormError("Driver publishing is not wired to backend yet.");
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    setFormError(errorMessage);
  } finally {
    setLoading(false);
  }
}

  return (
    <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0, position: "fixed", top: 0, left: 0 }}>
      <div ref={mapRef} style={{ width: "100vw", height: "100vh" }} />
      <ScriptLoader />
      {error && <div style={{position:'absolute',top:10,left:10,background:'#fff',padding:8,borderRadius:4,color:'red',zIndex:1000}}>{error}</div>}
      <SocketStatusCard status={socketStatus} userId={userId ?? undefined} details={socketDetails} />
      {/* Ride/Drive Card */}
      <div className="absolute bottom-0 left-0 right-0 w-full px-4 pb-4 z-40">
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle>{role === "driver" ? "Create a Drive" : "Find a Ride"}</CardTitle>
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
                    onChange={e => setPickupAddr(e.target.value)}
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
                    onChange={e => setDropoffAddr(e.target.value)}
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
                  <TimePicker
                    value={time}
                    onChange={setTime}
                    disabled={loading}
                  />
                </div>
              </div>
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (role === "driver" ? "Creating..." : "Finding...") : (role === "driver" ? "Create Drive" : "Find Ride")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ScriptLoader() {
  useEffect(() => {
    if (typeof window !== "undefined" && !('google' in window)) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      document.body.appendChild(script);
      return () => { document.body.removeChild(script); };
    }
  }, []);
  return null;
}