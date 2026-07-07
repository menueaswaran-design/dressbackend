"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import api from "@/lib/api";

interface CMSPage {
  _id: string;
  title: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

export default function CMSPage() {
  const router = useRouter();
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/cms");
        setPages(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    try {
      await api.delete(`/cms/${id}`);
      setPages((prev) => prev.filter((p) => p._id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CMS Pages</h1>
          <p className="text-sm text-zinc-500">Manage content pages</p>
        </div>
        <Button onClick={() => router.push("/cms/new")}><Plus className="h-4 w-4" /> Add Page</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Card key={page._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{page.title}</h3>
                  <code className="text-xs text-zinc-500">/{page.slug}</code>
                </div>
                <Badge variant={page.isActive ? "success" : "secondary"}>{page.isActive ? "Live" : "Draft"}</Badge>
              </div>
              <p className="mt-2 text-xs text-zinc-500">Updated {formatDate(page.createdAt)}</p>
              <div className="mt-3 flex gap-1">
                <Button variant="ghost" size="sm" className="h-8" onClick={() => window.open(`/${page.slug}`, "_blank")}><Eye className="h-3 w-3 mr-1" /> Preview</Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/cms/${page._id}`)}><Pencil className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(page._id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && pages.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center text-zinc-500">No CMS pages yet. Create your first page.</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
