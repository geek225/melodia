"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  LayoutDashboard, 
  Users, 
  Music2, 
  CreditCard, 
  Package, 
  BarChart3, 
  Megaphone, 
  Star, 
  HardDrive, 
  TerminalSquare, 
  LifeBuoy, 
  ShieldCheck,
  Activity,
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

const ADMIN_LINKS = [
  { name: "Vue Globale", href: "/admin", icon: LayoutDashboard },
  { name: "Utilisateurs", href: "/admin/users", icon: Users },
  { name: "Musiques", href: "/admin/music", icon: Music2 },
  { name: "Paiements", href: "/admin/payments", icon: CreditCard },
  { name: "Plans & Mélodies", href: "/admin/plans", icon: Package },
  { name: "Statistiques", href: "/admin/stats", icon: BarChart3 },
  { name: "Marketing", href: "/admin/marketing", icon: Megaphone },
  { name: "Avis Clients", href: "/admin/reviews", icon: Star },
  { name: "Stockage", href: "/admin/storage", icon: HardDrive },
  { name: "Journaux (Logs)", href: "/admin/logs", icon: TerminalSquare },
  { name: "Support", href: "/admin/support", icon: LifeBuoy },
  { name: "Rôles", href: "/admin/roles", icon: ShieldCheck },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState<{full_name: string | null, email: string | null, role: string} | null>(null);

  useEffect(() => {
    setMounted(true);
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profile) {
          setUserProfile({
            full_name: profile.full_name,
            email: profile.email || user.email || '',
            role: profile.role
          });
        }
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!mounted) {
    return <div className="min-h-screen bg-background flex"></div>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-card border-r border-border/50 flex-col hidden lg:flex sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-border/50">
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-black tracking-tight">
            <Image src="/images/logo.png" alt="Melodia Admin Logo" width={160} height={52} className="h-14 w-auto object-contain" />
            <span className="text-primary text-sm uppercase mt-1">Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {ADMIN_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.name} href={link.href}>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                  isActive 
                    ? "bg-primary text-white font-medium shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                }`}>
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <AlertDialog>
            <AlertDialogTrigger render={
              <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                <LogOut className="w-5 h-5 mr-3" />
                Quitter l&apos;Admin
              </Button>
            } />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Déconnexion de l&apos;Admin</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir quitter l&apos;espace administrateur et vous déconnecter ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white">
                  Se déconnecter
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Topbar for Admin */}
        <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger render={
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              } />
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Menu d&apos;administration</SheetTitle>
                <div className="p-6 border-b border-border/50">
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-xl font-black tracking-tight">
                    <Image src="/images/logo.png" alt="Melodia Admin Logo" width={140} height={48} className="h-12 w-auto object-contain" />
                    <span className="text-primary text-sm uppercase mt-1">Admin</span>
                  </Link>
                </div>
                <nav className="flex-1 p-4 space-y-1 h-[calc(100vh-140px)] overflow-y-auto">
                  {ADMIN_LINKS.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                          isActive 
                            ? "bg-primary text-white font-medium shadow-sm" 
                            : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                        }`}>
                          <link.icon className="w-5 h-5" />
                          {link.name}
                        </div>
                      </Link>
                    );
                  })}
                </nav>
                <div className="p-4 border-t border-border/50 absolute bottom-0 w-full bg-card">
                  <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                    <LogOut className="w-5 h-5 mr-3" />
                    Quitter l&apos;Admin
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="font-bold text-lg md:text-xl text-primary flex items-center gap-2">
              <Activity className="w-5 h-5 animate-pulse hidden sm:block" />
              <span className="hidden sm:inline">Système Opérationnel</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="font-bold text-sm leading-none">
                {userProfile?.role === 'super_admin' ? 'Super Admin' : 'Administrateur'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{userProfile?.email || 'admin@melodia.ai'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20">
              {userProfile?.full_name ? userProfile.full_name.substring(0, 2).toUpperCase() : 'AD'}
            </div>
          </div>
        </header>
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
