"use client";

import { useEffect, useState } from "react";
import { getAdminTickets } from "./actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminSupportClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    const res = await getAdminTickets();
    if (res.success && res.data) {
      setTickets(res.data);
    }
    setLoading(false);
  };

  const filteredTickets = tickets.filter((t) => 
    t.subject?.toLowerCase().includes(search.toLowerCase()) || 
    t.profiles?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par sujet ou email..." 
            className="pl-9 rounded-xl bg-background border-border/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead>Sujet</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Aucun ticket de support trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket.id} className="border-border/50">
                  <TableCell>
                    <div className="font-medium">{ticket.subject}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1 max-w-62.5 mt-1">{ticket.message}</div>
                    {ticket.image_url && (
                      <a href={ticket.image_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-md hover:bg-purple-100 transition-colors">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Voir la capture d&apos;écran
                      </a>
                    )}
                  </TableCell>
                  <TableCell>{ticket.profiles?.email || "Inconnu"}</TableCell>
                  <TableCell>
                    {ticket.status === 'resolved' ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-none border-0"><CheckCircle2 className="w-3 h-3 mr-1" /> Résolu</Badge>
                    ) : ticket.status === 'in_progress' ? (
                      <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 shadow-none border-0 animate-pulse">En cours</Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-none border-0"><AlertCircle className="w-3 h-3 mr-1" /> Ouvert</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" /> Lire le message
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Détails du ticket</DialogTitle>
            <DialogDescription>
              Ticket envoyé par {selectedTicket?.profiles?.email || "Inconnu"} le {selectedTicket && new Date(selectedTicket.created_at).toLocaleDateString('fr-FR')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Sujet</h4>
              <p className="font-medium text-lg">{selectedTicket?.subject}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Message</h4>
              <div className="bg-muted p-4 rounded-xl text-sm whitespace-pre-wrap">
                {selectedTicket?.message}
              </div>
            </div>

            {selectedTicket?.image_url && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Capture d&apos;écran attachée</h4>
                <a href={selectedTicket.image_url} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedTicket.image_url} alt="Capture" className="w-full h-auto rounded-xl border border-border" />
                </a>
              </div>
            )}

            <div className="pt-4 border-t border-border flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedTicket(null)}>Fermer</Button>
              <Button 
                onClick={() => window.open(`mailto:${selectedTicket?.profiles?.email}?subject=RE: ${encodeURIComponent(selectedTicket?.subject)}`)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Mail className="w-4 h-4 mr-2" /> Répondre par Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
