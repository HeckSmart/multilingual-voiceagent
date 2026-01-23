import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, User } from "lucide-react";

interface EscalationCardProps {
  id: string;
  driverId: string;
  reason: string;
  sentiment: string;
  intent: string;
  messageCount: number;
  createdAt: number;
  onAssign?: (agentId: string) => void;
  onResolve?: (resolution: string) => void;
}

export default function EscalationCard({
  id,
  driverId,
  reason,
  sentiment,
  intent,
  messageCount,
  createdAt,
  onAssign,
  onResolve,
}: EscalationCardProps) {
  const timeAgo = Math.floor((Date.now() - createdAt) / 1000);
  const timeStr =
    timeAgo < 60 ? `${timeAgo}s ago` : `${Math.floor(timeAgo / 60)}m ago`;

  const sentimentColor = {
    angry: "bg-red-100 text-red-800",
    negative: "bg-orange-100 text-orange-800",
    neutral: "bg-gray-100 text-gray-800",
    positive: "bg-green-100 text-green-800",
  }[sentiment] || "bg-gray-100 text-gray-800";

  return (
    <Card className="p-4 border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <AlertCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              Driver {driverId}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{reason}</p>
          </div>
        </div>
        <div className="text-right ml-2">
          <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
            <Clock className="w-3 h-3" />
            <span>{timeStr}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="secondary" className={sentimentColor}>
          {sentiment}
        </Badge>
        <Badge variant="outline">{intent}</Badge>
        <Badge variant="outline">{messageCount} messages</Badge>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAssign?.("agent-current")}
          className="flex-1"
        >
          <User className="w-3 h-3 mr-1" />
          Assign to Me
        </Button>
        <Button
          size="sm"
          variant="default"
          onClick={() => onResolve?.("Resolved by agent")}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          View Details
        </Button>
      </div>
    </Card>
  );
}
