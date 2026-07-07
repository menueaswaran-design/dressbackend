"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Package, Users, IndianRupee, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "./_components/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { DashboardStats } from "@/lib/types";
import api from "@/lib/api";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/charts"),
        ]);
        setStats({ ...statsRes.data.data, ...chartsRes.data.data });
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Overview of your store performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={<IndianRupee className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />}
          description="Lifetime revenue"
        />
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(stats?.todayRevenue || 0)}
          icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={<ShoppingCart className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />}
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          icon={<ShoppingCart className="h-5 w-5 text-amber-600" />}
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={<Package className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />}
        />
        <StatCard
          title="Low Stock"
          value={stats?.lowStockProducts || 0}
          icon={<TrendingDown className="h-5 w-5 text-red-600" />}
        />
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          icon={<Users className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />}
        />
        <StatCard
          title="Returning Customers"
          value={stats?.returningCustomers || 0}
          icon={<Users className="h-5 w-5 text-blue-600" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.monthlyStats?.slice(-6).map((m) => (
                <div key={m._id} className="flex items-center gap-4">
                  <span className="w-20 text-sm font-medium">{m._id}</span>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-2 rounded-full bg-zinc-900 dark:bg-zinc-50 transition-all"
                        style={{
                          width: `${Math.min(
                            (m.revenue / Math.max(...(stats?.monthlyStats?.map((x) => x.revenue) || [1]))) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-24 text-right text-sm font-medium">{formatCurrency(m.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.monthlyStats?.slice(-6).map((m) => (
                <div key={m._id} className="flex items-center gap-4">
                  <span className="w-20 text-sm font-medium">{m._id}</span>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-2 rounded-full bg-blue-500 transition-all"
                        style={{
                          width: `${Math.min(
                            (m.count / Math.max(...(stats?.monthlyStats?.map((x) => x.count) || [1]))) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-16 text-right text-sm font-medium">{m.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
