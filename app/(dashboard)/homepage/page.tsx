"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2, ImageIcon } from "lucide-react";
import api from "@/lib/api";

interface Collection {
  _id: string;
  name: string;
  slug: string;
}

const defaultBanners = [
  { heading: "", subHeading: "", buttonText: "Shop Now", buttonLink: "/products", desktopImage: "", mobileImage: "", isActive: true },
  { heading: "", subHeading: "", buttonText: "Shop Now", buttonLink: "/products", desktopImage: "", mobileImage: "", isActive: true },
  { heading: "", subHeading: "", buttonText: "Shop Now", buttonLink: "/products", desktopImage: "", mobileImage: "", isActive: true },
];

export default function HomepagePage() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [announcement, setAnnouncement] = useState({ enabled: true, message: "Free shipping on orders over ₹999", bgColor: "#000000", textColor: "#ffffff" });
  const [banners, setBanners] = useState(defaultBanners);
  const [newsletter, setNewsletter] = useState({ enabled: true, heading: "Subscribe to our newsletter", description: "Get the latest updates and offers", successMessage: "Thank you for subscribing!" });
  const [promoBanner, setPromoBanner] = useState({
    isActive: false,
    heading: "Up to 50% Off",
    subHeading: "Limited time offer on select styles. Elevate your wardrobe with premium fashion at unbeatable prices.",
    buttonText: "Shop Now",
    buttonLink: "/shop",
    desktopImage: "",
    mobileImage: "",
    backgroundColor: "#111827",
    textColor: "#ffffff",
    collection: "",
  });
  const [brandStory, setBrandStory] = useState({
    isActive: false,
    heading: "Designed for the Modern Individual",
    subHeading: "Our Story",
    description: "At DRESS, we believe fashion is more than clothing — it's a statement of confidence. Every piece is crafted with premium materials and meticulous attention to detail, ensuring you look and feel your best.",
    buttonText: "Explore Collection",
    buttonLink: "/shop",
    secondaryButtonText: "Learn More",
    secondaryButtonLink: "/about",
    image: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectionsRes, collectionsRes] = await Promise.all([
          api.get("/homepage/sections"),
          api.get("/collections"),
        ]);
        const sections = sectionsRes.data?.sections || [];
        const promo = sections.find((s: any) => s.sectionType === "promotional_banner");
        if (promo?.promotionalBanner) {
          setPromoBanner((prev) => ({ ...prev, ...promo.promotionalBanner, collection: promo.promotionalBanner.collection?._id || promo.promotionalBanner.collection || "" }));
        }
        const story = sections.find((s: any) => s.sectionType === "brand_story");
        if (story?.brandStory) {
          setBrandStory((prev) => ({ ...prev, ...story.brandStory }));
        }
        setCollections(collectionsRes.data?.collections || collectionsRes.data?.data || []);
      } catch (err) {
        console.error("Failed to load homepage data", err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const promoPayload = { ...promoBanner, collection: promoBanner.collection || undefined };
      await api.post("/homepage", { announcement, banners, newsletter, promotionalBanner: promoPayload, brandStory });
    } catch (err) {
      console.error("Failed to save homepage", err);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

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
          <TabsTrigger value="promotional">Promotional Banner</TabsTrigger>
          <TabsTrigger value="announcement">Announcement Bar</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="brandstory">Brand Story</TabsTrigger>
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

        <TabsContent value="promotional" className="pt-4">
          <Card>
            <CardHeader><CardTitle>Promotional Banner</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch checked={promoBanner.isActive} onCheckedChange={(v) => setPromoBanner((prev) => ({ ...prev, isActive: v }))} />
                <Label>Enable Promotional Banner</Label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Desktop Image <span className="text-xs text-zinc-400">(optional - overrides background color)</span></Label>
                  <div className="flex gap-2">
                    <Input value={promoBanner.desktopImage} onChange={(e) => setPromoBanner((prev) => ({ ...prev, desktopImage: e.target.value }))} placeholder="https://example.com/banner.jpg" />
                    <div className="flex items-center justify-center w-10 h-10 rounded border bg-zinc-100 shrink-0">
                      <ImageIcon size={16} className="text-zinc-400" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Mobile Image <span className="text-xs text-zinc-400">(optional)</span></Label>
                  <Input value={promoBanner.mobileImage} onChange={(e) => setPromoBanner((prev) => ({ ...prev, mobileImage: e.target.value }))} placeholder="https://example.com/banner-mobile.jpg" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input value={promoBanner.heading} onChange={(e) => setPromoBanner((prev) => ({ ...prev, heading: e.target.value }))} placeholder="Up to 50% Off" />
                </div>
                <div className="space-y-2">
                  <Label>Sub Heading</Label>
                  <Input value={promoBanner.subHeading} onChange={(e) => setPromoBanner((prev) => ({ ...prev, subHeading: e.target.value }))} placeholder="Limited time offer on select styles" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input value={promoBanner.buttonText} onChange={(e) => setPromoBanner((prev) => ({ ...prev, buttonText: e.target.value }))} placeholder="Shop Now" />
                </div>
                <div className="space-y-2">
                  <Label>Button Link</Label>
                  <Input value={promoBanner.buttonLink} onChange={(e) => setPromoBanner((prev) => ({ ...prev, buttonLink: e.target.value }))} placeholder="/shop" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <Input value={promoBanner.backgroundColor} onChange={(e) => setPromoBanner((prev) => ({ ...prev, backgroundColor: e.target.value }))} placeholder="#111827" />
                    <div className="w-10 h-10 rounded border shrink-0" style={{ backgroundColor: promoBanner.backgroundColor }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <Input value={promoBanner.textColor} onChange={(e) => setPromoBanner((prev) => ({ ...prev, textColor: e.target.value }))} placeholder="#ffffff" />
                    <div className="w-10 h-10 rounded border shrink-0" style={{ backgroundColor: promoBanner.textColor }} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Link to Collection <span className="text-xs text-zinc-400">(optional - overrides button link)</span></Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={promoBanner.collection}
                  onChange={(e) => {
                    const colId = e.target.value;
                    const col = collections.find((c) => c._id === colId);
                    setPromoBanner((prev) => ({
                      ...prev,
                      collection: colId,
                      buttonLink: col ? `/collections/${col.slug}` : prev.buttonLink,
                    }));
                  }}
                >
                  <option value="">None (use custom button link)</option>
                  {collections.map((col) => (
                    <option key={col._id} value={col._id}>{col.name}</option>
                  ))}
                </select>
              </div>
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

        <TabsContent value="brandstory" className="pt-4">
          <Card>
            <CardHeader><CardTitle>Brand Story</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch checked={brandStory.isActive} onCheckedChange={(v) => setBrandStory((prev) => ({ ...prev, isActive: v }))} />
                <Label>Enable Brand Story Section</Label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Sub Heading <span className="text-xs text-zinc-400">(small label above title)</span></Label>
                  <Input value={brandStory.subHeading} onChange={(e) => setBrandStory((prev) => ({ ...prev, subHeading: e.target.value }))} placeholder="Our Story" />
                </div>
                <div className="space-y-2">
                  <Label>Image URL <span className="text-xs text-zinc-400">(optional)</span></Label>
                  <Input value={brandStory.image} onChange={(e) => setBrandStory((prev) => ({ ...prev, image: e.target.value }))} placeholder="https://example.com/image.jpg" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input value={brandStory.heading} onChange={(e) => setBrandStory((prev) => ({ ...prev, heading: e.target.value }))} placeholder="Designed for the Modern Individual" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={brandStory.description}
                  onChange={(e) => setBrandStory((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell your brand story..."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input value={brandStory.buttonText} onChange={(e) => setBrandStory((prev) => ({ ...prev, buttonText: e.target.value }))} placeholder="Explore Collection" />
                </div>
                <div className="space-y-2">
                  <Label>Button Link</Label>
                  <Input value={brandStory.buttonLink} onChange={(e) => setBrandStory((prev) => ({ ...prev, buttonLink: e.target.value }))} placeholder="/shop" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Secondary Button Text</Label>
                  <Input value={brandStory.secondaryButtonText} onChange={(e) => setBrandStory((prev) => ({ ...prev, secondaryButtonText: e.target.value }))} placeholder="Learn More" />
                </div>
                <div className="space-y-2">
                  <Label>Secondary Button Link</Label>
                  <Input value={brandStory.secondaryButtonLink} onChange={(e) => setBrandStory((prev) => ({ ...prev, secondaryButtonLink: e.target.value }))} placeholder="/about" />
                </div>
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
