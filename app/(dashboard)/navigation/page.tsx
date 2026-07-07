"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Plus, GripVertical, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function NavigationPage() {
  const [saving, setSaving] = useState(false);
  const [headerItems, setHeaderItems] = useState(["Home", "Shop", "Collections", "About", "Contact"]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/navigation", { header: headerItems });
    } catch (err) { console.error("Failed to save navigation", err); }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Navigation</h1>
          <p className="text-sm text-zinc-500">Manage header, footer and mega menus</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="header">
        <TabsList>
          <TabsTrigger value="header">Header Menu</TabsTrigger>
          <TabsTrigger value="footer">Footer Menu</TabsTrigger>
          <TabsTrigger value="mega">Mega Menu</TabsTrigger>
        </TabsList>

        <TabsContent value="header" className="pt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Header Navigation Items</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setHeaderItems([...headerItems, "New Item"])}><Plus className="h-3 w-3 mr-1" /> Add Item</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {headerItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                  <GripVertical className="h-4 w-4 text-zinc-400 cursor-move" />
                  <div className="flex-1 grid gap-3 sm:grid-cols-3">
                    <Input defaultValue={item} className="h-9" />
                    <Input defaultValue={`/${item.toLowerCase()}`} className="h-9" />
                    <select className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                      <option>Internal</option>
                      <option>External</option>
                    </select>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">×</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="pt-4">
          <Card>
            <CardHeader><CardTitle>Footer Content</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>About Text</Label><Input placeholder="About your store..." /></div>
              <div className="space-y-2"><Label>Copyright Text</Label><Input placeholder="© 2026 Your Store. All rights reserved." /></div>
              <div className="space-y-2"><Label>Payment Icons (comma separated)</Label><Input placeholder="Visa, Mastercard, UPI" /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mega" className="pt-4">
          <Card>
            <CardHeader><CardTitle>Mega Menu</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-500">Configure mega menu items with nested categories and collections.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
