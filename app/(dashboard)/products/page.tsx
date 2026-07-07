"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Product, Pagination } from "@/lib/types";
import api from "@/lib/api";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products", { params: { page, limit: 10, search } });
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) { console.error(err); }
  };

  const columns: Column<Product>[] = [
    {
      key: "image",
      header: "",
      cell: (p) => (
        <div className="h-10 w-10 rounded-lg border bg-zinc-50 dark:bg-zinc-800 overflow-hidden">
          {p.images?.[0] && (
            <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      ),
    },
    { key: "name", header: "Product", cell: (p) => <div><p className="font-medium">{p.name}</p><p className="text-xs text-zinc-500">{p.sku}</p></div> },
    { key: "category", header: "Category", cell: (p) => <span className="text-sm">{p.category?.name || "-"}</span> },
    { key: "sellingPrice", header: "Price", cell: (p) => <span className="font-medium">{formatCurrency(p.sellingPrice)}</span> },
    {
      key: "stock",
      header: "Stock",
      cell: (p) => (
        <Badge variant={p.stock === 0 ? "destructive" : p.stock <= p.lowStockLimit ? "warning" : "success"}>
          {p.stock}
        </Badge>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      cell: (p) => <Badge variant={p.isActive ? "success" : "secondary"}>{p.isActive ? "Active" : "Inactive"}</Badge>,
    },
    { key: "createdAt", header: "Created", cell: (p) => <span className="text-sm text-zinc-500">{formatDate(p.createdAt)}</span> },
    {
      key: "actions",
      header: "",
      cell: (p: Product) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); router.push(`/products/${p._id}`); }}><Pencil className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={(e) => handleDelete(p._id, e)}><Trash2 className="h-3 w-3" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-zinc-500">Manage your product catalog</p>
        </div>
        <Button onClick={() => router.push("/products/new")}><Plus className="h-4 w-4" /> Add Product</Button>
      </div>
      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        pagination={pagination || undefined}
        onPageChange={setPage}
        onSearch={setSearch}
        onRowClick={(p) => router.push(`/products/${p._id}`)}
      />
    </div>
  );
}
