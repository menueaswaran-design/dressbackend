"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck, Package, AlertTriangle, XCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import api from "@/lib/api";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, typeof Bell> = {
  new_order: ShoppingCart,
  low_stock: AlertTriangle,
  failed_payment: XCircle,
  cancelled_order: XCircle,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/notifications", { params: { recipient: "admin" } });
        setNotifications(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-zinc-500">System notifications and alerts</p>
        </div>
        <Button variant="outline" onClick={markAllRead}><CheckCheck className="h-4 w-4 mr-1" /> Mark All Read</Button>
      </div>

      <div className="space-y-2">
        {notifications.map((n) => {
          const Icon = typeIcons[n.type] || Bell;
          return (
            <Card key={n._id} className={`transition-colors ${!n.isRead ? "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50" : ""}`}>
              <CardContent className="flex items-start gap-4 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${!n.isRead ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-400"}`}>
                      {n.title}
                    </p>
                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
                  </div>
                  <p className="text-sm text-zinc-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-zinc-400 mt-1">{formatDateTime(n.createdAt)}</p>
                </div>
                <Badge variant="secondary" className="capitalize shrink-0">{n.type.replace(/_/g, " ")}</Badge>
              </CardContent>
            </Card>
          );
        })}
        {!loading && notifications.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-8 w-8 mx-auto text-zinc-300 mb-2" />
              <p className="text-zinc-500">No notifications yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
