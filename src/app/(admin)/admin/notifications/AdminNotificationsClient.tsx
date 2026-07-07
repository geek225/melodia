"use client";

import { useEffect, useState } from "react";
import { getAdminNotifications, sendNotification, findUserByEmail } from "./actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BellRing, Users, User, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  user_id?: string;
  profiles?: {
    email: string;
  };
}

export default function AdminNotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState('global');
  const [targetEmail, setTargetEmail] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await getAdminNotifications();
    if (res.success && res.data) {
      setNotifications(res.data);
    }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!title || !message) {
      toast.error('Veuillez remplir le titre et le message');
      return;
    }

    setSending(true);
    let userId = null;

    if (targetType === 'targeted') {
      if (!targetEmail) {
        toast.error('Veuillez renseigner l\'email cible');
        setSending(false);
        return;
      }
      const userRes = await findUserByEmail(targetEmail);
      if (!userRes.success || !userRes.user) {
        toast.error('Utilisateur introuvable avec cet email');
        setSending(false);
        return;
      }
      userId = userRes.user.id;
    }

    const res = await sendNotification({ title, message, user_id: userId });
    
    if (res.success) {
      toast.success('Notification envoyée avec succès !');
      setTitle('');
      setMessage('');
      setTargetEmail('');
      fetchNotifications();
    } else {
      toast.error('Erreur lors de l\'envoi de la notification');
    }
    
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm rounded-[24px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-primary" />
            Envoyer une nouvelle notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="flex bg-muted p-1 rounded-xl w-full max-w-100">
            <button 
              onClick={() => setTargetType('global')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${targetType === 'global' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Users className="w-4 h-4" /> Tous les utilisateurs
            </button>
            <button 
              onClick={() => setTargetType('targeted')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${targetType === 'targeted' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <User className="w-4 h-4" /> Utilisateur ciblé
            </button>
          </div>

          {targetType === 'targeted' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-sm font-medium">Email de l&apos;utilisateur cible</label>
              <Input 
                placeholder="Ex: client@email.com" 
                className="rounded-xl max-w-100" 
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Titre de la notification</label>
            <Input 
              placeholder="Ex: Mise à jour, Cadeau, Alerte..." 
              className="rounded-xl"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Message de la notification</label>
            <textarea 
              className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
              placeholder="Rédigez votre message ici (court et impactant)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={150}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSend} disabled={sending} className="rounded-xl gap-2">
              <Send className="w-4 h-4" />
              {sending ? 'Envoi en cours...' : 'Envoyer la notification'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-bold tracking-tight">Historique des envois</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead>Date</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Cible</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Aucune notification envoyée pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              notifications.map((notif) => (
                <TableRow key={notif.id} className="border-border/50">
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {new Date(notif.created_at).toLocaleString('fr-FR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell className="font-medium max-w-50 truncate">{notif.title}</TableCell>
                  <TableCell className="text-sm max-w-75 truncate">{notif.message}</TableCell>
                  <TableCell>
                    {notif.user_id ? (
                      <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 shadow-none border-0 font-normal">
                        Spécifique: {notif.profiles?.email}
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-none border-0 font-normal">
                        Globale (Tous)
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
