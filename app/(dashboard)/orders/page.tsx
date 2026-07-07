"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Order, Pagination } from "@/lib/types";
import api from "@/lib/api";

const statusStyles: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  pending: "warning",
  confirmed: "info",
  packed: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "destructive",
  returned: "secondary",
  refunded: "secondary",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders", { params: { page, limit: 10, search } });
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page, search]);

  const columns: Column<Order>[] = [
    { key: "orderNumber", header: "Order", cell: (o) => <span className="font-mono text-sm font-medium">{o.orderNumber}</span> },
    { key: "customer", header: "Customer", cell: (o) => <span>{o.customer?.name || o.customer?.email || "N/A"}</span> },
    { key: "total", header: "Total", cell: (o) => <span className="font-medium">{formatCurrency(o.total)}</span> },
    { key: "status", header: "Status", cell: (o) => <Badge variant={statusStyles[o.status] || "default"}>{o.status}</Badge> },
    { key: "payment", header: "Payment", cell: (o) => <Badge variant={o.paymentInfo?.status === "paid" ? "success" : "warning"}>{o.paymentInfo?.status || "N/A"}</Badge> },
    { key: "createdAt", header: "Date", cell: (o) => <span className="text-sm text-zinc-500">{formatDateTime(o.createdAt)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-sm text-zinc-500">Manage customer orders</p>
      </div>
      <DataTable columns={columns} data={orders} loading={loading} pagination={pagination || undefined} onPageChange={setPage} onSearch={setSearch} onRowClick={(o) => router.push(`/orders/${o._id}`)} />
    </div>
  );
}
