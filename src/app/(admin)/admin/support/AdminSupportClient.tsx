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
import { Search, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminSupportClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                      <MessageSquare className="w-4 h-4 mr-2" /> Répondre
                    </Button>
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
