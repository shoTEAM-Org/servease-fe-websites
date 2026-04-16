import { useMemo, useState } from "react";
import { AlertCircle, Megaphone, Send, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { fetchAdminJson } from "../lib/adminApi";

type AudienceTarget = "customers" | "providers" | "custom";
type BroadcastType = "broadcast" | "announcement" | "system";

type BroadcastPayload = {
  role?: "customer" | "provider";
  user_ids?: string[];
  title: string;
  message: string;
  type: BroadcastType;
};

export function Broadcasts() {
  const [audience, setAudience] = useState<AudienceTarget>("customers");
  const [type, setType] = useState<BroadcastType>("broadcast");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [userIdsText, setUserIdsText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedUserIds = useMemo(() => {
    const ids = userIdsText
      .split(/[\n,]/)
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
    return Array.from(new Set(ids));
  }, [userIdsText]);

  async function submitBroadcast() {
    const normalizedTitle = title.trim();
    const normalizedMessage = message.trim();

    if (!normalizedTitle) {
      setError("Title is required.");
      return;
    }
    if (!normalizedMessage) {
      setError("Message is required.");
      return;
    }
    if (audience === "custom" && parsedUserIds.length === 0) {
      setError("Provide at least one user ID for custom audience.");
      return;
    }

    const payload: BroadcastPayload = {
      title: normalizedTitle,
      message: normalizedMessage,
      type,
    };

    if (audience === "customers") payload.role = "customer";
    if (audience === "providers") payload.role = "provider";
    if (audience === "custom") payload.user_ids = parsedUserIds;

    try {
      setIsSubmitting(true);
      setError(null);
      await fetchAdminJson<{ status: string }>("/api/admin/v1/marketplace/broadcasts", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success("Broadcast queued successfully.");
      setTitle("");
      setMessage("");
      if (audience === "custom") {
        setUserIdsText("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to queue broadcast.");
      toast.error(err instanceof Error ? err.message : "Failed to queue broadcast.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Broadcasts</h1>
        <p className="text-gray-500 mt-1">Send announcements and notifications to customer or provider groups.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Create Broadcast</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Audience</label>
                <Select
                  value={audience}
                  onValueChange={(value) => {
                    setAudience(value as AudienceTarget);
                    setError(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customers">All Customers</SelectItem>
                    <SelectItem value="providers">All Providers</SelectItem>
                    <SelectItem value="custom">Specific User IDs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Message Type</label>
                <Select value={type} onValueChange={(value) => setType(value as BroadcastType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select message type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="broadcast">Broadcast</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {audience === "custom" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Target User IDs</label>
                <Textarea
                  value={userIdsText}
                  onChange={(event) => setUserIdsText(event.target.value)}
                  placeholder="Enter one user ID per line or comma-separated IDs"
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500">{parsedUserIds.length} user ID(s) detected.</p>
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Title</label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter broadcast title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Message</label>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Type your broadcast message"
                className="min-h-[160px]"
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => void submitBroadcast()}
                disabled={isSubmitting}
                className="bg-[#16A34A] hover:bg-[#15803D]"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Queueing..." : "Queue Broadcast"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Broadcast Guidance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <Megaphone className="h-4 w-4 mt-0.5 text-gray-500" />
              <p>
                Broadcasts are queued asynchronously. Delivery happens in the background after acceptance.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 mt-0.5 text-gray-500" />
              <p>
                Use <strong>All Customers</strong> or <strong>All Providers</strong> for role-based campaigns.
              </p>
            </div>
            <div className="rounded-md border bg-gray-50 p-3">
              <p className="font-medium text-gray-800">Best practice</p>
              <p className="mt-1">
                Keep titles short and actionable. Put complete context and deadlines in the message body.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
