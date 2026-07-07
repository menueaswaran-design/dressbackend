"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, Tags, Layers, ShoppingCart, Users, Tag, Home, FileText,
  Menu, Newspaper, Settings, Image, BarChart3, Shield, Bell, ChevronDown, ChevronLeft,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  {
    label: "Products",
    icon: Package,
    children: [
      { label: "All Products", href: "/products" },
      { label: "Categories", href: "/categories" },
      { label: "Collections", href: "/collections" },
    ],
  },
  { label: "Orders", icon: ShoppingCart, href: "/orders" },
  { label: "Customers", icon: Users, href: "/customers" },
  { label: "Coupons", icon: Tag, href: "/coupons" },
  {
    label: "Content",
    icon: FileText,
    children: [
      { label: "Homepage", href: "/homepage" },
      { label: "CMS Pages", href: "/cms" },
      { label: "Navigation", href: "/navigation" },
    ],
  },
  { label: "Media", icon: Image, href: "/media" },
  { label: "Reports", icon: BarChart3, href: "/reports" },
  { label: "Admin Users", icon: Shield, href: "/users" },
  { label: "Notifications", icon: Bell, href: "/notifications" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-zinc-200 px-4 dark:border-zinc-800", collapsed ? "justify-center" : "gap-3")}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
          <Store className="h-4 w-4" />
        </div>
        {!collapsed && <span className="text-lg font-bold tracking-tight">Dress Admin</span>}
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto h-8 w-8", collapsed && "ml-0")}
          onClick={onToggle}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          if (item.children) {
            const isExpanded = expandedItems.includes(item.label);
            const hasActiveChild = item.children.some((c) => isActive(c.href));
            return (
              <Collapsible key={item.label} open={isExpanded || hasActiveChild} onOpenChange={() => toggleExpand(item.label)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size={collapsed ? "icon" : "default"}
                    className={cn(
                      "w-full justify-start gap-3 font-normal",
                      collapsed && "justify-center p-0",
                      hasActiveChild && "bg-zinc-100 font-medium dark:bg-zinc-800"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-180")} />
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
                {!collapsed && (
                  <CollapsibleContent className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link key={child.href} href={child.href}>
                        <Button
                          variant="ghost"
                          size="default"
                          className={cn(
                            "w-full justify-start gap-2 pl-4 font-normal",
                            isActive(child.href) && "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                          )}
                        >
                          <span className="h-1 w-1 rounded-full bg-current opacity-40" />
                          {child.label}
                        </Button>
                      </Link>
                    ))}
                  </CollapsibleContent>
                )}
              </Collapsible>
            );
          }
          return (
            <Link key={item.href} href={item.href || "/"}>
              <Button
                variant="ghost"
                size={collapsed ? "icon" : "default"}
                className={cn(
                  "w-full justify-start gap-3 font-normal",
                  collapsed && "justify-center p-0",
                  isActive(item.href || "/") && "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
