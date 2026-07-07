"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Upload, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/utils";
import { SIZES, COLORS } from "@/lib/constants";
import { Product } from "@/lib/types";
import api from "@/lib/api";

interface ImageField {
  url: string;
  type: string;
  isPrimary: boolean;
}

interface VariantField {
  sku: string;
  color: string;
  size: string;
  price: string;
  stock: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    slug: "",
    mrp: "",
    sellingPrice: "",
    costPrice: "",
    stock: "",
    lowStockLimit: "",
    brand: "",
    isActive: true,
    seoTitle: "",
    seoDescription: "",
    shippingWeight: "",
    shippingLength: "",
    shippingWidth: "",
    shippingHeight: "",
  });

  const [images, setImages] = useState<ImageField[]>([]);
  const [variants, setVariants] = useState<VariantField[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const p = res.data.data.product;
        setProduct(p);
        setForm({
          name: p.name || "",
          sku: p.sku || "",
          slug: p.slug || "",
          mrp: String(p.mrp || ""),
          sellingPrice: String(p.sellingPrice || ""),
          costPrice: String(p.costPrice || ""),
          stock: String(p.stock ?? ""),
          lowStockLimit: String(p.lowStockLimit ?? ""),
          brand: p.brand || "",
          isActive: p.isActive ?? true,
          seoTitle: p.seo?.title || "",
          seoDescription: p.seo?.description || "",
          shippingWeight: String(p.shipping?.weight || ""),
          shippingLength: String(p.shipping?.length || ""),
          shippingWidth: String(p.shipping?.width || ""),
          shippingHeight: String(p.shipping?.height || ""),
        });
        setImages(p.images?.map((img: any) => ({ url: img.url, type: img.type || "front", isPrimary: img.isPrimary || false })) || []);
        setVariants(p.variants?.map((v: any) => ({ sku: v.sku || "", color: v.color || "", size: v.size || "", price: String(v.price || ""), stock: String(v.stock || "") })) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, any> = {
        name: form.name,
        mrp: Number(form.mrp),
        sellingPrice: Number(form.sellingPrice),
        stock: Number(form.stock),
        lowStockLimit: Number(form.lowStockLimit),
        brand: form.brand,
        isActive: form.isActive,
        images: images.filter((img) => img.url),
        seo: {
          title: form.seoTitle || undefined,
          description: form.seoDescription || undefined,
        },
        shipping: {
          weight: form.shippingWeight ? Number(form.shippingWeight) : undefined,
          length: form.shippingLength ? Number(form.shippingLength) : undefined,
          width: form.shippingWidth ? Number(form.shippingWidth) : undefined,
          height: form.shippingHeight ? Number(form.shippingHeight) : undefined,
        },
      };
      if (form.sku) payload.sku = form.sku;
      if (form.slug) payload.slug = form.slug;
      if (form.costPrice) payload.costPrice = Number(form.costPrice);
      payload.variants = variants.filter((v) => v.sku || v.color || v.size).map((v) => ({
        sku: v.sku,
        color: v.color || undefined,
        size: v.size || undefined,
        price: Number(v.price) || 0,
        stock: Number(v.stock) || 0,
      }));

      await api.put(`/products/${id}`, payload);
      router.push("/products");
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors?.length > 0) {
        setError(data.errors.map((e: any) => `${e.field}: ${e.message}`).join("\n"));
      } else {
        setError(data?.message || err.message || "Failed to save");
      }
    }
    setSaving(false);
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-12 w-64" /><Skeleton className="h-96" /></div>;
  if (!product) return <p>Product not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-sm text-zinc-500">SKU: {product.sku} | Slug: {product.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={form.isActive}
            onCheckedChange={(v) => updateForm("isActive", v)}
            id="isActive"
          />
          <Label htmlFor="isActive" className="text-sm">{form.isActive ? "Active" : "Inactive"}</Label>
          <Button onClick={handleSave} disabled={saving}>
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
                <Label>Product Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input
                  value={form.sku}
                  onChange={(e) => updateForm("sku", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => updateForm("slug", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>MRP</Label>
                <Input
                  type="number"
                  value={form.mrp}
                  onChange={(e) => updateForm("mrp", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Selling Price</Label>
                <Input
                  type="number"
                  value={form.sellingPrice}
                  onChange={(e) => updateForm("sellingPrice", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Cost Price</Label>
                <Input
                  type="number"
                  value={form.costPrice}
                  onChange={(e) => updateForm("costPrice", e.target.value)}
                />
              </div>
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
              <div className="space-y-2">
                <Label>Brand</Label>
                <Input
                  value={form.brand}
                  onChange={(e) => updateForm("brand", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Images</CardTitle></CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="grid grid-cols-2 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-[4/3] rounded-lg border overflow-hidden bg-zinc-50 dark:bg-zinc-800 group">
                  {img.url ? (
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-zinc-400">No image</div>
                  )}
                  {img.isPrimary && <Badge className="absolute left-1 top-1 text-[10px]">Primary</Badge>}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7"
                      disabled={uploadingIndex === i}
                      onClick={() => triggerFileUpload(i)}
                    >
                      {uploadingIndex === i ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeImage(i)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {images.length === 0 && (
                <p className="col-span-2 text-sm text-zinc-500 py-8 text-center">No images</p>
              )}
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-3 w-full" onClick={addImage}>
              <Upload className="h-4 w-4" /> Add Image
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="variants">
            <TabsList>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>
            <TabsContent value="variants" className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">Manage product variants by color and size</p>
                <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                  <Plus className="h-4 w-4" /> Add Variant
                </Button>
              </div>
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
              {variants.length === 0 && (
                <p className="text-sm text-zinc-500 py-4 text-center">No variants. Click "Add Variant" to create one.</p>
              )}
            </TabsContent>
            <TabsContent value="seo" className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input value={form.seoTitle} onChange={(e) => updateForm("seoTitle", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Input value={form.seoDescription} onChange={(e) => updateForm("seoDescription", e.target.value)} />
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="pt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input type="number" value={form.shippingWeight} onChange={(e) => updateForm("shippingWeight", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Length (cm)</Label>
                  <Input type="number" value={form.shippingLength} onChange={(e) => updateForm("shippingLength", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Width (cm)</Label>
                  <Input type="number" value={form.shippingWidth} onChange={(e) => updateForm("shippingWidth", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input type="number" value={form.shippingHeight} onChange={(e) => updateForm("shippingHeight", e.target.value)} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
