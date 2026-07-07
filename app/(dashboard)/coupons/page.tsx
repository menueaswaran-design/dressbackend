"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { formatDate } from "@/lib/utils";
import { Coupon, Pagination } from "@/lib/types";
import api from "@/lib/api";

export default function CouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get("/coupons", { params: { page, limit: 10, search } });
      setCoupons(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await api.delete(`/coupons/${id}`);
      fetch();
    } catch (err) { console.error(err); }
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  const columns: Column<Coupon>[] = [
    { key: "code", header: "Code", cell: (c) => <span className="font-mono font-medium">{c.code}</span> },
    { key: "type", header: "Type", cell: (c) => <Badge variant="secondary" className="capitalize">{c.type.replace(/_/g, " ")}</Badge> },
    { key: "value", header: "Value", cell: (c) => <span>{c.type === "percentage" ? `${c.value}%` : c.type === "flat" ? `₹${c.value}` : "-"}</span> },
    { key: "usedCount", header: "Used", cell: (c) => <span>{c.usedCount}/{c.usageLimit || "∞"}</span> },
    { key: "expiresAt", header: "Expires", cell: (c) => <span className={`text-sm ${isExpired(c.expiresAt) ? "text-red-500" : "text-zinc-500"}`}>{formatDate(c.expiresAt)}</span> },
    { key: "isActive", header: "Status", cell: (c) => <Badge variant={c.isActive && !isExpired(c.expiresAt) ? "success" : "destructive"}>{c.isActive && !isExpired(c.expiresAt) ? "Active" : "Inactive"}</Badge> },
    {
      key: "actions", header: "",
      cell: (c: Coupon) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/coupons/${c._id}`)}><Pencil className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(c._id)}><Trash2 className="h-3 w-3" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
          <p className="text-sm text-zinc-500">Manage discount coupons</p>
        </div>
        <Button onClick={() => router.push("/coupons/new")}><Plus className="h-4 w-4" /> Add Coupon</Button>
      </div>
      <DataTable columns={columns} data={coupons} loading={loading} pagination={pagination || undefined} onPageChange={setPage} onSearch={setSearch} onRowClick={(c) => router.push(`/coupons/${c._id}`)} />
    </div>
  );
}
