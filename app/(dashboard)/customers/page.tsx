"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Customer, Pagination } from "@/lib/types";
import api from "@/lib/api";

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get("/customers", { params: { page, limit: 10, search } });
      setCustomers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page, search]);

  const columns: Column<Customer>[] = [
    { key: "name", header: "Name", cell: (c) => <span className="font-medium">{c.name || "N/A"}</span> },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone", cell: (c) => <span>{c.phone || "-"}</span> },
    { key: "totalOrders", header: "Orders", cell: (c) => <Badge variant="secondary">{c.totalOrders}</Badge> },
    { key: "totalSpent", header: "Total Spent", cell: (c) => <span className="font-medium">{formatCurrency(c.totalSpent)}</span> },
    { key: "isActive", header: "Status", cell: (c) => <Badge variant={c.isActive ? "success" : "secondary"}>{c.isActive ? "Active" : "Inactive"}</Badge> },
    { key: "createdAt", header: "Joined", cell: (c) => <span className="text-sm text-zinc-500">{formatDate(c.createdAt)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-sm text-zinc-500">View and manage customers</p>
      </div>
      <DataTable columns={columns} data={customers} loading={loading} pagination={pagination || undefined} onPageChange={setPage} onSearch={setSearch} onRowClick={(c) => router.push(`/customers/${c._id}`)} />
    </div>
  );
}
