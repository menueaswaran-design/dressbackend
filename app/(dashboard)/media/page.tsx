"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Grid3X3, List, Search, Trash2 } from "lucide-react";

export default function MediaPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => {
        const files = e.target.files;
        if (files) console.log("Selected", files.length, "files");
      }} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
          <p className="text-sm text-zinc-500">Upload and manage images, videos, and documents</p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" /> Upload Files</Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input placeholder="Search media..." className="pl-9" />
        </div>
        <Button variant="ghost" size="icon"><Grid3X3 className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon"><List className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
      </div>

      <div className="grid grid-cols-4 gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="group relative aspect-square cursor-pointer rounded-lg border bg-zinc-50 overflow-hidden hover:ring-2 hover:ring-zinc-400 dark:bg-zinc-800 dark:hover:ring-zinc-600">
            <div className="flex h-full items-center justify-center text-zinc-300 dark:text-zinc-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-[10px] text-white truncate">image-{i + 1}.jpg</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
