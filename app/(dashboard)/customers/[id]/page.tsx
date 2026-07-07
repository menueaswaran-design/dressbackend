"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Customer } from "@/lib/types";
import api from "@/lib/api";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/customers/${id}`);
        setCustomer(res.data.data.customer);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-12 w-64" /><Skeleton className="h-96" /></div>;
  if (!customer) return <p>Customer not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{customer.name || "Customer"}</h1>
          <p className="text-sm text-zinc-500">Customer details and history</p>
        </div>
        <Badge variant={customer.isActive ? "success" : "secondary"} className="ml-auto">{customer.isActive ? "Active" : "Inactive"}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-zinc-400" />{customer.email}</div>
            <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-zinc-400" />{customer.phone || "N/A"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Orders</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{customer.totalOrders}</p>
            <p className="text-sm text-zinc-500">Total orders placed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Spent</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(customer.totalSpent)}</p>
            <p className="text-sm text-zinc-500">Lifetime value</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
