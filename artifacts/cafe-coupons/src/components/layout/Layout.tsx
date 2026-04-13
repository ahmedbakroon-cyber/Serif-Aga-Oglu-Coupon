import { Link, useLocation } from "wouter";
import { Coffee, PlusCircle, Tag, Grid, Scan, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Coffee },
    { href: "/create", label: "Create Batch", icon: PlusCircle },
    { href: "/batches", label: "Batches", icon: Grid },
    { href: "/coupons", label: "All Coupons", icon: Tag },
    { href: "/staff", label: "Staff Scanner", icon: Scan },
  ];

  return (
    <div className="min-h-screen flex bg-background w-full">
      {/* Sidebar */}
      <div className="w-64 border-r bg-sidebar flex-shrink-0 flex flex-col print-hidden">
        <div className="h-16 flex items-center px-6 border-b border-border bg-sidebar-primary text-sidebar-primary-foreground">
          <Coffee className="w-6 h-6 mr-3" />
          <span className="font-serif font-bold text-lg tracking-tight">CafeCoupons</span>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start font-medium",
                    isActive ? "bg-secondary text-secondary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
