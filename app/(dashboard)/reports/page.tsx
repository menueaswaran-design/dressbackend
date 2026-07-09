"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, BarChart3, Package, Users, Tag, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";

export default function ReportsPage() {
  const [exporting, setExporting] = useState<string | null>(null);
  const [sales, setSales] = useState<any>(null);
  const [inventory, setInventory] = useState<any>(null);
  const [customers, setCustomers] = useState<any>(null);
  const [coupons, setCoupons] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sRes, iRes, cRes, coRes] = await Promise.all([
          api.get("/reports/sales"),
          api.get("/reports/inventory"),
          api.get("/reports/customers"),
          api.get("/reports/coupons"),
        ]);
        setSales(sRes.data.data);
        setInventory(iRes.data.data);
        setCustomers(cRes.data.data);
        setCoupons(coRes.data.data);
      } catch (err) {
        console.error("Failed to load reports", err);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleExport = async (format: string) => {
    setExporting(format);
    try {
      const res = await api.get(`/reports/export?format=${format}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `report.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) { console.error("Export failed", err); }
    setExporting(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-zinc-500">Generate and export reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("csv")} disabled={exporting !== null}>
            {exporting === "csv" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("pdf")} disabled={exporting !== null}>
            {exporting === "pdf" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales"><BarChart3 className="h-4 w-4 mr-1" /> Sales</TabsTrigger>
          <TabsTrigger value="inventory"><Package className="h-4 w-4 mr-1" /> Inventory</TabsTrigger>
          <TabsTrigger value="customers"><Users className="h-4 w-4 mr-1" /> Customers</TabsTrigger>
          <TabsTrigger value="coupons"><Tag className="h-4 w-4 mr-1" /> Coupons</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="pt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: "Total Revenue", value: formatCurrency(sales?.summary?.totalRevenue || 0), desc: "Lifetime revenue" },
              { title: "Total Orders", value: String(sales?.summary?.totalOrders || 0), desc: "Delivered orders" },
              { title: "Avg Order Value", value: formatCurrency(sales?.summary?.avgOrderValue || 0), desc: "Per order average" },
            ].map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <p className="text-sm text-zinc-500">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-zinc-400 mt-1">{stat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mt-4">
            <CardHeader><CardTitle>Sales Report</CardTitle></CardHeader>
            <CardContent>
              {sales?.dailySales?.length > 0 ? (
                <div className="space-y-2">
                  {sales.dailySales.map((d: any) => (
                    <div key={d._id} className="flex justify-between text-sm">
                      <span>{d._id}</span>
                      <span className="font-medium">{d.orders} orders — {formatCurrency(d.revenue)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 py-8 text-center">No sales data yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="pt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: "Total Products", value: String(inventory?.totalProducts || 0) },
              { title: "Low Stock Items", value: String(inventory?.lowStock || 0) },
              { title: "Out of Stock", value: String(inventory?.outOfStock || 0) },
            ].map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <p className="text-sm text-zinc-500">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="customers" className="pt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: "Total Customers", value: String(customers?.totalCustomers || 0) },
              { title: "Active Customers", value: String(customers?.activeCustomers || 0) },
              { title: "Returning", value: String(customers?.returningCustomers || 0) },
            ].map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <p className="text-sm text-zinc-500">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coupons" className="pt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: "Total Coupons", value: String(coupons?.totalCoupons || 0) },
              { title: "Active Coupons", value: String(coupons?.activeCoupons || 0) },
              { title: "Expired", value: String(coupons?.expiredCoupons || 0) },
            ].map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <p className="text-sm text-zinc-500">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
