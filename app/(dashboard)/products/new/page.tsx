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
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { SIZES } from "@/lib/constants";

const GENDERS = ["men", "women", "unisex", "kids"];
const LABELS = ["new", "sale", "trending", "bestseller", "limited_edition"];

interface VariantSizeField {
  size: string;
  price: string;
  stock: string;
}

interface VariantField {
  name: string;
  images: string[];
  sizes: VariantSizeField[];
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
    primaryImage: "",
  });

  const [variants, setVariants] = useState<VariantField[]>([{ name: "", images: [], sizes: [{ size: "", price: "", stock: "" }] }]);
  const [categories, setCategories] = useState<any[]>([]);
  const [uploadingVariant, setUploadingVariant] = useState<number | null>(null);
  const [uploadingPrimary, setUploadingPrimary] = useState(false);

  useEffect(() => {
    api.get("/categories", { params: { limit: 100 } }).then((res) => setCategories(res.data.data || [])).catch(() => {});
  }, []);

  const updateForm = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const addVariant = () => setVariants([...variants, { name: "", images: [], sizes: [{ size: "", price: "", stock: "" }] }]);
  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, key: string, value: any) => {
    setVariants(variants.map((v, idx) => (idx === i ? { ...v, [key]: value } : v)));
  };

  const updateVariantSize = (vIdx: number, sIdx: number, key: string, value: any) => {
    setVariants((prev) =>
      prev.map((v, idx) =>
        idx === vIdx
          ? { ...v, sizes: v.sizes.map((s, si) => (si === sIdx ? { ...s, [key]: value } : s)) }
          : v
      )
    );
  };

  const addVariantSize = (vIdx: number) => {
    setVariants((prev) =>
      prev.map((v, idx) =>
        idx === vIdx ? { ...v, sizes: [...v.sizes, { size: "", price: "", stock: "" }] } : v
      )
    );
  };

  const removeVariantSize = (vIdx: number, sIdx: number) => {
    setVariants((prev) =>
      prev.map((v, idx) =>
        idx === vIdx ? { ...v, sizes: v.sizes.filter((_, si) => si !== sIdx) } : v
      )
    );
  };

  const toggleLabel = (label: string) => {
    setForm((prev) => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter((l) => l !== label)
        : [...prev.labels, label],
    }));
  };

  const handleVariantImageUpload = async (index: number, file: File) => {
    setUploadingVariant(index);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploaded = res.data.data.image;
      setVariants((prev) =>
        prev.map((v, idx) =>
          idx === index
            ? { ...v, images: [...v.images, uploaded.url] }
            : v
        )
      );
    } catch {
      setError("Failed to upload image");
    }
    setUploadingVariant(null);
  };

  const removeVariantImage = (vIdx: number, imgIdx: number) => {
    setVariants((prev) =>
      prev.map((v, idx) =>
        idx === vIdx
          ? { ...v, images: v.images.filter((_, i) => i !== imgIdx) }
          : v
      )
    );
  };

  const handlePrimaryImageUpload = async (file: File) => {
    setUploadingPrimary(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateForm("primaryImage", res.data.data.image.url);
    } catch {
      setError("Failed to upload image");
    }
    setUploadingPrimary(false);
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
        variants: variants.filter((v) => v.images.length > 0 || v.sizes.some((s) => s.size)).map((v) => ({
          name: v.name || undefined,
          images: v.images.length > 0 ? v.images : undefined,
          sizes: v.sizes.filter((s) => s.size).map((s) => ({
            size: s.size,
            price: Number(s.price) || 0,
            stock: Number(s.stock) || 0,
          })),
        })),
        primaryImage: form.primaryImage || undefined,
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
              <div className="sm:col-span-2 space-y-2">
                <Label className="font-semibold">Primary Image <span className="text-zinc-400 font-normal">— Main banner for the product</span></Label>
                <div className="flex items-center gap-3">
                  {form.primaryImage ? (
                    <div className="relative group w-24 h-28">
                      <img
                        src={form.primaryImage}
                        alt="Primary"
                        className="w-full h-full object-cover rounded-lg border border-zinc-200"
                      />
                      <button
                        type="button"
                        onClick={() => updateForm("primaryImage", "")}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 h-28 rounded-lg border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center cursor-pointer hover:border-zinc-500 transition-colors bg-zinc-50 gap-1">
                      {uploadingPrimary ? (
                        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-zinc-400" />
                          <span className="text-[10px] text-zinc-400 text-center leading-tight px-1">Upload<br />banner</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePrimaryImageUpload(file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}
                </div>
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Variants</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              <Plus className="h-4 w-4" /> Add Variant
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {variants.map((v, i) => (
            <div key={i} className="rounded-xl border border-zinc-200 p-5 space-y-4 bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Input
                    value={v.name}
                    onChange={(e) => updateVariant(i, "name", e.target.value)}
                    placeholder="Variant name (e.g. Black, Navy Blue)"
                    className="h-9 text-sm font-medium"
                  />
                </div>
                {variants.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 ml-2 text-red-500 hover:text-red-700" onClick={() => removeVariant(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Images</Label>
                <div className="flex flex-wrap gap-2">
                  {v.images.map((url, imgIdx) => (
                    <div key={imgIdx} className="relative group">
                      <img
                        src={url}
                        alt=""
                        className="w-16 h-20 object-cover rounded-lg border border-zinc-200"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-lg flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeVariantImage(i, imgIdx)}
                          className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-xs"
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  <label className="w-16 h-20 rounded-lg border-2 border-dashed border-zinc-300 flex items-center justify-center cursor-pointer hover:border-zinc-500 transition-colors bg-zinc-50">
                    {uploadingVariant === i ? (
                      <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                    ) : (
                      <Upload className="w-5 h-5 text-zinc-400" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleVariantImageUpload(i, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Sizes</Label>
                  <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => addVariantSize(i)}>
                    <Plus className="h-3 w-3 mr-1" /> Add Size
                  </Button>
                </div>
                <div className="space-y-2">
                  {v.sizes.map((s, si) => (
                    <div key={si} className="flex items-end gap-2">
                      <div className="space-y-1 w-20 shrink-0">
                        <Label className="text-[10px] text-zinc-500">Size</Label>
                        <Select value={s.size} onValueChange={(val) => updateVariantSize(i, si, "size", val)}>
                          <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Size" /></SelectTrigger>
                          <SelectContent>
                            {SIZES.map((sz) => (
                              <SelectItem key={sz} value={sz} className="text-xs">{sz}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1 w-24">
                        <Label className="text-[10px] text-zinc-500">Price</Label>
                        <Input
                          type="number"
                          value={s.price}
                          onChange={(e) => updateVariantSize(i, si, "price", e.target.value)}
                          placeholder="0"
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1 w-20">
                        <Label className="text-[10px] text-zinc-500">Stock</Label>
                        <Input
                          type="number"
                          value={s.stock}
                          onChange={(e) => updateVariantSize(i, si, "stock", e.target.value)}
                          placeholder="0"
                          className="h-9 text-xs"
                        />
                      </div>
                      {v.sizes.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-red-400 hover:text-red-600" onClick={() => removeVariantSize(i, si)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {variants.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-6">No variants yet. Click "Add Variant" to create one.</p>
          )}
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
