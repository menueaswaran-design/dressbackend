"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import api from "@/lib/api";

const ORDER_STATUSES = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned", "refunded"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const statusBadge = (status: string) => {
  const map: Record<string, "success" | "warning" | "destructive" | "info" | "secondary"> = {
    delivered: "success", paid: "success",
    pending: "warning", shipped: "info",
    cancelled: "destructive", refunded: "destructive",
    returned: "secondary",
  };
  return map[status] || "secondary";
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        const o = res.data.data.order;
        setOrder(o);
        setStatus(o.status);
        setPaymentStatus(o.paymentInfo?.status || "pending");
        setNotes(o.notes || "");
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleUpdateStatus = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/orders/${id}/status`, { status, notes });
      setOrder(res.data.data.order);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleUpdatePayment = async () => {
    setSaving(true);
    try {
      const res = await api.patch(`/orders/${id}/payment`, { status: paymentStatus });
      setOrder(res.data.data.order);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-12 w-64" /><Skeleton className="h-96" /></div>;
  if (!order) return <p>Order not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order {order.orderNumber}</h1>
          <p className="text-sm text-zinc-500">{formatDateTime(order.createdAt)}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge variant={statusBadge(order.status)} className="capitalize">{order.status}</Badge>
          <Badge variant={statusBadge(order.paymentInfo?.status)}>{order.paymentInfo?.status}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    {item.product?.images?.[0] && (
                      <img src={item.product.images[0].url} alt="" className="w-12 h-12 rounded object-cover" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{(typeof item.product === 'object' ? item.product.name : "Product")}</p>
                      <p className="text-xs text-zinc-500">
                        {item.variant?.color && `${item.variant.color} / `}{item.variant?.size && `${item.variant.size}`} x {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium">{formatCurrency(item.total)}</p>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
              <div className="flex justify-between"><span>Shipping</span><span>{order.shippingCharge > 0 ? formatCurrency(order.shippingCharge) : "Free"}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(order.tax || 0)}</span></div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-zinc-500">Name:</span> {order.customer?.name || "N/A"}</p>
              <p><span className="text-zinc-500">Email:</span> {order.customer?.email || "N/A"}</p>
              <p><span className="text-zinc-500">Phone:</span> {order.customer?.phone || "N/A"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{order.shippingAddress?.name || "N/A"}</p>
              <p>{order.shippingAddress?.phone}</p>
              <p>{order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zip}</p>
              <p>{order.shippingAddress?.country}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p><span className="text-zinc-500">Method:</span> {order.paymentInfo?.method || "N/A"}</p>
              <p><span className="text-zinc-500">Transaction:</span> {order.paymentInfo?.transactionId || "N/A"}</p>
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={handleUpdatePayment} disabled={saving}>
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Update Payment
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Update Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Order Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Internal Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              </div>
              <Button onClick={handleUpdateStatus} disabled={saving} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update Status
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
