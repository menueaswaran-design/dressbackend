"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";

export default function EditCollectionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [banner, setBanner] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    api.get(`/collections/${id}`).then((res) => {
      const c = res.data.data?.collection || res.data.data;
      setName(c.name);
      setSlug(c.slug || "");
      setDescription(c.description || "");
      setBanner(c.banner || "");
      setDisplayOrder(String(c.displayOrder || 0));
      setIsActive(c.isActive);
      setProducts(c.products || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put(`/collections/${id}`, { name, slug: slug || undefined, description, banner: banner || undefined, displayOrder: Number(displayOrder), isActive });
      router.push("/collections");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to update collection");
    }
    setSaving(false);
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await api.get("/products", { params: { search: term, limit: 10 } });
      setSearchResults((res.data.data || []).filter((p: any) => !products.some((cp) => cp._id === p._id)));
    } catch { setSearchResults([]); }
    setSearching(false);
  };

  const addProduct = async (productId: string) => {
    try {
      const res = await api.post(`/collections/${id}/products`, { productIds: [productId] });
      const updated = res.data.data?.collection || res.data.data;
      setProducts(updated.products || []);
      setSearchResults(searchResults.filter((p) => p._id !== productId));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add product");
    }
  };

  const removeProduct = async (productId: string) => {
    try {
      const res = await api.delete(`/collections/${id}/products`, { data: { productIds: [productId] } });
      const updated = res.data.data?.collection || res.data.data;
      setProducts(updated.products || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove product");
    }
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-12 w-64" /><Skeleton className="h-96" /></div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Edit Collection</h1>
          <p className="text-sm text-zinc-500">{name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={isActive} onCheckedChange={setIsActive} id="isActive" />
          <Label htmlFor="isActive" className="text-sm">{isActive ? "Active" : "Inactive"}</Label>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>}

      <Card>
        <CardHeader><CardTitle>Collection Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name <span className="text-red-500">*</span></Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Banner URL</Label>
              <Input value={banner} onChange={(e) => setBanner(e.target.value)} placeholder="https://res.cloudinary.com/..." />
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Products ({products.length})</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowSearch(!showSearch)}>
              <Plus className="h-4 w-4" /> Add Products
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showSearch && (
            <div className="space-y-2 p-3 border rounded-lg bg-zinc-50 dark:bg-zinc-900">
              <Label>Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Type product name..."
                  className="pl-9"
                  autoFocus
                />
              </div>
              {searching && <p className="text-sm text-zinc-500">Searching...</p>}
              {searchResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1 mt-2">
                  {searchResults.map((p) => (
                    <div key={p._id} className="flex items-center justify-between p-2 rounded-lg border bg-white dark:bg-zinc-800">
                      <div className="flex items-center gap-2">
                        {p.images?.[0] && (
                          <img src={p.images[0].url} alt="" className="w-8 h-8 rounded object-cover" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-zinc-500">{formatCurrency(p.sellingPrice)}</p>
                        </div>
                      </div>
                      <Button type="button" size="sm" variant="ghost" onClick={() => addProduct(p._id)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {searchTerm.length >= 2 && !searching && searchResults.length === 0 && (
                <p className="text-sm text-zinc-500">No products found</p>
              )}
            </div>
          )}

          {products.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">No products in this collection</p>
          ) : (
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {p.images?.[0] && (
                      <img src={p.images[0].url} alt="" className="w-12 h-12 rounded object-cover" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-zinc-500">{formatCurrency(p.sellingPrice)}</p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-red-600" onClick={() => removeProduct(p._id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
