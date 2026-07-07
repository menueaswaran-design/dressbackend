"use client";

import { useState, useEffect } from "react";
import { Plus, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, formatDate } from "@/lib/utils";
import { AdminUser } from "@/lib/types";
import api from "@/lib/api";

const roleIcons: Record<string, typeof Shield> = {
  super_admin: ShieldAlert,
  admin: ShieldCheck,
  product_manager: Shield,
  order_manager: Shield,
  customer_support: Shield,
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/auth/admins");
        setUsers(res.data.data?.admins || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Users</h1>
          <p className="text-sm text-zinc-500">Manage admin accounts and roles</p>
        </div>
        <Button onClick={() => router.push("/users/new")}><Plus className="h-4 w-4" /> Add Admin</Button>
      </div>

      <div className="space-y-3">
        {users.map((user) => {
          const RoleIcon = roleIcons[user.role] || Shield;
          return (
            <Card key={user._id} className="hover:shadow-sm transition-shadow">
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar>
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-zinc-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <RoleIcon className="h-4 w-4 text-zinc-400" />
                  <Badge variant="secondary" className="capitalize">{user.role.replace(/_/g, " ")}</Badge>
                </div>
                <Badge variant={user.isActive ? "success" : "secondary"}>{user.isActive ? "Active" : "Inactive"}</Badge>
                <p className="text-xs text-zinc-500 w-24 text-right">{user.lastLogin ? formatDate(user.lastLogin) : "Never"}</p>
              </CardContent>
            </Card>
          );
        })}
        {!loading && users.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-zinc-500">No admin users found</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
