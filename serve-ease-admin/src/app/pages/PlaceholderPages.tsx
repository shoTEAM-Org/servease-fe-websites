import { Card, CardContent } from "../components/ui/card";
import { Package } from "lucide-react";

/* ── Coming-soon placeholder helper ──────────────────────────── */
function ComingSoon({ title, description }: Readonly<{ title: string; description: string }>) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">{description}</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-[#DCFCE7] rounded-2xl flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-[#16A34A]" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Coming Soon</h2>
          <p className="text-gray-400 text-sm max-w-sm">
            This section is under development and will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function Support() {
  return (
    <ComingSoon
      title="Support"
      description="Manage customer and provider support tickets"
    />
  );
}

export function Broadcasts() {
  return (
    <ComingSoon
      title="Broadcasts"
      description="Send announcements and push notifications to users and providers"
    />
  );
}
