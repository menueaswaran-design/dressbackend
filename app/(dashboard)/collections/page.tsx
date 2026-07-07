"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { formatDate } from "@/lib/utils";
import { Collection, Pagination } from "@/lib/types";
import api from "@/lib/api";

export default function CollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get("/collections", { params: { page, limit: 20, search } });
      setCollections(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;
    try {
      await api.delete(`/collections/${id}`);
      fetch();
    } catch (err) { console.error(err); }
  };

  const columns: Column<Collection>[] = [
    { key: "name", header: "Name", cell: (c) => <span className="font-medium">{c.name}</span> },
    { key: "slug", header: "Slug", cell: (c) => <code className="text-xs text-zinc-500">{c.slug}</code> },
    { key: "products", header: "Products", cell: (c) => <span>{c.products?.length || 0}</span> },
    { key: "displayOrder", header: "Order" },
    { key: "isActive", header: "Status", cell: (c) => <Badge variant={c.isActive ? "success" : "secondary"}>{c.isActive ? "Active" : "Inactive"}</Badge> },
    { key: "createdAt", header: "Created", cell: (c) => <span className="text-sm text-zinc-500">{formatDate(c.createdAt)}</span> },
    {
      key: "actions", header: "",
      cell: (c: Collection) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/collections/${c._id}`)}><Pencil className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(c._id)}><Trash2 className="h-3 w-3" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Collections</h1>
          <p className="text-sm text-zinc-500">Curated product collections</p>
        </div>
        <Button onClick={() => router.push("/collections/new")}><Plus className="h-4 w-4" /> Add Collection</Button>
      </div>
      <DataTable columns={columns} data={collections} loading={loading} pagination={pagination || undefined} onPageChange={setPage} onSearch={setSearch} onRowClick={(c) => router.push(`/collections/${c._id}`)} />
    </div>
  );
}
