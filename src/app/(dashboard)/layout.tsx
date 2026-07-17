"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  PlusCircle, 
  Music2, 
  Compass, 
  CreditCard, 
  BarChart3, 
  Settings,
  Bell,
  Coins,
  LogOut,
  User,
  Menu,
  X,
  MessageSquare
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import SidebarPlayer from "@/components/SidebarPlayer";
import ExpiryWarningBanner from "@/components/ExpiryWarningBanner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/create", label: "Créer", icon: PlusCircle },
  { href: "/music", label: "Ma musique", icon: Music2 },
  { href: "/explore", label: "Explorer", icon: Compass },
  { href: "/credits", label: "Mélodies", icon: CreditCard },
  { href: "/stats", label: "Statistiques", icon: BarChart3 },
  { href: "/support", label: "Support", icon: MessageSquare },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [credits, setCredits] = useState<number | null>(null);
  const [userInitial, setUserInitial] = useState("U");
  const [userName, setUserName] = useState("Utilisateur");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userRole, setUserRole] = useState("user");
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<{id: string, title: string, message: string, read: boolean, time: number, isServer?: boolean}[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load local notifications from local storage
    const saved = localStorage.getItem('meliodia_notifications');
    let localNotifs = [];
    if (saved) {
      try {
        localNotifs = JSON.parse(saved);
        setNotifications(localNotifs);
      } catch (e) {
        console.error("Error parsing notifications", e);
      }
    }
  }, []);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const addNotification = (title: string, message: string) => {
    const newNotif = {
      id: Math.random().toString(36).substring(7),
      title,
      message,
      read: false,
      time: Date.now()
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 20); // Keep last 20
      localStorage.setItem('meliodia_notifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(prev => prev + 1);
  };

  const markAllAsRead = async () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('meliodia_notifications', JSON.stringify(updated.filter(n => !n.isServer)));
      return updated;
    });
    
    // Update server notifications
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Mark personal notifications as read
      await supabase.from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      // Update last_read_notifications for global notifications
      await supabase.from('profiles')
        .update({ last_read_notifications: new Date().toISOString() })
        .eq('id', user.id);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
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
          setCredits(profile.credits || 0);
          setUserRole(profile.role || "user");
          if (profile.full_name) {
            setUserName(profile.full_name);
            setUserInitial(profile.full_name.charAt(0).toUpperCase());
          }
          if (profile.avatar_url) {
            setUserAvatar(profile.avatar_url);
          }

          // Fetch server notifications
          const { data: dbNotifications } = await supabase
            .from('notifications')
            .select('*')
            .or(`user_id.eq.${user.id},user_id.is.null`)
            .gte('created_at', profile.created_at || '2020-01-01')
            .order('created_at', { ascending: false })
            .limit(20);

          if (dbNotifications) {
            const formatted = dbNotifications.map(n => ({
              id: n.id,
              title: n.title,
              message: n.message,
              read: n.user_id ? n.is_read : (profile.last_read_notifications ? new Date(n.created_at) <= new Date(profile.last_read_notifications) : false),
              time: new Date(n.created_at).getTime(),
              isServer: true,
            }));

            setNotifications(prev => {
              const all = [...prev.filter(p => !p.isServer), ...formatted];
              all.sort((a, b) => b.time - a.time);
              return all.slice(0, 20);
            });
          }
        }
        // Listen to track generation updates
        const channel = supabase
          .channel(`tracks-updates-${user.id}-${Date.now()}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'tracks',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              const newStatus = payload.new.status;
              const oldStatus = payload.old.status;
              
              if (newStatus === 'completed' && oldStatus !== 'completed') {
                const title = "Musique prête !";
                const message = `La génération de "${payload.new.title}" est terminée.`;
                toast.success(title, {
                  description: message,
                  duration: 6000,
                });
                addNotification(title, message);
                
                // Fetch updated credits if a track was completed 
                // (though technically credits are deducted on creation)
              } else if (newStatus === 'failed' && oldStatus !== 'failed') {
                const title = "Échec de génération";
                const message = `Un problème est survenu avec "${payload.new.title}".`;
                toast.error(title, {
                  description: message,
                  duration: 6000,
                });
                addNotification(title, message);
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    };
    fetchProfile();
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-foreground flex flex-col md:flex-row font-sans selection:bg-purple-500/30">
      
      {/* Background glow effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FF6B00]/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-[#0B0B0F]/80 backdrop-blur-xl p-4 h-screen sticky top-0 z-40">
        <div className="flex items-center mb-10 px-4">
          <Image src="/images/logo.png" alt="Melodia Logo" width={200} height={68} className="h-16 w-auto object-contain brightness-0 invert" />
        </div>

        <nav className="flex-1 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                  isActive 
                    ? "text-white font-medium shadow-md" 
                    : "text-white/80 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-linear-to-r from-purple-500/20 to-transparent z-0 border-l-2 border-purple-500"></div>
                )}
                <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? "text-purple-400" : "group-hover:text-purple-400"}`} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
          
          {(userRole === 'admin' || userRole === 'super_admin') && (
            <Link 
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden text-red-400 hover:text-white hover:bg-red-500/10 mt-4"
            >
              <Settings className="w-5 h-5 relative z-10 transition-colors group-hover:text-red-400" />
              <span className="relative z-10 font-bold">Administration</span>
            </Link>
          )}
        </nav>
        
        {/* Sidebar Player */}
        <SidebarPlayer />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 bg-[#F9FAFB] text-slate-900">
        {/* Topbar */}
        <header className="h-16 border-b border-gray-200 bg-white/60 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
          {/* Mobile: hamburger button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-[#FF6B00] rounded-lg flex items-center justify-center text-white font-bold">
              M
            </div>
          </div>
          
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-gray-900">
              {NAV_ITEMS.find(item => item.href === pathname)?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/credits">
              <div className="flex items-center gap-2 bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] px-4 py-2 rounded-full text-sm font-bold transition-transform hover:scale-105 cursor-pointer shadow-[0_0_15px_rgba(255,107,0,0.15)]">
                <Coins className="w-4 h-4" />
                {credits !== null ? `${credits} Mélodies` : "..."}
              </div>
            </Link>
            <DropdownMenu onOpenChange={(open) => { if (open) markAllAsRead(); }}>
              <DropdownMenuTrigger 
                render={
                  <button id="notification-trigger" className="relative p-2.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition-all shadow-sm outline-none cursor-pointer">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#FF6B00] rounded-full shadow-[0_0_5px_rgba(255,107,0,0.5)]"></span>
                    )}
                  </button>
                } 
              />
              <DropdownMenuContent align="end" className="w-80 bg-white border-none shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-2xl p-2 mt-2">
                <div className="p-3 pb-2 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs font-semibold text-[#FF6B00] bg-[#FF6B00]/10 px-2 py-0.5 rounded-full">
                      {unreadCount} nouvelle(s)
                    </span>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-gray-100" />
                <div className="max-h-80 overflow-y-auto scrollbar-hide py-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 px-4 text-center flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                        <Bell className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="font-medium text-sm text-gray-900">Aucune notification</p>
                      <p className="text-xs text-gray-500 mt-1">Vous serez averti ici lorsque vos musiques seront prêtes.</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className="p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-default mb-1 relative">
                        {!notif.read && <div className="absolute left-1.5 top-5 w-1.5 h-1.5 bg-[#FF6B00] rounded-full"></div>}
                        <div className="pl-3">
                          <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger 
                render={
                  <button id="profile-trigger" className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer hover:opacity-80 transition-opacity outline-none">
                    {userAvatar ? (
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200">
                        <Image src={userAvatar} alt={userName} width={36} height={36} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 bg-purple-500/10 text-purple-600 border border-purple-500/20 rounded-full flex items-center justify-center overflow-hidden">
                        <span className="text-sm font-bold">{userInitial}</span>
                      </div>
                    )}
                    <span className="text-sm font-semibold hidden md:block text-gray-900">{userName}</span>
                  </button>
                } 
              />
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-white border-gray-200 text-gray-900 shadow-xl">
                <div className="px-2 py-1.5 text-sm font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-gray-500">Artiste Melodia</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-gray-100" />
                <DropdownMenuItem 
                  className="cursor-pointer rounded-xl flex items-center w-full hover:bg-gray-50 focus:bg-gray-50"
                  onClick={() => router.push('/settings')}
                >
                  <User className="mr-2 h-4 w-4 text-purple-500" />
                  <span>Mon Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer text-red-400 focus:bg-red-500/10 rounded-xl mt-1"
                  onClick={() => {
                    setShowLogoutAlert(true);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <ExpiryWarningBanner />
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-[#0B0B0F] z-50 md:hidden flex flex-col transition-transform duration-300 ease-out ${
        drawerOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <div className="flex items-center">
            <Image src="/images/logo.png" alt="Melodia Logo" width={140} height={48} className="h-12 w-auto object-contain brightness-0 invert" />
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          {userAvatar ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
              <Image src={userAvatar} alt={userName} width={40} height={40} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center text-purple-400 font-bold">
              {userInitial}
            </div>
          )}
          <div>
            <p className="text-white text-sm font-semibold">{userName}</p>
            <p className="text-white/40 text-xs">Artiste Melodia</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                  isActive
                    ? "text-white font-medium"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-linear-to-r from-purple-500/20 to-transparent border-l-2 border-purple-500" />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? "text-purple-400" : ""}`} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Drawer footer: credits + logout */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <Link href="/credits" onClick={() => setDrawerOpen(false)}>
            <div className="flex items-center gap-2 bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] px-4 py-3 rounded-xl text-sm font-bold">
              <Coins className="w-4 h-4" />
              {credits !== null ? `${credits} Mélodies` : "..."}
            </div>
          </Link>
          <button
            onClick={() => { setDrawerOpen(false); setShowLogoutAlert(true); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </div>

      {/* AlertDialog pour Déconnexion */}
      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent className="rounded-3xl bg-[#13131A] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Se déconnecter</AlertDialogTitle>
            <AlertDialogDescription className="text-white/80">
              Êtes-vous sûr de vouloir vous déconnecter de Melodia AI ? Vous devrez vous reconnecter pour générer de nouvelles musiques.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl bg-transparent text-white border border-white/20 hover:bg-white/10 hover:text-white">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white rounded-xl">
              Déconnexion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile Bottom Nav - shows only 5 main items */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#0B0B0F]/90 backdrop-blur-xl flex justify-around p-2 z-40 pb-safe">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
                isActive ? "text-purple-400" : "text-white/70"
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        {/* More button - opens drawer */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center p-2 rounded-xl text-white/70 hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Plus</span>
        </button>
      </nav>
    </div>
  );
}
