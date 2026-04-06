"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAppSelector } from "@/lib/store/hooks";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BoxProviderWithName } from "@/components/providers/BoxProviderWithName";
import Swal from "sweetalert2";

type Prefs = Record<string, boolean>;

const COMMON = [{ key: "chat", label: "Chat messages" }];
const USER_TYPES = [
  { key: "booking-confirmation", label: "Booking confirmation" },
  { key: "booking-cancellation", label: "Booking cancellation" },
  { key: "booking-reminder-24h", label: "24h booking reminder" },
];
const VENDOR_TYPES = [
  { key: "vendor-booking-new", label: "New booking" },
  { key: "vendor-booking-cancelled", label: "Booking cancelled" },
  { key: "vendor-booking-payment", label: "Booking payment confirmed" },
  { key: "vendor-review-new", label: "New review" },
  { key: "vendor-reminder-24h", label: "24h tour reminder" },
];
const ADMIN_TYPES = [
  { key: "admin-vendor-request", label: "New vendor application" },
  { key: "admin-tour-request", label: "New tour publish request" },
  { key: "admin-payout-request", label: "New payout request" },
];

export default function NotificationSettings() {
  const role = useAppSelector((s) => s.auth.user?.role) || "user";
  const [prefs, setPrefs] = useState<Prefs>({});
  const [loading, setLoading] = useState(false);

  const items = useMemo(() => {
    const base = [...COMMON];
    if (role === "vendor") return [...base, ...VENDOR_TYPES];
    if (role === "admin") return [...base, ...ADMIN_TYPES];
    return [...base, ...USER_TYPES];
  }, [role]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/notification-preferences");
        const server: Prefs = res.data?.prefs || {};
        const next: Prefs = {};
        for (const it of items) next[it.key] = server[it.key] ?? true;
        setPrefs(next);
      } catch (e: any) {
        Swal.fire({ icon: "error", title: "Error", text: e?.message || "Failed to load preferences", timer: 1500, showConfirmButton: false });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [items.length]);

  const updatePref = async (key: string, val: boolean) => {
    try {
      setPrefs((p) => ({ ...p, [key]: val }));
      await axios.put("/api/notification-preferences", { [key]: val });
    } catch (e: any) {
      Swal.fire({ icon: "error", title: "Error", text: e?.message || "Failed to update preference", timer: 1500, showConfirmButton: false });
      setPrefs((p) => ({ ...p, [key]: !val }));
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <BoxProviderWithName name="Notifications">
        <div className="w-full space-y-4">
          {items.map((it) => (
            <div key={it.key} className="flex items-center justify-between py-2">
              <div className="flex flex-col">
                <Label className="text-[14px] font-semibold">{it.label}</Label>
              </div>
              <Switch
                checked={!!prefs[it.key]}
                onCheckedChange={(v) => updatePref(it.key, !!v)}
                disabled={loading}
              />
            </div>
          ))}
        </div>
      </BoxProviderWithName>
    </div>
  );
}

