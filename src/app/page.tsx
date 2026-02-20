"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { login } from "@/lib/api"

export default function WelcomeSignup() {
  const [role, setRole] = useState<"rider" | "driver" | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!role || !displayName.trim()) {
      setError("Please select a role and enter your display name.");
      return;
    }
    setLoading(true);
    // const userId = generateUserId();
    try {
      const { userId } = await login(displayName, role);
      if (typeof window !== "undefined") {
        localStorage.setItem("userId", userId);
        localStorage.setItem("role", role);
        localStorage.setItem("displayName", displayName);
        window.location.href = "/map";
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}