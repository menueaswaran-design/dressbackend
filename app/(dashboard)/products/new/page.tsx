"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, X, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { SIZES, COLORS } from "@/lib/constants";

const GENDERS = ["men", "women", "unisex", "kids"];
const LABELS = ["new", "sale", "trending", "bestseller", "limited_edition"];

interface VariantField {
  sku: string;
  color: string;
  size: string;
  price: string;
  stock: string;
}

interface ImageField {
  url: string;
  type: string;
  isPrimary: boolean;
}

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    sku: "",
    slug: "",
    description: "",
    category: "",
    brand: "",
    gender: "",
    mrp: "",
    sellingPrice: "",
    costPrice: "",
    tax: "",
    stock: "0",
    lowStockLimit: "5",
    currency: "INR",
    isActive: true,
    tags: "",
    labels: [] as string[],
  });

  const [images, setImages] = useState<ImageField[]>([{ url: "", type: "front", isPrimary: true }]);
  const [variants, setVariants] = useState<VariantField[]>([{ sku: "", color: "", size: "", price: "", stock: "" }]);
  const [categories, setCategories] = useState<any[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadIndexRef = useRef<number | null>(null);

  useEffect(() => {
    api.get("/categories", { params: { limit: 100 } }).then((res) => setCategories(res.data.data || [])).catch(() => {});
  }, []);

  const updateForm = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const addImage = () => setImages([...images, { url: "", type: "front", isPrimary: false }]);
  const removeImage = (i: number) => setImages(images.filter((_, idx) => idx !== i));
  const updateImage = (i: number, key: string, value: any) => {
    setImages(images.map((img, idx) => (idx === i ? { ...img, [key]: value } : img)));
  };

  const addVariant = () => setVariants([...variants, { sku: "", color: "", size: "", price: "", stock: "" }]);
  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, key: string, value: any) => {
    setVariants(variants.map((v, idx) => (idx === i ? { ...v, [key]: value } : v)));
  };

  const toggleLabel = (label: string) => {
    setForm((prev) => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter((l) => l !== label)
        : [...prev.labels, label],
    }));
  };

  const triggerFileUpload = (index: number) => {
    uploadIndexRef.current = index;
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadIndexRef.current === null) return;

    const index = uploadIndexRef.current;
    setUploadingIndex(index);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploaded = res.data.data.image;
      updateImage(index, "url", uploaded.url);
    } catch {
      setError("Failed to upload image");
    }

    setUploadingIndex(null);
    uploadIndexRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) { setError("Product name is required"); return; }
    if (!form.category) { setError("Please select a category"); return; }
    if (!form.mrp || !form.sellingPrice) { setError("MRP and Selling Price are required"); return; }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        name: form.name,
        description: form.description,
        category: form.category,
        brand: form.brand,
        gender: form.gender || undefined,
        mrp: Number(form.mrp),
        sellingPrice: Number(form.sellingPrice),
        tax: form.tax ? Number(form.tax) : 0,
        stock: Number(form.stock),
        lowStockLimit: Number(form.lowStockLimit),
        currency: form.currency,
        isActive: form.isActive,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        labels: form.labels,
        images: images.filter((img) => img.url),
        variants: variants.filter((v) => v.sku || v.color || v.size).map((v) => ({
          sku: v.sku,
          color: v.color || undefined,
          size: v.size || undefined,
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
        })),
      };
      if (form.sku) payload.sku = form.sku;
      if (form.slug) payload.slug = form.slug;
      if (form.costPrice) payload.costPrice = Number(form.costPrice);

      await api.post("/products", payload);
      router.push("/products");
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors?.length > 0) {
        setError(data.errors.map((e: any) => `${e.field}: ${e.message}`).join("\n"));
      } else {
        setError(data?.message || err.message || "Failed to create product");
      }
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">New Product</h1>
          <p className="text-sm text-zinc-500">Add a new product to your catalog</p>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={form.isActive}
            onCheckedChange={(v) => updateForm("isActive", v)}
            id="isActive"
          />
          <Label htmlFor="isActive" className="text-sm">{form.isActive ? "Active" : "Inactive"}</Label>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 whitespace-pre-line">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Product Name <span className="text-red-500">*</span></Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="Oversized Cotton Tee"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input
                  value={form.sku}
                  onChange={(e) => updateForm("sku", e.target.value)}
                  placeholder="Auto-generated if empty"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => updateForm("slug", e.target.value)}
                  placeholder="Auto-generated if empty"
                />
              </div>
              <div className="space-y-2">
                <Label>Category <span className="text-red-500">*</span></Label>
                <Select value={form.category} onValueChange={(v) => updateForm("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <Input
                  value={form.brand}
                  onChange={(e) => updateForm("brand", e.target.value)}
                  placeholder="e.g. DRESS"
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => updateForm("gender", v)}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="Product description..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pricing & Inventory</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>MRP <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                value={form.mrp}
                onChange={(e) => updateForm("mrp", e.target.value)}
                placeholder="999"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Selling Price <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                value={form.sellingPrice}
                onChange={(e) => updateForm("sellingPrice", e.target.value)}
                placeholder="799"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Cost Price</Label>
              <Input
                type="number"
                value={form.costPrice}
                onChange={(e) => updateForm("costPrice", e.target.value)}
                placeholder="500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => updateForm("stock", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Low Stock Limit</Label>
                <Input
                  type="number"
                  value={form.lowStockLimit}
                  onChange={(e) => updateForm("lowStockLimit", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tax (%)</Label>
              <Input
                type="number"
                value={form.tax}
                onChange={(e) => updateForm("tax", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma separated)</Label>
              <Input
                value={form.tags}
                onChange={(e) => updateForm("tags", e.target.value)}
                placeholder="cotton, oversized, summer"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Images</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          {images.map((img, i) => (
            <div key={i} className="flex items-end gap-3">
              {img.url && (
                <div className="w-16 h-16 rounded-md border overflow-hidden bg-zinc-50 flex-shrink-0">
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <Label>Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={img.url}
                    onChange={(e) => updateImage(i, "url", e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    disabled={uploadingIndex === i}
                    onClick={() => triggerFileUpload(i)}
                  >
                    {uploadingIndex === i ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="w-32 space-y-2">
                <Label>Type</Label>
                <Select value={img.type} onValueChange={(v) => updateImage(i, "type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["front", "back", "side", "close-up", "lifestyle"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pb-2">
                <Switch
                  checked={img.isPrimary}
                  onCheckedChange={(v) => updateImage(i, "isPrimary", v)}
                  id={`primary-${i}`}
                />
                <Label htmlFor={`primary-${i}`} className="text-xs whitespace-nowrap">Primary</Label>
              </div>
              {images.length > 1 && (
                <Button type="button" variant="ghost" size="icon" className="shrink-0 mb-1" onClick={() => removeImage(i)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addImage}>
            <Plus className="h-4 w-4" /> Add Image
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Variants</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              <Plus className="h-4 w-4" /> Add Variant
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="flex items-end gap-3 p-3 rounded-lg border">
              <div className="space-y-2 flex-1">
                <Label className="text-xs">SKU</Label>
                <Input
                  value={v.sku}
                  onChange={(e) => updateVariant(i, "sku", e.target.value)}
                  placeholder="SKU"
                  className="h-9"
                />
              </div>
              <div className="space-y-2 w-24">
                <Label className="text-xs">Color</Label>
                <Select value={v.color} onValueChange={(val) => updateVariant(i, "color", val)}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Color" /></SelectTrigger>
                  <SelectContent>
                    {COLORS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 w-20">
                <Label className="text-xs">Size</Label>
                <Select value={v.size} onValueChange={(val) => updateVariant(i, "size", val)}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Size" /></SelectTrigger>
                  <SelectContent>
                    {SIZES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 w-24">
                <Label className="text-xs">Price</Label>
                <Input
                  type="number"
                  value={v.price}
                  onChange={(e) => updateVariant(i, "price", e.target.value)}
                  placeholder="0"
                  className="h-9"
                />
              </div>
              <div className="space-y-2 w-20">
                <Label className="text-xs">Stock</Label>
                <Input
                  type="number"
                  value={v.stock}
                  onChange={(e) => updateVariant(i, "stock", e.target.value)}
                  placeholder="0"
                  className="h-9"
                />
              </div>
              {variants.length > 1 && (
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeVariant(i)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Labels</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {LABELS.map((label) => (
              <Badge
                key={label}
                variant={form.labels.includes(label) ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => toggleLabel(label)}
              >
                {label.replace("_", " ")}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
