import * as React from "react";
import { Card } from "@/components/ui/card";

export interface SocketStatusCardProps {
  status: "connected" | "connecting" | "disconnected";
  details?: string;
  userId?: string;
}

export const SocketStatusCard: React.FC<SocketStatusCardProps> = ({ status, details, userId }) => {
  let color = "bg-gray-400";
  if (status === "connected") color = "bg-green-500";
  else if (status === "connecting") color = "bg-yellow-500";
  else if (status === "disconnected") color = "bg-red-500";

  return (
    <Card className="fixed top-4 right-4 z-50 w-56 p-3 shadow-lg border-2 border-muted bg-background/95 flex flex-col items-start space-y-1">
      <div className="flex items-center space-x-2">
        <span className={`inline-block h-3 w-3 rounded-full ${color}`}></span>
        <span className="text-sm font-semibold capitalize">{status}</span>
      </div>
      {userId && <div className="text-xs text-muted-foreground truncate">User: {userId}</div>}
      {details && <div className="text-xs text-muted-foreground truncate">{details}</div>}
    </Card>
  );
};
