"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/settings", {});
    } catch (err) { console.error("Failed to save settings", err); }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-zinc-500">Manage website settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="pt-4">
          <Card>
            <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Website Name</Label><Input placeholder="Your Store" /></div>
              <div className="space-y-2"><Label>Contact Email</Label><Input type="email" placeholder="hello@example.com" /></div>
              <div className="space-y-2"><Label>Phone Number</Label><Input placeholder="+91 9876543210" /></div>
              <div className="space-y-2"><Label>Address</Label><Input placeholder="Store address" /></div>
              <div className="space-y-2"><Label>WhatsApp Number</Label><Input placeholder="+91 9876543210" /></div>
              <div className="space-y-2"><Label>Currency</Label>
                <select className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <option>INR (₹)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="pt-4">
          <Card>
            <CardHeader><CardTitle>SEO Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Meta Title</Label><Input placeholder="Your Store - Best Fashion" /></div>
              <div className="space-y-2"><Label>Meta Description</Label><Input placeholder="Description for search engines" /></div>
              <div className="space-y-2"><Label>Google Analytics ID</Label><Input placeholder="G-XXXXXXXXXX" /></div>
              <div className="space-y-2"><Label>Facebook Pixel ID</Label><Input placeholder="1234567890" /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="pt-4">
          <Card>
            <CardHeader><CardTitle>Social Media Links</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Instagram</Label><Input placeholder="https://instagram.com/..." /></div>
              <div className="space-y-2"><Label>Facebook</Label><Input placeholder="https://facebook.com/..." /></div>
              <div className="space-y-2"><Label>YouTube</Label><Input placeholder="https://youtube.com/..." /></div>
              <div className="space-y-2"><Label>Twitter / X</Label><Input placeholder="https://twitter.com/..." /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="pt-4">
          <Card>
            <CardHeader><CardTitle>Footer Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>About Text</Label><Input placeholder="About your store..." /></div>
              <div className="space-y-2"><Label>Copyright Text</Label><Input placeholder="© 2026 Your Store" /></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
