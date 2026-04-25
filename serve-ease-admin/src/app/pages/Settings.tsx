import { Link } from "@/lib/react-router-compat";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { User, UserPlus } from "lucide-react";

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Account and admin access tools backed by the auth service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#00BF63]" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Manage the signed-in admin profile stored in identity_and_user.users.
            </p>
            <Button asChild className="bg-[#00BF63] hover:bg-[#00A055]">
              <Link to="/profile">Open Profile</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#00BF63]" />
              Admin Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Create admin users with role=admin through the auth-backed admin flow.
            </p>
            <Button asChild variant="outline">
              <Link to="/add-new-admin">Add Admin</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
