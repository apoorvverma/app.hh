"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function WelcomeSignup() {
  const [role, setRole] = useState<"rider" | "driver" | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function generateUserId() {
    return "u" + Math.floor(1000 + Math.random() * 9000);
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!role || !displayName.trim()) {
      setError("Please select a role and enter your display name.");
      return;
    }
    setLoading(true);
    const userId = generateUserId();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, displayName, role })
      });
      if (!res.ok) throw new Error("Registration failed");
      // Open socket connection and store user data
      if (typeof window !== "undefined") {
        const { createSocket } = await import("@/utils/socket");
        createSocket(userId, role);
        localStorage.setItem("userId", userId);
        localStorage.setItem("role", role);
        localStorage.setItem("displayName", displayName);
        window.location.href = "/map";
      }
    } catch (err: any) {
      setError(err.message || "Registration error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome to Hitchiked, do you want to</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="flex gap-4 mb-2">
              <Button
                type="button"
                variant={role === "rider" ? "default" : "outline"}
                onClick={() => setRole("rider")}
                className="flex-1"
              >
                ride today
              </Button>
              <Button
                type="button"
                variant={role === "driver" ? "default" : "outline"}
                onClick={() => setRole("driver")}
                className="flex-1"
              >
                drive today
              </Button>
            </div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              required
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">Registered successfully!</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}