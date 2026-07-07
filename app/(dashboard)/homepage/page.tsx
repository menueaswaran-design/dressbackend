"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2 } from "lucide-react";
import api from "@/lib/api";

const defaultBanners = [
  { heading: "", subHeading: "", buttonText: "Shop Now", buttonLink: "/products", desktopImage: "", mobileImage: "", isActive: true },
  { heading: "", subHeading: "", buttonText: "Shop Now", buttonLink: "/products", desktopImage: "", mobileImage: "", isActive: true },
  { heading: "", subHeading: "", buttonText: "Shop Now", buttonLink: "/products", desktopImage: "", mobileImage: "", isActive: true },
];

export default function HomepagePage() {
  const [saving, setSaving] = useState(false);
  const [announcement, setAnnouncement] = useState({ enabled: true, message: "Free shipping on orders over ₹999", bgColor: "#000000", textColor: "#ffffff" });
  const [banners, setBanners] = useState(defaultBanners);
  const [newsletter, setNewsletter] = useState({ enabled: true, heading: "Subscribe to our newsletter", description: "Get the latest updates and offers", successMessage: "Thank you for subscribing!" });

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/homepage", { announcement, banners, newsletter });
    } catch (err) {
      console.error("Failed to save homepage", err);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Homepage</h1>
          <p className="text-sm text-zinc-500">Manage homepage sections</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="hero">
        <TabsList>
          <TabsTrigger value="hero">Hero Banner</TabsTrigger>
          <TabsTrigger value="announcement">Announcement Bar</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="pt-4">
          <Card>
            <CardHeader><CardTitle>Hero Banners</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Banner {i}</h3>
                    <Switch checked={banners[i - 1]?.isActive} onCheckedChange={(v) => setBanners((prev) => prev.map((b, j) => j === i - 1 ? { ...b, isActive: v } : b))} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2"><Label>Desktop Image</Label><Input value={banners[i - 1]?.desktopImage} onChange={(e) => setBanners((prev) => prev.map((b, j) => j === i - 1 ? { ...b, desktopImage: e.target.value } : b))} placeholder="Image URL" /></div>
                    <div className="space-y-2"><Label>Mobile Image</Label><Input value={banners[i - 1]?.mobileImage} onChange={(e) => setBanners((prev) => prev.map((b, j) => j === i - 1 ? { ...b, mobileImage: e.target.value } : b))} placeholder="Image URL" /></div>
                    <div className="space-y-2"><Label>Heading</Label><Input value={banners[i - 1]?.heading} onChange={(e) => setBanners((prev) => prev.map((b, j) => j === i - 1 ? { ...b, heading: e.target.value } : b))} placeholder="Main heading" /></div>
                    <div className="space-y-2"><Label>Sub Heading</Label><Input value={banners[i - 1]?.subHeading} onChange={(e) => setBanners((prev) => prev.map((b, j) => j === i - 1 ? { ...b, subHeading: e.target.value } : b))} placeholder="Sub heading" /></div>
                    <div className="space-y-2"><Label>Button Text</Label><Input value={banners[i - 1]?.buttonText} onChange={(e) => setBanners((prev) => prev.map((b, j) => j === i - 1 ? { ...b, buttonText: e.target.value } : b))} placeholder="Shop Now" /></div>
                    <div className="space-y-2"><Label>Button Link</Label><Input value={banners[i - 1]?.buttonLink} onChange={(e) => setBanners((prev) => prev.map((b, j) => j === i - 1 ? { ...b, buttonLink: e.target.value } : b))} placeholder="/products" /></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcement" className="pt-4">
          <Card>
            <CardHeader><CardTitle>Announcement Bar</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2"><Switch checked={announcement.enabled} onCheckedChange={(v) => setAnnouncement((prev) => ({ ...prev, enabled: v }))} /> <Label>Enable Announcement Bar</Label></div>
              <div className="space-y-2"><Label>Message</Label><Input value={announcement.message} onChange={(e) => setAnnouncement((prev) => ({ ...prev, message: e.target.value }))} placeholder="Free shipping on orders over ₹999" /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Background Color</Label><Input value={announcement.bgColor} onChange={(e) => setAnnouncement((prev) => ({ ...prev, bgColor: e.target.value }))} placeholder="#000000" /></div>
                <div className="space-y-2"><Label>Text Color</Label><Input value={announcement.textColor} onChange={(e) => setAnnouncement((prev) => ({ ...prev, textColor: e.target.value }))} placeholder="#ffffff" /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="newsletter" className="pt-4">
          <Card>
            <CardHeader><CardTitle>Newsletter Section</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2"><Switch checked={newsletter.enabled} onCheckedChange={(v) => setNewsletter((prev) => ({ ...prev, enabled: v }))} /> <Label>Enable Newsletter</Label></div>
              <div className="space-y-2"><Label>Heading</Label><Input value={newsletter.heading} onChange={(e) => setNewsletter((prev) => ({ ...prev, heading: e.target.value }))} placeholder="Subscribe to our newsletter" /></div>
              <div className="space-y-2"><Label>Description</Label><Input value={newsletter.description} onChange={(e) => setNewsletter((prev) => ({ ...prev, description: e.target.value }))} placeholder="Get the latest updates and offers" /></div>
              <div className="space-y-2"><Label>Success Message</Label><Input value={newsletter.successMessage} onChange={(e) => setNewsletter((prev) => ({ ...prev, successMessage: e.target.value }))} placeholder="Thank you for subscribing!" /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="pt-4">
          <Card>
            <CardHeader><CardTitle>Categories Section</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-500">Manage which categories appear on the homepage. Go to Categories section to add/edit categories.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections" className="pt-4">
          <Card>
            <CardHeader><CardTitle>Featured Collections</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-500">Manage featured collections displayed on homepage. Go to Collections section to manage.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
