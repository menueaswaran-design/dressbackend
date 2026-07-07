"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";

export default function EditCouponPage() {
  const { id } = useParams();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("percentage");
  const [value, setValue] = useState("");
  const [minPurchase, setMinPurchase] = useState("0");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    api.get(`/coupons/${id}`).then((res) => {
      const c = res.data.data?.coupon || res.data.data;
      setCode(c.code);
      setType(c.type);
      setValue(String(c.value));
      setMinPurchase(String(c.minPurchase || 0));
      setMaxDiscount(c.maxDiscount ? String(c.maxDiscount) : "");
      setUsageLimit(c.usageLimit ? String(c.usageLimit) : "");
      setExpiresAt(c.expiresAt ? c.expiresAt.slice(0, 10) : "");
      setIsActive(c.isActive);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put(`/coupons/${id}`, { code, type, value: Number(value), minPurchase: Number(minPurchase), maxDiscount: maxDiscount ? Number(maxDiscount) : undefined, usageLimit: usageLimit ? Number(usageLimit) : undefined, expiresAt: new Date(expiresAt).toISOString(), isActive });
      router.push("/coupons");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to update coupon");
    }
    setSaving(false);
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-12 w-64" /><Skeleton className="h-96" /></div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Edit Coupon</h1>
          <p className="text-sm text-zinc-500">{code}</p>
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
        <CardHeader><CardTitle>Coupon Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Code <span className="text-red-500">*</span></Label>
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="flat">Flat Discount</SelectItem>
                  <SelectItem value="free_shipping">Free Shipping</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Value {type === "percentage" ? "(%)" : "(₹)"} <span className="text-red-500">*</span></Label>
              <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Min Purchase (₹)</Label>
              <Input type="number" value={minPurchase} onChange={(e) => setMinPurchase(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Max Discount (₹)</Label>
              <Input type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Usage Limit</Label>
              <Input type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date <span className="text-red-500">*</span></Label>
              <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} required />
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
