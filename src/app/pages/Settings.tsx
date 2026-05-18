import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Bell, Globe, Palette, Database, Save } from "lucide-react";
import { toast } from "sonner";
import { useApi, apiCall } from "../../hooks/useApi";
import { Skeleton } from "../components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import {
  applyAdminPreferences,
  defaultAdminPreferences,
  normalizeAdminPreferences,
  persistAdminPreferences,
} from "../utils/preferences";
import { useTranslation } from "../contexts/LanguageContext";

export function Settings() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useApi<any>("/api/admin/v1/settings");

  const [settings, setSettings] = useState({
    ...defaultAdminPreferences(),
  });

  // Update local state when API data is available
  useEffect(() => {
    if (data) {
      const generalSettings = normalizeAdminPreferences(data.general ?? data);
      setSettings((prev) => ({ ...prev, ...generalSettings }));
      applyAdminPreferences(generalSettings);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      const response = await apiCall<any>("/api/admin/v1/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      const savedSettings = normalizeAdminPreferences(response?.settings ?? settings);
      persistAdminPreferences(savedSettings);
      applyAdminPreferences(savedSettings);
      setSettings(savedSettings);
      toast.success(t("settings.saveSuccess"));
    } catch (err: any) {
      toast.error(t("settings.saveFailed"), { description: err.message });
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("settings.pageTitle")}</h1>
          <p className="text-gray-500 mt-1">{t("settings.pageSubtitle")}</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-red-700 font-medium">{t("settings.failedLoad")}</p>
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("settings.pageTitle")}</h1>
        <p className="text-gray-500 mt-1">
          {t("settings.pageSubtitle")}
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#00BF63]" />
              {t("settings.notifications")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notif">{t("settings.emailNotifications")}</Label>
                <p className="text-sm text-gray-500">
                  {t("settings.emailNotificationsDesc")}
                </p>
              </div>
              <Switch
                id="email-notif"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notif">{t("settings.pushNotifications")}</Label>
                <p className="text-sm text-gray-500">
                  {t("settings.pushNotificationsDesc")}
                </p>
              </div>
              <Switch
                id="push-notif"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, pushNotifications: checked })
                }
              />
            </div>

            {/* Booking Alerts */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="booking-alerts">{t("settings.bookingAlerts")}</Label>
                <p className="text-sm text-gray-500">
                  {t("settings.bookingAlertsDesc")}
                </p>
              </div>
              <Switch
                id="booking-alerts"
                checked={settings.bookingAlerts}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, bookingAlerts: checked })
                }
              />
            </div>

            {/* Payment Alerts */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="payment-alerts">{t("settings.paymentAlerts")}</Label>
                <p className="text-sm text-gray-500">
                  {t("settings.paymentAlertsDesc")}
                </p>
              </div>
              <Switch
                id="payment-alerts"
                checked={settings.paymentAlerts}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, paymentAlerts: checked })
                }
              />
            </div>

            {/* Dispute Alerts */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dispute-alerts">{t("settings.disputeAlerts")}</Label>
                <p className="text-sm text-gray-500">
                  {t("settings.disputeAlertsDesc")}
                </p>
              </div>
              <Switch
                id="dispute-alerts"
                checked={settings.disputeAlerts}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, disputeAlerts: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Regional & Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#00BF63]" />
              {t("settings.regionalPreferences")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">{t("settings.language")}</Label>
              <Select
                value={settings.language}
                onValueChange={(value) =>
                  setSettings({ ...settings, language: value })
                }
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder={t("settings.selectLanguage")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fil">{t("settings.filipino")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label htmlFor="timezone">{t("settings.timezone")}</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) =>
                  setSettings({ ...settings, timezone: value })
                }
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder={t("settings.selectTimezone")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Manila">
                    (GMT+8) Manila, Philippines
                  </SelectItem>
                  <SelectItem value="Asia/Singapore">
                    (GMT+8) Singapore
                  </SelectItem>
                  <SelectItem value="Asia/Tokyo">
                    (GMT+9) Tokyo, Japan
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#00BF63]" />
              {t("settings.appearance")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div className="space-y-2">
              <Label htmlFor="theme">{t("settings.theme")}</Label>
              <Select
                value={settings.theme}
                onValueChange={(value) =>
                  setSettings({ ...settings, theme: value })
                }
              >
                <SelectTrigger id="theme">
                  <SelectValue placeholder={t("settings.selectTheme")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t("settings.light")}</SelectItem>
                  <SelectItem value="dark">{t("settings.dark")}</SelectItem>
                  <SelectItem value="auto">{t("settings.autoSystem")}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {t("settings.themeDesc")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#00BF63]" />
              {t("settings.dataPrivacy")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Data Retention */}
            <div className="space-y-2">
              <Label htmlFor="retention">{t("settings.dataRetentionPeriod")}</Label>
              <Select
                value={settings.dataRetention}
                onValueChange={(value) =>
                  setSettings({ ...settings, dataRetention: value })
                }
              >
                <SelectTrigger id="retention">
                  <SelectValue placeholder={t("settings.selectPeriod")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {t("settings.dataRetentionDesc")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-[#00BF63] hover:bg-[#00A055]"
        >
          <Save className="w-4 h-4 mr-2" />
          {t("settings.saveSettings")}
        </Button>
      </div>
    </div>
  );
}
